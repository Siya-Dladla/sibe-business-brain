import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { Lightbulb, DollarSign, Users, MessageSquare, Wrench } from "lucide-react";

const Recommendations = () => {
  const recs = [
    { icon: MessageSquare, area: "Sales", title: "Lead conversion dropped 12%", action: "Launch WhatsApp follow-up campaign to 84 cold leads" },
    { icon: DollarSign, area: "Finance", title: "27 invoices are overdue", action: "Send automated reminders + payment links" },
    { icon: Wrench, area: "Operations", title: "Technician schedules can be optimized", action: "Re-route to save 18% travel time this week" },
    { icon: Users, area: "HR", title: "Productivity dropped 14% in Field Team", action: "Generate performance report and 1-on-1 talking points" },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40 pt-safe">
        <MobileMenu />
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">Layer 4 · Recommendations</Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-safe">
        <div className="mb-8 flex items-center gap-3 md:gap-4">
          <Lightbulb className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <div>
            <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">Recommended Actions</h1>
            <p className="text-xs text-muted-foreground">Approve, dismiss, or let Sibe handle it</p>
          </div>
        </div>

        <div className="space-y-3">
          {recs.map((r, i) => (
            <Card key={i} className="glass-card p-5 border-border/30">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-primary/70">{r.area}</p>
                  <h3 className="text-base font-light mt-1">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.action}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">Approve & execute</Button>
                <Button size="sm" variant="outline" className="border-border/40">Schedule</Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground">Dismiss</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
