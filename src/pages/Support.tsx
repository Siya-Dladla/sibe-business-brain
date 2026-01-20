import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Headphones, MessageSquare, CheckCircle, Clock, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Ticket {
  id: string;
  customer: string;
  subject: string;
  status: "resolved" | "pending" | "open";
  lastMessage: string;
  timestamp: Date;
  resolvedBy?: "ai" | "human";
}

const Support = () => {
  const [tickets] = useState<Ticket[]>([
    { 
      id: "1", 
      customer: "John D.", 
      subject: "Where is my order?", 
      status: "resolved", 
      lastMessage: "Your order was delivered on Jan 18th.",
      timestamp: new Date(Date.now() - 3600000),
      resolvedBy: "ai"
    },
    { 
      id: "2", 
      customer: "Sarah M.", 
      subject: "Wrong size received", 
      status: "pending", 
      lastMessage: "I'll send a prepaid return label.",
      timestamp: new Date(Date.now() - 7200000),
      resolvedBy: "ai"
    },
    { 
      id: "3", 
      customer: "Mike R.", 
      subject: "Refund request", 
      status: "open", 
      lastMessage: "I want a full refund for my order.",
      timestamp: new Date(Date.now() - 1800000)
    },
  ]);

  const stats = {
    resolved: tickets.filter(t => t.status === "resolved").length,
    pending: tickets.filter(t => t.status === "pending").length,
    open: tickets.filter(t => t.status === "open").length,
    aiResolved: tickets.filter(t => t.resolvedBy === "ai").length,
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Resolved</Badge>;
      case "pending": return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
      default: return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Open</Badge>;
    }
  };

  const getStatusIcon = (status: Ticket["status"]) => {
    switch (status) {
      case "resolved": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 flex items-center gap-4 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <Link to="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-light text-foreground flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Customer Support
          </h1>
          <p className="text-xs text-muted-foreground">AI-powered ticket resolution</p>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light text-green-400">{stats.resolved}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </Card>
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light text-yellow-400">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </Card>
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light text-red-400">{stats.open}</p>
              <p className="text-xs text-muted-foreground">Open</p>
            </Card>
            <Card className="p-4 bg-card/50 text-center">
              <p className="text-2xl font-light text-primary">{stats.aiResolved}</p>
              <p className="text-xs text-muted-foreground">AI Resolved</p>
            </Card>
          </div>

          {/* AI Status */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <div>
                  <p className="text-sm font-light">Sibe Support Agent</p>
                  <p className="text-xs text-muted-foreground">Handling customer queries automatically</p>
                </div>
              </div>
              <Badge variant="outline">Active</Badge>
            </div>
          </Card>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full justify-start bg-card/50">
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="open">Needs Attention ({stats.open})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <Card key={ticket.id} className="p-4 bg-card/50 hover:bg-card/80 transition-all cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span className="text-sm font-light">{ticket.subject}</span>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <User className="w-3 h-3" />
                        <span>{ticket.customer}</span>
                        <span>•</span>
                        <span>{ticket.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        {ticket.resolvedBy === "ai" && (
                          <>
                            <span>•</span>
                            <Badge variant="outline" className="text-[10px] h-4">AI</Badge>
                          </>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        {ticket.lastMessage}
                      </p>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="open" className="mt-4">
              <div className="space-y-3">
                {tickets.filter(t => t.status === "open").map((ticket) => (
                  <Card key={ticket.id} className="p-4 bg-red-500/5 border-red-500/20">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span className="text-sm font-light">{ticket.subject}</span>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{ticket.lastMessage}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Let AI Handle</Button>
                      <Button size="sm" variant="ghost">View Details</Button>
                    </div>
                  </Card>
                ))}
                {tickets.filter(t => t.status === "open").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No open tickets! Great job.</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="resolved" className="mt-4">
              <div className="space-y-3">
                {tickets.filter(t => t.status === "resolved").map((ticket) => (
                  <Card key={ticket.id} className="p-4 bg-card/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-light">{ticket.subject}</span>
                      {ticket.resolvedBy === "ai" && <Badge variant="outline" className="text-[10px]">AI</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{ticket.customer} • {ticket.timestamp.toLocaleTimeString()}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Support;
