import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Bell, 
  BellOff, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp,
  X,
  Users,
  DollarSign,
  Wallet
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface KPITarget {
  id: string;
  metric_type: string;
  target_value: number;
  current_value: number;
  alert_threshold?: number;
  alert_enabled?: boolean;
}

interface Metric {
  metric_type: string;
  metric_name: string;
  value: number;
  change_percentage: number;
}

interface Alert {
  id: string;
  metric_type: string;
  alert_type: 'below_threshold' | 'declining' | 'critical';
  message: string;
  value: number;
  threshold: number;
  timestamp: Date;
  dismissed: boolean;
}

interface KPIAlertsProps {
  metrics: Metric[];
}

const KPIAlerts = ({ metrics }: KPIAlertsProps) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [targets, setTargets] = useState<KPITarget[]>([]);
  const [showDismissed, setShowDismissed] = useState(false);
  const { toast } = useToast();

  const metricOptions = [
    { value: "customers", label: "Customers", icon: Users, color: "text-indigo-400" },
    { value: "revenue", label: "Revenue", icon: DollarSign, color: "text-green-400" },
    { value: "profit", label: "Profit", icon: Wallet, color: "text-amber-400" },
  ];

  // Load targets and check for alerts
  useEffect(() => {
    const savedTargets = localStorage.getItem('kpi_targets');
    if (savedTargets) {
      setTargets(JSON.parse(savedTargets));
    }

    // Load dismissed alerts
    const savedAlerts = localStorage.getItem('kpi_alerts');
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  // Check for alerts when metrics or targets change
  useEffect(() => {
    if (metrics.length === 0 || targets.length === 0) return;

    const newAlerts: Alert[] = [];
    const existingAlertIds = new Set(alerts.map(a => `${a.metric_type}-${a.alert_type}`));

    targets.forEach(target => {
      if (!target.alert_enabled) return;
      
      const metric = metrics.find(m => m.metric_type === target.metric_type);
      if (!metric) return;

      const progress = target.target_value > 0 
        ? (metric.value / target.target_value) * 100 
        : 0;
      const threshold = target.alert_threshold || 50;

      // Check if below threshold
      if (progress < threshold) {
        const alertId = `${target.metric_type}-below_threshold`;
        if (!existingAlertIds.has(alertId)) {
          newAlerts.push({
            id: Date.now().toString() + Math.random(),
            metric_type: target.metric_type,
            alert_type: 'below_threshold',
            message: `${getMetricLabel(target.metric_type)} is below ${threshold}% of target`,
            value: metric.value,
            threshold: target.target_value * (threshold / 100),
            timestamp: new Date(),
            dismissed: false,
          });
        }
      }

      // Check for declining metrics
      if (metric.change_percentage < -5) {
        const alertId = `${target.metric_type}-declining`;
        if (!existingAlertIds.has(alertId)) {
          newAlerts.push({
            id: Date.now().toString() + Math.random(),
            metric_type: target.metric_type,
            alert_type: 'declining',
            message: `${getMetricLabel(target.metric_type)} declined by ${Math.abs(metric.change_percentage).toFixed(1)}%`,
            value: metric.value,
            threshold: 0,
            timestamp: new Date(),
            dismissed: false,
          });
        }
      }

      // Check for critical (below 25%)
      if (progress < 25) {
        const alertId = `${target.metric_type}-critical`;
        if (!existingAlertIds.has(alertId)) {
          newAlerts.push({
            id: Date.now().toString() + Math.random(),
            metric_type: target.metric_type,
            alert_type: 'critical',
            message: `CRITICAL: ${getMetricLabel(target.metric_type)} is critically below target`,
            value: metric.value,
            threshold: target.target_value * 0.25,
            timestamp: new Date(),
            dismissed: false,
          });
        }
      }
    });

    if (newAlerts.length > 0) {
      const updatedAlerts = [...alerts, ...newAlerts];
      setAlerts(updatedAlerts);
      localStorage.setItem('kpi_alerts', JSON.stringify(updatedAlerts));

      // Show toast for new alerts
      newAlerts.forEach(alert => {
        toast({
          title: alert.alert_type === 'critical' ? "Critical Alert" : "KPI Alert",
          description: alert.message,
          variant: alert.alert_type === 'critical' ? "destructive" : "default",
        });
      });
    }
  }, [metrics, targets]);

  const getMetricLabel = (type: string) => {
    return metricOptions.find(m => m.value === type)?.label || type;
  };

  const getMetricIcon = (type: string) => {
    const option = metricOptions.find(m => m.value === type);
    if (!option) return <TrendingDown className="w-4 h-4" />;
    return <option.icon className={`w-4 h-4 ${option.color}`} />;
  };

  const dismissAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(a => 
      a.id === alertId ? { ...a, dismissed: true } : a
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('kpi_alerts', JSON.stringify(updatedAlerts));
  };

  const clearAllAlerts = () => {
    const updatedAlerts = alerts.map(a => ({ ...a, dismissed: true }));
    setAlerts(updatedAlerts);
    localStorage.setItem('kpi_alerts', JSON.stringify(updatedAlerts));
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          icon: 'text-red-400',
          badge: 'bg-red-500/20 text-red-400 border-red-500/30'
        };
      case 'declining':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30',
          icon: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        };
      default:
        return {
          bg: 'bg-orange-500/10 border-orange-500/30',
          icon: 'text-orange-400',
          badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        };
    }
  };

  const activeAlerts = alerts.filter(a => !a.dismissed);
  const dismissedAlerts = alerts.filter(a => a.dismissed);

  if (alerts.length === 0) {
    return (
      <Card className="glass-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">KPI Alerts</h3>
            <p className="text-xs text-muted-foreground">All metrics within acceptable range</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Set KPI targets with alert thresholds in Data Collection to receive notifications.
        </p>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${activeAlerts.length > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
            {activeAlerts.length > 0 ? (
              <Bell className="w-5 h-5 text-red-400 animate-pulse" />
            ) : (
              <BellOff className="w-5 h-5 text-green-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">KPI Alerts</h3>
            <p className="text-xs text-muted-foreground">
              {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {activeAlerts.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={clearAllAlerts}
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {activeAlerts.map((alert) => {
          const style = getAlertStyle(alert.alert_type);
          return (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border ${style.bg} relative`}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 hover:bg-background/50"
                onClick={() => dismissAlert(alert.id)}
              >
                <X className="w-3 h-3" />
              </Button>
              <div className="flex items-start gap-3 pr-6">
                <div className={`mt-0.5 ${style.icon}`}>
                  {alert.alert_type === 'critical' ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : alert.alert_type === 'declining' ? (
                    <TrendingDown className="w-4 h-4" />
                  ) : (
                    getMetricIcon(alert.metric_type)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${style.badge} border text-[10px] px-1.5 py-0`}>
                      {alert.alert_type === 'critical' ? 'Critical' : 
                       alert.alert_type === 'declining' ? 'Declining' : 'Below Threshold'}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(alert.timestamp), 'MMM d, HH:mm')}
                    </span>
                  </div>
                  <p className="text-xs text-foreground">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Show dismissed toggle */}
        {dismissedAlerts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setShowDismissed(!showDismissed)}
          >
            {showDismissed ? 'Hide' : 'Show'} {dismissedAlerts.length} dismissed alert{dismissedAlerts.length !== 1 ? 's' : ''}
          </Button>
        )}

        {showDismissed && dismissedAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-3 rounded-lg border border-border/30 bg-muted/20 opacity-60"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground line-through">{alert.message}</p>
                <span className="text-[10px] text-muted-foreground">
                  Dismissed • {format(new Date(alert.timestamp), 'MMM d, HH:mm')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default KPIAlerts;
