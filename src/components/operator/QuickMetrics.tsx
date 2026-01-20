import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext?: string;
}

const MetricCard = ({ icon, label, value, subtext }: MetricCardProps) => (
  <Card className="p-4 bg-card/50 border-border hover:bg-card/80 transition-all">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground font-light">{label}</p>
        <p className="text-lg font-light text-foreground">{value}</p>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </div>
    </div>
  </Card>
);

interface QuickMetricsProps {
  revenue?: number;
  orders?: number;
  customers?: number;
  pendingShipments?: number;
}

const QuickMetrics = ({ 
  revenue = 2847, 
  orders = 12, 
  customers = 8, 
  pendingShipments = 2 
}: QuickMetricsProps) => {
  const metrics = [
    {
      icon: <DollarSign className="w-4 h-4 text-primary" />,
      label: "Today's Revenue",
      value: `$${revenue.toLocaleString()}`,
      subtext: "+12% vs yesterday",
    },
    {
      icon: <ShoppingCart className="w-4 h-4 text-primary" />,
      label: "Orders",
      value: orders.toString(),
      subtext: "Last 24 hours",
    },
    {
      icon: <Users className="w-4 h-4 text-primary" />,
      label: "New Customers",
      value: customers.toString(),
    },
    {
      icon: <Package className="w-4 h-4 text-primary" />,
      label: "To Ship",
      value: pendingShipments.toString(),
      subtext: pendingShipments > 0 ? "Action needed" : "All clear",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default QuickMetrics;
