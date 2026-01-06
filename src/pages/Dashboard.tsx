import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import DocumentUpload from "@/components/DocumentUpload";
import MetricsGrid from "@/components/MetricsGrid";
import ManualMetricsInput from "@/components/ManualMetricsInput";
import APIDataFeeds from "@/components/APIDataFeeds";
import KPITargetSetting from "@/components/KPITargetSetting";
import SibeChat from "@/components/SibeChat";
import QuickActions from "@/components/QuickActions";
import WebsiteAnalyzer from "@/components/WebsiteAnalyzer";
import BusinessDNA from "@/components/BusinessDNA";
import KPIAlerts from "@/components/KPIAlerts";
import { HistoricalMetrics } from "@/components/HistoricalMetrics";
import { useToast } from "@/hooks/use-toast";
import { Brain, Database, Lightbulb } from "lucide-react";
const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "insights";
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    toast
  } = useToast();
  const chatRef = useRef<any>(null);
  
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { preventScrollReset: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
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
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40">
        <MobileMenu />
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 bg-primary-foreground">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 mb-3">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">Sibe SI</h1>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-full md:max-w-md h-auto">
            <TabsTrigger value="insights" className="flex items-center gap-2 py-3 text-xs md:text-sm">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span> Insights
            </TabsTrigger>
            <TabsTrigger value="collection" className="flex items-center gap-2 py-3 text-xs md:text-sm">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span> Collection
            </TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4 md:space-y-6">
            {/* KPI Alerts */}
            <KPIAlerts metrics={metrics} />

            {/* Quick Actions */}
            <QuickActions onAction={handleQuickAction} />

            {/* Business Brain - Business DNA */}
            <BusinessDNA metrics={metrics} />

            {/* Historical Metrics with Trend Analysis */}
            <HistoricalMetrics />

            {/* Metrics Grid */}
            <MetricsGrid metrics={metrics} />

            {/* Ask Sibe SI - Enhanced Chat */}
            <div className="w-full">
              <SibeChat ref={chatRef} />
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-4 md:space-y-6">
            {/* Manual Metrics Input & API Data Feeds */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ManualMetricsInput onMetricSaved={fetchData} />
              <APIDataFeeds />
            </div>

            {/* KPI Target Setting */}
            <KPITargetSetting metrics={metrics} onTargetSaved={fetchData} />

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <WebsiteAnalyzer onAnalysisComplete={fetchData} />
              <DocumentUpload onUploadSuccess={fetchData} />
            </div>

            {plans.length > 0 && <Card className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  <div>
                    <h3 className="text-lg md:text-xl font-extralight">Collected Data</h3>
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