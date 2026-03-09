import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Megaphone, UserCheck, Settings2, BarChart3 } from "lucide-react";

const actionIcons: Record<string, React.ElementType> = {
  marketing: Megaphone,
  follow_up: UserCheck,
  optimization: Settings2,
  analysis: BarChart3,
};

const AgentActions = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [empRes, actRes] = await Promise.all([
        supabase.from("ai_employees").select("*").eq("user_id", user.id),
        supabase.from("ai_employee_actions").select("*, ai_employees(name, department)"),
      ]);

      setEmployees(empRes.data || []);
      setActions(actRes.data || []);
    };
    fetch();
  }, []);

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Agent Actions</h1>
          <p className="text-sm text-muted-foreground mt-1">Automated tasks executed by AI agents</p>
        </div>

        {/* Agents Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Marketing Campaigns", icon: Megaphone, count: actions.filter(a => a.action_type === "marketing").length },
            { label: "Customer Follow-ups", icon: UserCheck, count: actions.filter(a => a.action_type === "follow_up").length },
            { label: "Optimizations", icon: Settings2, count: actions.filter(a => a.action_type === "optimization").length },
            { label: "Data Analysis", icon: BarChart3, count: actions.filter(a => a.action_type === "analysis").length },
          ].map((item) => (
            <Card key={item.label} className="glass-card border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{item.count}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Log */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-foreground">Recent Actions</CardTitle>
          </CardHeader>
          <CardContent>
            {actions.length > 0 ? (
              <div className="space-y-3">
                {actions.slice(0, 20).map((action) => {
                  const Icon = actionIcons[action.action_type] || Bot;
                  return (
                    <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">{action.action_type.replace("_", " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {action.ai_employees?.name} • {action.ai_employees?.department}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={action.is_enabled ? "default" : "outline"} className="text-[10px]">
                          {action.is_enabled ? "Active" : "Disabled"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          ×{action.execution_count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No agent actions yet. Create AI employees to automate tasks.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AgentActions;
