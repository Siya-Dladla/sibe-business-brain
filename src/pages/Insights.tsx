import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";

const typeIcons: Record<string, React.ElementType> = {
  opportunity: TrendingUp,
  risk: AlertTriangle,
  recommendation: Target,
};

const Insights = () => {
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("ai_insights").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      setInsights(data || []);
    };
    fetch();
  }, []);

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-generated business intelligence</p>
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight) => {
              const Icon = typeIcons[insight.insight_type] || Lightbulb;
              return (
                <Card key={insight.id} className="glass-card border-border/50 hover-lift">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <CardTitle className="text-sm font-medium">{insight.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{insight.insight_type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">{insight.content}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-3">
                      {new Date(insight.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-card border-border/50">
            <CardContent className="p-12 text-center">
              <Lightbulb className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No insights yet</p>
              <p className="text-xs text-muted-foreground mt-1">Upload your business data to generate AI insights.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default Insights;
