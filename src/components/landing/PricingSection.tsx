import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Sparkles } from "lucide-react";

const features = [
  "Unlimited users & team members",
  "AI smart scheduling & auto-planning",
  "Tasks, projects & kanban boards",
  "CRM & sales pipeline",
  "Invoicing & Stripe payments",
  "AI assistant (unlimited queries)",
  "Team collaboration & @mentions",
  "Dashboard & analytics",
  "Focus time protection",
  "Priority support",
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-background opacity-30" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-display-sm md:text-display-md font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            One plan. Everything included. No hidden fees.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="glass-panel-strong rounded-3xl p-8 md:p-10 relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/30 rounded-full blur-[80px]" />

            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-primary">
                  Most Popular
                </span>
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold mb-2">Sibe Pro</h3>
              <p className="text-muted-foreground mb-6">
                Full access to everything Sibe offers
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              {/* Trial */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 mb-8">
                <span className="text-sm">
                  Start with <span className="font-semibold">$1</span> for 14
                  days
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant="premium" size="xl" className="w-full" asChild>
                <Link to="/auth">Start 14-Day Trial for $1</Link>
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Cancel anytime. No questions asked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
