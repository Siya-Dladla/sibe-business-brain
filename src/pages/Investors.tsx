import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Globe, Mail, MapPin, Briefcase, Plus, Building2, DollarSign } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Investor {
  id: string;
  name: string;
  company: string | null;
  investment_focus: string[] | null;
  investment_range: string | null;
  location: string | null;
  website: string | null;
  email: string | null;
  bio: string | null;
  looking_for: string | null;
  created_at: string;
}

const Investors = () => {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [connectionMessage, setConnectionMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    investmentFocus: "",
    investmentRange: "",
    location: "",
    website: "",
    email: "",
    bio: "",
    lookingFor: ""
  });
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchInvestors = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("investors")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvestors(data || []);
    } catch (error: any) {
      console.error("Error fetching investors:", error);
    } finally {
      setLoading(false);
    }
  };

  const createInvestorProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create an investor profile",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("investors")
        .insert({
          user_id: user.id,
          name: formData.name,
          company: formData.company || null,
          investment_focus: formData.investmentFocus.split(',').map(s => s.trim()),
          investment_range: formData.investmentRange || null,
          location: formData.location || null,
          website: formData.website || null,
          email: formData.email || null,
          bio: formData.bio || null,
          looking_for: formData.lookingFor || null,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Investor profile created successfully"
      });

      setFormData({
        name: "",
        company: "",
        investmentFocus: "",
        investmentRange: "",
        location: "",
        website: "",
        email: "",
        bio: "",
        lookingFor: ""
      });
      setOpen(false);
      fetchInvestors();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const connectWithInvestor = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect with investors",
        variant: "destructive"
      });
      return;
    }

    if (!selectedInvestor) return;

    try {
      const { error } = await supabase
        .from("investor_connections")
        .insert({
          business_owner_id: user.id,
          investor_id: selectedInvestor.id,
          message: connectionMessage,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Connection Request Sent",
        description: "The investor will be notified of your interest"
      });

      setConnectionMessage("");
      setConnectOpen(false);
      setSelectedInvestor(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchInvestors();

    // Set up realtime subscription
    const channel = supabase
      .channel('investors-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'investors' }, fetchInvestors)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Global Investment Network</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-extralight mb-3 tracking-wide">Investor Network</h1>
            <p className="text-primary text-lg font-light">Connect with investors worldwide</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button text-primary border-primary/30 hover:bg-primary/10 h-12 px-8">
                <Plus className="w-4 h-4 mr-2" />
                List as Investor
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20 sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extralight tracking-wide">
                  Create Investor Profile
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-light">
                  Join our global network and connect with promising businesses
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createInvestorProfile} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-light">Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-input border-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light">Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="bg-input border-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-light">Investment Focus (comma separated)</Label>
                  <Input
                    placeholder="e.g., Tech, Healthcare, Finance"
                    value={formData.investmentFocus}
                    onChange={(e) => setFormData({ ...formData, investmentFocus: e.target.value })}
                    className="bg-input border-primary/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-light">Investment Range</Label>
                    <Input
                      placeholder="e.g., $100K - $5M"
                      value={formData.investmentRange}
                      onChange={(e) => setFormData({ ...formData, investmentRange: e.target.value })}
                      className="bg-input border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light">Location</Label>
                    <Input
                      placeholder="e.g., New York, USA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-input border-primary/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-light">Website</Label>
                    <Input
                      type="url"
                      placeholder="https://..."
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="bg-input border-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-light">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-input border-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-light">Bio</Label>
                  <Textarea
                    placeholder="Tell us about your investment philosophy..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="bg-input border-primary/20 min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-light">What I'm Looking For</Label>
                  <Textarea
                    placeholder="Describe ideal investment opportunities..."
                    value={formData.lookingFor}
                    onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                    className="bg-input border-primary/20 min-h-[100px]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full glass-button text-primary border-primary/30 hover:bg-primary/20 h-11"
                >
                  Create Profile
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[400px] border-primary/20">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-light">Loading investors...</p>
          </Card>
        ) : investors.length === 0 ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20">
            <TrendingUp className="w-20 h-20 text-primary mb-8 opacity-50 animate-pulse-glow" />
            <h2 className="text-3xl font-extralight mb-4 text-primary">No Investors Yet</h2>
            <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
              Be the first to join our global investment network and discover promising business opportunities.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investors.map((investor) => (
              <Card key={investor.id} className="glass-card p-6 hover-lift border-primary/20 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-light tracking-wide mb-1">{investor.name}</h3>
                    {investor.company && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        {investor.company}
                      </div>
                    )}
                  </div>
                </div>

                {investor.bio && (
                  <p className="text-sm text-muted-foreground font-light line-clamp-3 mb-4">
                    {investor.bio}
                  </p>
                )}

                <div className="space-y-3 mb-4">
                  {investor.investment_range && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground font-light">{investor.investment_range}</span>
                    </div>
                  )}

                  {investor.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground font-light">{investor.location}</span>
                    </div>
                  )}

                  {investor.investment_focus && investor.investment_focus.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {investor.investment_focus.slice(0, 3).map((focus, idx) => (
                        <Badge key={idx} variant="outline" className="border-primary/30 text-primary text-xs">
                          {focus}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-primary/10">
                  {investor.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 glass-button text-primary border-primary/30 hover:bg-primary/10"
                      onClick={() => window.open(investor.website!, '_blank')}
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Website
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 glass-button text-primary border-primary/30 hover:bg-primary/10"
                    onClick={() => {
                      setSelectedInvestor(investor);
                      setConnectOpen(true);
                    }}
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    Connect
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Connection Dialog */}
        <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
          <DialogContent className="glass-card border-primary/20 sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-extralight tracking-wide">
                Connect with {selectedInvestor?.name}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-light">
                Send a connection request with your pitch
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-light">Your Message</Label>
                <Textarea
                  placeholder="Introduce your business and why you're reaching out..."
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  className="bg-input border-primary/20 min-h-[150px]"
                />
              </div>

              <Button
                onClick={connectWithInvestor}
                className="w-full glass-button text-primary border-primary/30 hover:bg-primary/20 h-11"
              >
                Send Connection Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investors;
