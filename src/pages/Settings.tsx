import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import MobileMenu from "@/components/MobileMenu";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <MobileMenu />
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">Settings</h1>
          <p className="text-secondary text-xl">Configure your SIBE SI platform</p>
        </div>

        <Card className="glass-card p-12 flex flex-col items-center justify-center min-h-[400px]">
          <SettingsIcon className="w-16 h-16 text-primary mb-6 animate-pulse-glow" />
          <h2 className="text-2xl font-semibold mb-4">Settings Panel</h2>
          <p className="text-secondary text-center max-w-md">
            Platform configuration options coming soon
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
