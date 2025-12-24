import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import MobileMenu from "@/components/MobileMenu";
import { useToast } from "@/hooks/use-toast";
import { Layers, Plus, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  title: string;
  description?: string;
  summary?: string;
  status: string;
  assigned_employees?: string[];
  participants?: string[];
  created_at: string;
}

const Canvas = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "" });
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll use meetings as projects placeholder
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-accent" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-primary" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Project Management</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Layers className="w-10 h-10 text-primary animate-pulse" />
            <div>
              <h1 className="text-4xl font-extralight tracking-wide">Canvas</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                AI Employee Project Tracker
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowNewProject(!showNewProject)}
            className="bg-primary hover:bg-primary/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {showNewProject && (
          <Card className="glass-card p-6 mb-6">
            <h3 className="text-xl font-light mb-4">Create New Project</h3>
            <div className="space-y-4">
              <Input
                placeholder="Project Title"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="bg-background/50 border-primary/20"
              />
              <Textarea
                placeholder="Project Description"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="bg-background/50 border-primary/20"
                rows={4}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    toast({
                      title: "Coming Soon",
                      description: "Project creation will be available soon",
                    });
                    setShowNewProject(false);
                  }}
                  className="bg-primary hover:bg-primary/80"
                >
                  Create Project
                </Button>
                <Button
                  onClick={() => setShowNewProject(false)}
                  variant="outline"
                  className="border-primary/30"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <Card className="glass-card p-6">
              <p className="text-muted-foreground">Loading projects...</p>
            </Card>
          ) : projects.length > 0 ? (
            projects.map((project) => (
              <Card key={project.id} className="glass-card p-6 hover-lift cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-light mb-1">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description || project.summary}
                    </p>
                  </div>
                  {getStatusIcon(project.status)}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{project.participants?.length || 0} AI Employees</span>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
              </Card>
            ))
          ) : (
            <Card className="glass-card p-12 col-span-full text-center">
              <Layers className="w-16 h-16 mx-auto mb-4 text-primary/30" />
              <h3 className="text-xl font-light mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-4">
                Start organizing your AI employee activities by creating your first project
              </p>
              <Button
                onClick={() => setShowNewProject(true)}
                className="bg-primary hover:bg-primary/80"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
