import { useState } from "react";
import { Menu, X, Home, BarChart3, TrendingUp, Users, Calendar, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard" },
    { icon: TrendingUp, label: "Forecasting", path: "/forecasting" },
    { icon: Users, label: "Team", path: "/employees" },
    { icon: Calendar, label: "Meetings", path: "/meeting" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="glass-button p-3 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background border-white/10 p-0 w-[280px]">
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-bold">Menu</h2>
          </div>
          
          <nav className="flex-1 py-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition ${
                  location.pathname === item.path ? "bg-white/10" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-lg">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-white/10">
            <p className="text-sm text-muted-foreground">© 2025</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
