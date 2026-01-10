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
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

  const suggestedPrompts = [
    "Show me revenue trends",
    "Analyze customer growth",
    "Compare monthly metrics",
    "Forecast next quarter",
  ];

  return (
    <div className="relative flex flex-col h-full w-full bg-[#0a0a0a]">
      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-[20vw] font-extralight tracking-wider text-white/[0.02] select-none animate-float">
          Sibe
        </div>
      </div>

      {/* History Button */}
      <div className="absolute top-4 left-4 z-20">
        <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a]"
            >
              <History className="w-4 h-4 text-white/60" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 bg-[#0a0a0a] border-[#2a2a2a] p-0">
            <SheetHeader className="p-4 border-b border-[#2a2a2a]">
              <SheetTitle className="text-white/90 flex items-center justify-between">
                Chat History
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startNewChat}
                  className="h-8 px-3 bg-primary/20 hover:bg-primary/30 text-primary"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="p-2 space-y-1">
                {chatHistory.length === 0 ? (
                  <p className="text-sm text-white/40 text-center py-8">
                    No chat history yet
                  </p>
                ) : (
                  chatHistory.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => loadSession(session)}
                      className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSessionId === session.id
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-[#1a1a1a] hover:bg-[#252525] border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white/80 truncate">{session.title}</p>
                          <p className="text-[10px] text-white/40 mt-1">
                            {new Date(session.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => deleteSession(session.id, e)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
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

      {/* Graph Panel */}
      {showGraph && graphData.length > 0 && (
        <div className="absolute top-4 right-4 w-80 md:w-96 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 z-20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm text-white/80">Data Visualization</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGraph(false)}
              className="h-6 w-6 p-0 hover:bg-white/10"
            >
              <X className="w-4 h-4 text-white/60" />
            </Button>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={graphData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="name" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    borderRadius: "8px",
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
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pt-16 space-y-6 relative z-10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-2">
              How can I help you today?
            </h2>
            <p className="text-sm text-white/40 mb-8">
              Ask me anything about your business data
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-lg">
              {suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setInput(prompt)}
                  className="p-3 text-left text-sm text-white/60 bg-[#1a1a1a] hover:bg-[#252525] border border-[#2a2a2a] rounded-xl transition-colors"
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
                className={`max-w-[85%] md:max-w-[70%] ${
                  message.role === "user"
                    ? "bg-primary/20 border border-primary/30"
                    : "bg-[#1a1a1a] border border-[#2a2a2a]"
                } rounded-2xl px-4 py-3`}
              >
                <p className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
                {message.chartData && (
                  <div className="mt-4 h-32 bg-[#0a0a0a] rounded-lg p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={message.chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                        <XAxis dataKey="name" stroke="#666" fontSize={9} />
                        <YAxis stroke="#666" fontSize={9} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="text-[10px] text-white/30 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-white/60">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t border-[#1a1a1a] bg-[#0a0a0a] relative z-10">
        <div className="max-w-3xl mx-auto relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Message Sibe SI..."
            className="w-full min-h-[56px] max-h-32 resize-none bg-[#1a1a1a] border-[#2a2a2a] rounded-2xl px-4 py-4 pr-28 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-0"
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button
              onClick={toggleVoiceInput}
              disabled={isLoading}
              className={`h-10 w-10 p-0 rounded-xl transition-colors ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-[#252525] hover:bg-[#303030]'
              }`}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-white/60" />
              )}
            </Button>
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-center text-[10px] text-white/20 mt-3">
          {isListening ? "🎙️ Listening... Speak now" : "Sibe SI can make mistakes. Verify important information."}
        </p>
      </div>
    </div>
  );
};

export default HomeChat;
