import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, ArrowRight, RefreshCw } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface InventoryAlertsProps {
  className?: string;
}

const InventoryAlerts = ({ className }: InventoryAlertsProps) => {
  // Mock data - would come from database
  const alerts = [
    {
      id: "1",
      productName: "Premium Wireless Headphones",
      sku: "WH-PRO-001",
      currentStock: 5,
      threshold: 20,
      status: "critical",
    },
    {
      id: "2",
      productName: "Smart Watch Series X",
      sku: "SW-X-002",
      currentStock: 12,
      threshold: 25,
      status: "low",
    },
    {
      id: "3",
      productName: "Portable Charger 20000mAh",
      sku: "PC-20K-003",
      currentStock: 8,
      threshold: 15,
      status: "critical",
    },
    {
      id: "4",
      productName: "Bluetooth Speaker Mini",
      sku: "BS-MINI-004",
      currentStock: 18,
      threshold: 30,
      status: "low",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "low":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30";
      default:
        return "bg-green-500/10 text-green-500 border-green-500/30";
    }
  };

  return (
    <Card className={`glass-card p-4 border-border/30 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <h3 className="text-lg font-light text-foreground">Inventory Alerts</h3>
            <p className="text-xs text-muted-foreground">{alerts.length} items need attention</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-2">
          {alerts.map((alert) => (
            <Card 
              key={alert.id}
              className="flex-shrink-0 w-64 p-4 bg-card/50 border-border/30 active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Package className="w-4 h-4 text-muted-foreground" />
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] uppercase font-medium ${getStatusColor(alert.status)}`}
                >
                  {alert.status}
                </Badge>
              </div>
              
              <h4 className="text-sm font-medium text-foreground truncate mb-1">
                {alert.productName}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">SKU: {alert.sku}</p>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-light text-foreground">{alert.currentStock}</p>
                  <p className="text-[10px] text-muted-foreground">of {alert.threshold} min</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  Reorder
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </Card>
  );
};

export default InventoryAlerts;
