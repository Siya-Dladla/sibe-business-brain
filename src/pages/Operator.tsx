import { Link } from "react-router-dom";
import { Settings, Megaphone, Headphones, Package, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MobileMenu from "@/components/MobileMenu";
import OperatorStatus from "@/components/operator/OperatorStatus";
import OperatorChat from "@/components/operator/OperatorChat";
import QuickMetrics from "@/components/operator/QuickMetrics";
import { useIsMobile } from "@/hooks/use-mobile";

const Operator = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 flex items-center justify-between border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <div>
            <h1 className="text-lg font-light tracking-wider text-foreground">SIBE</h1>
            <p className="text-[10px] text-muted-foreground font-light">AI Operating System</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="outline" size="sm" className="text-xs h-8">
              Sign In
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {isMobile ? (
          // Mobile: Tab-based navigation
          <Tabs defaultValue="operator" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-4 py-6 bg-background border-b border-border rounded-none">
              <TabsTrigger value="operator" className="flex-1">Operator</TabsTrigger>
              <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
            </TabsList>
            <TabsContent value="operator" className="flex-1 m-0 overflow-hidden">
              <OperatorChat />
            </TabsContent>
            <TabsContent value="status" className="flex-1 m-0 overflow-auto p-4">
              <QuickMetrics />
              <div className="mt-6">
                <OperatorStatus />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Desktop: Split view
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Chat */}
            <div className="flex-1 flex flex-col border-r border-border">
              <OperatorChat />
            </div>
            
            {/* Right: Status Panel */}
            <div className="w-80 xl:w-96 flex flex-col overflow-hidden bg-card/30">
              <div className="p-4 border-b border-border">
                <QuickMetrics />
              </div>
              <div className="flex-1 overflow-auto p-4">
                <OperatorStatus />
              </div>
              
              {/* Quick Actions */}
              <div className="p-4 border-t border-border space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Modules</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/marketing">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-9">
                      <Megaphone className="w-3 h-3" />
                      Marketing
                    </Button>
                  </Link>
                  <Link to="/support">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-9">
                      <Headphones className="w-3 h-3" />
                      Support
                    </Button>
                  </Link>
                  <Link to="/operations">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-9">
                      <Package className="w-3 h-3" />
                      Operations
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs h-9">
                      <BarChart3 className="w-3 h-3" />
                      Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Operator;
