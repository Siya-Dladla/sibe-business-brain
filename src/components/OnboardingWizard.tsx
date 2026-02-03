import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  ShoppingCart,
  Globe,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Database,
  Bot,
  Workflow,
  Rocket,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";

interface OnboardingWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const DATA_SOURCES = [
  { 
    id: "shopify", 
    name: "Shopify", 
    icon: ShoppingCart, 
    color: "text-green-400",
    description: "Connect your Shopify store to sync orders, revenue, and inventory data."
  },
  { 
    id: "meta", 
    name: "Meta Ads", 
    icon: Globe, 
    color: "text-blue-500",
    description: "Sync Facebook & Instagram ad performance, spend, and ROAS metrics."
  },
  { 
    id: "google_analytics", 
    name: "Google Analytics", 
    icon: BarChart3, 
    color: "text-orange-400",
    description: "Import website traffic, user behavior, and conversion data."
  },
  { 
    id: "stripe", 
    name: "Stripe", 
    icon: TrendingUp, 
    color: "text-purple-400",
    description: "Connect payment data including MRR, subscriptions, and churn."
  },
];

const STEPS = [
  { id: 1, title: "Welcome", description: "Get started with Sibe" },
  { id: 2, title: "Data Sources", description: "Connect your first source" },
  { id: 3, title: "API Keys", description: "Enter credentials" },
  { id: 4, title: "Complete", description: "You're all set!" },
];

const OnboardingWizard = ({ open, onOpenChange, onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const progress = (currentStep / STEPS.length) * 100;

  const toggleSource = (sourceId: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(s => s !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedSources.length === 0) {
      toast({
        title: "Select at least one source",
        description: "Choose at least one data source to continue.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Create connections for each selected source
      for (const sourceId of selectedSources) {
        const source = DATA_SOURCES.find(s => s.id === sourceId);
        await supabase.from('api_connections').insert({
          user_id: user.id,
          name: source?.name || sourceId,
          provider: sourceId,
          credentials_encrypted: apiKeys[sourceId] || null,
          status: 'connected',
          sync_config: { frequency: 'hourly' },
        });
      }

      // Trigger initial sync for all connections
      await supabase.functions.invoke('sync-api-data', {
        body: { userId: user.id, syncAll: true },
      });

      toast({
        title: "🎉 Setup Complete!",
        description: `Connected ${selectedSources.length} data source${selectedSources.length > 1 ? 's' : ''}. Your data is syncing.`,
      });

      onComplete();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Setup Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Sparkles className="w-6 h-6 text-primary" />
            Welcome to Sibe
          </DialogTitle>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((step) => (
              <span 
                key={step.id} 
                className={currentStep >= step.id ? "text-primary" : ""}
              >
                {step.title}
              </span>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="py-4">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-full bg-primary/10 w-24 h-24 mx-auto flex items-center justify-center">
                <Rocket className="w-12 h-12 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-light">Let's set up your e-commerce command center</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Connect your data sources to unlock AI-powered insights, automated workflows, 
                  and real-time analytics for your online store.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-4">
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Database className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs">Data Sync</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Bot className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs">AI Insights</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/30">
                  <Workflow className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs">Automation</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Data Sources Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-light">Select your data sources</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the platforms you want to connect. You can add more later.
                </p>
              </div>
              <div className="grid gap-3">
                {DATA_SOURCES.map((source) => {
                  const isSelected = selectedSources.includes(source.id);
                  const Icon = source.icon;
                  return (
                    <Card
                      key={source.id}
                      className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        isSelected ? "border-primary bg-primary/5" : "glass-card"
                      }`}
                      onClick={() => toggleSource(source.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${isSelected ? "bg-primary/20" : "bg-muted/30"}`}>
                          <Icon className={`w-6 h-6 ${source.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{source.name}</h4>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {source.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
              {selectedSources.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-2">
                  {selectedSources.map(id => {
                    const source = DATA_SOURCES.find(s => s.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="gap-1">
                        {source?.name}
                        <CheckCircle2 className="w-3 h-3" />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 3: API Keys */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-light">Enter your API credentials</h3>
                <p className="text-sm text-muted-foreground">
                  Your keys are encrypted and stored securely. Skip if you don't have them yet.
                </p>
              </div>
              <div className="space-y-4">
                {selectedSources.map(sourceId => {
                  const source = DATA_SOURCES.find(s => s.id === sourceId);
                  const Icon = source?.icon || Database;
                  return (
                    <div key={sourceId} className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${source?.color}`} />
                        {source?.name} API Key
                      </Label>
                      <div className="relative">
                        <Input
                          type={showKeys[sourceId] ? "text" : "password"}
                          placeholder={`Enter your ${source?.name} API key (optional)`}
                          value={apiKeys[sourceId] || ""}
                          onChange={(e) => setApiKeys(prev => ({ 
                            ...prev, 
                            [sourceId]: e.target.value 
                          }))}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2"
                          onClick={() => setShowKeys(prev => ({ 
                            ...prev, 
                            [sourceId]: !prev[sourceId] 
                          }))}
                        >
                          {showKeys[sourceId] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Card className="p-4 bg-amber-500/10 border-amber-500/30">
                <div className="flex gap-3">
                  <Key className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-500">API Keys are Optional</p>
                    <p className="text-muted-foreground mt-1">
                      You can connect sources now and add API keys later in Settings. 
                      Demo data will be used until you provide real credentials.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center">
              <div className="p-6 rounded-full bg-green-500/10 w-24 h-24 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-light">You're all set!</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Your data sources are being connected. Head to the Command Center 
                  to start asking questions about your business.
                </p>
              </div>
              <div className="space-y-3 max-w-sm mx-auto pt-4">
                <h4 className="text-sm font-medium">What's next?</h4>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="text-sm">Ask Sibe AI about your metrics</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Workflow className="w-5 h-5 text-primary" />
                    <span className="text-sm">Connect n8n or Make workflows</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Bot className="w-5 h-5 text-primary" />
                    <span className="text-sm">Build AI agents on OpenAI</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div>
            {currentStep > 1 && currentStep < 4 && (
              <Button variant="ghost" onClick={handleBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {currentStep < 4 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip for now
              </Button>
            )}
            {currentStep < 4 ? (
              <Button onClick={handleNext} className="gap-2">
                {currentStep === 3 ? "Connect Sources" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? "Setting up..." : "Go to Dashboard"}
                <Rocket className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWizard;
