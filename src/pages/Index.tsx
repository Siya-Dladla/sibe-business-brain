import { Link } from "react-router-dom";
import { Database, Layers, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
const Index = () => {
  const menuItems = [{
    icon: Database,
    label: "Data",
    path: "/dashboard"
  }, {
    icon: Layers,
    label: "Canvas",
    path: "/canvas"
  }, {
    icon: Users,
    label: "AI Employees",
    path: "/employees"
  }, {
    icon: FileText,
    label: "Reports",
    path: "/reports"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];
  return <div className="min-h-screen bg-background flex flex-col grid-bg">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-primary-foreground">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">SIBE </div>
      </div>

      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-primary-foreground">
        <div className="mb-16 animate-float">
          <div className="relative">
            <div className="w-72 h-72 rounded-full border border-primary/30 flex items-center justify-center bg-gradient-card backdrop-blur-sm shadow-2xl hover-lift">
              <div className="text-center">
                <h1 className="text-7xl font-extralight tracking-wider mb-2 glow-text">Sibe</h1>
                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent"></div>
              </div>
            </div>
            
            <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse-glow"></div>
          </div>
        </div>

        <h2 className="text-2xl text-primary text-center mb-4 font-light tracking-wide">
          Synthetic Intelligence Business Engine
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-8 max-w-2xl">
          The AI that learns your business, thinks strategically, and advises you 24/7
        </p>
        <p className="text-xs text-muted-foreground/60 text-center mb-20 max-w-xl">
          Unlike traditional BI tools, Sibe SI is alive — it understands how your business operates and evolves with every data point you share
        </p>

        {/* Menu Grid */}
        <div className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-3 gap-6">
          {menuItems.map((item, index) => <Link key={index} to={item.path}>
              <div className="glass-card p-10 flex flex-col items-center justify-center gap-5 hover:glow-border hover-lift transition-all duration-300 min-h-[180px] group bg-primary-foreground">
                <item.icon className="w-14 h-14 text-primary transition-transform duration-300 group-hover:scale-110" />
                <span className="text-lg font-light tracking-wide">{item.label}</span>
              </div>
            </Link>)}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border/50 flex items-center justify-between bg-primary-foreground">
        <p className="text-xs text-muted-foreground">
          © 2025 SGD Business Analysis & Projects
        </p>
        <Link to="/auth">
          <Button variant="outline" className="glass-button text-primary border-primary/30 hover:bg-primary/10">
            Sign In
          </Button>
        </Link>
      </div>
    </div>;
};
export default Index;