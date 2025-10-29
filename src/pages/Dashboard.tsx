import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import DocumentUpload from "@/components/DocumentUpload";
import MetricsGrid from "@/components/MetricsGrid";
import AIInsights from "@/components/AIInsights";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

      setMetrics(metricsData || []);
      setInsights(insightsData || []);
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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Analytics Dashboard</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-5xl font-extralight mb-3 tracking-wide">Analytics</h1>
          <p className="text-primary text-lg font-light">Real-time business intelligence and insights</p>
        </div>

        {/* Document Upload Section */}
        <div className="mb-8">
          <DocumentUpload onUploadSuccess={fetchData} />
        </div>

        {/* KPI Cards */}
        <div className="mb-8">
          <MetricsGrid metrics={metrics} />
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <AIInsights insights={insights} onInsightGenerated={fetchData} />
        </div>

        {/* Charts Placeholder */}
        <Card className="glass-card hover-lift border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-light">Analytics Charts</CardTitle>
            <CardDescription className="text-muted-foreground font-light">
              Visual representation of your business performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border border-primary/10 rounded bg-black/20 backdrop-blur-sm">
              <p className="text-muted-foreground font-light">Charts will appear here once you upload business data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;