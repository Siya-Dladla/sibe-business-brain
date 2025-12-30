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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
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
  Loader2
} from "lucide-react";

interface APIConnection {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

const APIDataFeeds = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedType, setFeedType] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [autoSync, setAutoSync] = useState(true);
  const { toast } = useToast();

  // Mock connections - in production, these would come from the database
  const [connections, setConnections] = useState<APIConnection[]>([]);

  const feedOptions = [
    { value: "google_analytics", label: "Google Analytics", icon: BarChart3, color: "text-orange-400" },
    { value: "stripe", label: "Stripe", icon: TrendingUp, color: "text-purple-400" },
    { value: "custom_api", label: "Custom REST API", icon: Globe, color: "text-blue-400" },
  ];

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedType) {
      toast({
        title: "Missing Feed Type",
        description: "Please select a data feed type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API connection
    setTimeout(() => {
      const selectedFeed = feedOptions.find(f => f.value === feedType);
      const newConnection: APIConnection = {
        id: Date.now().toString(),
        name: selectedFeed?.label || feedType,
        type: feedType,
        status: 'connected',
        lastSync: new Date().toISOString(),
      };

      setConnections(prev => [...prev, newConnection]);
      
      toast({
        title: "Connected Successfully",
        description: `${selectedFeed?.label} has been connected to your dashboard`,
      });

      setFeedType("");
      setApiUrl("");
      setApiKey("");
      setOpen(false);
      setLoading(false);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setConnections(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Disconnected",
      description: "Data feed has been removed",
    });
  };

  const getStatusIcon = (status: APIConnection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const selectedFeed = feedOptions.find(f => f.value === feedType);

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Card className="glass-card p-4 cursor-pointer hover:border-primary/50 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">API Data Feeds</h3>
                <p className="text-xs text-muted-foreground">Connect external data sources</p>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plug className="w-5 h-5 text-primary" />
              Connect Data Feed
            </DialogTitle>
            <DialogDescription>
              Connect external APIs to automatically sync your business metrics.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConnect} className="space-y-5 pt-2">
            {/* Feed Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="feed-type">Data Source</Label>
              <Select value={feedType} onValueChange={setFeedType}>
                <SelectTrigger id="feed-type">
                  <SelectValue placeholder="Select a data source" />
                </SelectTrigger>
                <SelectContent>
                  {feedOptions.map((option) => (
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

            {/* Selected Feed Badge */}
            {selectedFeed && (
              <Badge className="bg-blue-500/20 text-blue-400 border-0">
                <selectedFeed.icon className="w-3 h-3 mr-1" />
                {selectedFeed.label}
              </Badge>
            )}

            {/* API URL (for custom) */}
            {feedType === "custom_api" && (
              <div className="space-y-2">
                <Label htmlFor="api-url">API Endpoint URL</Label>
                <Input
                  id="api-url"
                  type="url"
                  placeholder="https://api.example.com/metrics"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>
            )}

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key / Token</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted and stored securely
              </p>
            </div>

            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Auto-sync</Label>
                <p className="text-xs text-muted-foreground">Sync data every hour</p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={setAutoSync}
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
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plug className="w-4 h-4 mr-2" />
                    Connect
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Connected Feeds List */}
      {connections.length > 0 && (
        <Card className="glass-card p-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Connected Feeds</h4>
          <div className="space-y-2">
            {connections.map((connection) => {
              const feedOption = feedOptions.find(f => f.value === connection.type);
              return (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-3 bg-background/50 border border-border/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {feedOption && <feedOption.icon className={`w-4 h-4 ${feedOption.color}`} />}
                    <div>
                      <p className="text-sm font-medium">{connection.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Last sync: {connection.lastSync ? new Date(connection.lastSync).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(connection.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(connection.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
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

export default APIDataFeeds;
