import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Bot, Sparkles } from "lucide-react";

const Agents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("ax_agents").select("*").eq("user_id", user.id).order("agent_type");
    setAgents(data ?? []);
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
    <AXLayerShell icon={Bot} title="Agent Swarm" subtitle="7 specialized autonomous workers" layerLabel="Layer 3 · Agents">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          Each agent observes business data, reasons about context, and takes safe, audited actions.
          They learn from outcomes and improve continuously.
        </p>
      </Card>

      {!loading && agents.length === 0 && (
        <Card className="glass-card p-8 text-center border-border/30">
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
    </AXLayerShell>
  );
};

export default Agents;
