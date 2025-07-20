import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
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
import SelectLaunch from "./pages/SelectLaunch";

const queryClient = new QueryClient();

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-background">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
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
