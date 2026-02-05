import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Database, 
  Plus, 
  Plug, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Globe,
  BarChart3,
  TrendingUp,
  Loader2,
  Settings,
  Key,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Workflow,
  Bot,
  ShoppingCart,
  Activity,
  Pencil
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import EditConnectionDialog from "@/components/EditConnectionDialog";

interface APIConnection {
  id: string;
  name: string;
  provider: string;
  status: string;
  last_sync_at: string | null;
  api_endpoint: string | null;
  sync_frequency?: string;
  store_name?: string;
}

interface ConnectedWorkflow {
  id: string;
  platform: string;
  workflow_name: string;
  status: string;
  last_triggered_at: string | null;
  trigger_count: number;
}

interface ConnectedAgent {
  id: string;
  platform: string;
  agent_name: string;
  status: string;
  last_called_at: string | null;
  call_count: number;
  token_usage: number;
}

const FEED_OPTIONS = [
  { value: "shopify", label: "Shopify Store", icon: ShoppingCart, color: "text-green-400" },
  { value: "meta", label: "Meta (Facebook/Instagram)", icon: Globe, color: "text-blue-500" },
  { value: "google_analytics", label: "Google Analytics", icon: BarChart3, color: "text-orange-400" },
  { value: "stripe", label: "Stripe", icon: TrendingUp, color: "text-purple-400" },
  { value: "custom_api", label: "Custom REST API", icon: Globe, color: "text-blue-400" },
];

const WORKFLOW_PLATFORMS = [
  { value: "n8n", label: "n8n", color: "text-orange-400" },
  { value: "make", label: "Make (Integromat)", color: "text-purple-400" },
  { value: "zapier", label: "Zapier", color: "text-amber-400" },
];

const AGENT_PLATFORMS = [
  { value: "openai", label: "OpenAI Assistants", color: "text-green-400" },
  { value: "anthropic", label: "Claude (Anthropic)", color: "text-orange-400" },
  { value: "langchain", label: "LangChain Agent", color: "text-teal-400" },
  { value: "custom", label: "Custom Agent", color: "text-blue-400" },
];

