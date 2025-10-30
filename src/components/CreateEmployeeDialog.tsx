import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const CreateEmployeeDialog = ({ onEmployeeCreated }: { onEmployeeCreated: () => void }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    role: "",
    personality: "",
    expertise: ""
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create AI employees");
      }

      const expertiseArray = formData.expertise
        .split(",")
        .map(e => e.trim())
        .filter(e => e);

      const { error } = await supabase
        .from("ai_employees")
        .insert({
          user_id: user.id,
          name: formData.name,
          department: formData.department,
          role: formData.role,
          personality: formData.personality,
          expertise: expertiseArray,
          status: "active"
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI employee created successfully"
      });

      setFormData({
        name: "",
        department: "",
        role: "",
        personality: "",
        expertise: ""
      });
      setOpen(false);
      onEmployeeCreated();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="glass-button text-primary border-primary/30 hover:bg-primary/10 h-12 px-8">
          <Sparkles className="w-4 h-4 mr-2" />
          Create AI Employee
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-primary/20 sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extralight tracking-wide flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Create AI Employee
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-light">
            Design your synthetic workforce member
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-light">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Sarah Analytics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-input border-primary/20 focus:border-primary font-light"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-light">Department</Label>
            <Select
              value={formData.department}
              onValueChange={(value) => setFormData({ ...formData, department: value })}
              required
            >
              <SelectTrigger className="bg-input border-primary/20 focus:border-primary font-light">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent className="glass-card border-primary/20">
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="strategy">Strategy</SelectItem>
                <SelectItem value="hr">Human Resources</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-light">Role</Label>
            <Input
              id="role"
              placeholder="e.g., Senior Data Analyst"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="bg-input border-primary/20 focus:border-primary font-light"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality" className="text-sm font-light">Personality</Label>
            <Textarea
              id="personality"
              placeholder="Describe their communication style and approach..."
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              className="bg-input border-primary/20 focus:border-primary font-light min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expertise" className="text-sm font-light">Expertise (comma-separated)</Label>
            <Input
              id="expertise"
              placeholder="e.g., Data Analysis, Financial Modeling, Python"
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              className="bg-input border-primary/20 focus:border-primary font-light"
            />
          </div>

          <Button
            type="submit"
            className="w-full glass-button text-primary border-primary/30 hover:bg-primary/20 h-11 mt-6"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                Creating...
              </div>
            ) : (
              <>Create Employee</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeDialog;
