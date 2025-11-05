import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DocumentUploadProps {
  onUploadSuccess: () => void;
}

const DocumentUpload = ({ onUploadSuccess }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();

  const handleUpload = async () => {
    if (!title || !content) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and content for your business plan",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create business plan
      const { data: plan, error: planError } = await supabase
        .from("business_plans")
        .insert({
          user_id: user.id,
          title,
          description,
          content,
        })
        .select()
        .single();

      if (planError) throw planError;

      // Analyze with AI
      const { error: analysisError } = await supabase.functions.invoke(
        "analyze-business-plan",
        {
          body: {
            businessPlanId: plan.id,
            content,
          },
        }
      );

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        toast({
          title: "Plan Saved",
          description: "Business plan saved, but analysis failed. Please try generating insights manually.",
        });
      } else {
        toast({
          title: "Success",
          description: "Business plan uploaded and analyzed successfully!",
        });
      }

      setTitle("");
      setDescription("");
      setContent("");
      onUploadSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload business plan",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-primary" />
        <div>
          <h3 className="text-xl font-extralight">Feed Sibe SI</h3>
          <p className="text-xs text-muted-foreground font-light">Upload business data to teach your AI brain</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-muted-foreground font-light">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Q1 2025 Business Plan"
            className="glass-card border-primary/30 font-light"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-muted-foreground font-light">
            Description (Optional)
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Strategic goals and initiatives"
            className="glass-card border-primary/30 font-light"
          />
        </div>

        <div>
          <Label htmlFor="content" className="text-muted-foreground font-light">
            Business Plan Content
          </Label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your business plan content here..."
            className="glass-card border-primary/30 font-light min-h-[200px]"
          />
        </div>

        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-light"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload & Analyze
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default DocumentUpload;