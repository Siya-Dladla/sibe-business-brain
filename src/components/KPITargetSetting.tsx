import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Target, 
  Plus, 
  Users, 
  DollarSign, 
  Wallet, 
  Loader2,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface KPITarget {
  id: string;
  metric_type: string;
  target_value: number;
  current_value: number;
}

interface KPITargetSettingProps {
  metrics: Array<{
    metric_type: string;
    metric_name: string;
    value: number;
    change_percentage: number;
  }>;
  onTargetSaved: () => void;
}

const KPITargetSetting = ({ metrics, onTargetSaved }: KPITargetSettingProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metricType, setMetricType] = useState<string>("");
  const [targetValue, setTargetValue] = useState<string>("");
  const [targets, setTargets] = useState<KPITarget[]>([]);
  const { toast } = useToast();

  const metricOptions = [
    { value: "customers", label: "Customers", icon: Users, color: "text-indigo-400" },
    { value: "revenue", label: "Revenue", icon: DollarSign, color: "text-green-400" },
    { value: "profit", label: "Profit", icon: Wallet, color: "text-amber-400" },
  ];

  // Load targets from localStorage (in production, use database)
  useEffect(() => {
    const savedTargets = localStorage.getItem('kpi_targets');
    if (savedTargets) {
      setTargets(JSON.parse(savedTargets));
    }
  }, []);

  // Update targets with current values from metrics
  useEffect(() => {
    if (metrics.length > 0 && targets.length > 0) {
      const updatedTargets = targets.map(target => {
        const currentMetric = metrics.find(m => m.metric_type === target.metric_type);
        return {
          ...target,
          current_value: currentMetric?.value || target.current_value,
        };
      });
      setTargets(updatedTargets);
      localStorage.setItem('kpi_targets', JSON.stringify(updatedTargets));
    }
  }, [metrics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metricType || !targetValue) {
      toast({
        title: "Missing Fields",
        description: "Please select a metric and enter a target value",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const currentMetric = metrics.find(m => m.metric_type === metricType);
      const newTarget: KPITarget = {
        id: Date.now().toString(),
        metric_type: metricType,
        target_value: parseFloat(targetValue),
        current_value: currentMetric?.value || 0,
      };

      // Remove existing target for same metric type
      const filteredTargets = targets.filter(t => t.metric_type !== metricType);
      const newTargets = [...filteredTargets, newTarget];
      
      setTargets(newTargets);
      localStorage.setItem('kpi_targets', JSON.stringify(newTargets));

      toast({
        title: "Target Set",
        description: `KPI target for ${metricOptions.find(m => m.value === metricType)?.label} has been set`,
      });

      setMetricType("");
      setTargetValue("");
      setOpen(false);
      onTargetSaved();
    } catch (error) {
      console.error("Error saving target:", error);
      toast({
        title: "Error",
        description: "Failed to save target. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return "bg-green-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  const getStatus = (progress: number) => {
    if (progress >= 100) return { text: "Achieved", color: "bg-green-500/20 text-green-400" };
    if (progress >= 75) return { text: "On Track", color: "bg-blue-500/20 text-blue-400" };
    if (progress >= 50) return { text: "Progressing", color: "bg-amber-500/20 text-amber-400" };
    return { text: "Behind", color: "bg-red-500/20 text-red-400" };
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

  const selectedMetric = metricOptions.find(m => m.value === metricType);

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">KPI Targets</h3>
                <p className="text-xs text-muted-foreground">Set performance goals</p>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Set KPI Target
            </DialogTitle>
            <DialogDescription>
              Define your performance targets with risk thresholds.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Metric Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="metric-type">Metric</Label>
              <Select value={metricType} onValueChange={setMetricType}>
                <SelectTrigger id="metric-type">
                  <SelectValue placeholder="Select a metric" />
                </SelectTrigger>
                <SelectContent>
                  {metricOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Value Display */}
            {selectedMetric && (
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Value</span>
                  <span className="text-lg font-semibold">
                    {formatValue(metricType, metrics.find(m => m.metric_type === metricType)?.value || 0)}
                  </span>
                </div>
              </div>
            )}

            {/* Target Value Input */}
            <div className="space-y-2">
              <Label htmlFor="target-value">
                Target Value {metricType && metricType !== "customers" && "($)"}
              </Label>
              <Input
                id="target-value"
                type="number"
                step="0.01"
                min="0"
                placeholder={metricType === "customers" ? "e.g., 5000" : "e.g., 100000"}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Set Target
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Active Targets Display */}
      {targets.length > 0 && (
        <Card className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="text-sm font-medium text-foreground">Active KPI Targets</h4>
          </div>
          <div className="space-y-4">
            {targets.map((target) => {
              const metricOption = metricOptions.find(m => m.value === target.metric_type);
              const progress = target.target_value > 0 
                ? Math.min((target.current_value / target.target_value) * 100, 100)
                : 0;
              const status = getStatus(progress);

              return (
                <div
                  key={target.id}
                  className="p-3 bg-background/50 border border-border/50 rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metricOption && <metricOption.icon className={`w-4 h-4 ${metricOption.color}`} />}
                      <span className="text-sm font-medium">{metricOption?.label}</span>
                    </div>
                    <Badge className={`${status.color} border-0 text-xs`}>
                      {status.text}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress: {progress.toFixed(1)}%</span>
                      <span>
                        {formatValue(target.metric_type, target.current_value)} / {formatValue(target.metric_type, target.target_value)}
                      </span>
                    </div>
                    <Progress 
                      value={progress} 
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default KPITargetSetting;
