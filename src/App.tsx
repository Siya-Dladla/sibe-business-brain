import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
