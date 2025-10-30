import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, User, LogOut, Save } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    email: "",
    full_name: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

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

      const { error } = await supabase
        .from("profiles")
        .upsert({
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

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">System Settings</div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-5xl font-extralight mb-3 tracking-wide">Settings</h1>
          <p className="text-primary text-lg font-light">Configure your SIBE SI platform</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card className="glass-card p-8 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide">Profile Settings</h2>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            ) : (
              <form onSubmit={saveProfile} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-light">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-input/50 border-primary/20 font-light"
                  />
                  <p className="text-xs text-muted-foreground font-light">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-light">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="bg-input border-primary/20 focus:border-primary font-light"
                  />
                </div>

                <Button
                  type="submit"
                  className="glass-button text-primary border-primary/30 hover:bg-primary/10 h-11 px-8"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
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

          {/* Platform Information */}
          <Card className="glass-card p-8 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide">Platform Information</h2>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-3 border-b border-border/30">
                <span className="text-muted-foreground font-light">Platform Version</span>
                <span className="text-primary font-light">SIBE SI v6.0</span>
              </div>
              
              <div className="flex justify-between py-3 border-b border-border/30">
                <span className="text-muted-foreground font-light">AI Engine</span>
                <span className="text-primary font-light">OpenAI GPT-4</span>
              </div>
              
              <div className="flex justify-between py-3 border-b border-border/30">
                <span className="text-muted-foreground font-light">Backend</span>
                <span className="text-primary font-light">Lovable Cloud</span>
              </div>

              <div className="flex justify-between py-3">
                <span className="text-muted-foreground font-light">Status</span>
                <span className="text-green-400 font-light">● Active</span>
              </div>
            </div>
          </Card>

          {/* Account Actions */}
          <Card className="glass-card p-8 border-primary/20">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-extralight tracking-wide">Account Actions</h2>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-light">
                Sign out from your SIBE SI account. You can sign back in at any time.
              </p>

              <Button
                onClick={handleSignOut}
                variant="outline"
                className="glass-button border-destructive/30 text-destructive hover:bg-destructive/10 h-11 px-8"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>

          {/* Feature Overview */}
          <Card className="glass-card p-8 border-primary/20">
            <h2 className="text-2xl font-extralight tracking-wide mb-6">Enabled Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="font-light text-primary mb-1">Business Plan Analysis</h3>
                <p className="text-xs text-muted-foreground font-light">
                  AI-powered document analysis and insights
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="font-light text-primary mb-1">AI Employees</h3>
                <p className="text-xs text-muted-foreground font-light">
                  Create synthetic workforce members
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="font-light text-primary mb-1">AI Meetings</h3>
                <p className="text-xs text-muted-foreground font-light">
                  Strategic conference with AI team
                </p>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <h3 className="font-light text-primary mb-1">Forecasting & Reports</h3>
                <p className="text-xs text-muted-foreground font-light">
                  Predictive analytics and business reports
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
