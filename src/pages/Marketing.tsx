import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Megaphone, TrendingUp, DollarSign, Sparkles, Play, Pause, Target, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "draft";
  spend: number;
  sales: number;
  roas: number;
}

const Marketing = () => {
  const { toast } = useToast();
  const [campaigns] = useState<Campaign[]>([
    { id: "1", name: "Summer Sale 2025", status: "active", spend: 250, sales: 1200, roas: 4.8 },
    { id: "2", name: "New Arrivals Push", status: "active", spend: 150, sales: 450, roas: 3.0 },
    { id: "3", name: "Retargeting - Cart Abandoners", status: "paused", spend: 0, sales: 0, roas: 0 },
  ]);
  
  const [adCopyPrompt, setAdCopyPrompt] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCopy = async () => {
    if (!adCopyPrompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedCopy(`🔥 Limited Time Offer!\n\n${adCopyPrompt}\n\nShop now and save big. Free shipping on orders over $50.\n\n→ Link in bio`);
      setIsGenerating(false);
      toast({
        title: "Copy Generated",
        description: "Your ad copy is ready to use.",
      });
    }, 1500);
  };

  const getStatusBadge = (status: Campaign["status"]) => {
    switch (status) {
      case "active": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case "paused": return <Badge variant="outline" className="text-muted-foreground">Paused</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-light text-foreground flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Marketing
          </h1>
          <p className="text-xs text-muted-foreground">AI-powered campaigns & copy</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Spend</span>
              </div>
              <p className="text-xl font-light">$400</p>
              <p className="text-xs text-muted-foreground">This month</p>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <p className="text-xl font-light">$1,650</p>
              <p className="text-xs text-green-400">4.1x ROAS</p>
            </Card>
            <Card className="p-4 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Campaigns</span>
              </div>
              <p className="text-xl font-light">2</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </Card>
          </div>

          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="w-full justify-start bg-card/50">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="copywriter">AI Copywriter</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-3 mt-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="p-4 bg-card/50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-light text-foreground">{campaign.name}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {campaign.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Spend</p>
                      <p className="font-light">${campaign.spend}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Sales</p>
                      <p className="font-light">${campaign.sales}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">ROAS</p>
                      <p className={`font-light ${campaign.roas >= 3 ? "text-green-400" : ""}`}>
                        {campaign.roas > 0 ? `${campaign.roas}x` : "-"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="copywriter" className="space-y-4 mt-4">
              <Card className="p-4 bg-card/50">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-light">Generate Ad Copy</h3>
                </div>
                <Textarea
                  placeholder="Describe your product or promotion... (e.g., 'Summer dress collection, 30% off')"
                  value={adCopyPrompt}
                  onChange={(e) => setAdCopyPrompt(e.target.value)}
                  className="mb-3 min-h-[80px]"
                />
                <Button 
                  onClick={handleGenerateCopy} 
                  disabled={isGenerating || !adCopyPrompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate Copy"}
                </Button>
              </Card>

              {generatedCopy && (
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Generated Copy</span>
                  </div>
                  <p className="text-sm font-light whitespace-pre-wrap">{generatedCopy}</p>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generatedCopy)}>
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setGeneratedCopy("")}>
                      Clear
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-3 mt-4">
              <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
                <h3 className="font-light text-foreground mb-2">💡 Recommendation</h3>
                <p className="text-sm text-muted-foreground">
                  Campaign B has a low ROAS (3.0x). Consider pausing and reallocating budget to Summer Sale which is performing at 4.8x.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline">Pause Campaign B</Button>
                  <Button size="sm" variant="ghost">Dismiss</Button>
                </div>
              </Card>
              <Card className="p-4 bg-card/50">
                <h3 className="font-light text-foreground mb-2">📈 Opportunity</h3>
                <p className="text-sm text-muted-foreground">
                  Your cart abandonment rate is 68%. Enabling the Retargeting campaign could recover ~$340/week in lost sales.
                </p>
                <Button size="sm" variant="outline" className="mt-3">Enable Retargeting</Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Marketing;
