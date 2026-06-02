import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen } from "lucide-react";

const TYPES = ["episodic", "semantic", "procedural", "strategic", "outcome"] as const;

const Memory = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("ax_memory").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setMemories(data ?? []));
  }, [user]);

  return (
    <AXLayerShell icon={BookOpen} title="Memory Layer" subtitle="Persistent evolving knowledge" layerLabel="Layer 6 · Memory">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          Five memory streams record what happened, what it means, how things are done, why decisions were made,
          and what worked vs failed. Linked. Searchable. Agent-accessible.
        </p>
      </Card>

      <Tabs defaultValue="all">
        <TabsList className="bg-background/40">
          <TabsTrigger value="all">All</TabsTrigger>
          {TYPES.map(t => <TabsTrigger key={t} value={t} className="text-xs capitalize">{t}</TabsTrigger>)}
        </TabsList>

        {["all", ...TYPES].map((tab) => {
          const filtered = tab === "all" ? memories : memories.filter(m => m.memory_type === tab);
          return (
            <TabsContent key={tab} value={tab} className="space-y-2 mt-4">
              {filtered.length === 0 ? (
                <Card className="glass-card p-8 text-center border-border/30">
                  <p className="text-sm text-muted-foreground font-light">No {tab === "all" ? "" : tab} memories yet.</p>
                </Card>
              ) : filtered.map((m) => (
                <Card key={m.id} className="glass-card p-4 border-border/30">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm font-light flex-1">{m.title}</p>
                    <Badge variant="outline" className="text-[9px] border-border/40 capitalize">{m.memory_type}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-light">{m.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-muted-foreground/60">{new Date(m.created_at).toLocaleString()}</p>
                    <span className="text-[10px] text-primary/60">importance {m.importance}</span>
                  </div>
                </Card>
              ))}
            </TabsContent>
          );
        })}
      </Tabs>
    </AXLayerShell>
  );
};

export default Memory;
