import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import DocumentUpload from "@/components/DocumentUpload";
import MetricsGrid from "@/components/MetricsGrid";
import ManualMetricsInput from "@/components/ManualMetricsInput";
import APIDataFeeds from "@/components/APIDataFeeds";
import KPITargetSetting from "@/components/KPITargetSetting";
import WebsiteAnalyzer from "@/components/WebsiteAnalyzer";
import BusinessDNA from "@/components/BusinessDNA";
import KPIAlerts from "@/components/KPIAlerts";
import CurrentBusiness from "@/components/CurrentBusiness";
import { HistoricalMetrics } from "@/components/HistoricalMetrics";
import SalesAnalytics from "@/components/ecommerce/SalesAnalytics";
import InventoryAlerts from "@/components/ecommerce/InventoryAlerts";
import CustomerInsights from "@/components/ecommerce/CustomerInsights";
import QuickActionsPanel from "@/components/ecommerce/QuickActionsPanel";
import { useToast } from "@/hooks/use-toast";
import { Brain, Database, Lightbulb, RefreshCw, Clock, TrendingUp, ShoppingBag } from "lucide-react";

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
    <div className="min-h-screen bg-background grid-bg pb-24 md:pb-0">
      {/* Header - Sticky & Mobile optimized */}
      <div className="p-3 md:p-6 flex items-center justify-between border-b border-border/50 bg-card sticky top-0 z-40">
        <MobileMenu />
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground hidden sm:block" />
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Updated: {lastRefresh.toLocaleTimeString()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-9 w-9 p-0 md:h-9 md:w-auto md:px-3"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden md:inline ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-3 md:px-6 py-4 md:py-8 bg-card">
        {/* Header Section */}
        <div className="mb-4 md:mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-xl md:text-4xl font-extralight tracking-wide">Sibe SI</h1>
              <p className="text-xs text-muted-foreground">E-Commerce Intelligence Dashboard</p>
            </div>
          </div>

          {/* Timeframe Selector */}
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-full md:w-[140px] bg-background border-border/50 h-11">
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
        </div>

        {/* Tabs - Mobile optimized with swipe-friendly layout */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 md:h-auto md:max-w-lg">
            <TabsTrigger value="insights" className="flex items-center gap-1 md:gap-2 py-2 md:py-3 text-xs md:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Sales</span>
              <span className="sm:hidden">Sales</span>
            </TabsTrigger>
            <TabsTrigger value="store" className="flex items-center gap-1 md:gap-2 py-2 md:py-3 text-xs md:text-sm">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Store</span>
              <span className="sm:hidden">Store</span>
            </TabsTrigger>
            <TabsTrigger value="collection" className="flex items-center gap-1 md:gap-2 py-2 md:py-3 text-xs md:text-sm">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">Data</span>
              <span className="sm:hidden">Data</span>
            </TabsTrigger>
          </TabsList>

          {/* Sales & Analytics Tab */}
          <TabsContent value="insights" className="space-y-4 md:space-y-6">
            {/* Sales Analytics */}
            <SalesAnalytics />

            {/* Current Business Status */}
            <CurrentBusiness onBusinessChange={fetchData} />

            {/* Inventory Alerts */}
            <InventoryAlerts />

            {/* Customer Insights */}
            <CustomerInsights />

            {/* KPI Alerts Section */}
            <KPIAlerts metrics={metrics} />

            {/* Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
                <div className="space-y-3">
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

            {/* Historical Analysis */}
            <HistoricalMetrics />
          </TabsContent>

          {/* Store Management Tab */}
          <TabsContent value="store" className="space-y-4 md:space-y-6">
            {/* Quick Actions Panel */}
            <QuickActionsPanel />

            {/* Inventory Alerts */}
            <InventoryAlerts />

            {/* Customer Insights */}
            <CustomerInsights />
          </TabsContent>

          {/* Data Collection Tab */}
          <TabsContent value="collection" className="space-y-4 md:space-y-6">
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
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="p-3 bg-background/50 border border-primary/20 rounded-lg flex justify-between items-center active:bg-muted/50 transition-colors"
                    >
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
