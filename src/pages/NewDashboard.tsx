import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, Users, Gauge, Brain, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  description: string;
}

const NewDashboard = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [metricsRes, insightsRes] = await Promise.all([
        supabase.from("business_metrics").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("ai_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(4),
      ]);

      setMetrics(metricsRes.data || []);
      setInsights(insightsRes.data || []);
    };
    fetchData();
  }, []);

  const cards: MetricCard[] = [
    {
      title: "Revenue Trends",
      value: metrics.find(m => m.metric_type === "revenue")?.value?.toLocaleString() || "—",
      change: metrics.find(m => m.metric_type === "revenue")?.change_percentage || 0,
      icon: TrendingUp,
      description: "Total revenue performance",
    },
    {
      title: "Customer Activity",
      value: metrics.find(m => m.metric_type === "customers")?.value?.toLocaleString() || "—",
      change: metrics.find(m => m.metric_type === "customers")?.change_percentage || 0,
      icon: Users,
      description: "Active customer engagement",
    },
    {
      title: "Operational Efficiency",
      value: metrics.find(m => m.metric_type === "operations")?.value ? `${metrics.find(m => m.metric_type === "operations")?.value}%` : "—",
      change: metrics.find(m => m.metric_type === "operations")?.change_percentage || 0,
      icon: Gauge,
      description: "Process optimization score",
    },
    {
      title: "AI Recommendations",
      value: `${insights.length}`,
      change: 0,
      icon: Brain,
      description: "Pending AI-driven actions",
    },
  ];

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8">
        {/* Header with status */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Business performance overview</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Systems Active</span>
          </div>
        </div>

        {/* Performance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <Card key={card.title} className="glass-card hover-lift border-border/50 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                <card.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">{card.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  {card.change > 0 ? (
                    <ArrowUpRight className="w-3 h-3 text-primary" />
                  ) : card.change < 0 ? (
                    <ArrowDownRight className="w-3 h-3 text-destructive" />
                  ) : null}
                  <span className={`text-xs ${card.change > 0 ? "text-primary" : card.change < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {card.change !== 0 ? `${Math.abs(card.change)}%` : "No change"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI Recommendations */}
        <div>
          <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Latest AI Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.length > 0 ? insights.map((insight) => (
              <Card key={insight.id} className="glass-card border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: "0 0 6px hsla(190, 95%, 50%, 0.5)" }} />
                    <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground line-clamp-3">{insight.content}</p>
                  <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full border border-primary/20 text-primary/80">
                    {insight.insight_type}
                  </span>
                </CardContent>
              </Card>
            )) : (
              <Card className="glass-card border-border/50 col-span-2">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full arc-gradient flex items-center justify-center" style={{ boxShadow: "0 0 20px hsla(190, 95%, 50%, 0.2)" }}>
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No insights yet. Upload data to get AI-powered recommendations.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewDashboard;
