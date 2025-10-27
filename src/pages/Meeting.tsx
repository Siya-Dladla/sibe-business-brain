import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Mic, MicOff, Users, Calendar, Play, StopCircle } from "lucide-react";
import { useState } from "react";
import MobileMenu from "@/components/MobileMenu";

const Meeting = () => {
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const participants = [
    { name: "SIBE Host", role: "AI Coordinator", status: "speaking" },
    { name: "SIBE CFO", role: "Finance", status: "listening" },
    { name: "SIBE Engineer", role: "Operations", status: "listening" },
    { name: "SIBE Analyst", role: "Data", status: "listening" },
  ];

  const agenda = [
    "Weekly Performance Review",
    "Financial Health Assessment",
    "Operational Efficiency Report",
    "Growth Strategy Discussion",
    "Risk Analysis & Mitigation",
    "Action Items for Next Week"
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <MobileMenu />
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">AI Conference Room</h1>
          <p className="text-secondary text-xl">Voice-enabled strategic meetings with your AI team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Meeting Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video/Conference Area */}
            <Card className="glass-card p-8 min-h-[500px]">
              {!isMeetingActive ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center mb-8 animate-pulse-glow">
                    <Video className="w-16 h-16 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4">Ready to Start Meeting</h2>
                  <p className="text-secondary text-center mb-8 max-w-md">
                    Join your weekly AI conference. SIBE and your AI team will provide insights, analysis, and strategic recommendations.
                  </p>
                  <Button 
                    size="lg" 
                    className="glass-button gap-3 text-lg px-8 py-6"
                    onClick={() => setIsMeetingActive(true)}
                  >
                    <Play className="w-6 h-6" />
                    Start AI Conference
                  </Button>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex-1 grid grid-cols-2 gap-4 mb-6">
                    {participants.map((participant, index) => (
                      <div 
                        key={index} 
                        className={`glass-card p-6 flex flex-col items-center justify-center ${
                          participant.status === 'speaking' ? 'border-primary glow-border' : ''
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full ${
                          participant.status === 'speaking' ? 'bg-primary/30' : 'bg-muted'
                        } flex items-center justify-center mb-3`}>
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">{participant.name}</h3>
                        <p className="text-sm text-secondary">{participant.role}</p>
                        {participant.status === 'speaking' && (
                          <div className="mt-2 flex gap-1">
                            {[1, 2, 3].map((i) => (
                              <div 
                                key={i} 
                                className="w-1 h-4 bg-primary rounded-full animate-pulse"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Live Transcript */}
                  <Card className="glass-card p-4 mb-4 max-h-32 overflow-y-auto">
                    <p className="text-sm text-secondary mb-2">SIBE Host:</p>
                    <p className="text-sm">Good morning team. Let's review this week's performance. SIBE CFO, please share your financial analysis...</p>
                  </Card>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="glass-button gap-2"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      {isMuted ? 'Unmute' : 'Mute'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="lg"
                      className="gap-2"
                      onClick={() => setIsMeetingActive(false)}
                    >
                      <StopCircle className="w-5 h-5" />
                      End Meeting
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Meeting Notes Preview */}
            {isMeetingActive && (
              <Card className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4">Live Meeting Notes</h3>
                <div className="space-y-2 text-sm">
                  <p className="text-secondary">📊 Revenue increased 24.5% this week</p>
                  <p className="text-secondary">💰 Cash flow is healthy, recommend investing in marketing</p>
                  <p className="text-secondary">⚡ Operational efficiency improved by 8%</p>
                  <p className="text-secondary">🎯 Action: Review Q2 hiring plan</p>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule */}
            <Card className="glass-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Schedule</h3>
              </div>
              <div className="space-y-4">
                <div className="glass-button p-4 rounded-lg">
                  <p className="text-sm text-secondary mb-1">Current Meeting</p>
                  <p className="font-semibold">Weekly Strategy Review</p>
                  <p className="text-sm text-muted-foreground mt-1">Every Monday, 9:00 AM</p>
                </div>
                <div className="glass-button p-4 rounded-lg opacity-60">
                  <p className="text-sm text-secondary mb-1">Next Meeting</p>
                  <p className="font-semibold">Quarterly Business Review</p>
                  <p className="text-sm text-muted-foreground mt-1">First Monday of Month</p>
                </div>
              </div>
              <Button className="w-full glass-button mt-4">
                Manage Schedule
              </Button>
            </Card>

            {/* Agenda */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6">Meeting Agenda</h3>
              <div className="space-y-3">
                {agenda.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-primary font-semibold">{index + 1}</span>
                    </div>
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full glass-button justify-start">
                  View Past Meetings
                </Button>
                <Button variant="outline" className="w-full glass-button justify-start">
                  Download Reports
                </Button>
                <Button variant="outline" className="w-full glass-button justify-start">
                  Meeting Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meeting;
