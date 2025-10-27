import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, TrendingUp, DollarSign, Users, Brain, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const kpis = [
    {
      title: "Revenue Growth",
      value: "+24.5%",
      icon: TrendingUp,
      color: "text-green-400",
      trend: "up"
    },
    {
      title: "Profit Margin",
      value: "38.2%",
      icon: DollarSign,
      color: "text-primary",
      trend: "up"
    },
    {
      title: "Team Efficiency",
      value: "94.8%",
      icon: Users,
      color: "text-purple-400",
      trend: "up"
    },
    {
      title: "AI Insights",
      value: "127",
      icon: Brain,
      color: "text-secondary",
      trend: "neutral"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold glow-text">SIBE SI</Link>
            <div className="flex gap-6">
              <Link to="/dashboard" className="text-foreground hover:text-primary transition">Dashboard</Link>
              <Link to="/employees" className="text-secondary hover:text-primary transition">AI Employees</Link>
              <Link to="/meeting" className="text-secondary hover:text-primary transition">Meetings</Link>
              <Link to="/reports" className="text-secondary hover:text-primary transition">Reports</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">Business Intelligence Dashboard</h1>
          <p className="text-secondary text-xl">Real-time insights powered by synthetic intelligence</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi, index) => (
            <Card key={index} className="glass-card p-6 hover:glow-border transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
              <h3 className="text-sm text-secondary mb-2">{kpi.title}</h3>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Area */}
          <Card className="glass-card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Performance Analytics</h2>
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div className="h-[400px] flex items-center justify-center border border-white/10 rounded-lg">
              <div className="text-center">
                <Brain className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-glow" />
                <p className="text-secondary">Chart visualization will render here</p>
                <p className="text-sm text-muted-foreground mt-2">Chart.js integration ready</p>
              </div>
            </div>
          </Card>

          {/* AI Chat */}
          <Card className="glass-card p-6">
            <h2 className="text-2xl font-semibold mb-6">Ask SIBE</h2>
            <div className="space-y-4 mb-6 h-[300px] overflow-y-auto">
              <div className="glass-button p-4 rounded-lg">
                <p className="text-sm text-secondary mb-1">You</p>
                <p>What's our growth forecast?</p>
              </div>
              <div className="glass-button p-4 rounded-lg border-primary/20">
                <p className="text-sm text-primary mb-1">SIBE AI</p>
                <p>Based on current trends, Q1 shows 24.5% growth. Your marketing ROI is performing exceptionally well.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Ask anything..." 
                className="flex-1 bg-muted/50 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition"
              />
              <Button className="glass-button">Send</Button>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/meeting">
            <Card className="glass-card p-6 hover:glow-border transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Start AI Meeting</h3>
              <p className="text-secondary text-sm">Conference with your AI team</p>
            </Card>
          </Link>
          <Link to="/employees">
            <Card className="glass-card p-6 hover:glow-border transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">Manage AI Employees</h3>
              <p className="text-secondary text-sm">Create and configure your AI workforce</p>
            </Card>
          </Link>
          <Link to="/reports">
            <Card className="glass-card p-6 hover:glow-border transition-all duration-300 cursor-pointer">
              <h3 className="text-xl font-semibold mb-2">View Reports</h3>
              <p className="text-secondary text-sm">Access AI-generated insights</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
