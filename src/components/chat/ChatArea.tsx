import { useRef, useEffect } from "react";
import { Brain } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  visualization?: {
    type: "chart" | "table" | "kpi";
    data: any;
  };
}

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string, attachments?: any[]) => void;
  onFileUpload: (file: File) => Promise<void>;
  onUrlAnalyze: (url: string) => Promise<void>;
}

export function ChatArea({ messages, isLoading, onSend, onFileUpload, onUrlAnalyze }: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="relative mb-8">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-light mb-2">Sibe SI</h1>
          <p className="text-muted-foreground text-center max-w-md mb-8">
            Your AI business intelligence partner. Upload data, ask questions, and get insights with visualizations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
            <SuggestionCard
              title="Analyze my data"
              description="Upload a PDF or connect to see insights"
              onClick={() => {}}
            />
            <SuggestionCard
              title="Show me trends"
              description="Visualize patterns in your metrics"
              onClick={() => onSend("Show me the trends in my business metrics with a chart")}
            />
            <SuggestionCard
              title="Get recommendations"
              description="AI-powered strategic advice"
              onClick={() => onSend("What are your strategic recommendations based on my business data?")}
            />
          </div>
        </div>
      ) : (
        <ScrollArea ref={scrollRef} className="flex-1">
          <div className="pb-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                visualization={message.visualization}
              />
            ))}
            {isLoading && (
              <ChatMessage
                role="assistant"
                content=""
                isLoading={true}
              />
            )}
          </div>
        </ScrollArea>
      )}

      <ChatInput
        onSend={onSend}
        onFileUpload={onFileUpload}
        onUrlAnalyze={onUrlAnalyze}
        isLoading={isLoading}
      />
    </div>
  );
}

function SuggestionCard({ 
  title, 
  description, 
  onClick 
}: { 
  title: string; 
  description: string; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors"
    >
      <div className="font-medium text-sm mb-1">{title}</div>
      <div className="text-xs text-muted-foreground">{description}</div>
    </button>
  );
}
