import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-background opacity-50" />
      <div className="absolute inset-0 radial-glow" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-float delay-300" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              AI-Powered Business OS
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-display-lg md:text-display-xl font-bold mb-6 animate-slide-up">
            <span className="block">Your business,</span>
            <span className="gradient-text">automatically managed.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up delay-100">
            Sibe plans your day, manages your team, and keeps everything in sync — 
            so you can focus on what matters.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
            <Button variant="premium" size="xl" asChild>
              <Link to="/auth" className="gap-3">
                Start 14-Day Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" className="gap-3">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trial Info */}
          <p className="text-sm text-muted-foreground mt-6 animate-fade-in delay-300">
            $1 for 14 days · Then $99/month · Unlimited users · Cancel anytime
          </p>
        </div>

        {/* Hero Visual */}
        <div className="mt-20 relative animate-slide-up delay-400">
          <div className="glass-panel-strong rounded-2xl p-2 max-w-5xl mx-auto">
            <div className="aspect-[16/9] rounded-xl bg-card overflow-hidden relative">
              {/* Dashboard Preview */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-muted-foreground">Dashboard Preview</p>
                </div>
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
            </div>
          </div>
          
          {/* Decorative Glow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-2/3 h-40 bg-primary/30 blur-[100px] rounded-full" />
        </div>
      </div>
    </section>
  );
}
