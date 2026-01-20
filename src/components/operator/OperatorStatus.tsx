import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Package, AlertTriangle, CheckCircle, DollarSign, ShoppingCart, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface StatusItem {
  type: "positive" | "negative" | "neutral" | "warning";
  message: string;
  metric?: string;
  change?: number;
}

const OperatorStatus = () => {
  const { user } = useAuth();
  const [statusItems, setStatusItems] = useState<StatusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBusinessStatus();
    } else {
      // Demo status for unauthenticated users
      setStatusItems([
        { type: "positive", message: "Sales are up 12% today", metric: "$2,847", change: 12 },
        { type: "warning", message: "2 orders need shipping", metric: "2 pending" },
        { type: "neutral", message: "Customer support inbox is clear", metric: "0 open tickets" },
        { type: "negative", message: "Stock running low on Product X", metric: "3 units left" },
      ]);
      setIsLoading(false);
    }
  }, [user]);

  const fetchBusinessStatus = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const { data: metrics } = await supabase
        .from("business_metrics")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      const items: StatusItem[] = [];

      // Generate status from real metrics
      if (metrics && metrics.length > 0) {
        metrics.forEach((metric) => {
          const change = metric.change_percentage || 0;
          const type = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
          items.push({
            type,
            message: `${metric.metric_name} is ${change > 0 ? "up" : change < 0 ? "down" : "steady"} ${Math.abs(change)}%`,
            metric: `$${metric.value?.toLocaleString() || 0}`,
            change,
          });
        });
      }

      // Add default items if no data
      if (items.length === 0) {
        items.push(
          { type: "neutral", message: "Connect your store to see live status", metric: "Setup required" },
          { type: "positive", message: "Sibe is ready to operate your business" }
        );
      }

      setStatusItems(items);
    } catch (error) {
      console.error("Error fetching status:", error);
      setStatusItems([
        { type: "neutral", message: "Unable to load status", metric: "Try refreshing" }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (type: StatusItem["type"]) => {
    switch (type) {
      case "positive": return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "negative": return <TrendingDown className="w-4 h-4 text-red-400" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeStyles = (type: StatusItem["type"]) => {
    switch (type) {
      case "positive": return "border-green-500/20 bg-green-500/5";
      case "negative": return "border-red-500/20 bg-red-500/5";
      case "warning": return "border-yellow-500/20 bg-yellow-500/5";
      default: return "border-border bg-card/50";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-card/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-light text-foreground">Today's Status</h2>
        <Badge variant="outline" className="text-xs font-light">
          Live
        </Badge>
      </div>
      
      {statusItems.map((item, index) => (
        <Card
          key={index}
          className={`p-4 border transition-all duration-200 hover:scale-[1.01] ${getTypeStyles(item.type)}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">{getIcon(item.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-light text-foreground">{item.message}</p>
              {item.metric && (
                <p className="text-xs text-muted-foreground mt-1">{item.metric}</p>
              )}
            </div>
            {item.change !== undefined && (
              <Badge 
                variant="outline" 
                className={`text-xs ${item.change > 0 ? "text-green-400 border-green-500/30" : item.change < 0 ? "text-red-400 border-red-500/30" : ""}`}
              >
                {item.change > 0 ? "+" : ""}{item.change}%
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default OperatorStatus;
