import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  CalendarIcon, TrendingUp, TrendingDown, Minus, Filter, Download, 
  BarChart3, Activity, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { format, subDays, subMonths, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface HistoricalDataPoint {
  date: string;
  revenue: number;
  customers: number;
  conversion: number;
  satisfaction: number;
}

interface TrendAnalysis {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  forecast: number;
  confidence: number;
}

const calculateTrendAnalysis = (data: HistoricalDataPoint[]): TrendAnalysis[] => {
  if (data.length < 2) return [];
  
  const metrics = ['revenue', 'customers', 'conversion', 'satisfaction'] as const;
  
  return metrics.map(metric => {
    const values = data.map(d => d[metric]);
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = firstAvg === 0 ? 0 : ((secondAvg - firstAvg) / firstAvg) * 100;
    const trend = change > 2 ? 'up' : change < -2 ? 'down' : 'stable';
    
    // Simple linear regression for forecast
    const n = values.length;
    const xSum = (n * (n - 1)) / 2;
    const ySum = values.reduce((a, b) => a + b, 0);
    const xySum = values.reduce((sum, y, i) => sum + i * y, 0);
    const xSquaredSum = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const denominator = n * xSquaredSum - xSum * xSum;
    const slope = denominator === 0 ? 0 : (n * xySum - xSum * ySum) / denominator;
    const intercept = (ySum - slope * xSum) / n;
    const forecast = intercept + slope * (n + 7); // 7-day forecast
    
    return {
      metric: metric.charAt(0).toUpperCase() + metric.slice(1),
      trend,
      change: parseFloat(change.toFixed(2)),
      forecast: parseFloat(Math.max(0, forecast).toFixed(2)),
      confidence: Math.min(95, Math.max(60, 85 - Math.abs(change) * 0.5)),
    };
  });
};

export const HistoricalMetrics = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis[]>([]);
  const [quickRange, setQuickRange] = useState<string>('30d');
  const [loading, setLoading] = useState(true);

  // Fetch metrics from database
  const fetchMetrics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay(dateRange.from).toISOString())
        .lte('created_at', endOfDay(dateRange.to).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group metrics by date and transform to chart format
      const groupedByDate = new Map<string, HistoricalDataPoint>();
      
      data?.forEach(metric => {
        const dateKey = format(new Date(metric.created_at), 'yyyy-MM-dd');
        
        if (!groupedByDate.has(dateKey)) {
          groupedByDate.set(dateKey, {
            date: dateKey,
            revenue: 0,
            customers: 0,
            conversion: 0,
            satisfaction: 0,
          });
        }
        
        const point = groupedByDate.get(dateKey)!;
        
        // Map metric_type to our chart fields
        switch (metric.metric_type.toLowerCase()) {
          case 'revenue':
          case 'financial':
            if (metric.metric_name.toLowerCase().includes('revenue')) {
              point.revenue = Number(metric.value);
            }
            break;
          case 'customers':
          case 'customer':
            point.customers = Number(metric.value);
            break;
          case 'conversion':
          case 'performance':
            if (metric.metric_name.toLowerCase().includes('conversion')) {
              point.conversion = Number(metric.value);
            }
            break;
          case 'satisfaction':
          case 'customer_satisfaction':
            point.satisfaction = Number(metric.value);
            break;
        }
        
        // Also check metric_name for flexibility
        const name = metric.metric_name.toLowerCase();
        if (name.includes('revenue')) point.revenue = Number(metric.value);
        if (name.includes('customer') && !name.includes('satisfaction')) point.customers = Number(metric.value);
        if (name.includes('conversion')) point.conversion = Number(metric.value);
        if (name.includes('satisfaction')) point.satisfaction = Number(metric.value);
      });

      const sortedData = Array.from(groupedByDate.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setHistoricalData(sortedData);
      setTrendAnalysis(calculateTrendAnalysis(sortedData));
    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast.error('Failed to load historical metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user, dateRange]);

  const handleQuickRange = (range: string) => {
    setQuickRange(range);
    const now = new Date();
    
    switch (range) {
      case '7d':
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case '30d':
        setDateRange({ from: subDays(now, 30), to: now });
        break;
      case '90d':
        setDateRange({ from: subDays(now, 90), to: now });
        break;
      case '6m':
        setDateRange({ from: subMonths(now, 6), to: now });
        break;
      case '1y':
        setDateRange({ from: subMonths(now, 12), to: now });
        break;
    }
  };

  const handleExport = () => {
    if (historicalData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const csvContent = [
      ['Date', 'Revenue', 'Customers', 'Conversion', 'Satisfaction'].join(','),
      ...historicalData.map(row => 
        [row.date, row.revenue, row.customers, row.conversion, row.satisfaction].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${format(dateRange.from, 'yyyy-MM-dd')}-to-${format(dateRange.to, 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Metrics exported successfully');
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatMetricValue = (metric: string, value: number) => {
    switch (metric.toLowerCase()) {
      case 'revenue': return `$${(value / 1000).toFixed(1)}K`;
      case 'customers': return value.toLocaleString();
      case 'conversion': return `${value}%`;
      case 'satisfaction': return `${value}/5`;
      default: return value.toString();
    }
  };

  const getVisibleLines = () => {
    if (selectedMetric === 'all') {
      return ['revenue', 'customers', 'conversion', 'satisfaction'];
    }
    return [selectedMetric];
  };

  const chartColors = {
    revenue: 'hsl(var(--chart-1))',
    customers: 'hsl(var(--chart-2))',
    conversion: 'hsl(var(--chart-3))',
    satisfaction: 'hsl(var(--chart-4))',
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Historical Metrics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track performance over time with trend analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Range Buttons */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              {['7d', '30d', '90d', '6m', '1y'].map((range) => (
                <Button
                  key={range}
                  variant={quickRange === range ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleQuickRange(range)}
                  className="px-3"
                >
                  {range}
                </Button>
              ))}
            </div>
            
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(dateRange.from, 'MMM d')} - {format(dateRange.to, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to });
                      setQuickRange('custom');
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            
            {/* Metric Filter */}
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
                <SelectItem value="conversion">Conversion</SelectItem>
                <SelectItem value="satisfaction">Satisfaction</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : historicalData.length === 0 ? (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Historical Data</h3>
            <p className="text-muted-foreground">
              Start adding metrics to see historical trends and analysis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Trend Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {trendAnalysis.map((analysis) => (
              <Card key={analysis.metric} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted-foreground">
                      {analysis.metric}
                    </span>
                    {getTrendIcon(analysis.trend)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Change</span>
                      <Badge 
                        variant={analysis.change > 0 ? 'default' : analysis.change < 0 ? 'destructive' : 'secondary'}
                        className="gap-1"
                      >
                        {analysis.change > 0 ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : analysis.change < 0 ? (
                          <ArrowDownRight className="h-3 w-3" />
                        ) : null}
                        {analysis.change > 0 ? '+' : ''}{analysis.change}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">7-Day Forecast</span>
                      <span className="text-sm font-medium">
                        {formatMetricValue(analysis.metric, analysis.forecast)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              analysis.confidence > 80 ? "bg-green-500" : 
                              analysis.confidence > 60 ? "bg-yellow-500" : "bg-red-500"
                            )}
                            style={{ width: `${analysis.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs">{analysis.confidence.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Chart */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Performance Trends</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <defs>
                      {Object.entries(chartColors).map(([key, color]) => (
                        <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => format(new Date(value), 'MMM d')}
                      className="text-muted-foreground"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis className="text-muted-foreground" tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                    />
                    <Legend />
                    {getVisibleLines().includes('revenue') && (
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke={chartColors.revenue}
                        fill={`url(#gradient-revenue)`}
                        strokeWidth={2}
                        name="Revenue ($)"
                      />
                    )}
                    {getVisibleLines().includes('customers') && (
                      <Area 
                        type="monotone" 
                        dataKey="customers" 
                        stroke={chartColors.customers}
                        fill={`url(#gradient-customers)`}
                        strokeWidth={2}
                        name="Customers"
                      />
                    )}
                    {getVisibleLines().includes('conversion') && (
                      <Area 
                        type="monotone" 
                        dataKey="conversion" 
                        stroke={chartColors.conversion}
                        fill={`url(#gradient-conversion)`}
                        strokeWidth={2}
                        name="Conversion (%)"
                      />
                    )}
                    {getVisibleLines().includes('satisfaction') && (
                      <Area 
                        type="monotone" 
                        dataKey="satisfaction" 
                        stroke={chartColors.satisfaction}
                        fill={`url(#gradient-satisfaction)`}
                        strokeWidth={2}
                        name="Satisfaction"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Historical Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Revenue</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Customers</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Conversion</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicalData.slice(-10).reverse().map((row, index) => (
                      <tr key={row.date} className={cn(
                        "border-b border-border/50",
                        index % 2 === 0 ? "bg-muted/20" : ""
                      )}>
                        <td className="py-3 px-4">{format(new Date(row.date), 'MMM d, yyyy')}</td>
                        <td className="text-right py-3 px-4 font-medium">${row.revenue.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{row.customers.toLocaleString()}</td>
                        <td className="text-right py-3 px-4">{row.conversion}%</td>
                        <td className="text-right py-3 px-4">{row.satisfaction}/5</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Showing last 10 records. {historicalData.length} total records in selected range.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
