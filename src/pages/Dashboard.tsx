import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, TrendingDown, Users, Upload, Brain, MessageSquare } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";

const Dashboard = () => {
  const kpis = [
    { title: "Revenue", value: "$1,250K", change: "+13.6%", trend: "up" },
    { title: "Efficiency", value: "88%", change: "+6.3%", trend: "up" },
    { title: "Growth", value: "+24%", change: "+29.1%", trend: "up" },
    { title: "Conversion", value: "12.8%", change: "-9.2%", trend: "down" }
  ];

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Analytics Dashboard</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-5xl font-extralight mb-3 tracking-wide">Analytics</h1>
          <p className="text-primary text-lg font-light">Real-time business intelligence and insights</p>
        </div>

        {/* Data Import Section */}
        <Card className="glass-card mb-8 hover-lift border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl font-light">Data Import</CardTitle>
            <CardDescription className="text-muted-foreground">Upload your business data for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full h-12 text-base font-light border-primary/30 hover:bg-primary/10 hover:border-primary">
              <Upload className="w-5 h-5 mr-2" />
              Upload Data Files
            </Button>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpis.map((kpi, index) => (
            <Card key={index} className="glass-card hover-lift border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-light text-muted-foreground uppercase tracking-wider">{kpi.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extralight mb-3 text-primary">{kpi.value}</div>
                <div className={`flex items-center text-sm font-light ${kpi.trend === "up" ? "text-primary" : "text-muted-foreground"}`}>
                  {kpi.trend === "up" ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span>{kpi.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="glass-card hover-lift border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-primary/10 rounded bg-black/20 backdrop-blur-sm">
                <BarChart3 className="w-16 h-16 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-primary/10 rounded bg-black/20 backdrop-blur-sm">
                <TrendingUp className="w-16 h-16 text-primary/30" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-2 hover-lift border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Department Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center border border-primary/10 rounded bg-black/20 backdrop-blur-sm">
                <Users className="w-16 h-16 text-primary/30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights and Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card hover-lift border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Insights
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">Automated business intelligence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-6 p-4 bg-black/20 rounded border border-primary/10 min-h-[200px]">
                <p className="text-sm text-muted-foreground font-light">AI-powered insights will analyze your data patterns, identify opportunities, and provide strategic recommendations.</p>
                <div className="space-y-2 mt-4">
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    <p className="text-xs text-muted-foreground">Revenue optimization opportunities</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    <p className="text-xs text-muted-foreground">Performance trend predictions</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1 h-1 bg-primary rounded-full mt-2"></div>
                    <p className="text-xs text-muted-foreground">Risk assessment and mitigation</p>
                  </div>
                </div>
              </div>
              <Button className="w-full h-11 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-light">
                <Brain className="w-4 h-4 mr-2" />
                Generate Insights
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card hover-lift border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-light flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Business Assistant
              </CardTitle>
              <CardDescription className="text-muted-foreground font-light">Ask questions about your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-4 border border-primary/10 rounded-lg p-4 overflow-y-auto bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-primary/50">
                  <MessageSquare className="w-4 h-4" />
                  <p className="text-sm font-light">Start a conversation with your AI assistant...</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask about your business performance..."
                  className="flex-1 px-4 py-3 bg-input border border-primary/20 rounded-lg text-sm font-light focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
                <Button className="h-11 w-11 bg-primary/10 hover:bg-primary/20 border border-primary/30">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;