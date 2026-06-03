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
import Cognitive from "./pages/Cognitive";
import Agents from "./pages/Agents";
import Swarm from "./pages/Swarm";
import Observation from "./pages/Observation";
import Memory from "./pages/Memory";
import Execution from "./pages/Execution";
import Evolution from "./pages/Evolution";
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
              <Route path="/cognitive" element={<ProtectedRoute><Cognitive /></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route path="/swarm" element={<ProtectedRoute><Swarm /></ProtectedRoute>} />
              <Route path="/observation" element={<ProtectedRoute><Observation /></ProtectedRoute>} />
              <Route path="/memory" element={<ProtectedRoute><Memory /></ProtectedRoute>} />
              <Route path="/execution" element={<ProtectedRoute><Execution /></ProtectedRoute>} />
              <Route path="/evolution" element={<ProtectedRoute><Evolution /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              {/* Legacy redirects → AX layers */}
              <Route path="/dashboard" element={<Navigate to="/reality" replace />} />
              <Route path="/analytics" element={<Navigate to="/observation" replace />} />
              <Route path="/intelligence" element={<Navigate to="/cognitive" replace />} />
              <Route path="/employees" element={<Navigate to="/agents" replace />} />
              <Route path="/automation" element={<Navigate to="/swarm" replace />} />
              <Route path="/documents" element={<Navigate to="/memory" replace />} />
              <Route path="/forecasting" element={<Navigate to="/evolution" replace />} />
              <Route path="/recommendations" element={<Navigate to="/cognitive" replace />} />
              <Route path="/reports" element={<Navigate to="/observation" replace />} />
              <Route path="/understanding" element={<Navigate to="/cognitive" replace />} />
              <Route path="/briefing" element={<Navigate to="/" replace />} />
              <Route path="/canvas" element={<Navigate to="/swarm" replace />} />
              <Route path="/meeting" element={<Navigate to="/execution" replace />} />
              <Route path="/industries" element={<Navigate to="/" replace />} />
              <Route path="/pricing" element={<Pricing />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SoundSettingsProvider>
  </ThemeProvider>
);

export default App;
