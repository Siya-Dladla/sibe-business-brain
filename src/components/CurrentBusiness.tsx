import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe, FileText, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BusinessPlan {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

interface WebsiteAnalysis {
  id: string;
  website_url: string;
  created_at: string;
}

interface CurrentBusinessProps {
  onBusinessChange?: () => void;
}

const CurrentBusiness = ({ onBusinessChange }: CurrentBusinessProps) => {
  const [businessPlan, setBusinessPlan] = useState<BusinessPlan | null>(null);
  const [websiteAnalysis, setWebsiteAnalysis] = useState<WebsiteAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCurrentBusiness = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [planResult, analysisResult] = await Promise.all([
        supabase
          .from('business_plans')
          .select('id, title, description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single(),
        supabase
          .from('website_analyses')
          .select('id, website_url, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
      ]);

      setBusinessPlan(planResult.data);
      setWebsiteAnalysis(analysisResult.data);
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentBusiness();
  }, []);

  const clearBusinessPlan = async () => {
    if (!businessPlan) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all business plans for this user
      await supabase
        .from('business_plans')
        .delete()
        .eq('user_id', user.id);

      // Also delete related insights
      await supabase
        .from('ai_insights')
        .delete()
        .eq('business_plan_id', businessPlan.id);

      setBusinessPlan(null);
      toast({
        title: "Business Data Cleared",
        description: "You can now upload new business data.",
      });
      onBusinessChange?.();
    } catch (error) {
      console.error('Error clearing business plan:', error);
      toast({
        title: "Error",
        description: "Failed to clear business data",
        variant: "destructive",
      });
    }
  };

  const clearWebsiteAnalysis = async () => {
    if (!websiteAnalysis) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete all website analyses for this user
      await supabase
        .from('website_analyses')
        .delete()
        .eq('user_id', user.id);

      setWebsiteAnalysis(null);
      toast({
        title: "Website Analysis Cleared",
        description: "You can now analyze a new website.",
      });
      onBusinessChange?.();
    } catch (error) {
      console.error('Error clearing website analysis:', error);
      toast({
        title: "Error",
        description: "Failed to clear website analysis",
        variant: "destructive",
      });
    }
  };

  const hasAnyBusiness = businessPlan || websiteAnalysis;
  const businessName = businessPlan?.title || 
    (websiteAnalysis?.website_url ? new URL(websiteAnalysis.website_url).hostname : null);

  if (loading) {
    return (
      <Card className="glass-card p-4 border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-primary/10 rounded animate-pulse w-32 mb-2" />
            <div className="h-3 bg-primary/10 rounded animate-pulse w-48" />
          </div>
        </div>
      </Card>
    );
  }

  if (!hasAnyBusiness) {
    return (
      <Card className="glass-card p-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <div>
            <p className="text-sm font-medium text-amber-500">No Business Configured</p>
            <p className="text-xs text-muted-foreground">
              Upload a business plan or analyze your website to get started
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4 border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary/20">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium truncate">
                Currently Analyzing: <span className="text-primary">{businessName}</span>
              </p>
              <Badge variant="outline" className="border-green-500/30 text-green-500 text-xs">
                Active
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              {businessPlan && (
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Business Plan
                </span>
              )}
              {websiteAnalysis && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {websiteAnalysis.website_url}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {businessPlan && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear Plan
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Business Plan?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your current business plan data. You'll be able to upload a new one afterward.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearBusinessPlan}>Clear Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {websiteAnalysis && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Clear Website
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Website Analysis?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove your current website analysis. You'll be able to analyze a new website afterward.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearWebsiteAnalysis}>Clear Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CurrentBusiness;
