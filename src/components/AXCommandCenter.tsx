import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, Sparkles, Activity, ArrowUpRight } from "lucide-react";

interface AgentResult {
  agent: string;
  agent_type: string;
  reasoning: string;
  actions: { action_type: string; description: string }[];
}

interface IntentRow {
  id: string;
  intent: string;
  reasoning: string | null;
  dispatched_agents: string[] | null;
  status: string;
  result: any;
  created_at: string;
}

const SUGGESTED = [
  "Increase revenue by 20% this quarter",
  "Why are we losing customers?",
  "Optimize technician scheduling",
  "Show risks in cash flow next 30 days",
];

const AXCommandCenter = () => {
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(false);
  const [latest, setLatest] = useState<AgentResult[]>([]);
  const [recent, setRecent] = useState<IntentRow[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const taRef = useRef<HTMLTextAreaElement>(null);

  const loadRecent = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ax_intents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    setRecent((data as IntentRow[]) ?? []);
  };

  useEffect(() => { loadRecent(); }, [user]);

  const dispatch = async (text: string) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setLatest([]);
    try {
      const { data, error } = await supabase.functions.invoke("ax-orchestrator", {
        body: { intent: text.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setLatest(data.agents ?? []);
      setIntent("");
      toast({
        title: "Swarm dispatched",
        description: `${data.dispatched?.length ?? 0} agents activated`,
      });
      loadRecent();
    } catch (e: any) {
      toast({
        title: "Orchestrator error",
        description: e.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto w-full">
      {/* Hero */}
      <div className="text-center mb-8">
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px] mb-4">
          iSiba AX · light as a feather
        </Badge>
        <h1 className="text-3xl md:text-5xl font-extralight tracking-wide mb-3">
          Direct the swarm.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground font-light max-w-2xl mx-auto">
          State your intent. Autonomous agents observe, reason, and act across your business in real time.
        </p>
      </div>

      {/* Intent Input */}
      <Card className="glass-card p-4 md:p-5 border-primary/20 mb-4">
        <Textarea
          ref={taRef}
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              dispatch(intent);
            }
          }}
          placeholder="What outcome do you want? e.g. 'Increase margin by 15% next quarter'"
          className="min-h-[80px] resize-none bg-transparent border-0 focus-visible:ring-0 text-base font-light"
          disabled={loading}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-muted-foreground">Enter to dispatch · Shift+Enter for newline</span>
          <Button
            onClick={() => dispatch(intent)}
            disabled={loading || !intent.trim()}
            size="sm"
            className="gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Dispatch
          </Button>
        </div>
      </Card>

      {/* Suggested intents */}
      {!latest.length && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => dispatch(s)}
              className="text-left p-3 rounded-lg border border-border/40 bg-background/40 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs text-muted-foreground hover:text-foreground"
            >
              <Sparkles className="w-3 h-3 inline mr-2 text-primary" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="glass-card p-6 border-primary/20 mb-6 text-center">
          <Activity className="w-6 h-6 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-sm font-light">Agents reasoning over your business graph…</p>
        </Card>
      )}

      {/* Latest swarm response */}
      {latest.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">Swarm Response</h2>
          {latest.map((a, i) => (
            <Card key={i} className="glass-card p-4 md:p-5 border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-light">{a.agent}</span>
                  <Badge variant="outline" className="text-[9px] border-border/40">{a.agent_type}</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{a.actions.length} actions</span>
              </div>
              <p className="text-sm font-light text-foreground/90 mb-3">{a.reasoning}</p>
              {a.actions.length > 0 && (
                <div className="space-y-1.5">
                  {a.actions.map((act, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <ArrowUpRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span><span className="text-primary/80">{act.action_type}</span> · {act.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Recent intents */}
      {recent.length > 0 && (
        <div>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Recent Intents</h2>
          <div className="space-y-2">
            {recent.map((r) => (
              <Card key={r.id} className="glass-card p-3 border-border/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-light truncate">{r.intent}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {(r.dispatched_agents ?? []).join(" · ") || "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[9px] border-border/40 flex-shrink-0">
                    {r.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AXCommandCenter;
