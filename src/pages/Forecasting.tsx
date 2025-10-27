import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import MobileMenu from "@/components/MobileMenu";
import { TrendingUp } from "lucide-react";

const Forecasting = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <MobileMenu />
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">Strategy & Forecasting</h1>
          <p className="text-secondary text-xl">Predictive analytics and strategic planning</p>
        </div>

        <Card className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px]">
          <TrendingUp className="w-16 h-16 text-primary mb-6 animate-pulse-glow" />
          <h2 className="text-2xl font-semibold mb-4">Strategy Module</h2>
          <p className="text-secondary text-center max-w-md">
            Forecasting and strategic planning features coming soon
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Forecasting;
