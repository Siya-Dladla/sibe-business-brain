import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import DocumentUpload from "@/components/DocumentUpload";
import MetricsGrid from "@/components/MetricsGrid";
import AIInsights from "@/components/AIInsights";
import SibeChat from "@/components/SibeChat";
import BusinessDNA from "@/components/BusinessDNA";
import QuickActions from "@/components/QuickActions";
import WebsiteAnalyzer from "@/components/WebsiteAnalyzer";
import { useToast } from "@/hooks/use-toast";
import { Brain, Sparkles } from "lucide-react";

const Dashboard = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const chatRef = useRef<any>(null);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', user.id)
        .eq('period', 'current')
        .order('created_at', { ascending: false })
        .limit(4);

      if (metricsError) throw metricsError;

      // Fetch insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (insightsError) throw insightsError;

      // Fetch plans
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
        variant: "destructive",
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
    const metricsChannel = supabase
      .channel('dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'business_metrics' }, fetchData)
      .subscribe();

    const insightsChannel = supabase
      .channel('dashboard-insights')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_insights' }, fetchData)
      .subscribe();

    const plansChannel = supabase
      .channel('dashboard-plans')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'business_plans' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(insightsChannel);
      supabase.removeChannel(plansChannel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Analytics Dashboard</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-5xl font-extralight tracking-wide">Business Intelligence</h1>
              <p className="text-primary text-lg font-light flex items-center gap-2 mt-1">
                <Sparkles className="w-4 h-4" />
                Your synthetic business brain is learning
              </p>
            </div>
          </div>
        </div>

        {/* Business DNA Analysis */}
        <div className="mb-8">
          <BusinessDNA 
            metricsCount={metrics.length}
            insightsCount={insights.length}
            plansCount={plans.length}
          />
        </div>

        {/* Website Analyzer */}
        <div className="mb-8">
          <WebsiteAnalyzer onAnalysisComplete={fetchData} />
        </div>

        {/* Chat with Sibe SI */}
        <div className="mb-8">
          <SibeChat ref={chatRef} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions onAction={handleQuickAction} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Document Upload Section */}
          <DocumentUpload onUploadSuccess={fetchData} />
          
          {/* AI Insights */}
          <AIInsights insights={insights} onInsightGenerated={fetchData} />
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-extralight mb-4 tracking-wide">Live Performance Metrics</h2>
          <MetricsGrid metrics={metrics} />
        </div>

        {/* Strategic Overview */}
        <Card className="glass-card hover-lift border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-light flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Strategic Intelligence Dashboard
            </CardTitle>
            <CardDescription className="text-muted-foreground font-light">
              Sibe SI continuously monitors your business and provides real-time strategic recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-primary/10 rounded bg-black/20 backdrop-blur-sm">
              <div className="text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-primary opacity-50" />
                <p className="text-muted-foreground font-light">Advanced analytics visualizations coming soon</p>
                <p className="text-xs text-muted-foreground/60 mt-2">Sibe SI is processing your business data</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;