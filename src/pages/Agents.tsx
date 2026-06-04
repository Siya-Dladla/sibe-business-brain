import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles, Workflow, Zap, ArrowRight, ArrowUpRight } from "lucide-react";

const Agents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [intents, setIntents] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [agRes, inRes, acRes] = await Promise.all([
      supabase.from("ax_agents").select("*").eq("user_id", user.id).order("agent_type"),
      supabase.from("ax_intents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
      supabase.from("ax_actions").select("*, ax_agents(name, agent_type)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
    ]);
    setAgents(agRes.data ?? []);
    setIntents(inRes.data ?? []);
    setActions(acRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const seed = async () => {
    if (!user) return;
    await supabase.rpc("seed_ax_agents", { _user_id: user.id });
    toast({ title: "Agents activated", description: "7 specialized agents are online." });
    load();
  };

  return (
    <AXLayerShell icon={Bot} title="Agents" subtitle="Swarm · Coordination · Execution" layerLabel="Agents">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          Specialized autonomous workers that observe, reason, coordinate, and execute safe, audited actions across your business.
        </p>
      </Card>

      <Tabs defaultValue="swarm">
        <TabsList className="bg-background/40 flex flex-wrap h-auto">
          <TabsTrigger value="swarm"><Bot className="w-3.5 h-3.5 mr-1.5" />Swarm</TabsTrigger>
          <TabsTrigger value="coordination"><Workflow className="w-3.5 h-3.5 mr-1.5" />Coordination</TabsTrigger>
          <TabsTrigger value="execution"><Zap className="w-3.5 h-3.5 mr-1.5" />Execution</TabsTrigger>
        </TabsList>

        {/* SWARM */}
        <TabsContent value="swarm" className="mt-4">
          {!loading && agents.length === 0 && (
            <Card className="glass-card p-8 text-center border-border/30 mb-4">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-sm font-light mb-4">No agents activated yet.</p>
              <Button onClick={seed}>Activate the Swarm</Button>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {agents.map((a) => (
              <Card key={a.id} className="glass-card p-5 border-border/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div>
                      <p className="text-base font-light">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground">{a.role}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{a.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground font-light line-clamp-3 mb-3">{a.system_prompt}</p>
                <div className="flex items-center gap-4 text-[10px] text-muted-foreground/70">
                  <span>{a.reasoning_count} reasoning</span>
                  <span>{a.action_count} actions</span>
                  {a.last_active_at && <span>· active {new Date(a.last_active_at).toLocaleDateString()}</span>}
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(a.capabilities ?? []).map((c: string) => (
                    <Badge key={c} variant="outline" className="text-[9px] border-border/40">{c}</Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* COORDINATION */}
        <TabsContent value="coordination" className="mt-4">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Active Swarm Flows</h2>
          {intents.length === 0 ? (
            <Card className="glass-card p-8 text-center border-border/30">
              <p className="text-sm text-muted-foreground font-light">No swarm flows yet.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {intents.map((i) => (
                <Card key={i.id} className="glass-card p-4 border-border/30">
                  <p className="text-sm font-light mb-3">{i.intent}</p>
                  <div className="flex items-center flex-wrap gap-2">
                    {(i.dispatched_agents ?? []).map((a: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">{a}</Badge>
                        {idx < (i.dispatched_agents.length - 1) && <ArrowRight className="w-3 h-3 text-muted-foreground/40" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">{new Date(i.created_at).toLocaleString()}</p>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* EXECUTION */}
        <TabsContent value="execution" className="mt-4">
          {actions.length === 0 ? (
            <Card className="glass-card p-8 text-center border-border/30">
              <p className="text-sm text-muted-foreground font-light">No actions taken yet. Agents act when you dispatch an intent.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {actions.map((a) => (
                <Card key={a.id} className="glass-card p-4 border-border/30">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <ArrowUpRight className="w-4 h-4 text-primary flex-shrink-0" />
                      <p className="text-sm font-light truncate">{a.description}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-border/40 flex-shrink-0">{a.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/70 mt-2 ml-6">
                    <span className="text-primary/70">{a.action_type}</span>
                    {a.ax_agents && <span>· by {a.ax_agents.name}</span>}
                    <span>· {new Date(a.created_at).toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </AXLayerShell>
  );
};

export default Agents;
