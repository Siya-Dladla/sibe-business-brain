import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SibeLogo from "@/components/SibeLogo";
import {
  Zap,
  Play,
  GitBranch,
  Users,
  FileText,
  Bell,
  TrendingUp,
  Database,
  Clock,
  Mail,
  Plus
} from "lucide-react";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface WorkflowToolbarProps {
  aiEmployees: AIEmployee[];
  onAddNode: (type: 'trigger' | 'ai_employee' | 'action' | 'condition', config?: Record<string, any>) => void;
}

const triggers = [
  { id: 'manual', name: 'Manual', icon: Play, description: 'Run on demand' },
  { id: 'scheduled', name: 'Scheduled', icon: Clock, description: 'Run at set times' },
  { id: 'data_change', name: 'Data Change', icon: Database, description: 'When data updates' },
];

const actions = [
  { id: 'analyze_data', name: 'Analyze Data', icon: TrendingUp, description: 'Process metrics' },
  { id: 'create_task', name: 'Create Task', icon: FileText, description: 'Add new tasks' },
  { id: 'generate_report', name: 'Generate Report', icon: FileText, description: 'Create reports' },
  { id: 'send_alert', name: 'Send Alert', icon: Bell, description: 'Notify users' },
  { id: 'send_email', name: 'Send Email', icon: Mail, description: 'Email notifications' },
  { id: 'sync_data', name: 'Sync Data', icon: Database, description: 'Sync with APIs' },
];

const WorkflowToolbar = ({ aiEmployees, onAddNode }: WorkflowToolbarProps) => {
  return (
    <Card className="w-72 h-full overflow-y-auto glass-card border-r border-border/50">
      <div className="p-4 space-y-6">
        {/* Triggers Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Triggers
          </h3>
          <div className="space-y-2">
            {triggers.map((trigger) => (
              <Button
                key={trigger.id}
                variant="outline"
                className="w-full justify-start h-auto p-3 hover:bg-amber-500/10 hover:border-amber-500/30"
                onClick={() => onAddNode('trigger', { triggerType: trigger.id })}
              >
                <trigger.icon className="w-4 h-4 mr-3 text-amber-500" />
                <div className="text-left">
                  <p className="text-sm font-medium">{trigger.name}</p>
                  <p className="text-xs text-muted-foreground">{trigger.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* AI Employees Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            AI Employees
          </h3>
          {aiEmployees.length > 0 ? (
            <div className="space-y-2">
              {aiEmployees.map((employee) => (
                <Button
                  key={employee.id}
                  variant="outline"
                  className="w-full justify-start h-auto p-3 hover:bg-primary/10 hover:border-primary/30"
                  onClick={() => onAddNode('ai_employee', { employeeId: employee.id })}
                >
                  <SibeLogo size="sm" className="mr-3" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{employee.name}</p>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {employee.department}
                      </Badge>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No AI employees yet. Create one first!
            </p>
          )}
        </div>

        <Separator />

        {/* Actions Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Play className="w-4 h-4 text-green-500" />
            Actions
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto p-2 flex-col hover:bg-green-500/10 hover:border-green-500/30"
                onClick={() => onAddNode('action', { actionType: action.id })}
              >
                <action.icon className="w-5 h-5 mb-1 text-green-500" />
                <span className="text-xs">{action.name}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Conditions Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-purple-500" />
            Logic
          </h3>
          <Button
            variant="outline"
            className="w-full justify-start h-auto p-3 hover:bg-purple-500/10 hover:border-purple-500/30"
            onClick={() => onAddNode('condition', {})}
          >
            <GitBranch className="w-4 h-4 mr-3 text-purple-500" />
            <div className="text-left">
              <p className="text-sm font-medium">Condition</p>
              <p className="text-xs text-muted-foreground">Branch logic</p>
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WorkflowToolbar;
