import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, BarChart3, X, Mic, MicOff, History, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  chartData?: any[];
  chartType?: "area" | "bar";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

const HomeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  // Initialize Web Speech API
  useEffect(() => {
    const win = window as any;
    if ('webkitSpeechRecognition' in win || 'SpeechRecognition' in win) {
      const SpeechRecognitionAPI = win.SpeechRecognition || win.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInput(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
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

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      const sessions = (data || []).map(session => ({
        ...session,
        messages: (session.messages as any[]).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      
      setChatHistory(sessions);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveCurrentSession = useCallback(async (sessionMessages: Message[]) => {
    if (!user || sessionMessages.length === 0) return;

    const title = sessionMessages[0]?.content.slice(0, 50) || 'New Chat';
    const messagesForStorage = sessionMessages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString()
    }));

    try {
      if (currentSessionId) {
        await supabase
          .from('chat_history')
          .update({ 
            messages: messagesForStorage,
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSessionId);
      } else {
        const { data, error } = await supabase
          .from('chat_history')
          .insert({
            user_id: user.id,
            title,
            messages: messagesForStorage
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setCurrentSessionId(data.id);
        }
      }
      
      loadChatHistory();
    } catch (error) {
      console.error('Error saving chat session:', error);
    }
  }, [user, currentSessionId]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
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
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now. Click the mic button again to stop.",
      });
    }
  };

  // Fetch current business context
  const fetchBusinessContext = async () => {
    if (!user) return null;

    try {
      // Fetch business plan (uploaded PDF/document)
      const { data: plans } = await supabase
        .from('business_plans')
        .select('title, description, content')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch website analysis
      const { data: websites } = await supabase
        .from('website_analyses')
        .select('website_url, analysis_content, recommendations')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Fetch latest metrics
      const { data: metrics } = await supabase
        .from('business_metrics')
        .select('metric_name, value, change_percentage, period')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        businessPlan: plans?.[0] || null,
        websiteAnalysis: websites?.[0] || null,
        metrics: metrics || []
      };
    } catch (error) {
      console.error('Error fetching business context:', error);
      return null;
    }
  };

  const generateChartData = (query: string) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const isRevenue = query.toLowerCase().includes("revenue") || query.toLowerCase().includes("sales");
    const isCustomer = query.toLowerCase().includes("customer") || query.toLowerCase().includes("user");
    
    return months.map((month, i) => ({
      name: month,
      value: isRevenue 
        ? Math.floor(50000 + Math.random() * 50000 + i * 5000)
        : isCustomer
        ? Math.floor(100 + Math.random() * 200 + i * 50)
        : Math.floor(Math.random() * 100 + i * 10),
      growth: Math.floor(5 + Math.random() * 15),
    }));
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Fetch current business context
      const businessContext = await fetchBusinessContext();

      const { data, error } = await supabase.functions.invoke("sibe-chat", {
        body: { 
          message: currentInput,
          businessContext 
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      const isVisualizationQuery = 
        currentInput.toLowerCase().includes("graph") ||
        currentInput.toLowerCase().includes("chart") ||
        currentInput.toLowerCase().includes("visuali") ||
        currentInput.toLowerCase().includes("show me") ||
        currentInput.toLowerCase().includes("display");

      const chartData = isVisualizationQuery ? generateChartData(currentInput) : undefined;
      
      if (chartData) {
        setGraphData(chartData);
        setShowGraph(true);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        chartData,
        chartType: chartData ? "area" : undefined,
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      
      // Save to history
      if (user) {
        saveCurrentSession(updatedMessages);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to connect. Please try again.",
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

  const loadSession = (session: ChatSession) => {
    setMessages(session.messages);
    setCurrentSessionId(session.id);
    setHistoryOpen(false);
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setShowGraph(false);
    setHistoryOpen(false);
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await supabase
        .from('chat_history')
        .delete()
        .eq('id', sessionId);

      if (currentSessionId === sessionId) {
        startNewChat();
      }
      
      loadChatHistory();
      toast({
        title: "Chat deleted",
        description: "The conversation has been removed.",
      });
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const suggestedPrompts = isMobile 
    ? ["Revenue trends", "Customer growth"]
    : ["Show me revenue trends", "Analyze customer growth", "Compare monthly metrics", "Forecast next quarter"];

  return (
    <div className="relative flex flex-col h-full w-full bg-background overflow-hidden">
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[25vw] md:text-[20vw] font-extralight tracking-wider text-foreground/[0.02] select-none">
          Sibe
        </div>
      </div>

      {/* History Button */}
      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 md:h-9 md:w-9 p-0 bg-card hover:bg-muted border border-border active:scale-95 transition-transform touch-manipulation"
            >
              <History className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] max-w-80 bg-background border-border p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="text-foreground/90 flex items-center justify-between">
                Chat History
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewChat}
                  className="h-10 px-4 bg-primary/20 hover:bg-primary/30 text-primary active:scale-95 transition-transform"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100dvh-80px)]">
              <div className="p-2 space-y-1">
                {chatHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No chat history yet
                  </p>
                ) : (
                  chatHistory.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`p-4 rounded-lg cursor-pointer transition-all active:scale-[0.98] touch-manipulation ${
                        currentSessionId === session.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-card hover:bg-muted border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground/80 truncate">{session.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(session.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteSession(session.id, e)}
                          className="h-8 w-8 p-0 hover:bg-destructive/20 shrink-0"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Graph Panel - Mobile Optimized */}
      {showGraph && graphData.length > 0 && (
        <div className={`absolute z-20 shadow-2xl ${
          isMobile 
            ? 'inset-x-2 top-14 bg-card border border-border rounded-xl p-3' 
            : 'top-4 right-4 w-96 bg-card border border-border rounded-xl p-4'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground/80">Data Visualization</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGraph(false)}
              className="h-8 w-8 p-0 hover:bg-muted active:scale-95 transition-transform"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
          <div className={isMobile ? "h-36" : "h-48"}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 pt-14 md:pt-16 space-y-4 md:space-y-6 relative z-10 overscroll-contain">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <h2 className="text-xl md:text-3xl font-light text-foreground/90 mb-2 text-center">
              How can I help you today?
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mb-6 md:mb-8 text-center">
              Ask me anything about your business data
            </p>
            <div className={`grid gap-2 md:gap-3 w-full max-w-lg ${isMobile ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                  className="p-3 md:p-4 text-left text-xs md:text-sm text-muted-foreground bg-card hover:bg-muted border border-border rounded-xl transition-all active:scale-[0.98] touch-manipulation"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] md:max-w-[70%] ${
                  message.role === "user"
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-card border border-border"
                } rounded-2xl px-3 py-2.5 md:px-4 md:py-3`}
              >
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                {message.chartData && (
                  <div className="mt-3 h-28 md:h-32 bg-background rounded-lg p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={message.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={9} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={9} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl px-3 py-2.5 md:px-4 md:py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Mobile Optimized */}
      <div className="shrink-0 p-3 md:p-6 border-t border-border bg-background/95 backdrop-blur-sm relative z-10 safe-area-inset-bottom">
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message Sibe SI..."
            className="w-full min-h-[48px] md:min-h-[56px] max-h-28 md:max-h-32 resize-none bg-card border-border rounded-2xl px-3 py-3 md:px-4 md:py-4 pr-24 md:pr-28 text-base md:text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:ring-0"
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            <Button
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`h-10 w-10 md:h-10 md:w-10 p-0 rounded-xl transition-all active:scale-95 touch-manipulation ${
                isListening 
                  ? 'bg-destructive hover:bg-destructive/90 animate-pulse' 
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {isListening ? (
                <MicOff className="w-5 h-5 md:w-4 md:h-4 text-destructive-foreground" />
              ) : (
                <Mic className="w-5 h-5 md:w-4 md:h-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 md:h-10 md:w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30 active:scale-95 transition-transform touch-manipulation"
            >
              <Send className="w-5 h-5 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
        <p className={`text-center text-muted-foreground/50 mt-2 ${isMobile ? 'text-[9px]' : 'text-[10px] mt-3'}`}>
          {isListening ? "🎙️ Listening..." : (isMobile ? "Sibe SI can make mistakes" : "Sibe SI can make mistakes. Verify important information.")}
        </p>
      </div>
    </div>
  );
};

export default HomeChat;
