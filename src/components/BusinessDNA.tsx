import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Brain, 
  Building2, 
  FileText, 
  Globe, 
  TrendingUp, 
  Users,
  DollarSign,
  Wallet,
  Calendar,
  Target,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

interface BusinessDNAProps {
  metrics: Array<{
    metric_type: string;
    metric_name: string;
    value: number;
    change_percentage: number;
    created_at?: string;
  }>;
}

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

const BusinessDNA = ({ metrics }: BusinessDNAProps) => {
  const [businessPlans, setBusinessPlans] = useState<BusinessPlan[]>([]);
  const [websiteAnalyses, setWebsiteAnalyses] = useState<WebsiteAnalysis[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBusinessData();
  }, []);

  useEffect(() => {
    // Calculate risk score based on metrics performance
    calculateRiskScore();
  }, [metrics]);

  const fetchBusinessData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [plansResult, analysesResult] = await Promise.all([
        supabase
          .from('business_plans')
          .select('id, title, description, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('website_analyses')
          .select('id, website_url, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3)
      ]);

      setBusinessPlans(plansResult.data || []);
      setWebsiteAnalyses(analysesResult.data || []);
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskScore = () => {
    if (!metrics || metrics.length === 0) {
      setRiskScore(50); // Default medium risk when no data
      return;
    }

    let totalRisk = 0;
    let count = 0;

    metrics.forEach(metric => {
      const change = metric.change_percentage || 0;
      // Higher negative change = higher risk
      if (change < -10) {
        totalRisk += 80;
      } else if (change < -5) {
        totalRisk += 60;
      } else if (change < 0) {
        totalRisk += 40;
      } else if (change < 5) {
        totalRisk += 25;
      } else {
        totalRisk += 10;
      }
      count++;
    });

    setRiskScore(count > 0 ? Math.round(totalRisk / count) : 50);
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { text: "High Risk", color: "bg-red-500/20 text-red-400 border-red-500/30" };
    if (score >= 40) return { text: "Medium Risk", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    return { text: "Low Risk", color: "bg-green-500/20 text-green-400 border-green-500/30" };
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'revenue' || type === 'profit') {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
      return `$${value.toFixed(0)}`;
    }
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'customers': return <Users className="w-4 h-4 text-indigo-400" />;
      case 'revenue': return <DollarSign className="w-4 h-4 text-green-400" />;
      case 'profit': return <Wallet className="w-4 h-4 text-amber-400" />;
      default: return <TrendingUp className="w-4 h-4 text-primary" />;
    }
  };

  const riskLevel = getRiskLevel(riskScore);
  const latestDate = metrics.length > 0 && metrics[0]?.created_at 
    ? format(new Date(metrics[0].created_at), 'MMM d, yyyy')
    : format(new Date(), 'MMM d, yyyy');

  return (
    <Card className="glass-card p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground">Business Brain</h3>
            <p className="text-xs text-muted-foreground">Complete business intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{latestDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Risk Assessment */}
        <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium">Risk Assessment</span>
            </div>
            <Badge className={`${riskLevel.color} border text-xs`}>
              {riskLevel.text}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Risk Score</span>
              <span className="font-medium">{riskScore}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  riskScore >= 70 ? 'bg-red-500' : riskScore >= 40 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${riskScore}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on current KPI performance trends
            </p>
          </div>
        </div>

        {/* KPI Summary */}
        <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Key Metrics</span>
          </div>
          <div className="space-y-2">
            {metrics.slice(0, 3).map((metric) => (
              <div key={metric.metric_type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getMetricIcon(metric.metric_type)}
                  <span className="text-xs text-muted-foreground capitalize">{metric.metric_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatValue(metric.metric_type, metric.value)}</span>
                  <span className={`text-xs ${metric.change_percentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metric.change_percentage >= 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
            {metrics.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">No metrics data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Business Documents & Sources */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Data Sources
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Business Plans */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="w-3.5 h-3.5" />
              <span>Business Plans ({businessPlans.length})</span>
            </div>
            {businessPlans.length > 0 ? (
              businessPlans.slice(0, 2).map((plan) => (
                <div key={plan.id} className="p-2 bg-muted/30 rounded-md text-xs">
                  <p className="font-medium truncate">{plan.title}</p>
                  <p className="text-muted-foreground">
                    {format(new Date(plan.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No business plans uploaded</p>
            )}
          </div>

          {/* Website Analyses */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="w-3.5 h-3.5" />
              <span>Website Analyses ({websiteAnalyses.length})</span>
            </div>
            {websiteAnalyses.length > 0 ? (
              websiteAnalyses.slice(0, 2).map((analysis) => (
                <div key={analysis.id} className="p-2 bg-muted/30 rounded-md text-xs">
                  <p className="font-medium truncate">{analysis.website_url}</p>
                  <p className="text-muted-foreground">
                    {format(new Date(analysis.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic">No website analyses yet</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BusinessDNA;
