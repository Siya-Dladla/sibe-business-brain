import { Card } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 42000, customers: 320 },
  { month: "Feb", revenue: 48000, customers: 380 },
  { month: "Mar", revenue: 55000, customers: 420 },
  { month: "Apr", revenue: 51000, customers: 390 },
  { month: "May", revenue: 62000, customers: 480 },
  { month: "Jun", revenue: 71000, customers: 550 },
];

const kpis = [
  { label: "Monthly Revenue", value: "$71,000", change: "+14.5%", icon: DollarSign },
  { label: "Active Customers", value: "550", change: "+14.6%", icon: Users },
  { label: "Avg Order Value", value: "$129", change: "+3.2%", icon: TrendingUp },
  { label: "Conversion Rate", value: "3.8%", change: "+0.4%", icon: BarChart3 },
];

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-card">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Analytics</div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <BarChart3 className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extralight tracking-wide">Analytics</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                Business performance metrics & predictive analytics
              </p>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="glass-card p-4 md:p-6 border-border/20">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl md:text-3xl font-light">{kpi.value}</p>
              <p className="text-xs text-green-500 mt-1">{kpi.change}</p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card p-6 border-border/20">
            <h3 className="text-lg font-light mb-4">Revenue Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="glass-card p-6 border-border/20">
            <h3 className="text-lg font-light mb-4">Customer Acquisition</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="customers" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;