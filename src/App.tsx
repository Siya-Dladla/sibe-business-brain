import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SoundSettingsProvider } from "@/contexts/SoundSettingsContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Reality from "./pages/Reality";
import Brain from "./pages/Brain";
import Agents from "./pages/Agents";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
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
              <Route path="/index" element={<Index />} />
              <Route path="/home" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reality" element={<ProtectedRoute><Reality /></ProtectedRoute>} />
              <Route path="/brain-graph" element={<Navigate to="/reality" replace />} />
              <Route path="/brain" element={<ProtectedRoute><Brain /></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/pricing" element={<Pricing />} />
              {/* Legacy redirects */}
              <Route path="/cognitive" element={<Navigate to="/brain" replace />} />
              <Route path="/observation" element={<Navigate to="/brain" replace />} />
              <Route path="/memory" element={<Navigate to="/brain" replace />} />
              <Route path="/evolution" element={<Navigate to="/brain" replace />} />
              <Route path="/swarm" element={<Navigate to="/agents" replace />} />
              <Route path="/execution" element={<Navigate to="/agents" replace />} />
              <Route path="/dashboard" element={<Navigate to="/reality" replace />} />
              <Route path="/analytics" element={<Navigate to="/brain" replace />} />
              <Route path="/intelligence" element={<Navigate to="/brain" replace />} />
              <Route path="/employees" element={<Navigate to="/agents" replace />} />
              <Route path="/automation" element={<Navigate to="/agents" replace />} />
              <Route path="/documents" element={<Navigate to="/brain" replace />} />
              <Route path="/forecasting" element={<Navigate to="/brain" replace />} />
              <Route path="/recommendations" element={<Navigate to="/brain" replace />} />
              <Route path="/reports" element={<Navigate to="/brain" replace />} />
              <Route path="/understanding" element={<Navigate to="/brain" replace />} />
              <Route path="/briefing" element={<Navigate to="/" replace />} />
              <Route path="/canvas" element={<Navigate to="/agents" replace />} />
              <Route path="/meeting" element={<Navigate to="/agents" replace />} />
              <Route path="/industries" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SoundSettingsProvider>
  </ThemeProvider>
);

export default App;
