import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useFeedback } from "@/hooks/useFeedback";

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
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const feedback = useFeedback();

  // Initialize Web Speech API
  useEffect(() => {
    const win = window as any;
    if ('webkitSpeechRecognition' in win || 'SpeechRecognition' in win) {
      const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: event.error === 'not-allowed' 
            ? "Microphone access denied. Please enable it in your browser settings."
            : "Voice recognition failed. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Stop listening when dialog closes
  useEffect(() => {
    if (!open && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [open, isListening]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      feedback.warning();
      toast({
        title: "Voice Input Unavailable",
        description: "Your browser doesn't support voice input. Try Chrome or Edge.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      feedback.toggle();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      feedback.toggle();
      toast({
        title: "Listening...",
        description: "Speak now. Click the mic button again to stop.",
      });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !employee) return;

    feedback.messageSent();

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

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

      feedback.messageReceived();
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.response || "I'm here to help with your business needs." 
      }]);
    } catch (error: any) {
      feedback.error();
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
            placeholder={isListening ? "🎙️ Listening..." : "Type your message..."}
            className="bg-input border-primary/20 focus:border-primary font-light resize-none"
            rows={2}
            disabled={loading}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={toggleVoiceInput}
              disabled={loading}
              variant="outline"
              className={`h-10 w-10 p-0 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 border-red-500 animate-pulse' 
                  : 'border-primary/30 hover:bg-primary/10'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
            <Button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="h-10 w-10 p-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeInteractionDialog;
