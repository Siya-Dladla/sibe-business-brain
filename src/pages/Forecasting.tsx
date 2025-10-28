import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MobileMenu from "@/components/MobileMenu";
import { TrendingUp } from "lucide-react";

const Forecasting = () => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Strategy & Forecasting</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-5xl font-extralight mb-3 tracking-wide">Strategy & Forecasting</h1>
          <p className="text-primary text-lg font-light">Predictive analytics and strategic business planning</p>
        </div>

        <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20">
          <TrendingUp className="w-20 h-20 text-primary mb-8 opacity-50" />
          <h2 className="text-3xl font-extralight mb-4 text-primary">Strategy Module</h2>
          <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
            Advanced forecasting models, trend predictions, risk analysis, and strategic growth recommendations 
            powered by synthetic intelligence algorithms.
          </p>
          <Button className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-light h-12 px-8">
            <TrendingUp className="w-4 h-4 mr-2" />
            Run Forecast Analysis
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Forecasting;
