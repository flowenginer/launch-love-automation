import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Launches from "./pages/Launches";
import Leads from "./pages/Leads";
import Communication from "./pages/Communication";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import LaunchDashboard from "./pages/LaunchDashboard";
import LaunchCommunication from "./pages/LaunchCommunication";
import LaunchLayout from "./pages/LaunchLayout";
import LaunchCopy from "./pages/LaunchCopy";
import LaunchAnalytics from "./pages/LaunchAnalytics";
import LaunchLinks from "./pages/LaunchLinks";
import LaunchIntegrations from "./pages/LaunchIntegrations";
import IntegrationConfig from "./pages/IntegrationConfig";
import LaunchTeam from "./pages/LaunchTeam";
import SelectLaunch from "./pages/SelectLaunch";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/launches" element={
              <ProtectedRoute>
                <Launches />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <SelectLaunch />
              </ProtectedRoute>
            } />
            <Route path="/launch/:id" element={
              <ProtectedRoute>
                <LaunchLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<LaunchDashboard />} />
              <Route path="leads" element={<Leads />} />
              <Route path="copy" element={<LaunchCopy />} />
              <Route path="links" element={<LaunchLinks />} />
              <Route path="integrations" element={<LaunchIntegrations />} />
              <Route path="integrations/:integrationId" element={<IntegrationConfig />} />
              <Route path="team" element={<LaunchTeam />} />
              <Route path="analytics" element={<LaunchAnalytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
