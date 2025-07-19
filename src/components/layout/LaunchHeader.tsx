import { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useNavigate } from "react-router-dom";

interface LaunchHeaderProps {
  currentLaunchId: string;
}

export function LaunchHeader({ currentLaunchId }: LaunchHeaderProps) {
  const { launches, selectedLaunch, setSelectedLaunch } = useWorkspace();
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, message: "A copy 'E-mail de Boas-Vindas' foi enviada para aprovação.", read: false },
    { id: 2, message: "Nova venda recebida via Hotmart", read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLaunchChange = (launchId: string) => {
    const launch = launches.find(l => l.id === launchId);
    if (launch) {
      setSelectedLaunch(launch);
      navigate(`/launch/${launchId}/dashboard`);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background px-6 flex items-center justify-between">
      {/* Seletor de Contexto de Lançamento */}
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="min-w-[200px] justify-between">
              <span className="truncate">
                {selectedLaunch?.name || "Selecionar Lançamento"}
              </span>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {launches.map((launch) => (
              <DropdownMenuItem
                key={launch.id}
                onClick={() => handleLaunchChange(launch.id)}
                className={currentLaunchId === launch.id ? "bg-accent" : ""}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{launch.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {launch.launch_code} • {launch.status}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Centro de Notificações */}
      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-3 border-b">
              <h3 className="font-medium">Notificações</h3>
            </div>
            {notifications.length > 0 ? (
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="p-3 flex flex-col items-start space-y-1"
                  >
                    <span className="text-sm">{notification.message}</span>
                    {!notification.read && (
                      <Badge variant="secondary" className="text-xs">
                        Nova
                      </Badge>
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-muted-foreground">
                Nenhuma notificação
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}