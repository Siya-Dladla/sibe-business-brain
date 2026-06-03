import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { Check, Sparkles } from "lucide-react";

const FEATURES = [
  "Custom AI Agents",
  "CRM integration",
  "AI Prospecting & Lead Scoring",
  "Business Health Dashboard",
  "Forecasting & Insights Engine",
  "Custom App with AI voice assistant on the go",
];

const PERFECT_FOR = [
  "Growing businesses",
  "Sales teams",
  "Agencies managing multiple clients",
  "Service businesses",
];

const Pricing = () => {
  return (
    <div className="min-h-[100dvh] bg-background grid-bg safe-area-inset">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40 pt-safe">
        <MobileMenu />
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">Pricing</Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16 pb-safe max-w-3xl">
        <div className="text-center mb-10 md:mb-12">
          <Badge variant="outline" className="border-primary/30 text-primary text-[10px] mb-4">
            One plan · Everything included
          </Badge>
          <h1 className="text-3xl md:text-5xl font-extralight tracking-wide">
            The brain on top of your <span className="text-primary">business</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-4 max-w-xl mx-auto font-light">
            SIBE AX sits on top of your existing data and operations. It automates your workflows,
            removes inefficiencies and errors, and <span className="text-foreground">scales every day</span>.
          </p>
        </div>

        <Card className="glass-card p-6 md:p-10 border-primary/60 ring-1 ring-primary/30 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground text-[10px]">
              <Sparkles className="w-3 h-3 mr-1" /> SIBE AX
            </Badge>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-light">SIBE AX</h2>
            <div className="mt-4">
              <span className="text-5xl md:text-6xl font-extralight">$499</span>
              <span className="text-sm text-muted-foreground ml-1">/month</span>
            </div>
          </div>

          <ul className="space-y-3 mb-8 max-w-md mx-auto">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm font-light">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
            <li className="flex items-start gap-3 text-sm font-light text-muted-foreground">
              <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>And more.</span>
            </li>
          </ul>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
            Start with SIBE AX
          </Button>
        </Card>

        <div className="mt-12 text-center">
          <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Perfect for</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {PERFECT_FOR.map((p) => (
              <Badge key={p} variant="outline" className="border-border/40 text-xs font-light px-3 py-1">
                {p}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
