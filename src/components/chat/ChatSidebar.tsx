import { useState } from "react";
import { MessageSquare, Plus, FileText, Globe, Database, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
}

interface DataSource {
  id: string;
  type: "pdf" | "url" | "api";
  name: string;
  created_at: string;
}

interface ChatSidebarProps {
  conversations: ChatConversation[];
  dataSources: DataSource[];
  activeConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  collapsed?: boolean;
}

export function ChatSidebar({
  conversations,
  dataSources,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  collapsed = false,
}: ChatSidebarProps) {
  const [showDataSources, setShowDataSources] = useState(true);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4" />;
      case "url":
        return <Globe className="h-4 w-4" />;
      case "api":
        return <Database className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (collapsed) {
    return (
      <div className="h-full bg-sidebar-background border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewChat}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <div className="text-sidebar-foreground/50 text-xs">
          {conversations.length}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-sidebar-background border-r border-sidebar-border flex flex-col">
      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={onNewChat}
          className="w-full justify-start gap-2 bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80 border border-sidebar-border"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        {/* Chat History */}
        <div className="pb-4">
          <div className="px-2 py-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Chats
          </div>
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-2 text-sm text-sidebar-foreground/40">
                No conversations yet
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    activeConversationId === conv.id
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50"
                  )}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-sm">{conv.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-sidebar-foreground/50 hover:text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data Sources */}
        <div className="pb-4">
          <button
            onClick={() => setShowDataSources(!showDataSources)}
            className="flex items-center gap-2 px-2 py-2 w-full text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider hover:text-sidebar-foreground/70"
          >
            {showDataSources ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Data Sources
          </button>
          {showDataSources && (
            <div className="space-y-1">
              {dataSources.length === 0 ? (
                <div className="px-3 py-2 text-sm text-sidebar-foreground/40">
                  No data connected
                </div>
              ) : (
                dataSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/70"
                  >
                    {getSourceIcon(source.type)}
                    <span className="flex-1 truncate text-sm">{source.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/40 text-center">
          Sibe SI
        </div>
      </div>
    </div>
  );
}
