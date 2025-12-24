import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import DocumentUpload from "@/components/DocumentUpload";
import MetricsGrid from "@/components/MetricsGrid";
import SibeChat from "@/components/SibeChat";
import QuickActions from "@/components/QuickActions";
import WebsiteAnalyzer from "@/components/WebsiteAnalyzer";
import { useToast } from "@/hooks/use-toast";
import { Brain, Database, Lightbulb } from "lucide-react";
const Dashboard = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const chatRef = useRef<any>(null);
  const fetchData = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch metrics
      const {
        data: metricsData,
        error: metricsError
      } = await supabase.from('business_metrics').select('*').eq('user_id', user.id).eq('period', 'current').order('created_at', {
        ascending: false
      }).limit(4);
      if (metricsError) throw metricsError;

      // Fetch insights
      const {
        data: insightsData,
        error: insightsError
      } = await supabase.from('ai_insights').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(5);
      if (insightsError) throw insightsError;

      // Fetch plans
      const {
        data: plansData,
        error: plansError
      } = await supabase.from('business_plans').select('id, title, created_at').eq('user_id', user.id).order('created_at', {
        ascending: false
      });
      if (plansError) throw plansError;
      setMetrics(metricsData || []);
      setInsights(insightsData || []);
      setPlans(plansData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleQuickAction = (question: string) => {
    if (chatRef.current) {
      chatRef.current.sendMessage(question);
    }
  };
  useEffect(() => {
    fetchData();

    // Set up realtime subscriptions
    const metricsChannel = supabase.channel('dashboard-metrics').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'business_metrics'
    }, fetchData).subscribe();
    const insightsChannel = supabase.channel('dashboard-insights').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ai_insights'
    }, fetchData).subscribe();
    const plansChannel = supabase.channel('dashboard-plans').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'business_plans'
    }, fetchData).subscribe();
    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(insightsChannel);
      supabase.removeChannel(plansChannel);
    };
  }, []);
  return <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground">
        <MobileMenu />
        
      </div>

      <div className="container mx-auto px-6 py-8 bg-primary-foreground">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
            <div>
              <h1 className="font-extralight tracking-wide text-6xl">Sibe </h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                Your Synthetic Intelligence Business Partner
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="insights" className="space-y-6 bg-primary-foreground">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Data Insights
            </TabsTrigger>
            <TabsTrigger value="collection" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Data Collection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            {/* Quick Actions */}
            <QuickActions onAction={handleQuickAction} />

            {/* Metrics Grid */}
            <MetricsGrid metrics={metrics} />

            {/* Ask Sibe SI - Enhanced Chat */}
            <div className="w-full">
              <SibeChat ref={chatRef} />
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WebsiteAnalyzer onAnalysisComplete={fetchData} />
              <DocumentUpload onUploadSuccess={fetchData} />
            </div>

            {plans.length > 0 && <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-extralight">Collected Data</h3>
                    <p className="text-xs text-muted-foreground font-light">
                      Your uploaded business plans and analyzed websites
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {plans.map(plan => <div key={plan.id} className="p-3 bg-background/50 border border-primary/20 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-light">{plan.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>)}
                </div>
              </Card>}
          </TabsContent>
        </Tabs>
      </div>
    </div>;
};
export default Dashboard;