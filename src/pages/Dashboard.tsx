import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Zap, TrendingUp, Target, Upload, Lightbulb, Sparkles, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import MobileMenu from "@/components/MobileMenu";

const Dashboard = () => {
  const [showInsights, setShowInsights] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const kpis = [
    {
      title: "Revenue",
      value: "$1250K",
      change: "+13.6%",
      icon: DollarSign,
      trendIcon: TrendingUp
    },
    {
      title: "Efficiency",
      value: "88%",
      change: "+6.3%",
      icon: Zap,
      trendIcon: TrendingUp
    },
    {
      title: "Growth",
      value: "+24%",
      change: "+29.1%",
      icon: TrendingUp,
      trendIcon: TrendingUp
    },
    {
      title: "Conversion",
      value: "12.8%",
      change: "-9.2%",
      icon: Target,
      trendIcon: TrendingUp
    }
  ];

  const insights = [
    {
      title: "Revenue Projection",
      description: "Trending toward $1420K next month (+13.6%)"
    },
    {
      title: "Efficiency Update",
      description: "Operations improved 6.3%. Maintain current strategies."
    },
    {
      title: "Attention Needed",
      description: "Conversion down 9.2%. Review campaign performance."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <MobileMenu />
      </div>

      <div className="px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
        </div>

        {/* Data Import */}
        <Card className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Upload className="w-6 h-6" />
              <span className="text-lg font-medium">Data Import</span>
            </div>
            <Button className="glass-button">Upload</Button>
          </div>
        </Card>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {kpis.map((kpi, index) => (
            <Card key={index} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <kpi.icon className="w-6 h-6" />
                <kpi.trendIcon className="w-4 h-4" />
              </div>
              <h3 className="text-sm text-secondary mb-2">{kpi.title}</h3>
              <p className="text-3xl font-bold mb-1">{kpi.value}</p>
              <p className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.change}
              </p>
            </Card>
          ))}
        </div>

        {/* Revenue Trend Chart */}
        <Card className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Revenue Trend</h2>
          <p className="text-sm text-secondary mb-6">6-month performance</p>
          <div className="h-[300px] flex items-center justify-center border border-white/10 rounded-lg">
            <p className="text-secondary text-sm">Area chart placeholder</p>
          </div>
        </Card>

        {/* Performance Metrics Chart */}
        <Card className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Performance Metrics</h2>
          <p className="text-sm text-secondary mb-6">Growth and efficiency</p>
          <div className="h-[300px] flex items-center justify-center border border-white/10 rounded-lg">
            <p className="text-secondary text-sm">Line chart placeholder</p>
          </div>
        </Card>

        {/* Department Performance Chart */}
        <Card className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Department Performance</h2>
          <p className="text-sm text-secondary mb-6">Cross-functional metrics</p>
          <div className="h-[300px] flex items-center justify-center border border-white/10 rounded-lg">
            <p className="text-secondary text-sm">Bar chart placeholder</p>
          </div>
        </Card>

        {/* AI Insights */}
        {!showInsights && !showChat && (
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-6 h-6" />
                <h2 className="text-xl font-semibold">AI Insights</h2>
              </div>
              <Button 
                className="glass-button"
                onClick={() => setShowInsights(true)}
              >
                Generate
              </Button>
            </div>
            <div className="flex flex-col items-center justify-center py-12">
              <Lightbulb className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-secondary text-center">
                No insights yet. Click Generate to analyze your business data.
              </p>
            </div>
          </Card>
        )}

        {/* Insights Generated */}
        {showInsights && !showChat && (
          <div className="space-y-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Insights</h2>
                <Button 
                  variant="ghost"
                  className="glass-button"
                  onClick={() => setShowChat(true)}
                >
                  Ask Questions
                </Button>
              </div>
              <p className="text-sm text-secondary mb-6">Trend analysis and projections</p>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border-l-2 border-primary pl-4 py-2">
                    <h3 className="font-semibold mb-1">{insight.title}</h3>
                    <p className="text-sm text-secondary">{insight.description}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Business Assistant Chat */}
        {showChat && (
          <Card className="glass-card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Business Assistant</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowChat(false);
                  setShowInsights(false);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 min-h-[400px]">
              <div className="glass-button p-4 rounded-lg mb-6">
                <p className="text-sm">
                  Hello! I'm your business intelligence assistant. Ask me about your metrics, forecasts, or strategic insights.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ask about metrics, forecasts, or insights..."
                  className="flex-1 bg-muted/50 border-white/10"
                />
                <Button className="glass-button">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
