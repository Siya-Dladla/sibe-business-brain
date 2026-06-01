import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MobileMenu from "@/components/MobileMenu";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, DollarSign, Users, Clock, Sparkles } from "lucide-react";

const Briefing = () => {
  const recommendations = [
    {
      icon: DollarSign,
      title: "Recover R96,000 in overdue invoices",
      detail: "17 invoices worth R142,000 are overdue. I can send automated reminders and payment links via WhatsApp & email.",
      impact: "+R96,000 expected within 7 days",
    },
    {
      icon: Users,
      title: "Reassign 2 underutilized technicians",
      detail: "Thabo and Lerato have been idle for 3+ days. There are 5 unscheduled service jobs in their area.",
      impact: "Recover R18,400 in lost revenue",
    },
    {
      icon: TrendingDown,
      title: "Investigate HVAC installation drop",
      detail: "Installations down 23% MoM. I can generate a root-cause report and contact the 12 lost leads.",
      impact: "Re-engage R210,000 pipeline",
    },
  ];

  const metrics = [
    { label: "Revenue (MTD)", value: "R1.24M", change: "+12%", trend: "up" },
    { label: "Cash Flow", value: "Healthy", change: "21 days runway", trend: "up" },
    { label: "Overdue Invoices", value: "R142K", change: "17 invoices", trend: "down" },
    { label: "Open Jobs", value: "48", change: "5 unscheduled", trend: "neutral" },
  ];

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground sticky top-0 z-40 pt-safe">
        <MobileMenu />
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
          <Sparkles className="w-3 h-3 mr-1" /> Live Briefing
        </Badge>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-safe">
        <div className="mb-8 flex items-center gap-3 md:gap-4">
          <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
          <div>
            <h1 className="text-2xl md:text-4xl font-extralight tracking-wide">Executive Briefing</h1>
            <p className="text-xs text-muted-foreground">Your business, summarized by Sibe AI</p>
          </div>
        </div>

        {/* AI Summary */}
        <Card className="glass-card p-6 md:p-8 border-primary/30 mb-6">
          <div className="flex items-start gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-3 flex-1">
              <p className="text-xs text-primary/70 font-light tracking-wider uppercase">Sibe says</p>
              <p className="text-base md:text-lg font-light leading-relaxed text-foreground">
                Revenue increased <span className="text-primary">12%</span> this month. Cash flow is healthy.
                There are <span className="text-primary">17 overdue invoices</span> worth{" "}
                <span className="text-primary">R142,000</span>. Two technicians are underutilized.
                I can recover <span className="text-primary">R96,000</span> this week through automated collections.
                Would you like me to proceed?
              </p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Approve all
                </Button>
                <Button size="sm" variant="outline" className="border-primary/30">
                  Review each
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Metric Snapshot */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {metrics.map((m) => (
            <Card key={m.label} className="glass-card p-4 border-border/30">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
              <p className="text-2xl font-light mt-2">{m.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {m.trend === "up" && <TrendingUp className="w-3 h-3 text-primary" />}
                {m.trend === "down" && <AlertTriangle className="w-3 h-3 text-destructive" />}
                {m.trend === "neutral" && <Clock className="w-3 h-3 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground">{m.change}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Recommended Actions */}
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-lg font-light tracking-wide">Recommended Actions</h2>
        </div>
        <div className="space-y-3">
          {recommendations.map((r, i) => (
            <Card key={i} className="glass-card p-5 border-border/30 hover:border-primary/40 transition-colors">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <r.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-light">{r.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.detail}</p>
                  <p className="text-xs text-primary mt-2">{r.impact}</p>
                </div>
                <div className="hidden md:flex flex-col gap-2 shrink-0">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="ghost" className="text-muted-foreground">
                    Dismiss
                  </Button>
                </div>
              </div>
              <div className="flex md:hidden gap-2 mt-4">
                <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                  Approve
                </Button>
                <Button size="sm" variant="ghost" className="flex-1 text-muted-foreground">
                  Dismiss
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Briefing;
