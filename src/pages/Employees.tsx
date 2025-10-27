import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Plus, MessageSquare, Brain, TrendingUp, DollarSign, Users, BarChart3, Shield, Cog } from "lucide-react";
import { useState } from "react";

const Employees = () => {
  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "SIBE CFO",
      role: "Chief Financial Officer",
      department: "Finance",
      icon: DollarSign,
      status: "active",
      description: "Analyzes financial health, cash flow, and investment opportunities"
    },
    {
      id: 2,
      name: "SIBE Engineer",
      role: "Business Engineer",
      department: "Operations",
      icon: Cog,
      status: "active",
      description: "Optimizes processes, identifies bottlenecks, and improves efficiency"
    },
    {
      id: 3,
      name: "SIBE Analyst",
      role: "Data Analyst",
      department: "Analytics",
      icon: BarChart3,
      status: "active",
      description: "Provides deep insights from data patterns and trends"
    },
    {
      id: 4,
      name: "SIBE CMO",
      role: "Marketing Officer",
      department: "Marketing",
      icon: TrendingUp,
      status: "active",
      description: "Develops growth strategies and marketing campaigns"
    }
  ]);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="glass-card border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold glow-text">SIBE SI</Link>
            <div className="flex gap-6">
              <Link to="/dashboard" className="text-secondary hover:text-primary transition">Dashboard</Link>
              <Link to="/employees" className="text-foreground hover:text-primary transition">AI Employees</Link>
              <Link to="/meeting" className="text-secondary hover:text-primary transition">Meetings</Link>
              <Link to="/reports" className="text-secondary hover:text-primary transition">Reports</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4 glow-text">AI Workforce</h1>
            <p className="text-secondary text-xl">Manage your synthetic intelligence team</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="glass-button gap-2">
                <Plus className="w-5 h-5" />
                Create AI Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/20">
              <DialogHeader>
                <DialogTitle className="text-2xl mb-4">Create New AI Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Employee Name</Label>
                  <Input id="name" placeholder="e.g., SIBE HR Partner" className="bg-muted/50 border-white/10" />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger className="bg-muted/50 border-white/10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                      <SelectItem value="cfo">Chief Financial Officer</SelectItem>
                      <SelectItem value="engineer">Business Engineer</SelectItem>
                      <SelectItem value="analyst">Data Analyst</SelectItem>
                      <SelectItem value="cmo">Marketing Officer</SelectItem>
                      <SelectItem value="hr">HR Partner</SelectItem>
                      <SelectItem value="legal">Legal Advisor</SelectItem>
                      <SelectItem value="security">Security Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" placeholder="e.g., Human Resources" className="bg-muted/50 border-white/10" />
                </div>
                <div>
                  <Label htmlFor="tone">Communication Tone</Label>
                  <Select>
                    <SelectTrigger className="bg-muted/50 border-white/10">
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="analytical">Analytical</SelectItem>
                      <SelectItem value="strategic">Strategic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full glass-button">Create Employee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Employee Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => (
            <Card key={employee.id} className="glass-card p-6 hover:glow-border transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-glow">
                  <employee.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="glass-button h-8 w-8 p-0">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  <div className="h-8 px-3 rounded-lg bg-green-500/20 flex items-center">
                    <span className="text-xs text-green-400 uppercase font-semibold">{employee.status}</span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">{employee.name}</h3>
              <p className="text-primary text-sm mb-1">{employee.role}</p>
              <p className="text-secondary text-sm mb-4">{employee.department}</p>
              <p className="text-sm text-muted-foreground mb-6">{employee.description}</p>
              <Button className="w-full glass-button gap-2">
                <MessageSquare className="w-4 h-4" />
                Start Conversation
              </Button>
            </Card>
          ))}

          {/* Add New Card */}
          <Dialog>
            <DialogTrigger asChild>
              <Card className="glass-card p-6 hover:glow-border transition-all duration-300 cursor-pointer flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create New Employee</h3>
                <p className="text-secondary text-sm text-center">Expand your AI workforce</p>
              </Card>
            </DialogTrigger>
            <DialogContent className="glass-card border-white/20">
              <DialogHeader>
                <DialogTitle className="text-2xl mb-4">Create New AI Employee</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name2">Employee Name</Label>
                  <Input id="name2" placeholder="e.g., SIBE HR Partner" className="bg-muted/50 border-white/10" />
                </div>
                <div>
                  <Label htmlFor="role2">Role</Label>
                  <Select>
                    <SelectTrigger className="bg-muted/50 border-white/10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20">
                      <SelectItem value="cfo">Chief Financial Officer</SelectItem>
                      <SelectItem value="engineer">Business Engineer</SelectItem>
                      <SelectItem value="analyst">Data Analyst</SelectItem>
                      <SelectItem value="cmo">Marketing Officer</SelectItem>
                      <SelectItem value="hr">HR Partner</SelectItem>
                      <SelectItem value="legal">Legal Advisor</SelectItem>
                      <SelectItem value="security">Security Officer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full glass-button">Create Employee</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Active Employees</h3>
            <p className="text-3xl font-bold text-primary">{employees.length}</p>
          </Card>
          <Card className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Conversations Today</h3>
            <p className="text-3xl font-bold text-green-400">47</p>
          </Card>
          <Card className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Insights Generated</h3>
            <p className="text-3xl font-bold text-purple-400">128</p>
          </Card>
          <Card className="glass-card p-6">
            <h3 className="text-sm text-secondary mb-2">Efficiency Score</h3>
            <p className="text-3xl font-bold text-secondary">96.8%</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Employees;
