import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { Network, Users, Package, Truck, Building2, CreditCard, Workflow } from "lucide-react";

const Understanding = () => {
  const entities = [
    { icon: Users, label: "Customers", count: 1248, color: "text-primary" },
    { icon: Users, label: "Employees", count: 42, color: "text-primary" },
    { icon: Truck, label: "Suppliers", count: 23, color: "text-primary" },
    { icon: Package, label: "Products & Services", count: 67, color: "text-primary" },
    { icon: CreditCard, label: "Revenue Streams", count: 5, color: "text-primary" },
    { icon: Building2, label: "Expense Categories", count: 18, color: "text-primary" },
  ];

  const processes = [
    "Lead capture → Quotation → Invoice → Payment → Service delivery → Review",
    "Stock order → Goods receipt → Inventory → Sale → Fulfilment",
    "Recruitment → Onboarding → Performance review → Payroll",
  ];

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40 pt-safe">
        <MobileMenu />
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">Layer 1 · Understanding</Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-safe">
        <div className="mb-8 flex items-center gap-3 md:gap-4">
          <Network className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <div>
            <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">Business Brain</h1>
            <p className="text-xs text-muted-foreground">Sibe's knowledge graph of your company</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          {entities.map((e) => (
            <Card key={e.label} className="glass-card p-5 border-border/30">
              <e.icon className={`w-5 h-5 ${e.color} mb-3`} />
              <p className="text-3xl font-extralight">{e.count.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">{e.label}</p>
            </Card>
          ))}
        </div>

        <Card className="glass-card p-6 border-border/30">
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-light">Mapped Business Processes</h2>
          </div>
          <div className="space-y-3">
            {processes.map((p, i) => (
              <div key={i} className="p-4 rounded-lg bg-background/50 border border-border/30 text-sm text-foreground font-light">
                {p}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Understanding;
