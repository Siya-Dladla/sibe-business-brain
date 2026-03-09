import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SoundSettingsProvider } from "@/contexts/SoundSettingsContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NewDashboard from "./pages/NewDashboard";
import DataUpload from "./pages/DataUpload";
import InsightsPage from "./pages/Insights";
import AgentActions from "./pages/AgentActions";
import Employees from "./pages/Employees";
import Meeting from "./pages/Meeting";
import Reports from "./pages/Reports";
import Forecasting from "./pages/Forecasting";
import Canvas from "./pages/Canvas";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <SoundSettingsProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<ProtectedRoute><NewDashboard /></ProtectedRoute>} />
              <Route path="/data-upload" element={<ProtectedRoute><DataUpload /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
              <Route path="/agent-actions" element={<ProtectedRoute><AgentActions /></ProtectedRoute>} />
              <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/canvas" element={<ProtectedRoute><Canvas /></ProtectedRoute>} />
              <Route path="/meeting" element={<ProtectedRoute><Meeting /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/forecasting" element={<ProtectedRoute><Forecasting /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SoundSettingsProvider>
  </ThemeProvider>
);

export default App;
