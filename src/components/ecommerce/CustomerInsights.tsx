import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Repeat, Crown, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface CustomerInsightsProps {
  className?: string;
}

const CustomerInsights = ({ className }: CustomerInsightsProps) => {
  const customerSegments = [
    { name: "VIP", value: 245, color: "hsl(var(--primary))", revenue: "$125,400" },
    { name: "Regular", value: 1420, color: "hsl(var(--chart-2))", revenue: "$89,200" },
    { name: "New", value: 890, color: "hsl(var(--chart-3))", revenue: "$34,100" },
    { name: "At Risk", value: 156, color: "hsl(var(--destructive))", revenue: "$12,300" },
  ];

  const stats = [
    {
      label: "Total Customers",
      value: "2,711",
      change: "+156 this month",
      icon: Users,
    },
    {
      label: "New This Week",
      value: "89",
      change: "+12.4%",
      icon: UserPlus,
    },
    {
      label: "Repeat Rate",
      value: "34.2%",
      change: "+2.1%",
      icon: Repeat,
    },
    {
      label: "Avg. LTV",
      value: "$412",
      change: "+$28",
      icon: Crown,
    },
  ];

  return (
    <Card className={`glass-card p-4 border-border/30 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Users className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-light text-foreground">Customer Insights</h3>
          <p className="text-xs text-muted-foreground">Segmentation & behavior</p>
        </div>
      </div>

      {/* Stats Row - Horizontal scroll on mobile */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {stats.map((stat) => (
          <div 
            key={stat.label}
            className="p-3 rounded-lg bg-muted/50 border border-border/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-light text-foreground">{stat.value}</p>
            <p className="text-[10px] text-green-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={customerSegments}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                paddingAngle={4}
                dataKey="value"
              >
                {customerSegments.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2">
          {customerSegments.map((segment) => (
            <div 
              key={segment.name}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/20"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: segment.color }}
                />
                <span className="text-sm text-foreground">{segment.name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {segment.value}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">{segment.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CustomerInsights;
