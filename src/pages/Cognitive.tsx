import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Brain } from "lucide-react";

const Cognitive = () => {
  const { user } = useAuth();
  const [intents, setIntents] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("ax_intents").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setIntents(data ?? []));
  }, [user]);

  return (
    <AXLayerShell icon={Brain} title="Cognitive Layer" subtitle="Continuous reasoning engine" layerLabel="Layer 2 · Cognitive">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          Sibe AX continuously reasons about your business state — detecting patterns, risks, and opportunities.
          Every human intent triggers a reasoning chain across specialized agents.
        </p>
      </Card>

      <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Reasoning History</h2>
      {intents.length === 0 ? (
        <Card className="glass-card p-8 text-center border-border/30">
          <p className="text-sm text-muted-foreground font-light">No reasoning chains yet. Dispatch an intent from the Command Center.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {intents.map((i) => (
            <Card key={i.id} className="glass-card p-4 border-border/30">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-light flex-1">{i.intent}</p>
                <Badge variant="outline" className="text-[9px] border-border/40">{i.status}</Badge>
              </div>
              {i.reasoning && (
                <p className="text-xs text-muted-foreground whitespace-pre-line mt-2 font-light">{i.reasoning}</p>
              )}
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                {(i.dispatched_agents ?? []).join(" · ")} · {new Date(i.created_at).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </AXLayerShell>
  );
};

export default Cognitive;
