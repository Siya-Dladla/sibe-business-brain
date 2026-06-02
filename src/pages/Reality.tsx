import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Network, Users, Briefcase, FileText, CreditCard, Package, Building2, Activity } from "lucide-react";

const Reality = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const tables = ["contacts", "tasks", "invoices", "ai_employees", "business_metrics", "api_connections", "ai_workflows"];
      const results = await Promise.all(
        tables.map(async (t) => {
          try {
            const r = await supabase.from(t as any).select("id", { count: "exact", head: true }).eq("user_id", user.id);
            return { t, c: r.count ?? 0 };
          } catch {
            return { t, c: 0 };
          }
        })
      );
      const map: Record<string, number> = {};
      results.forEach((r) => { map[r.t] = r.c; });
      setCounts(map);
    })();
  }, [user]);

  const entities = [
    { icon: Users, label: "Contacts", key: "contacts" },
    { icon: Briefcase, label: "Tasks", key: "tasks" },
    { icon: FileText, label: "Invoices", key: "invoices" },
    { icon: Building2, label: "AI Workforce", key: "ai_employees" },
    { icon: Activity, label: "Live Metrics", key: "business_metrics" },
    { icon: Package, label: "Data Sources", key: "api_connections" },
    { icon: CreditCard, label: "Workflows", key: "ai_workflows" },
  ];

  return (
    <AXLayerShell icon={Network} title="Reality Layer" subtitle="Living business knowledge graph" layerLabel="Layer 1 · Reality">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          Every entity in your business — customers, jobs, invoices, agents, signals — connected in a single living graph.
          Agents traverse this graph to reason about cause and effect.
        </p>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {entities.map((e) => (
          <Card key={e.key} className="glass-card p-5 border-border/30">
            <e.icon className="w-5 h-5 text-primary mb-3" />
            <p className="text-3xl font-extralight">{(counts[e.key] ?? 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{e.label}</p>
          </Card>
        ))}
      </div>
    </AXLayerShell>
  );
};

export default Reality;
