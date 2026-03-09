import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Plug, MessageCircle, Sheet, CreditCard, Calculator, Plus, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const availableIntegrations = [
  { name: "WhatsApp", icon: MessageCircle, provider: "whatsapp", description: "Send automated messages and notifications" },
  { name: "Google Sheets", icon: Sheet, provider: "google_sheets", description: "Sync data with spreadsheets" },
  { name: "POS System", icon: CreditCard, provider: "pos", description: "Connect point-of-sale data feeds" },
  { name: "Accounting", icon: Calculator, provider: "accounting", description: "Link accounting software for financial data" },
];

const Integrations = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("api_connections").select("*").eq("user_id", user.id);
      setConnections(data || []);
    };
    fetch();
  }, []);

  const isConnected = (provider: string) => connections.some(c => c.provider === provider && c.status === "active");

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-1">Connect your tools and data sources</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {connections.filter(c => c.status === "active").length} active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableIntegrations.map((integration) => {
            const connected = isConnected(integration.provider);
            return (
              <Card key={integration.provider} className="glass-card border-border/50 hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
                        <integration.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{integration.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{integration.description}</p>
                      </div>
                    </div>
                    {connected ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-500">Connected</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => toast({ title: "Coming Soon", description: `${integration.name} integration will be available soon.` })}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Existing Connections */}
        {connections.length > 0 && (
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div key={conn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="flex items-center gap-3">
                      <Plug className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-foreground">{conn.name}</p>
                        <p className="text-xs text-muted-foreground">{conn.provider}</p>
                      </div>
                    </div>
                    <Badge variant={conn.status === "active" ? "default" : "outline"} className="text-[10px]">
                      {conn.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Integrations;
