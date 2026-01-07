import { useState } from "react";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatArea } from "./chat/ChatArea";
import { useChatState } from "@/hooks/useChatState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    messages,
    conversations,
    dataSources,
    activeConversationId,
    isLoading,
    startNewChat,
    selectConversation,
    deleteConversation,
    sendMessage,
    handleFileUpload,
    handleUrlAnalyze,
  } = useChatState();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out" });
    navigate("/auth");
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0">
        <ChatSidebar
          conversations={conversations}
          dataSources={dataSources}
          activeConversationId={activeConversationId}
          onNewChat={startNewChat}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <ChatSidebar
            conversations={conversations}
            dataSources={dataSources}
            activeConversationId={activeConversationId}
            onNewChat={() => {
              startNewChat();
              setSidebarOpen(false);
            }}
            onSelectConversation={(id) => {
              selectConversation(id);
              setSidebarOpen(false);
            }}
            onDeleteConversation={deleteConversation}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-medium">Sibe SI</span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onFileUpload={handleFileUpload}
          onUrlAnalyze={handleUrlAnalyze}
        />
      </div>
    </div>
  );
}
