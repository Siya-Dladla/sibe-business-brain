import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SibeLogo from "@/components/SibeLogo";
import { 
  Play, 
  Pause, 
  Settings, 
  Trash2,
  Database,
  FileText,
  Bell,
  TrendingUp,
  Users,
  Mail,
  Zap,
  Clock
} from "lucide-react";

export interface WorkflowNodeData {
  id: string;
  type: 'trigger' | 'ai_employee' | 'action' | 'condition';
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number };
  connections: string[]; // IDs of nodes this connects to
}

interface WorkflowNodeProps {
  node: WorkflowNodeData;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onConfigure: () => void;
  aiEmployee?: {
    id: string;
    name: string;
    role: string;
    department: string;
  };
}

const nodeTypeConfig = {
  trigger: {
    icon: Zap,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
  },
  ai_employee: {
    icon: Users,
    color: "from-primary to-primary/80",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  action: {
    icon: Play,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  condition: {
    icon: Settings,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
};

const actionIcons: Record<string, typeof Database> = {
  analyze_data: TrendingUp,
  create_task: FileText,
  generate_report: FileText,
  send_alert: Bell,
  sync_data: Database,
  send_email: Mail,
  schedule: Clock,
};

const WorkflowNode = ({ 
  node, 
  isSelected, 
  onSelect, 
  onDelete, 
  onConfigure,
  aiEmployee 
}: WorkflowNodeProps) => {
  const config = nodeTypeConfig[node.type];
  const ActionIcon = node.config.actionType ? actionIcons[node.config.actionType] || config.icon : config.icon;

  return (
    <Card
      className={cn(
        "absolute cursor-pointer transition-all duration-200 w-48",
        config.bgColor,
        config.borderColor,
        isSelected && "ring-2 ring-primary shadow-lg scale-105",
        "hover:shadow-md"
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onClick={onSelect}
    >
      <div className="p-4 space-y-3">
        {/* Node Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {node.type === 'ai_employee' && aiEmployee ? (
              <SibeLogo size="sm" />
            ) : (
              <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", config.color)}>
                <ActionIcon className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {node.type === 'ai_employee' && aiEmployee ? aiEmployee.name : node.name}
              </p>
            </div>
          </div>
        </div>

        {/* Node Details */}
        <div className="space-y-2">
          {node.type === 'ai_employee' && aiEmployee && (
            <Badge variant="outline" className="text-xs">
              {aiEmployee.department}
            </Badge>
          )}
          
          {node.type === 'trigger' && (
            <Badge variant="secondary" className="text-xs">
              {node.config.triggerType || 'Manual'}
            </Badge>
          )}
          
          {node.type === 'action' && node.config.actionType && (
            <Badge variant="secondary" className="text-xs">
              {node.config.actionType.replace('_', ' ')}
            </Badge>
          )}
        </div>

        {/* Node Actions (visible when selected) */}
        {isSelected && (
          <div className="flex items-center gap-1 pt-2 border-t border-border/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs"
              onClick={(e) => { e.stopPropagation(); onConfigure(); }}
            >
              <Settings className="w-3 h-3 mr-1" />
              Configure
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Connection Points */}
      <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background" />
      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted border-2 border-background" />
    </Card>
  );
};

export default WorkflowNode;
