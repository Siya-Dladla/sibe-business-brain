import { Link, useNavigate } from "react-router-dom";
import { Database, Layers, FileText, Settings, LogOut, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import HomeChat from "@/components/HomeChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import SibeLogo from "@/components/SibeLogo";

const Index = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const menuItems = [
    { icon: Database, label: "Data", path: "/dashboard" },
    { icon: Layers, label: "Integrations", path: "/canvas" },
    { icon: FileText, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
    navigate("/");
  };

  return (
    <div className="min-h-[100dvh] bg-background grid-bg flex flex-col overflow-hidden safe-area-inset">
      {/* Header */}
      <header className="shrink-0 px-3 py-2 md:p-4 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full arc-gradient flex items-center justify-center" style={{ boxShadow: "0 0 10px hsla(190, 95%, 50%, 0.3)" }}>
              <Activity className="w-3 h-3 text-primary-foreground" />
            </div>
            {!isMobile && (
              <span className="text-lg font-light tracking-wider text-foreground ml-1">
                SIBE
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item, index) => (
              <Link key={index} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5 gap-2"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs h-8 px-3 active:scale-95 transition-transform"
            >
              <LogOut className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button
                size="sm"
                className="text-xs h-8 px-4 active:scale-95 transition-transform"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex min-h-0 overflow-hidden touch-pan-y">
        <HomeChat />
      </main>

      {/* Footer */}
      <footer className="hidden md:flex shrink-0 p-3 border-t border-border items-center justify-center bg-background pb-safe">
        <p className="text-[10px] text-muted-foreground/50">
          © 2025 SGD Business Analysis & Projects | Synthetic Intelligence Business Engine
        </p>
      </footer>
    </div>
  );
};

export default Index;
