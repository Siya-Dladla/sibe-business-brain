import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background grid-bg">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40 px-4">
            <SidebarTrigger className="text-muted-foreground hover:text-primary transition-colors" />
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: "0 0 8px hsla(190, 95%, 50%, 0.5)" }} />
              <span className="text-xs text-muted-foreground">Online</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
