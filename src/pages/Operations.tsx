import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Package, Truck, AlertTriangle, CheckCircle, Clock, Box, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: "pending" | "shipped" | "delivered";
  date: Date;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockThreshold: number;
  daysUntilEmpty: number;
}

const Operations = () => {
  const [orders] = useState<Order[]>([
    { id: "ORD-001", customer: "Alice J.", items: 2, total: 89.99, status: "pending", date: new Date() },
    { id: "ORD-002", customer: "Bob K.", items: 1, total: 45.00, status: "pending", date: new Date() },
    { id: "ORD-003", customer: "Carol L.", items: 3, total: 125.50, status: "shipped", date: new Date(Date.now() - 86400000) },
    { id: "ORD-004", customer: "Dave M.", items: 1, total: 35.00, status: "delivered", date: new Date(Date.now() - 172800000) },
  ]);

  const [inventory] = useState<InventoryItem[]>([
    { id: "1", name: "Summer Dress - Blue", sku: "SD-BLU-001", stock: 3, lowStockThreshold: 10, daysUntilEmpty: 2 },
    { id: "2", name: "Cotton T-Shirt - White", sku: "CT-WHT-001", stock: 45, lowStockThreshold: 20, daysUntilEmpty: 15 },
    { id: "3", name: "Denim Jacket", sku: "DJ-001", stock: 8, lowStockThreshold: 5, daysUntilEmpty: 6 },
    { id: "4", name: "Canvas Sneakers", sku: "CS-001", stock: 2, lowStockThreshold: 10, daysUntilEmpty: 1 },
  ]);

  const pendingOrders = orders.filter(o => o.status === "pending");
  const lowStockItems = inventory.filter(i => i.stock <= i.lowStockThreshold);

  const getOrderStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "delivered": return <Badge className="bg-green-500/20 text-green-400">Delivered</Badge>;
      case "shipped": return <Badge className="bg-blue-500/20 text-blue-400">Shipped</Badge>;
      default: return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.stock <= 3) return { color: "text-red-400", bg: "bg-red-500", label: "Critical" };
    if (item.stock <= item.lowStockThreshold) return { color: "text-yellow-400", bg: "bg-yellow-500", label: "Low" };
    return { color: "text-green-400", bg: "bg-green-500", label: "OK" };
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-light text-foreground flex items-center gap-2">
            <Package className="w-4 h-4" />
            Operations
          </h1>
          <p className="text-xs text-muted-foreground">Orders & Inventory</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Alerts */}
          {(pendingOrders.length > 0 || lowStockItems.length > 0) && (
            <div className="space-y-2">
              {pendingOrders.length > 0 && (
                <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm font-light">{pendingOrders.length} orders need shipping</span>
                    </div>
                    <Button size="sm" variant="outline">View Orders</Button>
                  </div>
                </Card>
              )}
              {lowStockItems.length > 0 && (
                <Card className="p-4 bg-red-500/10 border-red-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-light">{lowStockItems.length} items running low on stock</span>
                    </div>
                    <Button size="sm" variant="outline">View Inventory</Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </Card>
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light text-yellow-400">{pendingOrders.length}</p>
              <p className="text-xs text-muted-foreground">To Ship</p>
            </Card>
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light">{inventory.length}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </Card>
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light text-red-400">{lowStockItems.length}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </Card>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="w-full justify-start bg-card/50">
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-3 mt-4">
              {orders.map((order) => (
                <Card key={order.id} className="p-4 bg-card/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {order.status === "pending" ? (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      ) : order.status === "shipped" ? (
                        <Truck className="w-4 h-4 text-blue-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-sm font-light">{order.id}</span>
                    </div>
                    {getOrderStatusBadge(order.status)}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-light">{order.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Items</p>
                      <p className="font-light">{order.items}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total</p>
                      <p className="font-light">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                  {order.status === "pending" && (
                    <Button size="sm" variant="outline" className="mt-3">
                      Mark as Shipped
                    </Button>
                  )}
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="inventory" className="space-y-3 mt-4">
              {inventory.map((item) => {
                const status = getStockStatus(item);
                return (
                  <Card key={item.id} className={`p-4 ${item.stock <= 3 ? "bg-red-500/5 border-red-500/20" : "bg-card/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <span className="text-sm font-light">{item.name}</span>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={status.color}>{status.label}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Stock Level</span>
                        <span className={status.color}>{item.stock} units</span>
                      </div>
                      <Progress value={(item.stock / (item.lowStockThreshold * 2)) * 100} className="h-2" />
                      {item.daysUntilEmpty <= 5 && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Will run out in {item.daysUntilEmpty} days
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="predictions" className="space-y-3 mt-4">
              <Card className="p-4 bg-primary/5 border-primary/20">
                <h3 className="font-light text-foreground mb-2">📦 Restock Recommendations</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Based on your sales velocity, Sibe recommends restocking these items:
                </p>
                <div className="space-y-2">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                      <span className="text-sm">{item.name}</span>
                      <span className="text-xs text-muted-foreground">Order 50+ units</span>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="p-4 bg-card/50">
                <h3 className="font-light text-foreground mb-2">📈 Demand Forecast</h3>
                <p className="text-sm text-muted-foreground">
                  Next week's projected orders: <strong className="text-foreground">23-28 orders</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  +15% compared to last week
                </p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Operations;
