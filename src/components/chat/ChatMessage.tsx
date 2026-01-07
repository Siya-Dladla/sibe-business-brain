import { Brain, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatVisualization } from "./ChatVisualization";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  visualization?: {
    type: "chart" | "table" | "kpi";
    data: any;
  };
  isLoading?: boolean;
}

export function ChatMessage({ role, content, timestamp, visualization, isLoading }: ChatMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={cn("py-6 px-4 md:px-8", isAssistant ? "bg-card/50" : "bg-transparent")}>
      <div className="max-w-3xl mx-auto flex gap-4">
        {/* Avatar */}
        <div
          className={cn(
            "h-8 w-8 rounded-sm flex items-center justify-center shrink-0",
            isAssistant ? "bg-primary text-primary-foreground" : "bg-accent"
          )}
        >
          {isAssistant ? (
            <Brain className="h-5 w-5" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm mb-1">
            {isAssistant ? "Sibe SI" : "You"}
          </div>
          
          {isLoading ? (
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75" />
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150" />
            </div>
          ) : (
            <>
              <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {content}
              </div>
              
              {visualization && (
                <div className="mt-4">
                  <ChatVisualization type={visualization.type} data={visualization.data} />
                </div>
              )}
            </>
          )}
          
          {timestamp && (
            <div className="text-xs text-muted-foreground mt-2">
              {timestamp.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