const ConnectionDashboard = () => {
  const [connections, setConnections] = useState<APIConnection[]>([]);
  const [workflows, setWorkflows] = useState<ConnectedWorkflow[]>([]);
  const [agents, setAgents] = useState<ConnectedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addType, setAddType] = useState<'api' | 'workflow' | 'agent'>('api');
  
  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editType, setEditType] = useState<'api' | 'workflow' | 'agent'>('api');
  const [editConnection, setEditConnection] = useState<any>(null);
  
  // Form states
  const [feedType, setFeedType] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [syncFrequency, setSyncFrequency] = useState("hourly");
  
  // Workflow/Agent form states
  const [workflowPlatform, setWorkflowPlatform] = useState("");
  const [workflowName, setWorkflowName] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [agentPlatform, setAgentPlatform] = useState("");
  const [agentName, setAgentName] = useState("");
  const [agentEndpoint, setAgentEndpoint] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAllConnections();
    }
  }, [user]);

  const loadAllConnections = async () => {
    setLoading(true);
    try {
      const [connectionsRes, workflowsRes, agentsRes] = await Promise.all([
        supabase
          .from('api_connections')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('connected_workflows')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('connected_agents')
          .select('*')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false }),
      ]);

      if (connectionsRes.data) setConnections(connectionsRes.data);
      if (workflowsRes.data) setWorkflows(workflowsRes.data);
      if (agentsRes.data) setAgents(agentsRes.data);
    } catch (error) {
      console.error('Error loading connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addType === 'api') {
      if (!feedType) {
        toast({ title: "Missing Feed Type", description: "Please select a data feed type", variant: "destructive" });
        return;
      }

      setLoading(true);
      
      const selectedFeed = FEED_OPTIONS.find(f => f.value === feedType);
      const { error } = await supabase.from('api_connections').insert({
        user_id: user!.id,
        name: connectionName || selectedFeed?.label || feedType,
        provider: feedType,
        api_endpoint: apiEndpoint || null,
        credentials_encrypted: apiKey || null,
        status: 'connected',
        sync_config: { frequency: syncFrequency },
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Connected!", description: `${selectedFeed?.label} has been connected.` });
        resetForm();
        loadAllConnections();
      }
      setLoading(false);
    } else if (addType === 'workflow') {
      if (!workflowPlatform || !workflowName) {
        toast({ title: "Missing Info", description: "Please provide platform and workflow name", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from('connected_workflows').insert({
        user_id: user!.id,
        platform: workflowPlatform,
        workflow_name: workflowName,
        webhook_url: webhookUrl || null,
        api_key_encrypted: apiKey || null,
        status: 'active',
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Workflow Connected!", description: `${workflowName} from ${workflowPlatform} connected.` });
        resetForm();
        loadAllConnections();
      }
    } else if (addType === 'agent') {
      if (!agentPlatform || !agentName) {
        toast({ title: "Missing Info", description: "Please provide platform and agent name", variant: "destructive" });
        return;
      }

      const { error } = await supabase.from('connected_agents').insert({
        user_id: user!.id,
        platform: agentPlatform,
        agent_name: agentName,
        api_endpoint: agentEndpoint || null,
        api_key_encrypted: apiKey || null,
        status: 'active',
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Agent Connected!", description: `${agentName} from ${agentPlatform} connected.` });
        resetForm();
        loadAllConnections();
      }
    }
  };

  const resetForm = () => {
    setFeedType("");
    setApiKey("");
    setApiEndpoint("");
    setConnectionName("");
    setWorkflowPlatform("");
    setWorkflowName("");
    setWebhookUrl("");
    setAgentPlatform("");
    setAgentName("");
    setAgentEndpoint("");
    setAddDialogOpen(false);
  };

  const handleSync = async (connectionId: string) => {
    setSyncing(connectionId);
    try {
      const { data, error } = await supabase.functions.invoke('sync-api-data', {
        body: { connectionId },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: data.message || "Data synced successfully",
      });
      loadAllConnections();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncAll = async () => {
    if (!user) return;
    setSyncing('all');
    try {
      const { data, error } = await supabase.functions.invoke('sync-api-data', {
        body: { userId: user.id, syncAll: true },
      });

      if (error) throw error;

      toast({
        title: "All Connections Synced",
        description: data.message || `${data.total_metrics_synced} metrics synced`,
      });
      loadAllConnections();
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(null);
    }
  };

  const handleDelete = async (type: 'api' | 'workflow' | 'agent', id: string) => {
    const table = type === 'api' ? 'api_connections' : type === 'workflow' ? 'connected_workflows' : 'connected_agents';
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Connection removed successfully" });
      loadAllConnections();
    }
  };

  const handleEdit = (type: 'api' | 'workflow' | 'agent', connection: any) => {
    setEditType(type);
    setEditConnection(connection);
    setEditDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const totalConnections = connections.length + workflows.length + agents.length;
  const activeConnections = connections.filter(c => c.status === 'connected').length + 
    workflows.filter(w => w.status === 'active').length + 
    agents.filter(a => a.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Plug className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-light">{totalConnections}</p>
              <p className="text-xs text-muted-foreground">Total Connections</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-light">{activeConnections}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Workflow className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-light">{workflows.length}</p>
              <p className="text-xs text-muted-foreground">Workflows</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Bot className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-light">{agents.length}</p>
              <p className="text-xs text-muted-foreground">AI Agents</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3">
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plug className="w-5 h-5 text-primary" />
                Add New Connection
              </DialogTitle>
              <DialogDescription>
                Connect APIs, workflows, or AI agents to your dashboard.
                <span className="block mt-2 text-amber-500 text-xs">
                  ⚡ Note: Extra token charges may occur on third-party platforms.
                </span>
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="api" onValueChange={(v) => setAddType(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="api" className="gap-2">
                  <Database className="w-4 h-4" />
                  Data Feed
                </TabsTrigger>
                <TabsTrigger value="workflow" className="gap-2">
                  <Workflow className="w-4 h-4" />
                  Workflow
                </TabsTrigger>
                <TabsTrigger value="agent" className="gap-2">
                  <Bot className="w-4 h-4" />
                  AI Agent
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleAddConnection} className="space-y-4 pt-4">
                <TabsContent value="api" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Source</Label>
                    <Select value={feedType} onValueChange={setFeedType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEED_OPTIONS.map((option) => (
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

                  <div className="space-y-2">
                    <Label>Connection Name (optional)</Label>
                    <Input
                      placeholder="My Shopify Store"
                      value={connectionName}
                      onChange={(e) => setConnectionName(e.target.value)}
                    />
                  </div>

                  {feedType === "custom_api" && (
                    <div className="space-y-2">
                      <Label>API Endpoint URL</Label>
                      <Input
                        type="url"
                        placeholder="https://api.example.com/metrics"
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      API Key / Token
                    </Label>
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        placeholder="Enter your API key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
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
                    <Label>Sync Frequency</Label>
                    <Select value={syncFrequency} onValueChange={setSyncFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="manual">Manual only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="workflow" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={workflowPlatform} onValueChange={setWorkflowPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORKFLOW_PLATFORMS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <span className={p.color}>{p.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Workflow Name</Label>
                    <Input
                      placeholder="My Automation Workflow"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook URL (for triggering)</Label>
                    <Input
                      type="url"
                      placeholder="https://n8n.example.com/webhook/..."
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Key (optional)</Label>
                    <Input
                      type="password"
                      placeholder="API key for authentication"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="agent" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={agentPlatform} onValueChange={setAgentPlatform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {AGENT_PLATFORMS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            <span className={p.color}>{p.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Agent Name</Label>
                    <Input
                      placeholder="My AI Assistant"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Agent API Endpoint</Label>
                    <Input
                      type="url"
                      placeholder="https://api.openai.com/v1/assistants/..."
                      value={agentEndpoint}
                      onChange={(e) => setAgentEndpoint(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="Your API key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Connect"}
                  </Button>
                </div>
              </form>
            </Tabs>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleSyncAll} disabled={syncing === 'all' || connections.length === 0}>
          {syncing === 'all' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync All
        </Button>
      </div>

      {/* Connections Lists */}
      <Tabs defaultValue="apis" className="w-full">
        <TabsList>
          <TabsTrigger value="apis" className="gap-2">
            <Database className="w-4 h-4" />
            Data Feeds ({connections.length})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="gap-2">
            <Workflow className="w-4 h-4" />
            Workflows ({workflows.length})
          </TabsTrigger>
          <TabsTrigger value="agents" className="gap-2">
            <Bot className="w-4 h-4" />
            AI Agents ({agents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apis">
          {loading ? (
            <Card className="glass-card p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </Card>
          ) : connections.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No data feeds connected yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Add Shopify, Meta, or other APIs to sync your business data</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {connections.map((conn) => {
                const feedOption = FEED_OPTIONS.find(f => f.value === conn.provider);
                return (
                  <Card key={conn.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {feedOption && <feedOption.icon className={`w-5 h-5 ${feedOption.color}`} />}
                        <div>
                          <p className="font-medium">{conn.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {conn.last_sync_at ? `Last sync: ${new Date(conn.last_sync_at).toLocaleString()}` : 'Never synced'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(conn.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSync(conn.id)}
                          disabled={syncing === conn.id}
                        >
                          {syncing === conn.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit('api', conn)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('api', conn.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="workflows">
          {workflows.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <Workflow className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No workflows connected</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Connect n8n, Make, or Zapier workflows</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {workflows.map((wf) => {
                const platform = WORKFLOW_PLATFORMS.find(p => p.value === wf.platform);
                return (
                  <Card key={wf.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Workflow className={`w-5 h-5 ${platform?.color || 'text-primary'}`} />
                        <div>
                          <p className="font-medium">{wf.workflow_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {wf.platform} • Triggered {wf.trigger_count} times
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(wf.status)}
                        <Badge variant="outline" className="text-xs">
                          {wf.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit('workflow', wf)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('workflow', wf.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="agents">
          {agents.length === 0 ? (
            <Card className="glass-card p-8 text-center">
              <Bot className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No AI agents connected</p>
              <p className="text-sm text-muted-foreground/70 mt-1">Connect OpenAI, Anthropic, or custom AI agents</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {agents.map((agent) => {
                const platform = AGENT_PLATFORMS.find(p => p.value === agent.platform);
                return (
                  <Card key={agent.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bot className={`w-5 h-5 ${platform?.color || 'text-primary'}`} />
                        <div>
                          <p className="font-medium">{agent.agent_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {agent.platform} • {agent.call_count} calls • {agent.token_usage} tokens used
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(agent.status)}
                        <Badge variant="outline" className="text-xs">
                          {agent.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit('agent', agent)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete('agent', agent.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Connection Dialog */}
      <EditConnectionDialog
        type={editType}
        connection={editConnection}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSaved={loadAllConnections}
      />
    </div>
  );
};

export default ConnectionDashboard;
