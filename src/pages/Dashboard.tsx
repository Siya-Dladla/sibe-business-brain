import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
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
import { useToast } from "@/hooks/use-toast";
import { Brain, Database, Lightbulb } from "lucide-react";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "insights";
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const chatRef = useRef<any>(null);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { preventScrollReset: true });
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: metricsData, error: metricsError } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'current')
        .order('created_at', { ascending: false })
        .limit(4);
      if (metricsError) throw metricsError;

      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (insightsError) throw insightsError;

      const { data: plansData, error: plansError } = await supabase
        .from('business_plans')
        .select('id, title, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
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

  return (
    <div className="min-h-screen bg-background grid-bg pb-20">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/50 bg-primary-foreground sticky top-0 z-40">
        <div className="flex items-center gap-3 md:gap-4">
          <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
          <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">Sibe SI</h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 bg-primary-foreground">
        {activeTab === "insights" && (
          <div className="space-y-4 md:space-y-6">
            <KPIAlerts metrics={metrics} />
            <QuickActions onAction={handleQuickAction} />
            <BusinessDNA metrics={metrics} />
            <MetricsGrid metrics={metrics} />
            <div className="w-full">
              <SibeChat ref={chatRef} />
            </div>
          </div>
        )}

        {activeTab === "collection" && (
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ManualMetricsInput onMetricSaved={fetchData} />
              <APIDataFeeds />
            </div>

            <KPITargetSetting metrics={metrics} onTargetSaved={fetchData} />

            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <WebsiteAnalyzer onAnalysisComplete={fetchData} />
              <DocumentUpload onUploadSuccess={fetchData} />
            </div>

            {plans.length > 0 && (
              <Card className="glass-card p-4 md:p-6">
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
                  {plans.map(plan => (
                    <div key={plan.id} className="p-3 bg-background/50 border border-primary/20 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-light">{plan.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/50 backdrop-blur-xl">
        <div className="flex">
          <button
            onClick={() => handleTabChange("insights")}
            className={`flex-1 flex flex-col items-center gap-1 py-4 transition-all ${
              activeTab === "insights" 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Brain className="w-5 h-5" />
            <span className="text-xs font-light">Data Insights</span>
          </button>
          <button
            onClick={() => handleTabChange("collection")}
            className={`flex-1 flex flex-col items-center gap-1 py-4 transition-all ${
              activeTab === "collection" 
                ? "text-primary bg-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Database className="w-5 h-5" />
            <span className="text-xs font-light">Data Collection</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;