import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Brain as BrainIcon, Eye, BookOpen, TrendingUp, Zap, Bot } from "lucide-react";

const MEM_TYPES = ["episodic", "semantic", "procedural", "strategic", "outcome"] as const;

const Brain = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [intents, setIntents] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [stats, setStats] = useState({ intents: 0, actions: 0, memories: 0, agents: 0, avgActionsPerIntent: 0 });

  // signal input
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");

  const loadAll = async () => {
    if (!user) return;
    const [iRes, sRes, mRes, iCount, aCount, mCount, agCount] = await Promise.all([
      supabase.from("ax_intents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("ax_signals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("ax_memory").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("ax_intents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("ax_actions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("ax_memory").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("ax_agents").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setIntents(iRes.data ?? []);
    setSignals(sRes.data ?? []);
    setMemories(mRes.data ?? []);
    const intentN = iCount.count ?? 0;
    const actionN = aCount.count ?? 0;
    setStats({
      intents: intentN,
      actions: actionN,
      memories: mCount.count ?? 0,
      agents: agCount.count ?? 0,
      avgActionsPerIntent: intentN ? Math.round((actionN / intentN) * 10) / 10 : 0,
    });
  };

  useEffect(() => { loadAll(); }, [user]);

  const ingest = async () => {
    if (!user || !title.trim()) return;
    await supabase.from("ax_signals").insert({
      user_id: user.id, source, signal_type: "manual_input", title, content,
    });
    toast({ title: "Signal ingested" });
    setTitle(""); setContent("");
    loadAll();
  };

  const tiles = [
    { icon: BrainIcon, label: "Intents Reasoned", value: stats.intents },
    { icon: Zap, label: "Actions Executed", value: stats.actions },
    { icon: BookOpen, label: "Memories Stored", value: stats.memories },
    { icon: Bot, label: "Active Agents", value: stats.agents },
    { icon: TrendingUp, label: "Avg actions / intent", value: stats.avgActionsPerIntent },
  ];

  return (
    <AXLayerShell icon={BrainIcon} title="Brain" subtitle="Cognition · Observation · Memory · Evolution" layerLabel="Brain">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          The unified mind of SIBE AX — observing signals, reasoning over intents, storing memory, and evolving with every outcome.
        </p>
      </Card>

      <Tabs defaultValue="cognition">
        <TabsList className="bg-background/40 flex flex-wrap h-auto">
          <TabsTrigger value="cognition"><BrainIcon className="w-3.5 h-3.5 mr-1.5" />Cognition</TabsTrigger>
          <TabsTrigger value="observation"><Eye className="w-3.5 h-3.5 mr-1.5" />Observation</TabsTrigger>
          <TabsTrigger value="memory"><BookOpen className="w-3.5 h-3.5 mr-1.5" />Memory</TabsTrigger>
          <TabsTrigger value="evolution"><TrendingUp className="w-3.5 h-3.5 mr-1.5" />Evolution</TabsTrigger>
        </TabsList>

        {/* COGNITION */}
        <TabsContent value="cognition" className="mt-4">
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
        </TabsContent>

        {/* OBSERVATION */}
        <TabsContent value="observation" className="mt-4">
          <Card className="glass-card p-4 md:p-5 border-primary/20 mb-6">
            <h3 className="text-sm font-light mb-3">Inject a manual signal</h3>
            <div className="space-y-2">
              <Input placeholder="Signal title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background/40" />
              <Textarea placeholder="Details (optional)" value={content} onChange={(e) => setContent(e.target.value)} className="bg-background/40 min-h-[60px]" />
              <div className="flex items-center justify-between gap-2">
                <select value={source} onChange={(e) => setSource(e.target.value)} className="bg-background/40 border border-border/40 rounded px-3 py-1.5 text-xs">
                  <option value="manual">manual</option>
                  <option value="crm">crm</option>
                  <option value="email">email</option>
                  <option value="whatsapp">whatsapp</option>
                  <option value="finance">finance</option>
                  <option value="web">web</option>
                </select>
                <Button onClick={ingest} disabled={!title.trim()} size="sm">Ingest signal</Button>
              </div>
            </div>
          </Card>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Signal Stream</h2>
          {signals.length === 0 ? (
            <Card className="glass-card p-8 text-center border-border/30">
              <p className="text-sm text-muted-foreground font-light">No signals yet.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {signals.map((s) => (
                <Card key={s.id} className="glass-card p-3 border-border/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-light">{s.title}</p>
                      {s.content && <p className="text-xs text-muted-foreground mt-1">{s.content}</p>}
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{new Date(s.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] border-border/40 flex-shrink-0">{s.source}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* MEMORY */}
        <TabsContent value="memory" className="mt-4">
          <Tabs defaultValue="all">
            <TabsList className="bg-background/40 flex-wrap h-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              {MEM_TYPES.map(t => <TabsTrigger key={t} value={t} className="text-xs capitalize">{t}</TabsTrigger>)}
            </TabsList>
            {["all", ...MEM_TYPES].map((tab) => {
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
        </TabsContent>

        {/* EVOLUTION */}
        <TabsContent value="evolution" className="mt-4">
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
        </TabsContent>
      </Tabs>
    </AXLayerShell>
  );
};

export default Brain;
