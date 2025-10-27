import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";

const Reports = () => {
  const reports = [
    {
      id: 1,
      title: "Weekly Strategy Meeting",
      date: "Jan 27, 2025",
      type: "Meeting Summary",
      status: "completed",
      insights: 12,
      actions: 5
    },
    {
      id: 2,
      title: "Q1 Financial Analysis",
      date: "Jan 20, 2025",
      type: "Financial Report",
      status: "completed",
      insights: 24,
      actions: 8
    },
    {
      id: 3,
      title: "Operational Efficiency Review",
      date: "Jan 13, 2025",
      type: "Operations Report",
      status: "completed",
      insights: 18,
      actions: 6
    },
    {
      id: 4,
      title: "Digital Transformation Assessment",
      date: "Jan 6, 2025",
      type: "Strategic Analysis",
      status: "completed",
      insights: 31,
      actions: 12
    }
  ];

  const upcomingReports = [
    { name: "Weekly Meeting Summary", date: "Feb 3, 2025" },
    { name: "Monthly Performance Review", date: "Feb 1, 2025" },
    { name: "Q2 Planning Report", date: "Mar 15, 2025" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6">
        <MobileMenu />
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4 glow-text">AI-Generated Reports</h1>
          <p className="text-secondary text-xl">Strategic insights and meeting summaries</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card p-6">
            <FileText className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-sm text-secondary mb-2">Total Reports</h3>
            <p className="text-3xl font-bold">{reports.length}</p>
          </Card>
          <Card className="glass-card p-6">
            <TrendingUp className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-sm text-secondary mb-2">Total Insights</h3>
            <p className="text-3xl font-bold text-green-400">85</p>
          </Card>
          <Card className="glass-card p-6">
            <CheckCircle className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-sm text-secondary mb-2">Action Items</h3>
            <p className="text-3xl font-bold text-purple-400">31</p>
          </Card>
          <Card className="glass-card p-6">
            <AlertCircle className="w-8 h-8 text-secondary mb-4" />
            <h3 className="text-sm text-secondary mb-2">Completion Rate</h3>
            <p className="text-3xl font-bold text-secondary">94%</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Recent Reports</h2>
            {reports.map((report) => (
              <Card key={report.id} className="glass-card p-6 hover:glow-border transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{report.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-secondary">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {report.date}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold">
                          {report.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="glass-button gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
                  <div>
                    <p className="text-sm text-secondary mb-1">AI Insights</p>
                    <p className="text-2xl font-bold text-primary">{report.insights}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary mb-1">Action Items</p>
                    <p className="text-2xl font-bold text-green-400">{report.actions}</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <p className="text-sm font-semibold mb-3">Key Highlights:</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-secondary">Revenue growth exceeded targets by 12%</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-secondary">Team efficiency improved across all departments</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-secondary">Marketing budget reallocation recommended</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full glass-button mt-6">View Full Report</Button>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Reports */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6">Upcoming Reports</h3>
              <div className="space-y-4">
                {upcomingReports.map((report, index) => (
                  <div key={index} className="glass-button p-4 rounded-lg">
                    <p className="font-semibold mb-1">{report.name}</p>
                    <p className="text-sm text-secondary flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {report.date}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Report Settings */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-6">Report Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Auto-generate weekly reports</span>
                  <div className="w-12 h-6 rounded-full bg-primary flex items-center justify-end px-1">
                    <div className="w-4 h-4 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Email notifications</span>
                  <div className="w-12 h-6 rounded-full bg-primary flex items-center justify-end px-1">
                    <div className="w-4 h-4 rounded-full bg-white"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include AI predictions</span>
                  <div className="w-12 h-6 rounded-full bg-primary flex items-center justify-end px-1">
                    <div className="w-4 h-4 rounded-full bg-white"></div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full glass-button justify-start">
                  Generate Custom Report
                </Button>
                <Button variant="outline" className="w-full glass-button justify-start">
                  Export All Reports
                </Button>
                <Button variant="outline" className="w-full glass-button justify-start">
                  Schedule Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
