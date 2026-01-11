import { Link } from "react-router-dom";
import { Database, Layers, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import HomeChat from "@/components/HomeChat";

const Index = () => {
  const menuItems = [
    { icon: Database, label: "Data", path: "/dashboard" },
    { icon: Layers, label: "Canvas", path: "/canvas" },
    { icon: Users, label: "AI Employees", path: "/employees" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border bg-background">
        <MobileMenu />
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-muted gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
          <Link to="/auth">
            <Button
              variant="outline"
              size="sm"
              className="text-muted-foreground border-border hover:bg-muted hover:text-foreground"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex">
        <HomeChat />
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center justify-center bg-background">
        <p className="text-[10px] text-muted-foreground/50">
          © 2025 SGD Business Analysis & Projects | Synthetic Intelligence Business Engine
        </p>
      </div>
    </div>
  );
};

export default Index;
