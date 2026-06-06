import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TrendingUp, Brain, Zap, BookOpen, Bot } from "lucide-react";

const Evolution = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ intents: 0, actions: 0, memories: 0, agents: 0, avgActionsPerIntent: 0 });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [i, a, m, ag] = await Promise.all([
        supabase.from("ax_intents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("ax_actions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("ax_memory").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("ax_agents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      const intents = i.count ?? 0;
      const actions = a.count ?? 0;
      setStats({
        intents,
        actions,
        memories: m.count ?? 0,
        agents: ag.count ?? 0,
        avgActionsPerIntent: intents ? Math.round((actions / intents) * 10) / 10 : 0,
      });
    })();
  }, [user]);

  const tiles = [
    { icon: Brain, label: "Intents Reasoned", value: stats.intents },
    { icon: Zap, label: "Actions Executed", value: stats.actions },
    { icon: BookOpen, label: "Memories Stored", value: stats.memories },
    { icon: Bot, label: "Active Agents", value: stats.agents },
    { icon: TrendingUp, label: "Avg actions / intent", value: stats.avgActionsPerIntent },
  ];

  return (
    <AXLayerShell icon={TrendingUp} title="Evolution Layer" subtitle="Self-improving business organism" layerLabel="Layer 8 · Evolution">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          iSiba AX learns from every outcome. Workflows optimize. Agent decisions improve. Playbooks evolve.
          The system grows more capable with every intent you dispatch.
        </p>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <Card key={t.label} className="glass-card p-5 border-border/30">
            <t.icon className="w-5 h-5 text-primary mb-3" />
            <p className="text-3xl font-extralight">{t.value.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground mt-1">{t.label}</p>
          </Card>
        ))}
      </div>

      <Card className="glass-card p-5 border-border/30 mt-6">
        <h3 className="text-sm font-light mb-2">Organism state</h3>
        <p className="text-xs text-muted-foreground font-light">
          The more signals you ingest and intents you dispatch, the richer this organism becomes.
          Every reasoning cycle deepens the memory graph and refines agent decision quality.
        </p>
      </Card>
    </AXLayerShell>
  );
};

export default Evolution;
