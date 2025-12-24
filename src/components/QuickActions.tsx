import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Target, AlertCircle, Brain } from "lucide-react";
interface QuickActionsProps {
  onAction: (question: string) => void;
}
const QuickActions = ({
  onAction
}: QuickActionsProps) => {
  const actions = [{
    icon: TrendingUp,
    label: "Growth Analysis",
    question: "Analyze my business growth trends and identify the biggest opportunities",
    color: "text-green-400"
  }, {
    icon: Target,
    label: "Strategic Focus",
    question: "What are the top 3 things I should focus on this week to maximize impact?",
    color: "text-blue-400"
  }, {
    icon: AlertCircle,
    label: "Risk Assessment",
    question: "What are the biggest risks in my business right now and how should I address them?",
    color: "text-red-400"
  }, {
    icon: Brain,
    label: "Deep Insights",
    question: "What patterns do you see in my business that I might be missing?",
    color: "text-purple-400"
  }];
  return <Card className="glass-card p-6 bg-primary-foreground">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-extralight">Ask Sibe SI</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {actions.map(action => <Button key={action.label} onClick={() => onAction(action.question)} variant="outline" className="h-auto p-4 justify-start text-left hover:bg-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <action.icon className={`w-5 h-5 ${action.color} flex-shrink-0 mt-0.5`} />
              <div>
                <p className="text-sm font-light mb-1">{action.label}</p>
                
              </div>
            </div>
          </Button>)}
      </div>
    </Card>;
};
export default QuickActions;