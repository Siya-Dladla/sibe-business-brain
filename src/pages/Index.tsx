import { Link } from "react-router-dom";
import { BarChart3, Users, Calendar, TrendingUp, Settings } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";

const Index = () => {
  const menuItems = [
    { icon: BarChart3, label: "Analytics", path: "/dashboard" },
    { icon: Users, label: "Team", path: "/employees" },
    { icon: Calendar, label: "Meetings", path: "/meeting" },
    { icon: TrendingUp, label: "Strategy", path: "/forecasting" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Menu */}
      <div className="p-6">
        <MobileMenu />
      </div>

      {/* Logo Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-12">
          <div className="relative">
            <div className="w-64 h-64 rounded-full border-2 border-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-light mb-2">Sibe</h1>
              </div>
            </div>
            <div className="absolute -top-4 -right-8 text-3xl font-light">SI</div>
          </div>
        </div>

        <h2 className="text-xl text-secondary text-center mb-16">
          Professional Business Intelligence Platform
        </h2>

        {/* Menu Grid */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.path}>
              <div className="glass-card p-8 flex flex-col items-center justify-center gap-4 hover:glow-border transition-all duration-300 min-h-[160px]">
                <item.icon className="w-12 h-12" />
                <span className="text-lg font-medium">{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
