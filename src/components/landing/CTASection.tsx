import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 grid-background opacity-30" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 rounded-full blur-[150px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-display-sm md:text-display-md font-bold mb-6">
            Ready to let AI
            <br />
            <span className="gradient-text">run your business?</span>
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of teams who've upgraded to the future of work.
            Start your 14-day trial today.
          </p>

          {/* CTA */}
          <Button variant="premium" size="xl" asChild>
            <Link to="/auth" className="gap-3">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground mt-6">
            $1 for 14 days · No credit card required to explore
          </p>
        </div>
      </div>
    </section>
  );
}
