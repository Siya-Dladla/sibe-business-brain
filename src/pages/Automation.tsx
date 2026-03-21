import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Play, Settings, Plus, ArrowRight, Upload, FileText, Send } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const workflowTemplates = [
  {
    name: "Auto-Analyze Uploads",
    trigger: "When new data is uploaded",
    action: "Run AI analysis + generate report",
    output: "Store insight + send summary",
    icon: Upload,
  },
  {
    name: "Daily Performance Report",
    trigger: "Every day at 9 AM",
    action: "Pull metrics + generate analysis",
    output: "Email summary to team",
    icon: FileText,
  },
  {
    name: "Alert on KPI Change",
    trigger: "When KPI drops > 10%",
    action: "Run root-cause analysis",
    output: "Send alert + recommendations",
    icon: Send,
  },
];

const Automation = () => {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) fetchWorkflows();
  }, [user]);

  const fetchWorkflows = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_workflows")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setWorkflows(data || []);
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-card">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Automation</div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extralight tracking-wide">Automation</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                AI-driven workflows to automate your business operations
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              toast({ title: "Coming Soon", description: "Visual workflow builder launching soon" });
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Workflow
          </Button>
        </div>

        {/* Workflow Templates */}
        <h3 className="text-lg font-light mb-4">Workflow Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {workflowTemplates.map((template) => (
            <Card key={template.name} className="glass-card p-6 border-border/20 hover-lift">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <template.icon className="w-5 h-5 text-primary" />
                </div>
                <h4 className="text-sm font-medium">{template.name}</h4>
              </div>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">Trigger</Badge>
                  <span>{template.trigger}</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-3 h-3 text-primary" />
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">Action</Badge>
                  <span>{template.action}</span>
                </div>
                <div className="flex justify-center">
                  <ArrowRight className="w-3 h-3 text-primary" />
                </div>
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="text-[10px] shrink-0">Output</Badge>
                  <span>{template.output}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4 text-xs" size="sm">
                <Play className="w-3 h-3 mr-1" />
                Use Template
              </Button>
            </Card>
          ))}
        </div>

        {/* Active Workflows */}
        <h3 className="text-lg font-light mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Active Workflows
        </h3>
        {workflows.length === 0 ? (
          <Card className="glass-card p-12 text-center border-border/20">
            <Zap className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-muted-foreground font-light">No workflows yet. Use the Command Centre chat or templates above to create one.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {workflows.map((wf) => (
              <Card key={wf.id} className="glass-card p-4 border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-light">{wf.name}</p>
                    <p className="text-xs text-muted-foreground">{wf.description || wf.trigger_type}</p>
                  </div>
                </div>
                <Badge variant={wf.status === "active" ? "default" : "secondary"}>{wf.status}</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Automation;