import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface SalesAnalyticsProps {
  className?: string;
}

const SalesAnalytics = ({ className }: SalesAnalyticsProps) => {
  // Mock data for demo - would come from Supabase in production
  const revenueData = [
    { day: "Mon", revenue: 12400, orders: 45 },
    { day: "Tue", revenue: 15200, orders: 52 },
    { day: "Wed", revenue: 18100, orders: 61 },
    { day: "Thu", revenue: 14800, orders: 48 },
    { day: "Fri", revenue: 21500, orders: 78 },
    { day: "Sat", revenue: 25300, orders: 89 },
    { day: "Sun", revenue: 19800, orders: 67 },
  ];

  const stats = [
    {
      label: "Today's Revenue",
      value: "$25,340",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: "89",
      change: "+8.2%",
      isPositive: true,
      icon: ShoppingCart,
    },
    {
      label: "Conversion Rate",
      value: "3.2%",
      change: "-0.4%",
      isPositive: false,
      icon: TrendingUp,
    },
    {
      label: "Avg Order Value",
      value: "$284",
      change: "+4.1%",
      isPositive: true,
      icon: Package,
    },
  ];

  return (
    <div className={className}>
      {/* Stats Grid - Optimized for mobile */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className="glass-card p-4 border-border/30 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.isPositive ? "text-green-500" : "text-red-500"
              }`}>
                {stat.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-light text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card className="glass-card p-4 border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-light text-foreground">Weekly Revenue</h3>
            <p className="text-xs text-muted-foreground">Last 7 days performance</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-light text-primary">$127,140</p>
            <p className="text-xs text-green-500">+15.3% vs last week</p>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default SalesAnalytics;
