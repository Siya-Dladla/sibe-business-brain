import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, Sparkles, Trash2 } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Forecast {
  id: string;
  forecast_type: string;
  title: string;
  description: string | null;
  predictions: any;
  confidence_score: number | null;
  time_horizon: string;
  created_at: string;
}

const Forecasting = () => {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [formData, setFormData] = useState({
    forecastType: "",
    timeHorizon: "",
    businessData: ""
  });
  const { toast } = useToast();

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("forecasts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setForecasts(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("generate-forecast", {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Forecast generated successfully"
      });

      setFormData({ forecastType: "", timeHorizon: "", businessData: "" });
      setOpen(false);
      fetchForecasts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteForecast = async (id: string) => {
    try {
      const { error } = await supabase
        .from("forecasts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Forecast deleted successfully"
      });

      fetchForecasts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Strategy & Forecasting</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-extralight mb-3 tracking-wide">Strategy & Forecasting</h1>
            <p className="text-primary text-lg font-light">Predictive analytics powered by AI</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button text-primary border-primary/30 hover:bg-primary/10 h-12 px-8">
                <TrendingUp className="w-4 h-4 mr-2" />
                Generate Forecast
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20 sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extralight tracking-wide flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Generate Forecast
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-light">
                  AI-powered predictive analytics for your business
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={generateForecast} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="forecastType" className="text-sm font-light">Forecast Type</Label>
                  <Select
                    value={formData.forecastType}
                    onValueChange={(value) => setFormData({ ...formData, forecastType: value })}
                    required
                  >
                    <SelectTrigger className="bg-input border-primary/20 focus:border-primary font-light">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-primary/20">
                      <SelectItem value="Revenue">Revenue Forecast</SelectItem>
                      <SelectItem value="Growth">Growth Analysis</SelectItem>
                      <SelectItem value="Market">Market Trends</SelectItem>
                      <SelectItem value="Risk">Risk Assessment</SelectItem>
                      <SelectItem value="Operational">Operational Efficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeHorizon" className="text-sm font-light">Time Horizon</Label>
                  <Select
                    value={formData.timeHorizon}
                    onValueChange={(value) => setFormData({ ...formData, timeHorizon: value })}
                    required
                  >
                    <SelectTrigger className="bg-input border-primary/20 focus:border-primary font-light">
                      <SelectValue placeholder="Select horizon" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-primary/20">
                      <SelectItem value="1 Month">1 Month</SelectItem>
                      <SelectItem value="3 Months">3 Months</SelectItem>
                      <SelectItem value="6 Months">6 Months</SelectItem>
                      <SelectItem value="1 Year">1 Year</SelectItem>
                      <SelectItem value="2 Years">2 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessData" className="text-sm font-light">Additional Context (Optional)</Label>
                  <Input
                    id="businessData"
                    placeholder="Any specific factors to consider..."
                    value={formData.businessData}
                    onChange={(e) => setFormData({ ...formData, businessData: e.target.value })}
                    className="bg-input border-primary/20 focus:border-primary font-light"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full glass-button text-primary border-primary/30 hover:bg-primary/20 h-11"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      Generating...
                    </div>
                  ) : (
                    <>Generate Forecast</>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[400px] border-primary/20">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-light">Loading forecasts...</p>
          </Card>
        ) : forecasts.length === 0 ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20">
            <TrendingUp className="w-20 h-20 text-primary mb-8 opacity-50 animate-pulse-glow" />
            <h2 className="text-3xl font-extralight mb-4 text-primary">No Forecasts Yet</h2>
            <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
              Generate your first AI-powered forecast. SIBE analyzes your business data to provide
              predictive insights and strategic recommendations.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {forecasts.map((forecast) => (
              <Card
                key={forecast.id}
                className="glass-card p-6 hover-lift border-primary/20 group cursor-pointer"
                onClick={() => setSelectedForecast(forecast)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-light tracking-wide mb-2">{forecast.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-light">
                      <span>{forecast.time_horizon}</span>
                      {forecast.confidence_score && (
                        <span className="text-primary">
                          {Math.round(forecast.confidence_score)}% confidence
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteForecast(forecast.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {forecast.description && (
                  <p className="text-sm text-muted-foreground font-light line-clamp-3">
                    {forecast.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Forecast Details Dialog */}
        {selectedForecast && (
          <Dialog open={!!selectedForecast} onOpenChange={() => setSelectedForecast(null)}>
            <DialogContent className="glass-card border-primary/20 max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extralight tracking-wide">
                  {selectedForecast.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-light">
                  {selectedForecast.time_horizon} • {selectedForecast.confidence_score && `${Math.round(selectedForecast.confidence_score)}% confidence`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedForecast.description && (
                  <div>
                    <h3 className="text-lg font-light mb-2 text-primary">Summary</h3>
                    <p className="text-sm text-muted-foreground font-light">{selectedForecast.description}</p>
                  </div>
                )}

                {selectedForecast.predictions && (
                  <div>
                    <h3 className="text-lg font-light mb-3 text-primary">Detailed Analysis</h3>
                    <div className="text-sm text-muted-foreground font-light space-y-4">
                      {selectedForecast.predictions.predictions && (
                        <div>
                          <h4 className="font-normal text-foreground mb-2">Predictions:</h4>
                          {selectedForecast.predictions.predictions.map((p: any, idx: number) => (
                            <div key={idx} className="mb-2 pl-4 border-l border-primary/30">
                              <div className="font-normal">{p.metric}</div>
                              <div>{p.forecast}</div>
                              {p.confidence && <div className="text-primary">Confidence: {p.confidence}%</div>}
                            </div>
                          ))}
                        </div>
                      )}

                      {selectedForecast.predictions.recommendations && (
                        <div>
                          <h4 className="font-normal text-foreground mb-2">Recommendations:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedForecast.predictions.recommendations.map((r: string, idx: number) => (
                              <li key={idx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Forecasting;
