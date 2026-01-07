import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface Conversation {
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

export function useChatState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch business plans as data sources
      const { data: plans } = await supabase
        .from("business_plans")
        .select("id, title, created_at, file_url")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch website analyses
      const { data: websites } = await supabase
        .from("website_analyses")
        .select("id, website_url, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      // Convert to data sources format
      const sources: DataSource[] = [
        ...(plans || []).map((p) => ({
          id: p.id,
          type: "pdf" as const,
          name: p.title,
          created_at: p.created_at,
        })),
        ...(websites || []).map((w) => ({
          id: w.id,
          type: "url" as const,
          name: w.website_url,
          created_at: w.created_at,
        })),
      ];

      setDataSources(sources);

      // Fetch AI conversations
      const { data: convData } = await supabase
        .from("ai_conversations")
        .select("id, context, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (convData) {
        const convs: Conversation[] = convData.map((c) => ({
          id: c.id,
          title: (c.context as any)?.title || "New conversation",
          created_at: c.created_at,
        }));
        setConversations(convs);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  const selectConversation = useCallback(async (id: string) => {
    setActiveConversationId(id);
    
    try {
      const { data } = await supabase
        .from("ai_conversations")
        .select("messages")
        .eq("id", id)
        .single();

      if (data?.messages && Array.isArray(data.messages)) {
        const loadedMessages: Message[] = (data.messages as any[]).map((m, idx) => ({
          id: `${id}-${idx}`,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp || Date.now()),
          visualization: m.visualization,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    try {
      await supabase.from("ai_conversations").delete().eq("id", id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        startNewChat();
      }
      toast({ title: "Conversation deleted" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  }, [activeConversationId, startNewChat, toast]);

  const sendMessage = useCallback(async (content: string, attachments?: any[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("sibe-chat", {
        body: { message: content },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Parse response for potential visualization data
      let visualization;
      const responseContent = data.response;

      // Check if response contains structured data markers
      if (responseContent.includes("```json") || responseContent.includes("```chart")) {
        try {
          const jsonMatch = responseContent.match(/```(?:json|chart)\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[1]);
            if (parsedData.type && parsedData.data) {
              visualization = parsedData;
            }
          }
        } catch {
          // Not valid JSON, continue without visualization
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: responseContent.replace(/```(?:json|chart)\n[\s\S]*?\n```/g, "").trim(),
        timestamp: new Date(),
        visualization,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save conversation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const allMessages = [...messages, userMessage, assistantMessage].map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp.toISOString(),
          visualization: m.visualization,
        }));

        if (activeConversationId) {
          await supabase
            .from("ai_conversations")
            .update({ messages: allMessages, updated_at: new Date().toISOString() })
            .eq("id", activeConversationId);
        } else {
          // Get organization for new conversation
          const { data: orgMember } = await supabase
            .from("organization_members")
            .select("organization_id")
            .eq("user_id", user.id)
            .limit(1)
            .single();

          if (orgMember) {
            const { data: newConv } = await supabase
              .from("ai_conversations")
              .insert({
                user_id: user.id,
                organization_id: orgMember.organization_id,
                messages: allMessages,
                context: { title: content.substring(0, 50) + (content.length > 50 ? "..." : "") },
              })
              .select()
              .single();

            if (newConv) {
              setActiveConversationId(newConv.id);
              setConversations((prev) => [
                { id: newConv.id, title: content.substring(0, 50), created_at: newConv.created_at },
                ...prev,
              ]);
            }
          }
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, activeConversationId, toast]);

  const handleFileUpload = useCallback(async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Upload file to storage
    const fileName = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("business-documents")
      .upload(fileName, file);

    if (uploadError) {
      // If bucket doesn't exist, just save the plan without file
      console.warn("Storage upload failed, saving plan without file:", uploadError);
    }

    // Create business plan entry
    const { error: planError } = await supabase.from("business_plans").insert({
      user_id: user.id,
      title: file.name,
      description: `Uploaded document: ${file.name}`,
      file_url: uploadError ? null : fileName,
    });

    if (planError) throw planError;

    await fetchConversations();
    toast({ title: "Document uploaded", description: file.name });
  }, [fetchConversations, toast]);

  const handleUrlAnalyze = useCallback(async (url: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-website", {
        body: { url },
      });

      if (error) throw error;

      await fetchConversations();
      toast({ title: "Website analyzed", description: url });

      // Add analysis as a message
      if (data?.analysis) {
        const analysisMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `I've analyzed ${url}. Here's what I found:\n\n${data.analysis}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, analysisMessage]);
      }
    } catch (error: any) {
      console.error("URL analyze error:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze website",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchConversations, toast]);

  return {
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
  };
}
