import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Brain, Upload, Sparkles, TrendingUp, Target } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import DocumentUpload from "@/components/DocumentUpload";
import AIInsights from "@/components/AIInsights";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Intelligence = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const { user } = useAuth();

  const fetchData = async () => {
    if (!user) return;
    const [insightsRes, plansRes] = await Promise.all([
      supabase.from("ai_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("business_plans").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    setInsights(insightsRes.data || []);
    setPlans(plansRes.data || []);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-card">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Business Intelligence</div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <Brain className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extralight tracking-wide">Business Intelligence</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                Upload data, get AI summaries, insights & forecasts
              </p>
            </div>
          </div>
        </div>

        {/* Split layout: Upload + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <DocumentUpload onUploadSuccess={fetchData} />
            
            {/* Data Sources Summary */}
            <Card className="glass-card p-6 border-border/20">
              <h3 className="text-lg font-light mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Data Sources
              </h3>
              {plans.length === 0 ? (
                <p className="text-sm text-muted-foreground font-light">No data uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {plans.map((plan) => (
                    <div key={plan.id} className="p-3 bg-background/50 rounded-lg border border-border/30 flex items-center justify-between">
                      <span className="text-sm font-light">{plan.title}</span>
                      <span className="text-xs text-muted-foreground">{new Date(plan.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div>
            <AIInsights insights={insights} onInsightGenerated={fetchData} />
          </div>
        </div>

        {/* Forecast Teaser */}
        <Card className="glass-card p-6 border-border/20">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h3 className="text-lg font-light">Forecasts & Trend Analysis</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border border-border/30 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-primary/50" />
              <p className="text-sm font-light">Revenue Forecast</p>
              <p className="text-xs text-muted-foreground mt-1">Ask Sibe AI to generate</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/30 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary/50" />
              <p className="text-sm font-light">Growth Opportunities</p>
              <p className="text-xs text-muted-foreground mt-1">AI-identified patterns</p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border border-border/30 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary/50" />
              <p className="text-sm font-light">Market Trends</p>
              <p className="text-xs text-muted-foreground mt-1">Predictive analytics</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Intelligence;