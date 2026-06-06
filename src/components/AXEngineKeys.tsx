import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Eye, EyeOff, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ENGINES = [
  { id: "claude", label: "Claude API", placeholder: "sk-ant-...", hint: "Anthropic Claude — reasoning & long-context analysis" },
  { id: "obsidian", label: "Obsidian API", placeholder: "obs_...", hint: "Knowledge vault sync & semantic memory" },
  { id: "hermes", label: "Hermes API", placeholder: "hms_...", hint: "Multi-channel messaging & dispatch" },
  { id: "mirofish", label: "MiroFish API", placeholder: "mf_...", hint: "Visual reasoning & canvas intelligence" },
  { id: "openclaw", label: "OpenClaw API", placeholder: "oc_...", hint: "Agentic execution engine (default)" },
] as const;

const STORAGE_KEY = "ax_engine_keys_v1";

export default function AXEngineKeys() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setKeys(JSON.parse(raw));
    } catch {}
  }, []);

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    toast({ title: "Engine keys saved", description: "Stored securely on this device." });
  };

  return (
    <Card className="glass-card p-8 border-border/20">
      <div className="flex items-center gap-3 mb-2">
        <KeyRound className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-extralight tracking-wide text-foreground">AX Engine Keys</h2>
      </div>
      <p className="text-sm text-muted-foreground font-light mb-6">
        Plug your own API keys into the iSiba AX organism. Each engine extends a different cognitive layer.
        Keys are stored locally on this device until you connect a backend secret.
      </p>

      <div className="space-y-5">
        {ENGINES.map((e) => (
          <div key={e.id} className="space-y-2">
            <div className="flex items-baseline justify-between">
              <Label htmlFor={`key-${e.id}`}>{e.label}</Label>
              <span className="text-[10px] text-muted-foreground/70">{e.hint}</span>
            </div>
            <div className="relative">
              <Input
                id={`key-${e.id}`}
                type={reveal[e.id] ? "text" : "password"}
                value={keys[e.id] ?? ""}
                onChange={(ev) => setKeys({ ...keys, [e.id]: ev.target.value })}
                placeholder={e.placeholder}
                className="glass-button h-12 font-mono pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setReveal({ ...reveal, [e.id]: !reveal[e.id] })}
              >
                {reveal[e.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ))}

        <Button onClick={save} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          Save Engine Keys
        </Button>
      </div>
    </Card>
  );
}
