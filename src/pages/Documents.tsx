import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Search, Upload, Tag, Sparkles } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import DocumentUpload from "@/components/DocumentUpload";
import WebsiteAnalyzer from "@/components/WebsiteAnalyzer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();

  const fetchDocuments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("business_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setDocuments(data || []);
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const filtered = documents.filter(d =>
    d.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50 bg-card">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">Documents</div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <FileText className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl md:text-4xl font-extralight tracking-wide">Documents</h1>
              <p className="text-muted-foreground font-light text-sm mt-1">
                Organized file storage with AI-powered understanding
              </p>
            </div>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-button"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DocumentUpload onUploadComplete={fetchDocuments} />
          <WebsiteAnalyzer onAnalysisComplete={fetchDocuments} />
        </div>

        {/* Document List */}
        <div className="space-y-3">
          <h3 className="text-lg font-light flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            Your Documents
          </h3>
          {filtered.length === 0 ? (
            <Card className="glass-card p-12 text-center border-border/20">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-muted-foreground font-light">No documents yet. Upload business data to get started.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((doc) => (
                <Card key={doc.id} className="glass-card p-4 border-border/20 hover-lift">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-light truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{doc.description}</p>
                      )}
                    </div>
                    <Sparkles className="w-4 h-4 text-primary/50 shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Documents;