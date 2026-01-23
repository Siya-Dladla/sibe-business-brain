import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  TrendingUp, 
  Users,
  DollarSign,
  Wallet,
  Calendar,
  Target
} from "lucide-react";
import { format } from "date-fns";

interface BusinessDNAProps {
  metrics: Array<{
    metric_type: string;
    metric_name: string;
    value: number;
    change_percentage: number;
    created_at?: string;
  }>;
}

const BusinessDNA = ({ metrics }: BusinessDNAProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated loading state
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const formatValue = (type: string, value: number) => {
    if (type === 'revenue' || type === 'profit') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value.toFixed(0)}`;
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'customers': return <Users className="w-4 h-4 text-indigo-400" />;
      case 'revenue': return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'profit': return <Wallet className="w-4 h-4 text-amber-400" />;
      default: return <TrendingUp className="w-4 h-4 text-primary" />;
    }
  };

  const latestDate = metrics.length > 0 && metrics[0]?.created_at 
    ? format(new Date(metrics[0].created_at), 'MMM d, yyyy')
    : format(new Date(), 'MMM d, yyyy');

  return (
    <Card className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Business Brain</h3>
            <p className="text-xs text-muted-foreground">Key performance metrics</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{latestDate}</span>
        </div>
      </div>

      {/* KPI Summary - Full Width */}
      <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">Key Metrics Overview</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.length > 0 ? (
            metrics.slice(0, 4).map((metric) => (
              <div key={metric.metric_type} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getMetricIcon(metric.metric_type)}
                  <span className="text-xs text-muted-foreground capitalize">{metric.metric_type}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-medium">{formatValue(metric.metric_type, metric.value)}</span>
                  <span className={`text-xs ${metric.change_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change_percentage >= 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-6">
              <p className="text-sm text-muted-foreground">No metrics data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Connect your data sources to see insights</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default BusinessDNA;
