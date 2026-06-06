import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, User, LogOut, Save, CreditCard, Check, Palette, Sun, Moon, Crown, Zap, Shield, Volume2, VolumeX, Eye, EyeOff, KeyRound, Cpu, RefreshCw } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useSoundSettings, type SoundPack } from "@/contexts/SoundSettingsContext";
import { useFeedback } from "@/hooks/useFeedback";

const AI_PROVIDERS = [
  { id: "claude", label: "Claude", placeholder: "sk-ant-...", hint: "Anthropic Claude" },
  { id: "gemini", label: "Gemini", placeholder: "AIza...", hint: "Google Gemini" },
  { id: "openai", label: "OpenAI", placeholder: "sk-...", hint: "OpenAI GPT" },
] as const;

const AX_ENGINES = [
  { id: "claude", label: "Claude Agent API", placeholder: "sk-ant-..." },
  { id: "hermes", label: "Hermes Agent API", placeholder: "hms_..." },
  { id: "obsidian", label: "Obsidian Vault API", placeholder: "obs_..." },
  { id: "higgsfield", label: "Higgsfield API", placeholder: "hf_..." },
  { id: "custom_crm", label: "Custom CRM API Endpoint", placeholder: "https://your-crm.example.com/api" },
] as const;

const BACKEND_PROVIDERS = [
  { id: "supabase", label: "Supabase", placeholder: "https://xxx.supabase.co", hint: "Lovable Cloud / Postgres + Auth" },
  { id: "mongodb", label: "MongoDB", placeholder: "mongodb+srv://user:pass@cluster/db", hint: "MongoDB Atlas connection string" },
] as const;

const AX_KEYS_STORAGE = "ax_engine_keys_v1";
const AI_PROVIDER_STORAGE = "ai_provider_config_v1";
const BACKEND_STORAGE = "backend_connection_v1";


