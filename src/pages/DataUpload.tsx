import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, FileSpreadsheet, File, CheckCircle, Clock, AlertCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: "processing" | "completed" | "failed";
  uploadedAt: Date;
}

const DataUpload = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptedTypes = [
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/pdf",
    "application/json",
  ];

  const getFileIcon = (type: string) => {
    if (type.includes("csv") || type.includes("excel") || type.includes("spreadsheet")) return FileSpreadsheet;
    if (type.includes("pdf")) return FileText;
    return File;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "processing": return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const handleFiles = async (fileList: FileList) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Error", description: "Please sign in to upload files.", variant: "destructive" });
      return;
    }

    for (const file of Array.from(fileList)) {
      const newFile: UploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        status: "processing",
        uploadedAt: new Date(),
      };
      setFiles(prev => [newFile, ...prev]);

      try {
        const filePath = `${user.id}/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from("business-documents").upload(filePath, file);
        if (error) throw error;

        setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: "completed" as const } : f));
        toast({ title: "Upload Complete", description: `${file.name} uploaded successfully.` });
      } catch {
        setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, status: "failed" as const } : f));
        toast({ title: "Upload Failed", description: `Failed to upload ${file.name}.`, variant: "destructive" });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <AppLayout>
      <div className="p-6 md:p-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-wide text-foreground">Data Upload Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload Excel, CSV, PDF, or POS exports for analysis</p>
        </div>

        {/* Drop Zone */}
        <Card
          className={`glass-card border-2 border-dashed transition-colors cursor-pointer ${isDragging ? "border-foreground/50 bg-muted/20" : "border-border/50 hover:border-border"}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Upload className="w-10 h-10 text-muted-foreground mb-4" />
            <p className="text-foreground font-medium">Drop files here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">Supports CSV, Excel, PDF, JSON</p>
          </CardContent>
        </Card>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept=".csv,.xlsx,.xls,.pdf,.json"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />

        {/* Uploaded Datasets */}
        {files.length > 0 && (
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-foreground">Uploaded Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-3">
                        <FileIcon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px]">
                          {file.status}
                        </Badge>
                        {getStatusIcon(file.status)}
                        <button onClick={() => removeFile(file.id)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default DataUpload;
