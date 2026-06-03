import { Link } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import AXCommandCenter from "@/components/AXCommandCenter";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { AX_NAV } from "@/components/MobileMenu";

const Index = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out" });
    navigate("/");
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden safe-area-inset">
      <header className="shrink-0 px-3 py-2 md:p-4 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50 pt-safe">
        <div className="flex items-center gap-2">
          <MobileMenu />
          {!isMobile && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-lg font-light tracking-wider text-foreground">SIBE AX</span>
              <span className="text-[10px] text-muted-foreground/60 hidden md:inline">Agent Experience OS</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <nav className="hidden lg:flex items-center gap-1">
            {AX_NAV.filter(i => i.path !== "/").slice(0, 8).map((item, index) => (
              <Link key={index} to={item.path}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted gap-1.5 px-2">
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{item.label}</span>
                </Button>
              </Link>
            ))}
          </nav>
          {user ? (
            <Button variant="outline" size="sm" onClick={handleSignOut} className="text-muted-foreground border-border hover:bg-muted hover:text-foreground text-xs h-8 px-3 active:scale-95 transition-transform">
              <LogOut className="w-3 h-3 mr-1" /><span className="hidden sm:inline">Sign Out</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="text-muted-foreground border-border hover:bg-muted hover:text-foreground text-xs h-8 px-3 active:scale-95 transition-transform">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex min-h-0 overflow-hidden touch-pan-y">
        {user ? (
          <AXCommandCenter />
        ) : (
          <Navigate to="/auth" replace />
        )}
      </main>

      <footer className="hidden md:flex shrink-0 p-3 border-t border-border items-center justify-center bg-background pb-safe">
        <p className="text-[10px] text-muted-foreground/50">
          © 2025 SGD Business Analysis | SIBE AX · Living Business Intelligence Organism
        </p>
      </footer>
    </div>
  );
};

export default Index;
