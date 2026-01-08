import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, BarChart3, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  chartData?: any[];
  chartType?: "area" | "bar";
}

const HomeChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [graphData, setGraphData] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate sample chart data based on query
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
      const { data, error } = await supabase.functions.invoke("sibe-chat", {
        body: { message: currentInput },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Check if query is about visualization
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

      setMessages((prev) => [...prev, assistantMessage]);
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
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 relative z-10">
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
            className="w-full min-h-[56px] max-h-32 resize-none bg-[#1a1a1a] border-[#2a2a2a] rounded-2xl px-4 py-4 pr-14 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:ring-0"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 h-10 w-10 p-0 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-[10px] text-white/20 mt-3">
          Sibe SI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default HomeChat;
