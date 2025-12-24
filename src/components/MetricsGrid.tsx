import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Zap, TrendingUp, Target, ArrowUp, ArrowDown, Sparkles } from "lucide-react";
interface Metric {
  metric_type: string;
  metric_name: string;
  value: number;
  change_percentage: number;
}
interface MetricsGridProps {
  metrics: Metric[];
}
const MetricsGrid = ({
  metrics
}: MetricsGridProps) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="w-6 h-6" />;
      case 'efficiency':
        return <Zap className="w-6 h-6" />;
      case 'growth':
        return <TrendingUp className="w-6 h-6" />;
      case 'conversion':
        return <Target className="w-6 h-6" />;
      default:
        return <TrendingUp className="w-6 h-6" />;
    }
  };
  const formatValue = (type: string, value: number) => {
    if (type === 'revenue') {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    if (type === 'conversion') {
      return `${value.toFixed(1)}%`;
    }
    if (type === 'efficiency') {
      return `${value.toFixed(0)}%`;
    }
    if (type === 'growth') {
      return `+${value.toFixed(0)}%`;
    }
    return value.toFixed(0);
  };
  if (!metrics || metrics.length === 0) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['revenue', 'efficiency', 'growth', 'conversion'].map(type => <Card key={type} className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="text-primary">{getIcon(type)}</div>
              <ArrowUp className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-muted-foreground font-light text-sm mb-2 capitalize">
              {type}
            </h3>
            <p className="text-3xl font-extralight mb-1">--</p>
            <p className="text-sm text-muted-foreground font-light">No data</p>
          </Card>)}
      </div>;
  }
  const getInsightBadge = (change: number) => {
    if (change > 15) return {
      text: "Exceptional",
      color: "bg-green-500/20 text-green-400"
    };
    if (change > 5) return {
      text: "Strong",
      color: "bg-blue-500/20 text-blue-400"
    };
    if (change > -5) return {
      text: "Stable",
      color: "bg-gray-500/20 text-gray-400"
    };
    return {
      text: "Needs Attention",
      color: "bg-red-500/20 text-red-400"
    };
  };
  return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map(metric => {
      const badge = getInsightBadge(metric.change_percentage);
      return <Card key={metric.metric_type} className="glass-card p-6 hover-lift relative overflow-hidden group bg-primary-foreground">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="text-primary">{getIcon(metric.metric_type)}</div>
                <div className="flex items-center gap-2">
                  {metric.change_percentage >= 0 ? <ArrowUp className="w-4 h-4 text-green-400" /> : <ArrowDown className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              <h3 className="text-muted-foreground font-light text-sm mb-2">
                {metric.metric_name}
              </h3>
              <p className="text-3xl font-extralight mb-2">
                {formatValue(metric.metric_type, metric.value)}
              </p>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-light ${metric.change_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change_percentage >= 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                </p>
                <Badge className={`${badge.color} border-0 text-xs`}>
                  {badge.text}
                </Badge>
              </div>
            </div>
          </Card>;
    })}
    </div>;
};
export default MetricsGrid;