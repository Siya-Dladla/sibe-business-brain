import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Pencil } from "lucide-react";

interface EditConnectionDialogProps {
  type: 'api' | 'workflow' | 'agent';
  connection: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const SYNC_FREQUENCIES = [
  { value: "realtime", label: "Real-time" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "manual", label: "Manual only" },
];

const EditConnectionDialog = ({ 
  type, 
  connection, 
  open, 
  onOpenChange, 
  onSaved 
}: EditConnectionDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();

  // Form fields
  const [name, setName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [syncFrequency, setSyncFrequency] = useState("hourly");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    if (connection && open) {
      if (type === 'api') {
        setName(connection.name || "");
        setApiEndpoint(connection.api_endpoint || "");
        setSyncFrequency(connection.sync_config?.frequency || "hourly");
        setStatus(connection.status || "connected");
      } else if (type === 'workflow') {
        setName(connection.workflow_name || "");
        setWebhookUrl(connection.webhook_url || "");
        setStatus(connection.status || "active");
      } else if (type === 'agent') {
        setName(connection.agent_name || "");
        setApiEndpoint(connection.api_endpoint || "");
        setStatus(connection.status || "active");
      }
      setApiKey(""); // Don't pre-fill API keys for security
    }
  }, [connection, open, type]);

  const handleSave = async () => {
    setLoading(true);
    try {
      let error: any = null;

      if (type === 'api') {
        const updateData: any = {
          name,
          api_endpoint: apiEndpoint || null,
          sync_config: { frequency: syncFrequency },
          status,
        };
        if (apiKey) {
          updateData.credentials_encrypted = apiKey;
        }
        const result = await supabase
          .from('api_connections')
          .update(updateData)
          .eq('id', connection.id);
        error = result.error;
      } else if (type === 'workflow') {
        const updateData: any = {
          workflow_name: name,
          webhook_url: webhookUrl || null,
          status,
        };
        if (apiKey) {
          updateData.api_key_encrypted = apiKey;
        }
        const result = await supabase
          .from('connected_workflows')
          .update(updateData)
          .eq('id', connection.id);
        error = result.error;
      } else if (type === 'agent') {
        const updateData: any = {
          agent_name: name,
          api_endpoint: apiEndpoint || null,
          status,
        };
        if (apiKey) {
          updateData.api_key_encrypted = apiKey;
        }
        const result = await supabase
          .from('connected_agents')
          .update(updateData)
          .eq('id', connection.id);
        error = result.error;
      }

      if (error) throw error;

      toast({
        title: "Updated",
        description: "Connection updated successfully",
      });
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'api': return 'Edit Data Feed';
      case 'workflow': return 'Edit Workflow';
      case 'agent': return 'Edit AI Agent';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-primary" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            Update the connection settings below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Connection name"
            />
          </div>

          {(type === 'api' || type === 'agent') && (
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input
                type="url"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.example.com/..."
              />
            </div>
          )}

          {type === 'workflow' && (
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://n8n.example.com/webhook/..."
              />
            </div>
          )}

          {type === 'api' && (
            <div className="space-y-2">
              <Label>Sync Frequency</Label>
              <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SYNC_FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>API Key (leave empty to keep current)</Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter new API key to update"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connected">Connected</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              className="flex-1" 
              disabled={loading || !name}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditConnectionDialog;
