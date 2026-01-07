import { useState, useRef } from "react";
import { Send, Paperclip, Globe, Database, X, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface AttachedFile {
  id: string;
  name: string;
  type: "pdf" | "url" | "api";
  file?: File;
  url?: string;
}

interface ChatInputProps {
  onSend: (message: string, attachments?: AttachedFile[]) => void;
  onFileUpload: (file: File) => Promise<void>;
  onUrlAnalyze: (url: string) => Promise<void>;
  isLoading: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  onFileUpload, 
  onUrlAnalyze, 
  isLoading, 
  placeholder = "Message Sibe SI..." 
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    onSend(input, attachments);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await onFileUpload(file);
      setAttachments((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: file.name,
          type: "pdf",
          file,
        },
      ]);
    } catch (error) {
      console.error("File upload error:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    setIsUploading(true);
    try {
      await onUrlAnalyze(urlInput);
      setAttachments((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: urlInput,
          type: "url",
          url: urlInput,
        },
      ]);
      setUrlInput("");
      setShowUrlInput(false);
    } catch (error) {
      console.error("URL analyze error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="max-w-3xl mx-auto">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5"
              >
                {attachment.type === "pdf" && <FileText className="h-4 w-4 text-muted-foreground" />}
                {attachment.type === "url" && <Globe className="h-4 w-4 text-muted-foreground" />}
                {attachment.type === "api" && <Database className="h-4 w-4 text-muted-foreground" />}
                <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* URL Input Modal */}
        {showUrlInput && (
          <div className="flex gap-2 mb-3">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter website URL to analyze..."
              className="flex-1 bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              autoFocus
            />
            <Button onClick={handleUrlSubmit} disabled={isUploading || !urlInput.trim()}>
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Analyze"}
            </Button>
            <Button variant="ghost" onClick={() => setShowUrlInput(false)}>
              Cancel
            </Button>
          </div>
        )}

        {/* Main Input */}
        <div className="relative flex items-end gap-2 bg-card border border-border rounded-xl p-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Paperclip className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                <FileText className="h-4 w-4 mr-2" />
                Upload PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowUrlInput(true)}>
                <Globe className="h-4 w-4 mr-2" />
                Analyze Website
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <Database className="h-4 w-4 mr-2" />
                Connect API
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "flex-1 min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2",
              "placeholder:text-muted-foreground"
            )}
            rows={1}
          />

          <Button
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && attachments.length === 0)}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-lg"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-2">
          Sibe SI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
