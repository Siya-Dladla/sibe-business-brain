import { Card } from "@/components/ui/card";
import { DollarSign, Zap, TrendingUp, Target, ArrowUp, ArrowDown } from "lucide-react";

interface Metric {
  metric_type: string;
  metric_name: string;
  value: number;
  change_percentage: number;
}

interface MetricsGridProps {
  metrics: Metric[];
}

const MetricsGrid = ({ metrics }: MetricsGridProps) => {
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
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {['revenue', 'efficiency', 'growth', 'conversion'].map((type) => (
          <Card key={type} className="glass-card p-6 hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="text-primary">{getIcon(type)}</div>
              <ArrowUp className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-muted-foreground font-light text-sm mb-2 capitalize">
              {type}
            </h3>
            <p className="text-3xl font-extralight mb-1">--</p>
            <p className="text-sm text-muted-foreground font-light">No data</p>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.metric_type} className="glass-card p-6 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <div className="text-primary">{getIcon(metric.metric_type)}</div>
            {metric.change_percentage >= 0 ? (
              <ArrowUp className="w-4 h-4 text-green-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <h3 className="text-muted-foreground font-light text-sm mb-2">
            {metric.metric_name}
          </h3>
          <p className="text-3xl font-extralight mb-1">
            {formatValue(metric.metric_type, metric.value)}
          </p>
          <p className={`text-sm font-light ${
            metric.change_percentage >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {metric.change_percentage >= 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
          </p>
        </Card>
      ))}
    </div>
  );
};

export default MetricsGrid;