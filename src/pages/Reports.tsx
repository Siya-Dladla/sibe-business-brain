import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Sparkles, Trash2, Download } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface Report {
  id: string;
  report_type: string;
  title: string;
  content: string | null;
  summary: string | null;
  period_start: string | null;
  period_end: string | null;
  status: string;
  created_at: string;
}
const Reports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState({
    reportType: "",
    periodStart: "",
    periodEnd: ""
  });
  const {
    toast
  } = useToast();
  const fetchReports = async () => {
    setLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from("reports").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      setReports(data || []);
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
  const generateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const {
        data,
        error
      } = await supabase.functions.invoke("generate-report", {
        body: formData
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Report generated successfully"
      });
      setFormData({
        reportType: "",
        periodStart: "",
        periodEnd: ""
      });
      setOpen(false);
      fetchReports();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const deleteReport = async (id: string) => {
    try {
      const {
        error
      } = await supabase.from("reports").delete().eq("id", id);
      if (error) throw error;
      toast({
        title: "Success",
        description: "Report deleted successfully"
      });
      fetchReports();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    fetchReports();

    // Set up realtime subscription
    const channel = supabase.channel('reports-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'reports'
    }, fetchReports).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Get default dates (last 30 days)
  const getDefaultDates = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };
  useEffect(() => {
    const dates = getDefaultDates();
    setFormData(prev => ({
      ...prev,
      periodStart: dates.start,
      periodEnd: dates.end
    }));
  }, []);
  return <AppLayout>
      <div className="p-6 md:p-8 space-y-6">

      <div className="container mx-auto px-6 py-8 bg-primary-foreground">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-extralight mb-3 tracking-wide">Reports & Insights</h1>
            <p className="text-primary text-lg font-light">AI-generated business intelligence</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="glass-button text-primary border-primary/30 hover:bg-primary/10 h-12 px-8">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-primary/20 sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extralight tracking-wide flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Generate Report
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-light">
                  Create comprehensive business analysis reports
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={generateReport} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="reportType" className="text-sm font-light">Report Type</Label>
                  <Select value={formData.reportType} onValueChange={value => setFormData({
                  ...formData,
                  reportType: value
                })} required>
                    <SelectTrigger className="bg-input border-primary/20 focus:border-primary font-light">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-primary/20">
                      <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                      <SelectItem value="Performance Analysis">Performance Analysis</SelectItem>
                      <SelectItem value="Strategic Review">Strategic Review</SelectItem>
                      <SelectItem value="Financial Report">Financial Report</SelectItem>
                      <SelectItem value="Quarterly Report">Quarterly Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodStart" className="text-sm font-light">Start Date</Label>
                    <Input id="periodStart" type="date" value={formData.periodStart} onChange={e => setFormData({
                    ...formData,
                    periodStart: e.target.value
                  })} className="bg-input border-primary/20 focus:border-primary font-light" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="periodEnd" className="text-sm font-light">End Date</Label>
                    <Input id="periodEnd" type="date" value={formData.periodEnd} onChange={e => setFormData({
                    ...formData,
                    periodEnd: e.target.value
                  })} className="bg-input border-primary/20 focus:border-primary font-light" required />
                  </div>
                </div>

                <Button type="submit" className="w-full glass-button text-primary border-primary/30 hover:bg-primary/20 h-11" disabled={isGenerating}>
                  {isGenerating ? <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      Generating...
                    </div> : <>Generate Report</>}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[400px] border-primary/20">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-light">Loading reports...</p>
          </Card> : reports.length === 0 ? <Card className="glass-card p-16 flex flex-col items-center justify-center min-h-[500px] hover-lift border-primary/20 bg-primary-foreground">
            <FileText className="w-20 h-20 text-primary mb-8 opacity-50 animate-pulse-glow" />
            <h2 className="text-3xl font-extralight mb-4 text-primary">No Reports Yet</h2>
            <p className="text-muted-foreground text-center max-w-lg font-light leading-relaxed mb-8">
              Generate your first AI-powered business report. SIBE analyzes all your data to create
              comprehensive insights and strategic recommendations.
            </p>
          </Card> : <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {reports.map(report => <Card key={report.id} className="glass-card p-6 hover-lift border-primary/20 group cursor-pointer" onClick={() => setSelectedReport(report)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-light tracking-wide mb-2">{report.title}</h3>
                    <p className="text-xs text-muted-foreground font-light">
                      {report.period_start && report.period_end && `${new Date(report.period_start).toLocaleDateString()} - ${new Date(report.period_end).toLocaleDateString()}`}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={e => {
              e.stopPropagation();
              deleteReport(report.id);
            }} className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {report.summary && <p className="text-sm text-muted-foreground font-light line-clamp-3">
                    {report.summary}
                  </p>}

                <div className="mt-4">
                  <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-light">
                    {report.report_type}
                  </span>
                </div>
              </Card>)}
          </div>}

        {/* Report Details Dialog */}
        {selectedReport && <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
            <DialogContent className="glass-card border-primary/20 max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extralight tracking-wide">
                  {selectedReport.title}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground font-light">
                  {selectedReport.period_start && selectedReport.period_end && `${new Date(selectedReport.period_start).toLocaleDateString()} - ${new Date(selectedReport.period_end).toLocaleDateString()}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {selectedReport.content && <div className="prose prose-invert max-w-none">
                    <div className="text-sm text-muted-foreground font-light whitespace-pre-wrap leading-relaxed">
                      {selectedReport.content}
                    </div>
                  </div>}
              </div>
            </DialogContent>
          </Dialog>}
      </div>
    </AppLayout>;
};
export default Reports;