import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Loader2, Sparkles, TrendingUp, Target, Lightbulb, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebsiteAnalyzerProps {
  onAnalysisComplete?: () => void;
}

const WebsiteAnalyzer = ({ onAnalysisComplete }: WebsiteAnalyzerProps) => {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [hasExistingAnalysis, setHasExistingAnalysis] = useState(false);
  const [existingAnalysis, setExistingAnalysis] = useState<{ website_url: string; created_at: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkExistingAnalysis();
  }, []);

  const checkExistingAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("website_analyses")
        .select("website_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setHasExistingAnalysis(true);
        setExistingAnalysis(data);
      }
    } catch (error) {
      // No existing analysis
      setHasExistingAnalysis(false);
    }
  };

  const analyzeWebsite = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid website URL",
        variant: "destructive"
      });
      return;
    }

    if (hasExistingAnalysis) {
      toast({
        title: "Website Already Analyzed",
        description: "You can only analyze one website at a time. Clear your current analysis first.",
        variant: "destructive"
      });
      return;
    }

    // Validate URL format
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { websiteUrl: finalUrl }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        setHasExistingAnalysis(true);
        setExistingAnalysis({ website_url: finalUrl, created_at: new Date().toISOString() });
        toast({
          title: "Analysis Complete!",
          description: "Your website has been analyzed by Sibe SI"
        });
        onAnalysisComplete?.();
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error: any) {
      console.error("Error analyzing website:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze website",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      analyzeWebsite();
    }
  };

  if (hasExistingAnalysis && existingAnalysis && !analysis) {
    return (
      <Card className="glass-card p-6 bg-primary-foreground">
        <div className="flex items-center gap-3 mb-6">
          <Globe className="w-6 h-6 text-primary" />
          <div>
            <h3 className="text-xl font-extralight">Business Website Analyzer</h3>
            <p className="text-xs text-muted-foreground font-light">
              Let Sibe SI analyze your business and unlock scaling strategies
            </p>
          </div>
        </div>

        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-green-500">Website Analysis Active</p>
          </div>
          <p className="text-sm text-primary truncate">
            {existingAnalysis.website_url}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Analyzed: {new Date(existingAnalysis.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            To analyze a new website, clear your current analysis from the status bar above.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6 bg-primary-foreground">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-xl font-extralight">Business Website Analyzer</h3>
          <p className="text-xs text-muted-foreground font-light">
            Let Sibe SI analyze your business and unlock scaling strategies
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {!analysis ? (
          <>
            <div className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your website URL (e.g., myshop.com)"
                className="bg-background/50 border-primary/20 focus:border-primary font-light"
                disabled={isAnalyzing}
              />
              <Button
                onClick={analyzeWebsite}
                disabled={isAnalyzing}
                className="border border-primary/30 text-primary font-light bg-primary-foreground"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>

            <div className="p-4 border border-primary/10 rounded-lg bg-primary-foreground">
              <p className="text-sm text-muted-foreground font-light">
                <strong className="text-primary">What Sibe SI will analyze:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground font-light">
                <li className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-primary" />
                  Business model and revenue streams
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-primary" />
                  Growth opportunities and scaling strategies
                </li>
                <li className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 text-primary" />
                  Actionable recommendations for improvement
                </li>
              </ul>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-background/50 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-primary font-light">Analysis Complete</h4>
                <Button
                  onClick={() => {
                    setAnalysis(null);
                    setUrl("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                >
                  View Details
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Analyzed URL:</p>
                  <p className="text-sm font-light text-primary">{analysis.website_url}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-2">Strategic Analysis:</p>
                  <div className="text-sm text-muted-foreground font-light whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {analysis.analysis_content}
                  </div>
                </div>

                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Top Recommendations:</p>
                    <ul className="space-y-2">
                      {analysis.recommendations.slice(0, 5).map((rec: string, idx: number) => (
                        <li key={idx} className="text-xs text-muted-foreground font-light flex gap-2">
                          <Sparkles className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs text-primary font-light">
                    ✓ Your business data has been loaded into Sibe SI
                  </p>
                  <p className="text-xs text-muted-foreground font-light mt-1">
                    Explore AI Employees, Business Insights, and more features to scale your business
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WebsiteAnalyzer;