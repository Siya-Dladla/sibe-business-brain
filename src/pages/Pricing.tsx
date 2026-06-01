import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { Check, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Starter",
    price: "R499",
    tagline: "For solo operators & micro-businesses",
    features: ["1 connected business", "Health monitoring", "5 AI recommendations / day", "Email support"],
  },
  {
    name: "Growth",
    price: "R1,999",
    tagline: "Most popular for SMEs",
    featured: true,
    features: ["Up to 5 integrations", "Autonomous recommendations", "1 industry brain", "Automated execution (basic)", "Priority support"],
  },
  {
    name: "Professional",
    price: "R4,999",
    tagline: "For teams running multi-channel operations",
    features: ["Unlimited integrations", "Full execution engine", "Predictive forecasting", "2 industry brains", "Dedicated success manager"],
  },
  {
    name: "Enterprise",
    price: "R15,000+",
    tagline: "Custom-built ABOS for established companies",
    features: ["Custom industry brain", "On-prem / private cloud", "Custom workflows", "SLA & 24/7 support", "Implementation services"],
  },
];

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40 pt-safe">
        <MobileMenu />
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">Pricing</Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 pb-safe">
        <div className="text-center mb-10 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-extralight tracking-wide">
            Run your business <span className="text-primary">autonomously</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-3 max-w-2xl mx-auto font-light">
            Sibe AI is the operating system that monitors, decides and acts across your business. Pick a tier to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {tiers.map((t) => (
            <Card
              key={t.name}
              className={`glass-card p-6 flex flex-col border-border/30 relative ${
                t.featured ? "border-primary/60 ring-1 ring-primary/30" : ""
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-[10px]">
                    <Sparkles className="w-3 h-3 mr-1" /> Most popular
                  </Badge>
                </div>
              )}
              <h3 className="text-xl font-light">{t.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 min-h-[2.5rem]">{t.tagline}</p>
              <div className="mt-4 mb-5">
                <span className="text-3xl font-extralight">{t.price}</span>
                <span className="text-xs text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-2 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs font-light">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-6 w-full ${
                  t.featured
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-background border border-primary/30 text-primary hover:bg-primary/10"
                }`}
              >
                {t.name === "Enterprise" ? "Contact sales" : "Start trial"}
              </Button>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8 font-light">
          Add-ons available: extra AI agents, industry brains, custom integrations, consulting & workflow design.
        </p>
      </div>
    </div>
  );
};

export default Pricing;
