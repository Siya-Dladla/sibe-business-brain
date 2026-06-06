import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AXLayerShell from "@/components/AXLayerShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Eye } from "lucide-react";

const Observation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signals, setSignals] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [source, setSource] = useState("manual");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("ax_signals").select("*").eq("user_id", user.id)
      .order("created_at", { ascending: false }).limit(30);
    setSignals(data ?? []);
  };

  useEffect(() => { load(); }, [user]);

  const ingest = async () => {
    if (!user || !title.trim()) return;
    await supabase.from("ax_signals").insert({
      user_id: user.id, source, signal_type: "manual_input", title, content,
    });
    toast({ title: "Signal ingested" });
    setTitle(""); setContent("");
    load();
  };

  return (
    <AXLayerShell icon={Eye} title="Observation Layer" subtitle="Always-on business signal ingestion" layerLabel="Layer 5 · Observation">
      <Card className="glass-card p-5 border-border/30 mb-6">
        <p className="text-sm font-light text-muted-foreground">
          iSiba AX continuously ingests signals from CRM, email, messaging, finance, web, and IoT.
          Every signal becomes context for agent reasoning.
        </p>
      </Card>

      <Card className="glass-card p-4 md:p-5 border-primary/20 mb-6">
        <h3 className="text-sm font-light mb-3">Inject a manual signal</h3>
        <div className="space-y-2">
          <Input placeholder="Signal title (e.g. 'Customer X complained about delivery')"
            value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background/40" />
          <Textarea placeholder="Details (optional)" value={content} onChange={(e) => setContent(e.target.value)}
            className="bg-background/40 min-h-[60px]" />
          <div className="flex items-center justify-between gap-2">
            <select value={source} onChange={(e) => setSource(e.target.value)}
              className="bg-background/40 border border-border/40 rounded px-3 py-1.5 text-xs">
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
    </AXLayerShell>
  );
};

export default Observation;
