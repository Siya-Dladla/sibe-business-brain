import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import { useToast } from "@/hooks/use-toast";
import { Layers, Plus, Clock, Play, Pause, Zap, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import WorkflowBuilder from "@/components/workflow/WorkflowBuilder";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
}

const Canvas = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWorkflows = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleOpenBuilder = (workflowId?: string) => {
    setEditingWorkflowId(workflowId || null);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setEditingWorkflowId(null);
    fetchWorkflows();
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    try {
      // First delete related workflow runs
      await supabase
        .from('workflow_runs')
        .delete()
        .eq('workflow_id', workflowId);

      // Then delete the workflow
      const { error } = await supabase
        .from('ai_workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      toast({
        title: "Workflow Deleted",
        description: "The workflow has been removed successfully.",
      });

      fetchWorkflows();
    } catch (error: any) {
      console.error('Error deleting workflow:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete workflow",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (showBuilder) {
    return (
      <WorkflowBuilder
        workflowId={editingWorkflowId || undefined}
        onBack={handleCloseBuilder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">AI Automation Workflows</div>
      </div>

      <div className="container mx-auto px-6 py-8 bg-primary-foreground">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Layers className="w-10 h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-4xl font-extralight tracking-wide">Canvas</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                Visual Workflow Builder for AI Automation
              </p>
            </div>
          </div>
          <Button onClick={() => handleOpenBuilder()} className="bg-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Workflow
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <Card className="glass-card p-6 bg-primary-foreground">
              <p className="text-muted-foreground">Loading workflows...</p>
            </Card>
          ) : workflows.length > 0 ? (
            workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="glass-card p-6 hover-lift cursor-pointer group relative"
                onClick={() => handleOpenBuilder(workflow.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-light">{workflow.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {workflow.description || "No description"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(workflow.status)}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(workflow.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{workflow.name}"? This action cannot be undone and will also remove all workflow run history.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteWorkflow(workflow.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{workflow.status}</Badge>
                  <span>{workflow.run_count} runs</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  {new Date(workflow.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))
          ) : (
            <Card className="glass-card p-12 col-span-full text-center bg-primary-foreground">
              <Layers className="w-16 h-16 mx-auto mb-4 text-primary/30" />
              <h3 className="text-xl font-light mb-2">No Workflows Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create automation workflows with your AI employees to handle tasks automatically
              </p>
              <Button onClick={() => handleOpenBuilder()} className="bg-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create First Workflow
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
