import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, PenLine, Users, DollarSign, Wallet, Trash2, Loader2 } from "lucide-react";

interface ManualMetricsInputProps {
  onMetricSaved: () => void;
}

const ManualMetricsInput = ({ onMetricSaved }: ManualMetricsInputProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [metricType, setMetricType] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [changePercentage, setChangePercentage] = useState<string>("");
  const { toast } = useToast();

  const metricOptions = [
    { value: "customers", label: "Customers", icon: Users, color: "bg-indigo-500/20 text-indigo-400" },
    { value: "revenue", label: "Revenue", icon: DollarSign, color: "bg-green-500/20 text-green-400" },
    { value: "profit", label: "Profit", icon: Wallet, color: "bg-amber-500/20 text-amber-400" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!metricType || !value) {
      toast({
        title: "Missing Fields",
        description: "Please select a metric type and enter a value",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Not Authenticated",
          description: "Please log in to save metrics",
          variant: "destructive",
        });
        return;
      }

      // Get metric name based on type
      const metricNames: Record<string, string> = {
        customers: "Total Customers",
        revenue: "Total Revenue",
        profit: "Net Profit",
      };

      // Delete existing metric of same type for current period
      await supabase
        .from("business_metrics")
        .delete()
        .eq("user_id", user.id)
        .eq("metric_type", metricType)
        .eq("period", "current");

      // Insert new metric
      const { error } = await supabase.from("business_metrics").insert({
        user_id: user.id,
        metric_type: metricType,
        metric_name: metricNames[metricType] || metricType,
        value: parseFloat(value),
        change_percentage: changePercentage ? parseFloat(changePercentage) : 0,
        period: "current",
      });

      if (error) throw error;

      toast({
        title: "Metric Saved",
        description: `${metricNames[metricType]} has been updated successfully`,
      });

      // Reset form
      setMetricType("");
      setValue("");
      setChangePercentage("");
      setOpen(false);
      onMetricSaved();
    } catch (error) {
      console.error("Error saving metric:", error);
      toast({
        title: "Error",
        description: "Failed to save metric. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedMetric = metricOptions.find(m => m.value === metricType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Card className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <PenLine className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-foreground">Manual Input</h3>
              <p className="text-xs text-muted-foreground">Enter metrics manually</p>
            </div>
            <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </Card>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-primary" />
            Manual Metrics Entry
          </DialogTitle>
          <DialogDescription>
            Enter your business metrics manually. These will appear in your Growth Dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Metric Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="metric-type">Metric Type</Label>
            <Select value={metricType} onValueChange={setMetricType}>
              <SelectTrigger id="metric-type">
                <SelectValue placeholder="Select a metric" />
              </SelectTrigger>
              <SelectContent>
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Metric Badge */}
          {selectedMetric && (
            <Badge className={`${selectedMetric.color} border-0`}>
              <selectedMetric.icon className="w-3 h-3 mr-1" />
              {selectedMetric.label}
            </Badge>
          )}

          {/* Value Input */}
          <div className="space-y-2">
            <Label htmlFor="value">
              {metricType === "customers" ? "Number of Customers" : "Amount ($)"}
            </Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              placeholder={metricType === "customers" ? "e.g., 1500" : "e.g., 50000"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Change Percentage Input */}
          <div className="space-y-2">
            <Label htmlFor="change" className="flex items-center gap-2">
              Change vs Last Period (%)
              <span className="text-xs text-muted-foreground font-normal">Optional</span>
            </Label>
            <Input
              id="change"
              type="number"
              step="0.1"
              placeholder="e.g., 12.5 or -5.0"
              value={changePercentage}
              onChange={(e) => setChangePercentage(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Use negative values for decline (e.g., -5.0)
            </p>
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
                  <Plus className="w-4 h-4 mr-2" />
                  Save Metric
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ManualMetricsInput;
