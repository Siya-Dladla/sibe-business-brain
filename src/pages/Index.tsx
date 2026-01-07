import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChatInterface } from "@/components/ChatInterface";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Brain className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  // Authenticated - show chat interface
  if (isAuthenticated) {
    return <ChatInterface />;
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <span className="font-medium">Sibe SI</span>
        </div>
        <Button onClick={() => navigate("/auth")} variant="outline" size="sm">
          Sign In
        </Button>
      </header>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-12 relative">
          <div className="w-32 h-32 rounded-full bg-card border border-border flex items-center justify-center">
            <Brain className="w-16 h-16 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
        </div>

        <h1 className="text-4xl md:text-5xl font-light mb-4 text-center">
          Sibe SI
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-xl mb-4">
          Synthetic Intelligence Business Engine
        </p>
        <p className="text-sm text-muted-foreground/70 text-center max-w-lg mb-12">
          Chat with your business data. Upload PDFs, analyze websites, connect APIs, 
          and get AI-powered insights with beautiful visualizations.
        </p>

        <Button onClick={() => navigate("/auth")} size="lg" className="gap-2">
          Get Started
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full">
          <FeatureCard
            title="Upload Documents"
            description="PDF, Word docs, and more. Extract insights from your business documents."
          />
          <FeatureCard
            title="Analyze Websites"
            description="Enter any URL and get strategic analysis of competitors or your own site."
          />
          <FeatureCard
            title="Visual Insights"
            description="Charts, tables, and KPI cards rendered right in your conversation."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="h-14 border-t border-border flex items-center justify-center px-6">
        <p className="text-xs text-muted-foreground">
          © 2025 SGD Business Analysis & Projects
        </p>
      </footer>
    </div>
  );
};

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;
