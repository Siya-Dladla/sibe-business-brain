import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users, TrendingUp, ArrowUp, ArrowDown, Wallet, AlertTriangle, Target } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useEffect, useState } from "react";

interface Metric {
  metric_type: string;
  metric_name: string;
  value: number;
  change_percentage: number;
}

interface KPITarget {
  id: string;
  metric_type: string;
  target_value: number;
  current_value: number;
  risk_percentage: number;
}

interface MetricsGridProps {
  metrics: Metric[];
}

// Sample trend data for mini charts
const generateTrendData = (positive: boolean) => {
  const baseValue = positive ? 50 : 80;
  const trend = positive ? 1.08 : 0.95;
  return Array.from({ length: 7 }, (_, i) => ({
    value: Math.floor(baseValue * Math.pow(trend, i) + (Math.random() * 10 - 5)),
  }));
};

const defaultMetrics = [
  { metric_type: 'customers', metric_name: 'Total Customers', value: 0, change_percentage: 0 },
  { metric_type: 'revenue', metric_name: 'Total Revenue', value: 0, change_percentage: 0 },
  { metric_type: 'profit', metric_name: 'Net Profit', value: 0, change_percentage: 0 },
];

const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  const [targets, setTargets] = useState<KPITarget[]>([]);

  // Load KPI targets from localStorage
  useEffect(() => {
    const savedTargets = localStorage.getItem('kpi_targets');
    if (savedTargets) {
      setTargets(JSON.parse(savedTargets));
    }

    // Listen for storage changes
    const handleStorageChange = () => {
      const updatedTargets = localStorage.getItem('kpi_targets');
      if (updatedTargets) {
        setTargets(JSON.parse(updatedTargets));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="w-5 h-5" />;
      case 'customers':
        return <Users className="w-5 h-5" />;
      case 'profit':
        return <Wallet className="w-5 h-5" />;
      case 'growth':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'revenue' || type === 'profit') {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    }
    if (type === 'customers') {
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toFixed(0);
    }
    return value.toFixed(0);
  };

  const getGradientColors = (type: string) => {
    switch (type) {
      case 'customers':
        return { from: '#6366f1', to: '#8b5cf6' }; // indigo to violet
      case 'revenue':
        return { from: '#22c55e', to: '#10b981' }; // green shades
      case 'profit':
        return { from: '#f59e0b', to: '#eab308' }; // amber to yellow
      default:
        return { from: '#6366f1', to: '#8b5cf6' };
    }
  };

  const getStatusBadge = (change: number) => {
    if (change > 15) return { text: "Excellent", color: "bg-green-500/20 text-green-400 border-green-500/30" };
    if (change > 5) return { text: "Growing", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    if (change > 0) return { text: "Stable", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    if (change > -5) return { text: "Declining", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" };
    return { text: "Critical", color: "bg-red-500/20 text-red-400 border-red-500/30" };
  };

  const getRiskInfo = (metricType: string, currentValue: number) => {
    const target = targets.find(t => t.metric_type === metricType);
    if (!target) return null;

    const progress = target.target_value > 0 
      ? (currentValue / target.target_value) * 100
      : 0;
    
    const riskThreshold = 100 - target.risk_percentage;
    const isAtRisk = progress < 100 && progress >= riskThreshold;
    const isBehind = progress < riskThreshold;

    return {
      target: target.target_value,
      progress: Math.min(progress, 100),
      riskPercentage: target.risk_percentage,
      isAtRisk,
      isBehind,
      status: progress >= 100 ? 'on-target' : isAtRisk ? 'at-risk' : isBehind ? 'behind' : 'tracking'
    };
  };

  // Use default metrics if none provided
  const displayMetrics = metrics && metrics.length > 0 
    ? metrics.filter(m => ['customers', 'revenue', 'profit'].includes(m.metric_type))
    : defaultMetrics;

  // If we have fewer than 3 metrics, add defaults
  const finalMetrics = displayMetrics.length >= 3 
    ? displayMetrics.slice(0, 3) 
    : [...displayMetrics, ...defaultMetrics.filter(d => !displayMetrics.find(m => m.metric_type === d.metric_type))].slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-light text-foreground">Growth Dashboard</h2>
          <p className="text-xs text-muted-foreground">Real-time business performance</p>
        </div>
        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
          Live Data
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {finalMetrics.map((metric, index) => {
          const badge = getStatusBadge(metric.change_percentage);
          const colors = getGradientColors(metric.metric_type);
          const trendData = generateTrendData(metric.change_percentage >= 0);
          const isPositive = metric.change_percentage >= 0;

          return (
            <Card 
              key={metric.metric_type} 
              className="relative overflow-hidden bg-card border-border/50 hover:border-primary/30 transition-all duration-300"
            >
              {/* Background gradient accent */}
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ background: `linear-gradient(90deg, ${colors.from}, ${colors.to})` }}
              />
              
              <div className="p-4 md:p-5">
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: `linear-gradient(135deg, ${colors.from}20, ${colors.to}10)` }}
                  >
                    <div style={{ color: colors.from }}>{getIcon(metric.metric_type)}</div>
                  </div>
                  <Badge className={`${badge.color} border text-[10px]`}>
                    {badge.text}
                  </Badge>
                </div>

                {/* Metric name */}
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">
                  {metric.metric_name}
                </p>

                {/* Value */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl md:text-3xl font-semibold text-foreground">
                    {formatValue(metric.metric_type, metric.value) || '--'}
                  </span>
                  <div className={`flex items-center gap-0.5 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    <span className="font-medium">{Math.abs(metric.change_percentage).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Risk & Target Info */}
                {(() => {
                  const riskInfo = getRiskInfo(metric.metric_type, metric.value);
                  if (riskInfo) {
                    return (
                      <div className="mb-3 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3 text-muted-foreground" />
                            <span className="text-muted-foreground">Target: {formatValue(metric.metric_type, riskInfo.target)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <AlertTriangle className={`w-3 h-3 ${riskInfo.isAtRisk ? 'text-amber-400' : riskInfo.isBehind ? 'text-red-400' : 'text-muted-foreground'}`} />
                            <span className={`${riskInfo.isAtRisk ? 'text-amber-400' : riskInfo.isBehind ? 'text-red-400' : 'text-muted-foreground'}`}>
                              {riskInfo.riskPercentage}% risk
                            </span>
                          </div>
                        </div>
                        <Progress 
                          value={riskInfo.progress} 
                          className="h-1.5"
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground">
                          <span>{riskInfo.progress.toFixed(0)}% of target</span>
                          <span className={
                            riskInfo.status === 'on-target' ? 'text-green-400' :
                            riskInfo.status === 'at-risk' ? 'text-amber-400' :
                            riskInfo.status === 'behind' ? 'text-red-400' : ''
                          }>
                            {riskInfo.status === 'on-target' ? 'On Target' :
                             riskInfo.status === 'at-risk' ? 'At Risk' :
                             riskInfo.status === 'behind' ? 'Behind' : 'Tracking'}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Mini Chart - Power BI style */}
                <div className="h-10 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {index % 2 === 0 ? (
                      <AreaChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`gradient-${metric.metric_type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.from} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={colors.to} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={colors.from}
                          strokeWidth={2}
                          fill={`url(#gradient-${metric.metric_type})`}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart data={trendData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`bar-gradient-${metric.metric_type}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.from} stopOpacity={0.8} />
                            <stop offset="100%" stopColor={colors.to} stopOpacity={0.4} />
                          </linearGradient>
                        </defs>
                        <Bar
                          dataKey="value"
                          fill={`url(#bar-gradient-${metric.metric_type})`}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-muted-foreground">vs last period</span>
                  <span className="text-[10px] text-muted-foreground">7-day trend</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsGrid;
