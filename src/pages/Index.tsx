import { Link } from "react-router-dom";
import { Database, Layers, Users, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import HomeChat from "@/components/HomeChat";
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
  return <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <MobileMenu />
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => <Link key={index} to={item.path}>
                
              </Link>)}
          </nav>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="text-white/60 border-white/10 hover:bg-white/5 hover:text-white">
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
      <div className="p-3 border-t border-[#1a1a1a] flex items-center justify-center bg-[#0a0a0a]">
        <p className="text-[10px] text-white/30">
          © 2025 SGD Business Analysis & Projects | Synthetic Intelligence Business Engine
        </p>
      </div>
    </div>;
};
export default Index;