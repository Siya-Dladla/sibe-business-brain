import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, MessageSquare, Sparkles, Trash2 } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Meeting {
  id: string;
  title: string;
  summary: string | null;
  transcript: string | null;
  participants: string[] | null;
  ai_recommendations: string | null;
  meeting_date: string;
  status: string;
}

const Meeting = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [formData, setFormData] = useState({ title: "", agenda: "" });
  const { toast } = useToast();

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: false });

      if (error) throw error;
      setMeetings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke("ai-meeting", {
        body: {
          meetingTitle: formData.title,
          agenda: formData.agenda,
          participantIds: []
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI meeting completed successfully"
      });

      setFormData({ title: "", agenda: "" });
      setOpen(false);
      fetchMeetings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase
        .from("meetings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Meeting deleted successfully"
      });

      fetchMeetings();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg">
      <div className="p-6 flex items-center justify-between border-b border-border/50">
        <MobileMenu />
        <div className="text-xs text-muted-foreground">AI Conference</div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-extralight mb-3 tracking-wide">AI Conference Room</h1>
            <p className="text-primary text-lg font-light">Strategic meetings with synthetic intelligence</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button text-primary border-primary/30 hover:bg-primary/10 h-12 px-8">
                <Calendar className="w-4 h-4 mr-2" />
                Start AI Meeting
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20 sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extralight tracking-wide flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  New AI Meeting
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-light">
                  Create an AI-facilitated strategic business meeting
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={createMeeting} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-light">Meeting Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Q1 Strategy Review"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-input border-primary/20 focus:border-primary font-light"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agenda" className="text-sm font-light">Meeting Agenda</Label>
                  <Textarea
                    id="agenda"
                    placeholder="List topics to discuss..."
                    value={formData.agenda}
                    onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                    className="bg-input border-primary/20 focus:border-primary font-light min-h-[100px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full glass-button text-primary border-primary/30 hover:bg-primary/20 h-11"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      Creating Meeting...
                    </div>
                  ) : (
                    <>Start Meeting</>
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[400px] border-primary/20">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-light">Loading meetings...</p>
          </Card>
        ) : meetings.length === 0 ? (
          <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20">
            <Calendar className="w-20 h-20 text-primary mb-8 opacity-50 animate-pulse-glow" />
            <h2 className="text-3xl font-extralight mb-4 text-primary">No Meetings Yet</h2>
            <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
              Start your first AI-facilitated meeting. SIBE will analyze your agenda, provide insights,
              and generate actionable recommendations.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="glass-card p-6 hover-lift border-primary/20 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-light tracking-wide mb-2">{meeting.title}</h3>
                    <p className="text-xs text-muted-foreground font-light">
                      {new Date(meeting.meeting_date).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedMeeting(meeting)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMeeting(meeting.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {meeting.summary && (
                  <p className="text-sm text-muted-foreground font-light line-clamp-3 mb-3">
                    {meeting.summary}
                  </p>
                )}

                {meeting.participants && meeting.participants.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {meeting.participants.map((participant, idx) => (
                      <div
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-light"
                      >
                        {participant}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Meeting Details Dialog */}
        {selectedMeeting && (
          <Dialog open={!!selectedMeeting} onOpenChange={() => setSelectedMeeting(null)}>
            <DialogContent className="glass-card border-primary/20 max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extralight tracking-wide">
                  {selectedMeeting.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-light">
                  {new Date(selectedMeeting.meeting_date).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedMeeting.transcript && (
                  <div>
                    <h3 className="text-lg font-light mb-2 text-primary">Meeting Transcript</h3>
                    <div className="text-sm text-muted-foreground font-light whitespace-pre-wrap leading-relaxed">
                      {selectedMeeting.transcript}
                    </div>
                  </div>
                )}

                {selectedMeeting.ai_recommendations && (
                  <div>
                    <h3 className="text-lg font-light mb-2 text-primary">AI Recommendations</h3>
                    <div className="text-sm text-muted-foreground font-light whitespace-pre-wrap leading-relaxed">
                      {selectedMeeting.ai_recommendations}
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Meeting;
