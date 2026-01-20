import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Mic, MicOff, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isAction?: boolean;
  actionType?: string;
}

const SUGGESTED_PROMPTS = [
  "What should I focus on today?",
  "How are my sales performing?",
  "Create a marketing campaign",
  "Check customer support status",
  "Analyze my inventory levels",
];

const OperatorChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Good morning. I've reviewed your store performance overnight. Sales are tracking 8% above yesterday. You have 3 orders ready to ship. What would you like me to handle first?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Web Speech API
  useEffect(() => {
    const win = window as any;
    if ("webkitSpeechRecognition" in win || "SpeechRecognition" in win) {
      const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setInput((prev) => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
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
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Voice Unavailable",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const fetchBusinessContext = async () => {
    if (!user) return null;

    try {
      const [metricsRes, ordersRes] = await Promise.all([
        supabase
          .from("business_metrics")
          .select("metric_name, value, change_percentage")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("business_plans")
          .select("title, description")
          .eq("user_id", user.id)
          .limit(3),
      ]);

      return {
        metrics: metricsRes.data || [],
        businessInfo: ordersRes.data || [],
        storeConnected: true, // Will be dynamic with Shopify
      };
    } catch (error) {
      console.error("Error fetching context:", error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      const businessContext = await fetchBusinessContext();

      const { data, error } = await supabase.functions.invoke("sibe-chat", {
        body: {
          message: currentInput,
          businessContext,
          mode: "operator", // Tell the backend this is ecommerce operator mode
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        isAction: data.commandResult?.success,
        actionType: data.commandResult?.type,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Show action toast if applicable
      if (data.commandResult?.success) {
        toast({
          title: "Action Completed",
          description: data.commandResult.message,
        });
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to reach Sibe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4 max-w-2xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">SIBE</span>
                    {message.isAction && (
                      <Badge variant="outline" className="text-xs">
                        {message.actionType || "Action"}
                      </Badge>
                    )}
                  </div>
                )}
                <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border p-4 rounded-2xl">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Quick Actions</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs h-8 font-light"
                onClick={() => handleSuggestedPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-end gap-2 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVoiceInput}
            className={`shrink-0 ${isListening ? "text-red-400 bg-red-500/10" : "text-muted-foreground"}`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask Sibe what to do..."
            className="min-h-[44px] max-h-32 resize-none bg-card border-border font-light text-sm"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OperatorChat;
