import { useState, useEffect } from "react";
import { Bot, Link2, Zap, Users, Activity, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface StatusData {
  apiCount: number;
  workflowCount: number;
  employeeCount: number;
  activeAPIs: number;
  lastActivity: string | null;
}

const ClawdBotStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<StatusData>({
    apiCount: 0,
    workflowCount: 0,
    employeeCount: 0,
    activeAPIs: 0,
    lastActivity: null,
  });
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState(false);

  const fetchStatus = async () => {
    if (!user) return;
    setPulse(true);

    try {
      const [connectionsRes, workflowsRes, employeesRes] = await Promise.all([
        supabase.from("api_connections").select("id, status, last_sync_at").eq("user_id", user.id),
        supabase.from("ai_workflows").select("id, status, last_run_at").eq("user_id", user.id),
        supabase.from("ai_employees").select("id").eq("user_id", user.id),
      ]);

      const connections = connectionsRes.data || [];
      const workflows = workflowsRes.data || [];
      const employees = employeesRes.data || [];

      const activeAPIs = connections.filter((c) => c.status === "connected").length;

      // Find latest activity across all sources
      const timestamps = [
        ...connections.map((c) => c.last_sync_at).filter(Boolean),
        ...workflows.map((w) => w.last_run_at).filter(Boolean),
      ].sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime());

      setStatus({
        apiCount: connections.length,
        workflowCount: workflows.length,
        employeeCount: employees.length,
        activeAPIs,
        lastActivity: timestamps[0] || null,
      });
    } catch (error) {
      console.error("Error fetching ClawdBot status:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setPulse(false), 600);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [user]);

  const formatLastActivity = (timestamp: string | null) => {
    if (!timestamp) return "No activity yet";
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const isOnline = status.apiCount > 0 || status.workflowCount > 0;

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      <div className="relative p-4 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-transparent backdrop-blur-sm overflow-hidden">
        {/* Subtle animated glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className={`p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20 ${pulse ? "animate-pulse" : ""}`}>
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">ClawdBot</span>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/40"}`} />
                <span className="text-[10px] text-muted-foreground">
                  {isOnline ? "Online" : "Standby"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={fetchStatus}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors active:scale-95 touch-manipulation"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${pulse ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 relative z-10">
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-card/50 border border-border/30">
              <Link2 className="w-3.5 h-3.5 text-orange-400 mb-1" />
              <span className="text-lg font-semibold text-foreground">{status.apiCount}</span>
              <span className="text-[10px] text-muted-foreground">APIs</span>
              {status.activeAPIs > 0 && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 mt-1 border-emerald-500/30 text-emerald-400">
                  {status.activeAPIs} active
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-card/50 border border-border/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 mb-1" />
              <span className="text-lg font-semibold text-foreground">{status.workflowCount}</span>
              <span className="text-[10px] text-muted-foreground">Workflows</span>
            </div>
            <div className="flex flex-col items-center p-2.5 rounded-xl bg-card/50 border border-border/30">
              <Users className="w-3.5 h-3.5 text-primary mb-1" />
              <span className="text-lg font-semibold text-foreground">{status.employeeCount}</span>
              <span className="text-[10px] text-muted-foreground">AI Team</span>
            </div>
          </div>
        )}

        {/* Last Activity */}
        <div className="flex items-center justify-center gap-1.5 mt-3 relative z-10">
          <Activity className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Last activity: {formatLastActivity(status.lastActivity)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ClawdBotStatus;
