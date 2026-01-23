import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import MetricsGrid from "@/components/MetricsGrid";
import APIDataFeeds from "@/components/APIDataFeeds";
import KPITargetSetting from "@/components/KPITargetSetting";
import BusinessDNA from "@/components/BusinessDNA";
import KPIAlerts from "@/components/KPIAlerts";
import { useToast } from "@/hooks/use-toast";
import { Brain, Database, Lightbulb, RefreshCw, Clock } from "lucide-react";

const Dashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "insights";
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState("current");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { preventScrollReset: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const fetchData = async (period: string = timeframe) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: metricsData, error: metricsError } = await supabase
        .from("business_metrics")
        .select("*")
        .eq("user_id", user.id)
        .eq("period", period)
        .order("created_at", { ascending: false })
        .limit(4);
      if (metricsError) throw metricsError;

      const { data: insightsData, error: insightsError } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (insightsError) throw insightsError;

      const { data: plansData, error: plansError } = await supabase
        .from("business_plans")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (plansError) throw plansError;

      setMetrics(metricsData || []);
      setInsights(insightsData || []);
      setPlans(plansData || []);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData(timeframe);
    toast({
      title: "Data Refreshed",
      description: `Metrics updated as of ${new Date().toLocaleTimeString()}`,
    });
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    setRefreshing(true);
    fetchData(value);
  };

  useEffect(() => {
    fetchData();

    const metricsChannel = supabase
      .channel("dashboard-metrics")
      .on("postgres_changes", { event: "*", schema: "public", table: "business_metrics" }, () => fetchData())
      .subscribe();
    const insightsChannel = supabase
      .channel("dashboard-insights")
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_insights" }, () => fetchData())
      .subscribe();
    const plansChannel = supabase
      .channel("dashboard-plans")
      .on("postgres_changes", { event: "*", schema: "public", table: "business_plans" }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(metricsChannel);
      supabase.removeChannel(insightsChannel);
      supabase.removeChannel(plansChannel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40">
        <MobileMenu />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 bg-primary-foreground">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">Sibe SI</h1>
              <p className="text-xs text-muted-foreground">Data Intelligence Dashboard</p>
            </div>
          </div>

          {/* Refresh Controls */}
          <div className="flex items-center gap-3">
            <Select value={timeframe} onValueChange={handleTimeframeChange}>
              <SelectTrigger className="w-[140px] bg-background border-border/50">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
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

          <TabsContent value="insights" className="space-y-6">
            {/* Alerts Section */}
            <KPIAlerts metrics={metrics} />

            {/* Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Business DNA - Takes 2 columns */}
              <div className="lg:col-span-2">
                <BusinessDNA metrics={metrics} />
              </div>

              {/* Quick Stats */}
              <Card className="glass-card p-4 md:p-6 border-primary/20">
                <h3 className="text-lg font-light mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground">Total Metrics</p>
                    <p className="text-2xl font-light">{metrics.length}</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground">Active Insights</p>
                    <p className="text-2xl font-light">{insights.length}</p>
                  </div>
                  <div className="p-3 bg-background/50 rounded-lg border border-border/30">
                    <p className="text-xs text-muted-foreground">Data Sources</p>
                    <p className="text-2xl font-light">{plans.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Metrics Grid */}
            <MetricsGrid metrics={metrics} />
          </TabsContent>

          <TabsContent value="collection" className="space-y-4 md:space-y-6">
            {/* API Data Feeds - Full Width */}
            <APIDataFeeds />

            {/* KPI Target Setting */}
            <KPITargetSetting metrics={metrics} onTargetSaved={fetchData} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
