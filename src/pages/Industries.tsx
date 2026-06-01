import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { Cpu, Wrench, Pickaxe, HardHat, Banknote, Headphones, CheckCircle2 } from "lucide-react";

const industries = [
  { icon: Wrench, name: "Sibe HVAC", desc: "Quotes, installations, maintenance & dispatching for HVAC operators.", tags: ["Quotes", "Service", "Dispatch"] },
  { icon: Pickaxe, name: "Sibe Mining", desc: "Equipment utilization, downtime, production & maintenance schedules.", tags: ["Equipment", "Production", "Downtime"] },
  { icon: HardHat, name: "Sibe Construction", desc: "Projects, materials, contractors and site productivity.", tags: ["Projects", "Materials", "Sites"] },
  { icon: Banknote, name: "Sibe Cash Loans", desc: "Loan books, collections, arrears and risk scoring.", tags: ["Loans", "Collections", "Risk"] },
  { icon: Headphones, name: "Sibe Service Businesses", desc: "Bookings, dispatch, staff and customer satisfaction.", tags: ["Bookings", "Dispatch", "CSAT"] },
];

const Industries = () => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40 pt-safe">
        <MobileMenu />
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">Layer 7 · Industry Brains</Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-safe">
        <div className="mb-8 flex items-center gap-3 md:gap-4">
          <Cpu className="w-8 h-8 md:w-10 md:h-10 text-primary" />
          <div>
            <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">Industry Brains</h1>
            <p className="text-xs text-muted-foreground">Pre-trained Sibe variants for your sector</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {industries.map((ind) => (
            <Card key={ind.name} className="glass-card p-6 border-border/30 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <ind.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-light">{ind.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ind.desc}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {ind.tags.map((t) => (
                      <span key={t} className="text-[10px] px-2 py-1 rounded-full bg-background/60 border border-border/40 text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                  <Button size="sm" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Activate brain
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Industries;
