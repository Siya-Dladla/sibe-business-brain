import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Workflow, ArrowRight } from "lucide-react";

const Swarm = () => {
  const { user } = useAuth();
  const [intents, setIntents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("ax_intents").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(15)
      .then(({ data }) => setIntents(data ?? []));
  }, [user]);

  return (
    <AXLayerShell icon={Workflow} title="Swarm Coordination" subtitle="Multi-agent collaboration flows" layerLabel="Layer 4 · Swarm">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          Agents collaborate dynamically. Tasks are delegated automatically, workflows emerge from context — never hardcoded.
        </p>
      </Card>

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
    </AXLayerShell>
  );
};

export default Swarm;
