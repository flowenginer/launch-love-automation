"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Settings, 
  Home,
  ArrowLeft 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Launch {
  id: string;
  name: string;
  launch_code: string;
  status: "planning" | "active" | "closed";
}

const navigation = [
  { name: "Dashboard", icon: Home, href: "dashboard" },
  { name: "Leads", icon: Users, href: "leads" },
  { name: "Comunicação", icon: MessageSquare, href: "communication" },
  { name: "Analytics", icon: BarChart3, href: "analytics" },
  { name: "Configurações", icon: Settings, href: "settings" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-500";
    case "planning":
      return "bg-yellow-500";
    case "closed":
      return "bg-gray-500";
    default:
      return "bg-gray-400";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "active":
      return "Ativo";
    case "planning":
      return "Planejamento";
    case "closed":
      return "Encerrado";
    default:
      return status;
  }
};

interface LaunchLayoutProps {
  children: React.ReactNode;
  launchId: string;
}

export default function LaunchLayout({ children, launchId }: LaunchLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);

  const currentPage = location.pathname.split('/').pop() || 'dashboard';

  useEffect(() => {
    if (launchId) {
      fetchLaunch();
    }
  }, [launchId]);

  const fetchLaunch = async () => {
    try {
      const { data, error } = await supabase
        .from("launches")
        .select("id, name, launch_code, status")
        .eq("id", launchId)
        .single();

      if (error) throw error;
      setLaunch(data);
    } catch (error) {
      console.error("Erro ao buscar lançamento:", error);
      navigate("/launches");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!launch) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header do Lançamento */}
      <div className="border-b border-border pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/launches")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{launch.name}</h1>
              <div className="flex items-center space-x-3 mt-1">
                <p className="text-sm text-muted-foreground font-mono">
                  {launch.launch_code}
                </p>
                <Badge className={getStatusColor(launch.status)}>
                  {getStatusText(launch.status)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-navegação */}
        <nav className="flex space-x-1 mt-6">
          {navigation.map((item) => (
            <Button
              key={item.name}
              variant={currentPage === item.href ? "default" : "ghost"}
              size="sm"
              onClick={() => navigate(`/launch/${launchId}/${item.href}`)}
              className={cn(
                "flex items-center space-x-2",
                currentPage === item.href 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da página */}
      {children}
    </div>
  );
}