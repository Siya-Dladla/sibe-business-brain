import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Save, 
  Pause, 
  MoreVertical,
  ChevronLeft,
  Activity,
  Download,
  Copy,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { WorkflowNodeData } from "./WorkflowNode";
import { convertToN8nWorkflow, exportToClipboard, downloadAsFile } from "@/lib/n8n-export";

interface WorkflowHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
  status: 'draft' | 'active' | 'paused';
  onStatusChange: (status: 'draft' | 'active' | 'paused') => void;
  onSave: () => void;
  onRun: () => void;
  onBack: () => void;
  isSaving: boolean;
  isRunning: boolean;
  runCount: number;
  nodes: WorkflowNodeData[];
  aiEmployees: Array<{ id: string; name: string; role: string; department: string }>;
}

const WorkflowHeader = ({
  name,
  onNameChange,
  status,
  onStatusChange,
  onSave,
  onRun,
  onBack,
  isSaving,
  isRunning,
  runCount,
  nodes,
  aiEmployees,
}: WorkflowHeaderProps) => {
  const { toast } = useToast();
  
  const statusColors = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-green-500/20 text-green-500",
    paused: "bg-amber-500/20 text-amber-500",
  };

  const handleExportToClipboard = async () => {
    try {
      const n8nWorkflow = convertToN8nWorkflow({
        workflowName: name,
        nodes,
        aiEmployees,
      });
      await exportToClipboard(n8nWorkflow);
      toast({
        title: "Copied to Clipboard",
        description: "n8n workflow JSON copied. Paste it in n8n's workflow editor.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownloadN8n = () => {
    try {
      const n8nWorkflow = convertToN8nWorkflow({
        workflowName: name,
        nodes,
        aiEmployees,
      });
      downloadAsFile(n8nWorkflow);
      toast({
        title: "Downloaded",
        description: "n8n workflow file downloaded. Import it in n8n.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not download file",
        variant: "destructive",
      });
    }
  };

  const handleOpenN8n = () => {
    window.open("https://n8n.io/", "_blank");
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        
        <Input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="text-lg font-light w-64 bg-transparent border-0 focus-visible:ring-1"
          placeholder="Workflow name..."
        />

        <Badge className={statusColors[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>

        {runCount > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>{runCount} runs</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onSave}
          disabled={isSaving}
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>

        {status === 'active' ? (
          <Button
            variant="outline"
            onClick={() => onStatusChange('paused')}
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        ) : (
          <Button
            onClick={() => onStatusChange('active')}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Activate
          </Button>
        )}

        <Button
          variant="default"
          onClick={onRun}
          disabled={isRunning}
        >
          <Play className="w-4 h-4 mr-2" />
          {isRunning ? "Running..." : "Run Now"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export to n8n
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportToClipboard} disabled={nodes.length === 0}>
              <Copy className="w-4 h-4 mr-2" />
              Copy to Clipboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadN8n} disabled={nodes.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Download JSON File
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleOpenN8n}>
              <ExternalLink className="w-4 h-4 mr-2" />
              Open n8n
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onStatusChange('draft')}>
              Reset to Draft
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Delete Workflow
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default WorkflowHeader;
