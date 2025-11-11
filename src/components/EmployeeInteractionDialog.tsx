import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  personality?: string;
  expertise?: string[];
}

interface EmployeeInteractionDialogProps {
  employee: AIEmployee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const EmployeeInteractionDialog = ({ employee, open, onOpenChange }: EmployeeInteractionDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || !employee) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sibe-chat", {
        body: { 
          message: `[Speaking with ${employee.name} - ${employee.role}] ${userMessage}`,
          context: `You are ${employee.name}, an AI ${employee.role} in the ${employee.department} department. ${employee.personality ? `Your personality: ${employee.personality}.` : ""} ${employee.expertise ? `Your expertise: ${employee.expertise.join(", ")}.` : ""} Respond as this character would, providing insights from your role's perspective.`
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.response || "I'm here to help with your business needs." 
      }]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-primary/20 sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extralight tracking-wide flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            {employee?.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-light">
            {employee?.role} • {employee?.department}
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[300px]">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground font-light py-8">
              <p>Start a conversation with {employee?.name}</p>
              <p className="text-xs mt-2">Ask questions or discuss business strategies</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary/20 text-foreground"
                      : "bg-muted/50 text-foreground"
                  }`}
                >
                  <p className="text-sm font-light whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-border/50">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="bg-input border-primary/20 focus:border-primary font-light resize-none"
            rows={2}
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="h-auto"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeInteractionDialog;
