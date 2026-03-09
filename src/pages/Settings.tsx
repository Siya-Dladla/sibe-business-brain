import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Settings as SettingsIcon, User, LogOut, Save, Cpu, CreditCard, Check, Palette, Sun, Moon, Crown, Zap, Shield, Volume2, VolumeX, Eye, EyeOff } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useSoundSettings, type SoundPack } from "@/contexts/SoundSettingsContext";
import { useFeedback } from "@/hooks/useFeedback";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [profile, setProfile] = useState({
    email: "",
    full_name: ""
  });
  const [aiEngine, setAiEngine] = useState("lovable-ai");
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    gemini: ""
  });
  const [openclawConfig, setOpenclawConfig] = useState({
    endpoint: "",
    apiKey: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings: soundSettings, setEnabled: setSoundEnabled, setSoundPack, setVolume } = useSoundSettings();
  const feedback = useFeedback();

  useEffect(() => {
    fetchProfile();
    fetchAiConfig();
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

  const fetchAiConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("connected_agents")
        .select("*")
        .eq("user_id", user.id)
        .eq("platform", "openclaw")
        .maybeSingle();
      if (data) {
        setAiEngine("openclaw");
        setOpenclawConfig({
          endpoint: data.api_endpoint || "",
          apiKey: data.api_key_encrypted || ""
        });
      }
    } catch (error) {
      console.error("Error fetching AI config:", error);
    }
  };

  const saveAiSettings = async () => {
    setSavingAi(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (aiEngine === "openclaw") {
        if (!openclawConfig.endpoint || !openclawConfig.apiKey) {
          toast({ title: "Missing Fields", description: "Please enter both endpoint and API key", variant: "destructive" });
          setSavingAi(false);
          return;
        }
        // Check if record exists
        const { data: existing } = await supabase
          .from("connected_agents")
          .select("id")
          .eq("user_id", user.id)
          .eq("platform", "openclaw")
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("connected_agents")
            .update({
              api_endpoint: openclawConfig.endpoint,
              api_key_encrypted: openclawConfig.apiKey,
              status: "active"
            })
            .eq("id", existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("connected_agents")
            .insert({
              user_id: user.id,
              platform: "openclaw",
              agent_name: "OpenClaw Engine",
              api_endpoint: openclawConfig.endpoint,
              api_key_encrypted: openclawConfig.apiKey,
              status: "active"
            });
          if (error) throw error;
        }
      } else {
        // If switching away from openclaw, deactivate it
        await supabase
          .from("connected_agents")
          .update({ status: "inactive" })
          .eq("platform", "openclaw");
      }

      toast({ title: "Settings Saved", description: "Your AI engine preferences have been updated" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSavingAi(false);
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
    <AppLayout>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-5xl font-extralight mb-3 tracking-wide text-foreground">Settings</h1>
          <p className="text-primary text-lg font-light">Configure your SIBE platform & integrations</p>
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

          {/* AI Engine Configuration */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <Cpu className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">AI Engine</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-engine">Select AI Provider</Label>
                <Select value={aiEngine} onValueChange={setAiEngine}>
                  <SelectTrigger className="glass-button h-12">
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable-ai">Lovable AI (Default)</SelectItem>
                    <SelectItem value="openclaw">OpenClaw (Primary Engine)</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {aiEngine === "openclaw" && (
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    Configure your OpenClaw API credentials. All AI operations will route through your OpenClaw endpoint.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="openclaw-endpoint">API Endpoint URL</Label>
                    <Input
                      id="openclaw-endpoint"
                      type="url"
                      value={openclawConfig.endpoint}
                      onChange={e => setOpenclawConfig({ ...openclawConfig, endpoint: e.target.value })}
                      placeholder="https://api.openclaw.ai/v1"
                      className="glass-button h-12 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="openclaw-key">API Key</Label>
                    <div className="relative">
                      <Input
                        id="openclaw-key"
                        type={showApiKey ? "text" : "password"}
                        value={openclawConfig.apiKey}
                        onChange={e => setOpenclawConfig({ ...openclawConfig, apiKey: e.target.value })}
                        placeholder="oc-..."
                        className="glass-button h-12 font-mono pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {aiEngine !== "lovable-ai" && aiEngine !== "openclaw" && (
                <div className="space-y-4 pt-4 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    Enter your API key for {aiEngine === "openai" ? "OpenAI" : aiEngine === "anthropic" ? "Anthropic" : "Google Gemini"}
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor={`${aiEngine}-key`}>API Key</Label>
                    <Input
                      id={`${aiEngine}-key`}
                      type="password"
                      value={apiKeys[aiEngine as keyof typeof apiKeys]}
                      onChange={e => setApiKeys({ ...apiKeys, [aiEngine]: e.target.value })}
                      placeholder="sk-..."
                      className="glass-button h-12 font-mono"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={saveAiSettings}
                disabled={savingAi}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {savingAi ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save AI Settings
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Subscription & Billing */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Subscription Plans</h2>
            </div>

            <div className="space-y-6">
              {/* Professional Plan */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="text-xl font-light text-primary">Professional Plan</h3>
                      <p className="text-sm text-muted-foreground">Self-service automation</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-foreground">$49<span className="text-sm text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-muted-foreground">after 30-day trial</p>
                  </div>
                </div>
                <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Start with $1 for 30 days</p>
                  <p className="text-xs text-muted-foreground">Then $49/month after trial ends</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Unlimited Data Source Connections</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Third-Party Workflow Integrations</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>AI Agent Connections</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Operator Chat Assistant</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Community Developer Access</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    toast({
                      title: "Trial Started",
                      description: "Starting your $1 30-day trial. You'll be charged $49/month after the trial ends."
                    });
                  }}
                  className="w-full mt-4 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Start $1 Trial
                </Button>
              </div>

              {/* VIP Plan */}
              <div className="p-6 rounded-lg bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20 border-2 border-yellow-500/50 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 text-xs font-semibold bg-yellow-500 text-black rounded-full">
                    RECOMMENDED
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Crown className="w-7 h-7 text-yellow-500" />
                    <div>
                      <h3 className="text-xl font-light text-yellow-500">VIP Plan</h3>
                      <p className="text-sm text-muted-foreground">Full-service managed solution</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-foreground">$199<span className="text-sm text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-yellow-500/80">Done-for-you service</p>
                  </div>
                </div>
                <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-yellow-500" />
                    SGD Business Analysis & Projects Included FREE
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Our team builds, configures, and deploys your entire ecosystem
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Everything in Professional, plus:</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span>Custom Store Setup & Configuration</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span>AI Agent & Workflow Creation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span>Full Ecosystem Deployment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span>Dedicated Account Manager</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span>Priority 24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-yellow-500" />
                    <span>Monthly Strategy Consultation</span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    toast({
                      title: "VIP Upgrade Request Sent",
                      description: "Our team will contact you within 24 hours to set up your VIP account."
                    });
                  }}
                  className="w-full mt-4 h-12 bg-yellow-500 text-black hover:bg-yellow-400 font-medium"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to VIP
                </Button>
              </div>

              <Button variant="outline" className="w-full glass-button border-destructive/30 text-destructive hover:bg-destructive/10">
                Cancel Subscription
              </Button>
            </div>
          </Card>

          {/* Platform Information */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Platform Information</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-3 border-b border-border/30">
                <span className="text-muted-foreground font-light">Platform Version</span>
                <span className="text-primary font-light">SIBE v6.0</span>
              </div>

              <div className="flex justify-between py-3 border-b border-border/30">
                <span className="text-muted-foreground font-light">AI Engine</span>
                <span className="text-primary font-light capitalize">{aiEngine.replace('-', ' ')}</span>
              </div>

              <div className="flex justify-between py-3 border-b border-border/30">
                <span className="text-muted-foreground font-light">Backend</span>
                <span className="text-primary font-light">Lovable Cloud</span>
              </div>

              <div className="flex justify-between py-3 border-b border-border/30">
                <span className="text-muted-foreground font-light">Theme</span>
                <span className="text-primary font-light capitalize">{theme}</span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-light">Status</span>
                <span className="font-light text-green-500">● Active</span>
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Account Actions</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-light">
                Sign out from your SIBE account. You can sign back in at any time.
              </p>

              <Button onClick={handleSignOut} variant="outline" className="glass-button border-destructive/30 text-destructive hover:bg-destructive/10 h-11 px-8">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
