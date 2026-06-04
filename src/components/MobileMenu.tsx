import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useFeedback } from "@/hooks/useFeedback";
import SibeLogo from "@/components/SibeLogo";
import {
  Menu, Home, Network, Brain, Bot, Settings, LogOut,
} from "lucide-react";

export const AX_NAV = [
  { icon: Home, label: "Command", path: "/" },
  { icon: Network, label: "Brain Graph", path: "/reality" },
  { icon: Brain, label: "Brain", path: "/brain" },
  { icon: Bot, label: "Agents", path: "/agents" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const feedback = useFeedback();

  const handleSignOut = async () => {
    feedback.impact();
    await signOut();
    toast({ title: "Signed out" });
    navigate("/auth");
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (v) feedback.navigate(); setOpen(v); }}>
      <SheetTrigger asChild>
        <button
          className="glass-button p-3 rounded-lg hover-lift bg-primary-foreground active:scale-95 transition-transform touch-manipulation"
          onClick={() => feedback.tap()}
        >
          <Menu className="w-6 h-6 text-primary" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-background border-primary/20 p-0 w-[300px] backdrop-blur-xl safe-area-inset">
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-primary/20 pt-safe">
            <div className="flex items-center gap-3 mb-2">
              <SibeLogo size="sm" />
              <div>
                <h2 className="text-2xl font-extralight tracking-wider">SIBE AX</h2>
                <p className="text-[10px] text-muted-foreground font-light">Agent Experience OS</p>
              </div>
            </div>
            <p className="text-xs text-primary font-light mt-1">Living Business Intelligence Organism</p>
          </div>

          <nav className="flex-1 py-4 native-bounce overflow-y-auto">
            {AX_NAV.map((item, i) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => { feedback.tap(); setOpen(false); }}
                  className={`flex items-center gap-4 px-8 py-3 hover:bg-primary/5 transition-all duration-200 group active:scale-[0.98] touch-manipulation ${isActive ? "bg-primary/10 border-l-2 border-primary" : "border-l-2 border-transparent"}`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-light ${isActive ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-8 border-t border-primary/20 space-y-4 pb-safe">
            {user && (
              <Button onClick={handleSignOut} variant="outline" className="w-full glass-button justify-start text-primary border-primary/30 hover:bg-primary/10 active:scale-95 transition-transform touch-manipulation">
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            )}
            <div>
              <p className="text-xs text-muted-foreground font-light">© 2025 SGD Business Analysis</p>
              <p className="text-xs text-primary/50 mt-1">SIBE AX v7.0 · Agent-Native</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
