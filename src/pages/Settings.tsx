import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MobileMenu from "@/components/MobileMenu";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">System Settings</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-5xl font-extralight mb-3 tracking-wide">Settings</h1>
          <p className="text-primary text-lg font-light">Configure your SIBE SI platform</p>
        </div>

        <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20">
          <SettingsIcon className="w-20 h-20 text-primary mb-8 opacity-50" />
          <h2 className="text-3xl font-extralight mb-4 text-primary">Settings Panel</h2>
          <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
            Configure integrations, data sources, AI employee parameters, notification preferences, 
            and platform customization options.
          </p>
          <Button className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-light h-12 px-8">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Configure Platform
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
