import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WorkflowToolbar from "./WorkflowToolbar";
import WorkflowCanvas from "./WorkflowCanvas";
import WorkflowHeader from "./WorkflowHeader";
import { WorkflowNodeData } from "./WorkflowNode";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, any>;
  nodes: WorkflowNodeData[];
  status: 'draft' | 'active' | 'paused';
  run_count: number;
}

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface WorkflowBuilderProps {
  workflowId?: string;
  onBack: () => void;
}

const WorkflowBuilder = ({ workflowId, onBack }: WorkflowBuilderProps) => {
  const { toast } = useToast();
  const [workflow, setWorkflow] = useState<Workflow>({
    id: "",
    name: "New Workflow",
    description: null,
    trigger_type: "manual",
    trigger_config: {},
    nodes: [],
    status: "draft",
    run_count: 0,
  });
  const [aiEmployees, setAiEmployees] = useState<AIEmployee[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Fetch AI employees
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("ai_employees")
        .select("id, name, role, department");
      
      if (!error && data) {
        setAiEmployees(data);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch existing workflow if editing
  useEffect(() => {
    if (!workflowId) return;

    const fetchWorkflow = async () => {
      const { data, error } = await supabase
        .from("ai_workflows")
        .select("*")
        .eq("id", workflowId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load workflow",
          variant: "destructive",
        });
        return;
      }

      setWorkflow({
        id: data.id,
        name: data.name,
        description: data.description,
        trigger_type: data.trigger_type,
        trigger_config: data.trigger_config as Record<string, any>,
        nodes: (Array.isArray(data.nodes) ? data.nodes : []) as unknown as WorkflowNodeData[],
        status: data.status as 'draft' | 'active' | 'paused',
        run_count: data.run_count || 0,
      });
    };

    fetchWorkflow();
  }, [workflowId, toast]);

  const handleAddNode = useCallback((
    type: 'trigger' | 'ai_employee' | 'action' | 'condition',
    config: Record<string, any> = {}
  ) => {
    const newNode: WorkflowNodeData = {
      id: crypto.randomUUID(),
      type,
      name: type === 'trigger' 
        ? `${config.triggerType || 'Manual'} Trigger`
        : type === 'action'
        ? config.actionType?.replace('_', ' ') || 'Action'
        : type === 'condition'
        ? 'Condition'
        : 'AI Employee',
      config,
      position: {
        x: 100 + (workflow.nodes.length % 3) * 220,
        y: 100 + Math.floor(workflow.nodes.length / 3) * 150,
      },
      connections: [],
    };

    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
  }, [workflow.nodes.length]);

  const handleNodesChange = useCallback((nodes: WorkflowNodeData[]) => {
    setWorkflow((prev) => ({ ...prev, nodes }));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const workflowData = {
        name: workflow.name,
        description: workflow.description,
        trigger_type: workflow.trigger_type,
        trigger_config: workflow.trigger_config as any,
        nodes: workflow.nodes as any,
        status: workflow.status,
        user_id: user.id,
      };

      if (workflow.id) {
        // Update existing
        const { error } = await supabase
          .from("ai_workflows")
          .update(workflowData)
          .eq("id", workflow.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("ai_workflows")
          .insert([workflowData])
          .select()
          .single();

        if (error) throw error;
        setWorkflow((prev) => ({ ...prev, id: data.id }));
      }

      toast({
        title: "Saved",
        description: "Workflow saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    if (!workflow.id) {
      toast({
        title: "Save First",
        description: "Please save the workflow before running",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("execute-workflow", {
        body: { workflowId: workflow.id },
      });

      if (error) throw error;

      toast({
        title: "Workflow Executed",
        description: data.message || "Workflow completed successfully",
      });

      // Update run count
      setWorkflow((prev) => ({ ...prev, run_count: prev.run_count + 1 }));
    } catch (error: any) {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleStatusChange = async (status: 'draft' | 'active' | 'paused') => {
    setWorkflow((prev) => ({ ...prev, status }));
    
    if (workflow.id) {
      await supabase
        .from("ai_workflows")
        .update({ status })
        .eq("id", workflow.id);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <WorkflowHeader
        name={workflow.name}
        onNameChange={(name) => setWorkflow((prev) => ({ ...prev, name }))}
        status={workflow.status}
        onStatusChange={handleStatusChange}
        onSave={handleSave}
        onRun={handleRun}
        onBack={onBack}
        isSaving={isSaving}
        isRunning={isRunning}
        runCount={workflow.run_count}
      />

      <div className="flex-1 flex overflow-hidden">
        <WorkflowToolbar
          aiEmployees={aiEmployees}
          onAddNode={handleAddNode}
        />
        
        <WorkflowCanvas
          nodes={workflow.nodes}
          onNodesChange={handleNodesChange}
          aiEmployees={aiEmployees}
        />
      </div>
    </div>
  );
};

export default WorkflowBuilder;
