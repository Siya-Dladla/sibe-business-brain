import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileMenu from "@/components/MobileMenu";
import CreateEmployeeDialog from "@/components/CreateEmployeeDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_employees")
        .select("*")
        .order("created_at", { ascending: false });

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
      const { error } = await supabase
        .from("ai_employees")
        .delete()
        .eq("id", id);

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

  useEffect(() => {
    fetchEmployees();

    // Set up realtime subscription
    const channel = supabase
      .channel('employees-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_employees' }, fetchEmployees)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
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

        {loading ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[400px] border-primary/20">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-light">Loading AI employees...</p>
          </Card>
        ) : employees.length === 0 ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20">
            <Brain className="w-20 h-20 text-primary mb-8 opacity-50 animate-pulse-glow" />
            <h2 className="text-3xl font-extralight mb-4 text-primary">No AI Employees Yet</h2>
            <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
              Create your first AI employee to build your synthetic workforce. Each employee can handle specific departments, 
              provide insights, and participate in strategic meetings.
            </p>
            <CreateEmployeeDialog onEmployeeCreated={fetchEmployees} />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <Card key={employee.id} className="glass-card p-6 hover-lift border-primary/20 group">
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteEmployee(employee.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="border-primary/30 text-primary font-light">
                      {employee.department}
                    </Badge>
                  </div>

                  {employee.personality && (
                    <p className="text-sm text-muted-foreground font-light line-clamp-2">
                      {employee.personality}
                    </p>
                  )}

                  {employee.expertise && employee.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {employee.expertise.slice(0, 3).map((skill, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs font-light bg-primary/5 border-primary/10"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {employee.expertise.length > 3 && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-light bg-primary/5 border-primary/10"
                        >
                          +{employee.expertise.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Employees;