const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [profile, setProfile] = useState({
    email: "",
    full_name: ""
  });
  const [platformPanel, setPlatformPanel] = useState<"overview" | "ax_keys" | "ai_engine" | "backend">("overview");
  const [aiProvider, setAiProvider] = useState<"claude" | "gemini" | "openai">("claude");
  const [aiProviderKey, setAiProviderKey] = useState("");
  const [showAiKey, setShowAiKey] = useState(false);
  const [axKeys, setAxKeys] = useState<Record<string, string>>({});
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [backendProvider, setBackendProvider] = useState<"supabase" | "mongodb">("supabase");
  const [backendConn, setBackendConn] = useState("");
  const [showBackend, setShowBackend] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const PLATFORM_UPDATE_STORAGE = "platform_last_update_v1";
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings: soundSettings, setEnabled: setSoundEnabled, setSoundPack, setVolume } = useSoundSettings();
  const feedback = useFeedback();

  useEffect(() => {
    fetchProfile();
    try {
      const raw = localStorage.getItem(AX_KEYS_STORAGE);
      if (raw) setAxKeys(JSON.parse(raw));
      const rawAi = localStorage.getItem(AI_PROVIDER_STORAGE);
      if (rawAi) {
        const p = JSON.parse(rawAi);
        if (p.provider) setAiProvider(p.provider);
        if (p.key) setAiProviderKey(p.key);
      }
      const rawBe = localStorage.getItem(BACKEND_STORAGE);
      if (rawBe) {
        const b = JSON.parse(rawBe);
        if (b.provider) setBackendProvider(b.provider);
        if (b.conn) setBackendConn(b.conn);
      }
      const lu = localStorage.getItem(PLATFORM_UPDATE_STORAGE);
      if (lu) setLastUpdate(lu);
    } catch {}
  }, []);


  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (error && error.code !== 'PGRST116') throw error;
        setProfile({
          email: user.email || "",
          full_name: data?.full_name || ""
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: profile.email,
        full_name: profile.full_name,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const saveAxKeys = () => {
    localStorage.setItem(AX_KEYS_STORAGE, JSON.stringify(axKeys));
    toast({ title: "Engine keys saved", description: "Stored securely on this device." });
  };

  const saveAiProvider = () => {
    setSavingAi(true);
    try {
      localStorage.setItem(AI_PROVIDER_STORAGE, JSON.stringify({ provider: aiProvider, key: aiProviderKey }));
      toast({ title: "AI engine saved", description: `${aiProvider.toUpperCase()} configured.` });
    } finally {
      setSavingAi(false);
    }
  };

  const saveBackend = () => {
    localStorage.setItem(BACKEND_STORAGE, JSON.stringify({ provider: backendProvider, conn: backendConn }));
    toast({ title: "Backend saved", description: `${backendProvider.toUpperCase()} connection stored on this device.` });
  };

  const runPlatformUpdate = async () => {
    setUpdating(true);
    try {
      // Persist latest local creds
      localStorage.setItem(AX_KEYS_STORAGE, JSON.stringify(axKeys));
      localStorage.setItem(AI_PROVIDER_STORAGE, JSON.stringify({ provider: aiProvider, key: aiProviderKey }));
      localStorage.setItem(BACKEND_STORAGE, JSON.stringify({ provider: backendProvider, conn: backendConn }));

      // Refresh auth session (rotates token)
      await supabase.auth.refreshSession();

      // Re-sync all connected APIs
      const { data, error } = await supabase.functions.invoke("sync-api-data", { body: { syncAll: true } });
      if (error) throw error;

      const ts = new Date().toISOString();
      localStorage.setItem(PLATFORM_UPDATE_STORAGE, ts);
      setLastUpdate(ts);

      toast({
        title: "Platform updated",
        description: data?.message || "All connected APIs and tokens refreshed.",
      });
    } catch (err: any) {
      toast({
        title: "Update completed with warnings",
        description: err?.message || "Local tokens refreshed; some remote syncs may have failed.",
        variant: "destructive",
      });
      const ts = new Date().toISOString();
      localStorage.setItem(PLATFORM_UPDATE_STORAGE, ts);
      setLastUpdate(ts);
    } finally {
      setUpdating(false);
    }
  };


  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "dark" | "light");
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode`
    });
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-card">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">System Settings</div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-5xl font-extralight mb-3 tracking-wide text-foreground">Settings</h1>
          <p className="text-primary text-lg font-light">iSiba AX</p>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => handleThemeChange("dark")}
                    className={`h-16 flex flex-col items-center justify-center gap-2 ${
                      theme === "dark" 
                        ? "bg-primary text-primary-foreground" 
                        : "glass-button"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-sm">Dark Mode</span>
                  </Button>
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => handleThemeChange("light")}
                    className={`h-16 flex flex-col items-center justify-center gap-2 ${
                      theme === "light" 
                        ? "bg-primary text-primary-foreground" 
                        : "glass-button"
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-sm">Light Mode</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Sound & Haptics Settings */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              {soundSettings.enabled ? (
                <Volume2 className="w-6 h-6 text-primary" />
              ) : (
                <VolumeX className="w-6 h-6 text-muted-foreground" />
              )}
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Sound & Haptics</h2>
            </div>

            <div className="space-y-6">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound-enabled">Sound Effects</Label>
                  <p className="text-sm text-muted-foreground">Enable UI sound feedback</p>
                </div>
                <Switch
                  id="sound-enabled"
                  checked={soundSettings.enabled}
                  onCheckedChange={(checked) => {
                    setSoundEnabled(checked);
                    toast({
                      title: checked ? "Sound Enabled" : "Sound Disabled",
                      description: checked ? "UI sounds are now on" : "UI sounds are now off"
                    });
                  }}
                />
              </div>

              {/* Sound Pack Selection */}
              <div className="space-y-2">
                <Label htmlFor="sound-pack">Sound Pack</Label>
                <Select 
                  value={soundSettings.soundPack} 
                  onValueChange={(value: SoundPack) => {
                    setSoundPack(value);
                    feedback.success();
                    toast({
                      title: "Sound Pack Changed",
                      description: `Switched to ${value === 'ios' ? 'iOS' : value === 'minimal' ? 'Minimal' : value === 'retro' ? 'Retro' : 'None'} sound pack`
                    });
                  }}
                  disabled={!soundSettings.enabled}
                >
                  <SelectTrigger className="glass-button h-12">
                    <SelectValue placeholder="Select sound pack" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ios">iOS Classic</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="retro">Retro 8-bit</SelectItem>
                    <SelectItem value="none">None (Haptics only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Volume Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Volume</Label>
                  <span className="text-sm text-muted-foreground">{Math.round(soundSettings.volume * 100)}%</span>
                </div>
                <Slider
                  value={[soundSettings.volume * 100]}
                  onValueChange={([value]) => setVolume(value / 100)}
                  max={100}
                  step={5}
                  disabled={!soundSettings.enabled || soundSettings.soundPack === 'none'}
                  className="w-full"
                />
              </div>

              {/* Test Sound Button */}
              <Button
                variant="outline"
                className="w-full glass-button"
                onClick={() => feedback.success()}
                disabled={!soundSettings.enabled || soundSettings.soundPack === 'none'}
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Sound
              </Button>
            </div>
          </Card>

          {/* Profile Settings */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Profile Settings</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                    className="glass-button h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="glass-button h-12 opacity-60"
                  />
                </div>

                <Button type="submit" disabled={saving} className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90">
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            )}
          </Card>

          {/* Subscription & Billing */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Subscription</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/40 relative">
                <div className="absolute -top-3 left-6 px-2 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full">
                  iSiba AX
                </div>
                <div className="text-center mb-6 mt-2">
                  <div className="inline-flex flex-col items-center gap-1">
                    <h3 className="text-xl font-light text-primary">iSiba AX</h3>
                    <p className="text-[10px] text-muted-foreground">independent Synthetic Intelligence Business Agents</p>
                    <div className="mt-3">
                      <span className="text-5xl font-extralight">$499</span>
                      <span className="text-sm text-muted-foreground ml-1">/month</span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-3 mb-6 max-w-md mx-auto">
                  {[
                    "Custom AI Agents",
                    "CRM integration",
                    "AI Prospecting & Lead Scoring",
                    "Business Health Dashboard",
                    "Forecasting & Insights Engine",
                    "Custom App with AI voice assistant on the go",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm font-light">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-sm font-light text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>And more.</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground font-light mb-4 text-center max-w-md mx-auto">
                  iSiba AX sits on top of your existing data and operations. It automates your operations,
                  removes inefficiencies and errors, and <span className="text-foreground">scales every day</span>.
                </p>
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 text-center">Perfect for</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Growing businesses", "Sales teams", "Agencies managing multiple clients", "Service businesses"].map((p) => (
                      <span key={p} className="px-2 py-1 text-[11px] font-light border border-border/40 rounded-full text-muted-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12"
                  onClick={() => toast({ title: "iSiba AX", description: "Subscription request sent. We'll be in touch." })}
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Start with iSiba AX
                </Button>
              </div>

              <Button variant="outline" className="w-full glass-button border-destructive/30 text-destructive hover:bg-destructive/10">
                Cancel Subscription
              </Button>
            </div>
          </Card>



          {/* Platform Information (with dropdown menu) */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-extralight tracking-wide text-foreground">Platform Information</h2>
              </div>
              <Select value={platformPanel} onValueChange={(v: any) => setPlatformPanel(v)}>
                <SelectTrigger className="glass-button h-10 w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="ax_keys">AX Engine Keys</SelectItem>
                  <SelectItem value="ai_engine">AI Engine</SelectItem>
                  <SelectItem value="backend">Backend / Connection</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {platformPanel === "overview" && (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground font-light">Platform Version</span>
                  <span className="text-primary font-light">iSiba AX V1.0</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground font-light">Name</span>
                  <span className="text-primary font-light">independent Synthetic Intelligence Business Agents</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground font-light">AI Engine</span>
                  <span className="text-primary font-light capitalize">{aiProvider}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground font-light">Backend</span>
                  <span className="text-primary font-light capitalize">{backendProvider}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground font-light">Theme</span>
                  <span className="text-primary font-light capitalize">{theme}</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground font-light">Connected Engine Keys</span>
                  <span className="text-primary font-light">
                    {Object.values(axKeys).filter(Boolean).length} / {AX_ENGINES.length}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-border/30">
                  <span className="text-muted-foreground font-light">Last Platform Update</span>
                  <span className="text-primary font-light">
                    {lastUpdate ? new Date(lastUpdate).toLocaleString() : "Never"}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground font-light">Status</span>
                  <span className="font-light text-green-500">● Active</span>
                </div>

                <Button
                  onClick={runPlatformUpdate}
                  disabled={updating}
                  className="w-full h-12 mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${updating ? "animate-spin" : ""}`} />
                  {updating ? "Updating platform…" : "Update Platform (sync APIs & tokens)"}
                </Button>
                <p className="text-[11px] text-muted-foreground font-light text-center">
                  Re-syncs all connected APIs, AI engines, AX engine keys and backend tokens.
                </p>
              </div>
            )}

            {platformPanel === "ax_keys" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Plug your own API keys into the iSiba AX organism. Stored locally on this device.
                </div>
                {AX_ENGINES.map((e) => (
                  <div key={e.id} className="space-y-2">
                    <Label htmlFor={`ax-${e.id}`}>{e.label}</Label>
                    <div className="relative">
                      <Input
                        id={`ax-${e.id}`}
                        type={reveal[e.id] ? "text" : "password"}
                        value={axKeys[e.id] ?? ""}
                        onChange={(ev) => setAxKeys({ ...axKeys, [e.id]: ev.target.value })}
                        placeholder={e.placeholder}
                        className="glass-button h-12 font-mono pr-12"
                      />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setReveal({ ...reveal, [e.id]: !reveal[e.id] })}>
                        {reveal[e.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
                <Button onClick={saveAxKeys} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" /> Save Engine Keys
                </Button>
              </div>
            )}

            {platformPanel === "ai_engine" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                  <Cpu className="w-4 h-4 text-primary" />
                  Choose the AI engine that powers reasoning across your platform.
                </div>
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select value={aiProvider} onValueChange={(v: any) => setAiProvider(v)}>
                    <SelectTrigger className="glass-button h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.label} — {p.hint}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ai-provider-key">{AI_PROVIDERS.find(p => p.id === aiProvider)?.label} API Key</Label>
                  <div className="relative">
                    <Input
                      id="ai-provider-key"
                      type={showAiKey ? "text" : "password"}
                      value={aiProviderKey}
                      onChange={(e) => setAiProviderKey(e.target.value)}
                      placeholder={AI_PROVIDERS.find(p => p.id === aiProvider)?.placeholder}
                      className="glass-button h-12 font-mono pr-12"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowAiKey(!showAiKey)}>
                      {showAiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={saveAiProvider} disabled={savingAi} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" /> Save AI Engine
                </Button>
              </div>
            )}

            {platformPanel === "backend" && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-light">
                  <KeyRound className="w-4 h-4 text-primary" />
                  Connect a backend database for your AX agents to read & write.
                </div>
                <div className="space-y-2">
                  <Label>Backend Provider</Label>
                  <Select value={backendProvider} onValueChange={(v: any) => setBackendProvider(v)}>
                    <SelectTrigger className="glass-button h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BACKEND_PROVIDERS.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.label} — {p.hint}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backend-conn">
                    {BACKEND_PROVIDERS.find(p => p.id === backendProvider)?.label} Connection String / URL
                  </Label>
                  <div className="relative">
                    <Input
                      id="backend-conn"
                      type={showBackend ? "text" : "password"}
                      value={backendConn}
                      onChange={(e) => setBackendConn(e.target.value)}
                      placeholder={BACKEND_PROVIDERS.find(p => p.id === backendProvider)?.placeholder}
                      className="glass-button h-12 font-mono pr-12"
                    />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowBackend(!showBackend)}>
                      {showBackend ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <Button onClick={saveBackend} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" /> Save Backend Connection
                </Button>
              </div>
            )}
          </Card>


          {/* Account Actions */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Account Actions</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-light">
                Sign out from your Sibe AI account. You can sign back in at any time.
              </p>

              <Button onClick={handleSignOut} variant="outline" className="glass-button border-destructive/30 text-destructive hover:bg-destructive/10 h-11 px-8">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
