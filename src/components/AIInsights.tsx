import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Insight {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

interface AIInsightsProps {
  insights: Insight[];
  onInsightGenerated: () => void;
}

const AIInsights = ({ insights, onInsightGenerated }: AIInsightsProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateInsights = async () => {
    setIsGenerating(true);

    try {
      const { error } = await supabase.functions.invoke("generate-insights");

      if (error) throw error;

      toast({
        title: "Insights Generated",
        description: "New AI insights have been generated successfully!",
      });

      onInsightGenerated();
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate insights",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-xl font-extralight">Strategic Insights</h3>
            <p className="text-xs text-muted-foreground font-light">AI-powered business intelligence</p>
          </div>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-light"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {insights && insights.length > 0 ? (
          insights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 bg-background/50 border border-primary/20 rounded-lg"
            >
              <h4 className="text-primary font-light mb-2">{insight.title}</h4>
              <p className="text-sm text-muted-foreground font-light whitespace-pre-wrap">
                {insight.content}
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                {new Date(insight.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground font-light">
            <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Sibe SI is ready to learn your business.</p>
            <p className="text-xs mt-2">Upload data to generate strategic insights.</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AIInsights;