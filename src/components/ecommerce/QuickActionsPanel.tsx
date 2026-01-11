import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Package, 
  Tag, 
  Truck, 
  Users, 
  BarChart3, 
  Megaphone, 
  CreditCard,
  ArrowUpRight,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QuickActionsPanelProps {
  className?: string;
}

const QuickActionsPanel = ({ className }: QuickActionsPanelProps) => {
  const { toast } = useToast();

  const actions = [
    {
      icon: Plus,
      label: "Add Product",
      description: "Create new listing",
      color: "bg-blue-500/10 text-blue-500",
      action: () => toast({ title: "Add Product", description: "Product creation coming soon!" }),
    },
    {
      icon: Tag,
      label: "Discount",
      description: "Create promo code",
      color: "bg-green-500/10 text-green-500",
      action: () => toast({ title: "Discounts", description: "Discount management coming soon!" }),
    },
    {
      icon: Truck,
      label: "Shipping",
      description: "Update rates",
      color: "bg-orange-500/10 text-orange-500",
      action: () => toast({ title: "Shipping", description: "Shipping settings coming soon!" }),
    },
    {
      icon: Megaphone,
      label: "Campaign",
      description: "Launch promo",
      color: "bg-purple-500/10 text-purple-500",
      action: () => toast({ title: "Campaigns", description: "Marketing campaigns coming soon!" }),
    },
  ];

  const recentOrders = [
    { id: "#2847", customer: "John D.", amount: "$124.99", status: "processing" },
    { id: "#2846", customer: "Sarah M.", amount: "$89.50", status: "shipped" },
    { id: "#2845", customer: "Mike R.", amount: "$245.00", status: "delivered" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-yellow-500/10 text-yellow-500";
      case "shipped":
        return "bg-blue-500/10 text-blue-500";
      case "delivered":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className={className}>
      {/* Quick Actions Grid */}
      <Card className="glass-card p-4 border-border/30 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-light text-foreground">Quick Actions</h3>
            <p className="text-xs text-muted-foreground">Common store operations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              onClick={action.action}
              className="h-auto p-4 flex flex-col items-center gap-2 border-border/30 hover:bg-muted/50 active:scale-[0.98] transition-all"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{action.label}</p>
                <p className="text-[10px] text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="glass-card p-4 border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CreditCard className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-light text-foreground">Recent Orders</h3>
              <p className="text-xs text-muted-foreground">Latest transactions</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-xs">
            View All
            <ArrowUpRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        <div className="space-y-2">
          {recentOrders.map((order) => (
            <div 
              key={order.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/20 active:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{order.amount}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default QuickActionsPanel;
