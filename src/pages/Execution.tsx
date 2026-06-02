import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Zap, ArrowUpRight } from "lucide-react";

const Execution = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("ax_actions").select("*, ax_agents(name, agent_type)").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(50)
      .then(({ data }) => setActions(data ?? []));
  }, [user]);

  return (
    <AXLayerShell icon={Zap} title="Execution Layer" subtitle="Audited agent action ledger" layerLabel="Layer 7 · Execution">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          Every agent action is safe, permission-controlled, and logged in real time.
          You can review, reject, or replay any action below.
        </p>
      </Card>

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
    </AXLayerShell>
  );
};

export default Execution;
