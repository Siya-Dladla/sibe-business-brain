import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, User, LogOut, Save, Cpu, CreditCard, Check, Palette, Sun, Moon } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchProfile();
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
      navigate("/");
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

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as "dark" | "light");
    toast({
      title: "Theme Updated",
      description: `Switched to ${newTheme} mode`
    });
  };

  return (
    <div className="min-h-screen bg-background grid-bg pb-24 md:pb-0">
      <div className="p-3 md:p-6 flex items-center justify-between border-b border-border/50 bg-card sticky top-0 z-40">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">System Settings</div>
      </div>

      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 max-w-4xl">
        <div className="mb-6 md:mb-10">
          <h1 className="text-3xl md:text-5xl font-extralight mb-2 md:mb-3 tracking-wide text-foreground">Settings</h1>
          <p className="text-primary text-base md:text-lg font-light">Configure your SIBE SI platform</p>
        </div>

        <div className="space-y-4 md:space-y-6">
          {/* Theme Settings */}
          <Card className="glass-card p-4 md:p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Appearance</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => handleThemeChange("dark")}
                    className={`h-14 md:h-16 flex flex-col items-center justify-center gap-1 md:gap-2 ${
                      theme === "dark" 
                        ? "bg-primary text-primary-foreground" 
                        : "glass-button"
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span className="text-xs md:text-sm">Dark</span>
                  </Button>
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => handleThemeChange("light")}
                    className={`h-14 md:h-16 flex flex-col items-center justify-center gap-1 md:gap-2 ${
                      theme === "light" 
                        ? "bg-primary text-primary-foreground" 
                        : "glass-button"
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span className="text-xs md:text-sm">Light</span>
                  </Button>
                </div>
              </div>
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
                    <SelectItem value="lovable-ai">Lovable AI (Recommended)</SelectItem>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {aiEngine !== "lovable-ai" && (
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
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "Your AI engine preferences have been updated"
                  });
                }}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save AI Settings
              </Button>
            </div>
          </Card>

          {/* Subscription & Billing */}
          <Card className="glass-card p-8 border-border/20">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide text-foreground">Subscription</h2>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-light text-primary">Professional Plan</h3>
                    <p className="text-sm text-muted-foreground">Current subscription</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-light text-foreground">$49<span className="text-sm text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-muted-foreground">after 14-day trial</p>
                  </div>
                </div>
                <div className="mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
                  <p className="text-sm font-medium text-foreground">Start with $1 for 14 days</p>
                  <p className="text-xs text-muted-foreground">Then $49/month after trial ends</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Unlimited AI Employees</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Advanced Analytics & Insights</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Priority Support</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Canvas Project Management</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => {
                      toast({
                        title: "Trial Started",
                        description: "Starting your $1 14-day trial. You'll be charged $49/month after the trial ends."
                      });
                    }}
                    className="h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Start $1 Trial
                  </Button>
                </div>
                <Button variant="outline" className="w-full glass-button border-destructive/30 text-destructive hover:bg-destructive/10">
                  Cancel Subscription
                </Button>
              </div>
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
                <span className="text-primary font-light">SIBE SI v6.0</span>
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
                Sign out from your SIBE SI account. You can sign back in at any time.
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
