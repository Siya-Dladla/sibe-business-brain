import { Card } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Users, DollarSign, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BusinessDNAProps {
  metricsCount: number;
  insightsCount: number;
  plansCount: number;
}

const BusinessDNA = ({ metricsCount, insightsCount, plansCount }: BusinessDNAProps) => {
  // Calculate understanding percentage based on data points
  const totalDataPoints = metricsCount + insightsCount + (plansCount * 10);
  const understandingLevel = Math.min(Math.floor((totalDataPoints / 50) * 100), 100);
  
  const getUnderstandingLabel = () => {
    if (understandingLevel < 20) return "Initial Learning";
    if (understandingLevel < 40) return "Building Knowledge";
    if (understandingLevel < 60) return "Understanding Patterns";
    if (understandingLevel < 80) return "Strategic Partner";
    return "Deep Intelligence";
  };

  const aspects = [
    { icon: Target, label: "Business Model", value: Math.min(plansCount * 25, 100), color: "text-blue-400" },
    { icon: DollarSign, label: "Financial Health", value: Math.min(metricsCount * 5, 100), color: "text-green-400" },
    { icon: TrendingUp, label: "Growth Patterns", value: Math.min(insightsCount * 10, 100), color: "text-purple-400" },
    { icon: Users, label: "Market Position", value: Math.min((metricsCount + insightsCount) * 3, 100), color: "text-orange-400" },
    { icon: Zap, label: "Operational Efficiency", value: Math.min(metricsCount * 6, 100), color: "text-yellow-400" },
  ];

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-glow"></div>
        </div>
        <div>
          <h3 className="text-xl font-extralight">Business DNA Analysis</h3>
          <p className="text-xs text-muted-foreground font-light">How well Sibe SI understands your business</p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-light text-muted-foreground">Understanding Level</span>
          <span className="text-lg font-light text-primary">{understandingLevel}%</span>
        </div>
        <Progress value={understandingLevel} className="h-3 mb-2" />
        <p className="text-xs text-muted-foreground font-light">{getUnderstandingLabel()}</p>
      </div>

      <div className="space-y-4">
        {aspects.map((aspect) => (
          <div key={aspect.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <aspect.icon className={`w-4 h-4 ${aspect.color}`} />
                <span className="text-sm font-light">{aspect.label}</span>
              </div>
              <span className="text-sm font-light text-muted-foreground">{aspect.value}%</span>
            </div>
            <Progress value={aspect.value} className="h-1" />
          </div>
        ))}
      </div>

      {understandingLevel < 50 && (
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-xs text-muted-foreground font-light">
            💡 Upload more business plans and data to help Sibe SI build a deeper understanding of your business
          </p>
        </div>
      )}
    </Card>
  );
};

export default BusinessDNA;
