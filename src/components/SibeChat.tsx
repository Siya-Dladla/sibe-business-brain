import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
const SibeChat = forwardRef((props, ref) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: "assistant",
    content: "Hello! I'm Sibe SI, your synthetic business intelligence partner. I've analyzed your business data and I'm ready to provide strategic insights. How can I help you today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke("sibe-chat", {
        body: {
          message: input
        }
      });
      if (error) throw error;
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Communication Error",
        description: "Failed to connect with Sibe SI. Please try again.",
        variant: "destructive"
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
  useImperativeHandle(ref, () => ({
    sendMessage: (message: string) => {
      setInput(message);
      setTimeout(() => handleSend(), 100);
    }
  }));
  return <Card className="glass-card p-6 flex flex-col h-[600px] border-primary/30 bg-primary-foreground">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-primary/20">
        <div className="relative">
          <Brain className="w-8 h-8 text-primary animate-pulse" />
          <div className="absolute inset-0 rounded-full border border-primary/30 animate-pulse-glow"></div>
        </div>
        <div>
          <h3 className="text-2xl font-extralight tracking-wide bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Ask Sibe SI
          </h3>
          <p className="text-sm text-muted-foreground font-light">Your AI Business Intelligence Partner</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((message, index) => <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-4 rounded-lg ${message.role === "user" ? "bg-primary/10 border border-primary/30 text-foreground" : "bg-background/50 border border-primary/20 text-foreground"}`}>
              <p className="text-sm font-light whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>)}
        {isLoading && <div className="flex justify-start">
            <div className="max-w-[80%] p-4 rounded-lg bg-background/50 border border-primary/20">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            </div>
          </div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask Sibe SI anything about your business..." className="glass-card border-primary/30 font-light" disabled={isLoading} />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="border border-primary/30 text-primary bg-primary-foreground">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>;
});
export default SibeChat;