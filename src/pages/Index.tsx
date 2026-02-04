import { Link, useNavigate } from "react-router-dom";
import { Database, Layers, Bot, FileText, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import HomeChat from "@/components/HomeChat";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const menuItems = [
    { icon: Database, label: "Data", path: "/dashboard" },
    { icon: Layers, label: "Integrations", path: "/canvas" },
    { icon: Bot, label: "AI Agents", path: "/employees" },
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
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-3 py-2 md:p-4 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 safe-area-inset-top">
        <div className="flex items-center gap-2">
          <MobileMenu />
          {!isMobile && (
            <span className="text-lg font-light tracking-wider text-foreground ml-2">SIBE</span>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
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
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground border-border hover:bg-muted hover:text-foreground text-xs h-8 px-3"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button
                variant="outline"
                size="sm"
                className="text-muted-foreground border-border hover:bg-muted hover:text-foreground text-xs h-8 px-3"
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex min-h-0 overflow-hidden">
        <HomeChat />
      </main>

      {/* Footer - Hidden on mobile for more space */}
      <footer className="hidden md:flex shrink-0 p-3 border-t border-border items-center justify-center bg-background">
        <p className="text-[10px] text-muted-foreground/50">
          © 2025 SGD Business Analysis & Projects | Synthetic Intelligence Business Engine
        </p>
      </footer>
    </div>
  );
};

export default Index;
