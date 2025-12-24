import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, Sparkles, Brain, Plus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import CreateEmployeeDialog from "@/components/CreateEmployeeDialog";
import EmployeeInteractionDialog from "@/components/EmployeeInteractionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
const TEMPLATE_EMPLOYEES = [{
  name: "AI Business Analyst",
  department: "Strategy",
  role: "Business Analyst",
  personality: "Analytical and data-driven professional specializing in market trends, competitive analysis, and strategic insights.",
  expertise: ["Market Research", "Data Analysis", "Strategic Planning", "KPI Tracking", "Business Intelligence"]
}, {
  name: "AI Software Engineer",
  department: "Engineering",
  role: "Software Engineer",
  personality: "Expert coder with deep knowledge of modern frameworks, architecture patterns, and best practices in software development.",
  expertise: ["Full Stack Development", "System Design", "Code Review", "DevOps", "Technical Documentation"]
}, {
  name: "AI Accountant",
  department: "Finance",
  role: "Senior Accountant",
  personality: "Detail-oriented financial expert specializing in bookkeeping, tax compliance, and financial reporting.",
  expertise: ["Financial Reporting", "Tax Compliance", "Budgeting", "Audit Preparation", "Cash Flow Management"]
}, {
  name: "AI Business Intelligence Analyst",
  department: "Analytics",
  role: "BI Analyst",
  personality: "Data storyteller who transforms complex datasets into actionable insights and compelling visualizations.",
  expertise: ["Data Visualization", "SQL", "Dashboard Creation", "Predictive Analytics", "Report Automation"]
}];
interface AIEmployee {
  id: string;
  name: string;
  department: string;
  role: string;
  personality: string | null;
  expertise: string[] | null;
  status: string;
  created_at: string;
}
const Employees = () => {
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const {
    toast
  } = useToast();
  const fetchEmployees = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("ai_employees").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const deleteEmployee = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from("ai_employees").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "AI employee deleted successfully"
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  const addTemplateEmployee = async (template: typeof TEMPLATE_EMPLOYEES[0]) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const {
        error
      } = await supabase.from("ai_employees").insert({
        name: template.name,
        department: template.department,
        role: template.role,
        personality: template.personality,
        expertise: template.expertise,
        user_id: user.id
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: `${template.name} added to your team!`
      });
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    fetchEmployees();

    // Set up realtime subscription
    const channel = supabase.channel('employees-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'ai_employees'
    }, fetchEmployees).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  return <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Team Management</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-extralight mb-3 tracking-wide">Team Management</h1>
            <p className="text-primary text-lg font-light">Manage your AI employees and synthetic workforce</p>
          </div>
          <CreateEmployeeDialog onEmployeeCreated={fetchEmployees} />
        </div>

        {/* Template AI Employees Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-extralight mb-6 tracking-wide">Ready-Made AI Employees</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATE_EMPLOYEES.map((template, idx) => <Card key={idx} onClick={() => addTemplateEmployee(template)} className="holographic-card p-6 cursor-pointer group hover-lift bg-primary-foreground">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center animate-pulse-glow">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-light tracking-wide mb-1">{template.name}</h3>
                    <Badge variant="outline" className="border-primary/30 text-primary font-light mb-3">
                      {template.department}
                    </Badge>
                    <p className="text-sm text-muted-foreground font-light line-clamp-3 mb-4">
                      {template.personality}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Team
                  </Button>
                </div>
              </Card>)}
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 mb-6">
          <h2 className="text-3xl font-extralight mb-6 tracking-wide">Your AI Team</h2>
        </div>

        {loading ? <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[400px] border-primary/20">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-light">Loading AI employees...</p>
          </Card> : employees.length === 0 ? <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20">
            <Brain className="w-20 h-20 text-primary mb-8 opacity-50 animate-pulse-glow" />
            <h2 className="text-3xl font-extralight mb-4 text-primary">No AI Employees Yet</h2>
            <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
              Create your first AI employee to build your synthetic workforce. Each employee can handle specific departments, 
              provide insights, and participate in strategic meetings.
            </p>
            <CreateEmployeeDialog onEmployeeCreated={fetchEmployees} />
          </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map(employee => <Card key={employee.id} className="glass-card p-6 hover-lift border-primary/20 group bg-primary-foreground">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center bg-black/20">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-light tracking-wide">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground font-light">{employee.role}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteEmployee(employee.id)} className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="border-primary/30 text-primary font-light">
                      {employee.department}
                    </Badge>
                  </div>

                  {employee.personality && <p className="text-sm text-muted-foreground font-light line-clamp-2">
                      {employee.personality}
                    </p>}

                  {employee.expertise && employee.expertise.length > 0 && <div className="flex flex-wrap gap-2">
                      {employee.expertise.slice(0, 3).map((skill, idx) => <Badge key={idx} variant="secondary" className="text-xs font-light bg-primary/5 border-primary/10">
                          {skill}
                        </Badge>)}
                      {employee.expertise.length > 3 && <Badge variant="secondary" className="text-xs font-light bg-primary/5 border-primary/10">
                          +{employee.expertise.length - 3}
                        </Badge>}
                    </div>}

                  <Button variant="outline" size="sm" onClick={() => setSelectedEmployee(employee)} className="w-full mt-4 border-primary/30 hover:bg-primary/10">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Chat with {employee.name.split(' ')[0]}
                  </Button>
                </div>
              </Card>)}
          </div>}

        <EmployeeInteractionDialog employee={selectedEmployee} open={!!selectedEmployee} onOpenChange={open => !open && setSelectedEmployee(null)} />
      </div>
    </div>;
};
export default Employees;