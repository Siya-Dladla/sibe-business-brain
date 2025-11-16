import { useState } from "react";
import { Menu, X, Home, BarChart3, TrendingUp, Users, Calendar, Settings, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
    navigate("/auth");
    setOpen(false);
  };

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
        <button className="glass-button p-3 rounded-lg hover-lift">
          <Menu className="w-6 h-6 text-primary" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background border-primary/20 p-0 w-[300px] backdrop-blur-xl">
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-primary/20">
            <h2 className="text-3xl font-extralight tracking-wider mb-1">SIBE</h2>
            <p className="text-xs text-primary font-light">Synthetic Intelligence</p>
          </div>
          
          <nav className="flex-1 py-6">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-4 px-8 py-4 hover:bg-primary/5 transition-all duration-200 group ${
                  location.pathname === item.path ? "bg-primary/10 border-l-2 border-primary" : "border-l-2 border-transparent"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                }`} />
                <span className={`text-base font-light ${
                  location.pathname === item.path ? "text-primary" : "text-foreground"
                }`}>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-8 border-t border-primary/20 space-y-4">
            {user && (
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full glass-button justify-start text-primary border-primary/30 hover:bg-primary/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-light">© 2025 SGD Business Analysis</p>
              <p className="text-xs text-primary/50 mt-1">v6.0 Professional</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
