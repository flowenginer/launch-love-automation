import { useState } from "react";
import { 
  BarChart3, 
  MessageSquare, 
  Users, 
  Rocket, 
  Settings, 
  Home,
  PlusCircle,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation, useParams } from "react-router-dom";
import { useCopyNotifications } from "@/hooks/useCopyNotifications";

const navigation = [
  { name: "Dashboard", icon: Home, href: "dashboard" },
  { name: "Leads", icon: Users, href: "leads" },
  { name: "Copy", icon: MessageSquare, href: "copy" },
  { name: "Links", icon: Rocket, href: "links" },
  { name: "Integrações", icon: PlusCircle, href: "integrations" },
  { name: "Whats-On", icon: MessageSquare, href: "whats-on" },
  { name: "Equipe", icon: Users, href: "team" },
  { name: "Lançamentos", icon: Rocket, href: "launches" },
  { name: "Analytics", icon: BarChart3, href: "analytics" },
  { name: "Configurações", icon: Settings, href: "settings" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { id } = useParams();
  const { count } = useCopyNotifications(id);
  
  const isActivePage = (href: string) => {
    return location.pathname.includes(`/${href}`);
  };

  const handleNavigate = (href: string) => {
    if (id) {
      window.location.href = `/launch/${id}/${href}`;
    }
  };

  const renderNotificationIndicators = (itemName: string) => {
    if (itemName !== "Copy" || (count.email === 0 && count.whatsapp === 0)) return null;

    return (
      <div className="flex gap-1 ml-auto">
        {count.email > 0 && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title={`${count.email} email(s) em revisão`} />
        )}
        {count.whatsapp > 0 && (
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title={`${count.whatsapp} whatsapp em revisão`} />
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">LOVABLE</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* New Launch Button */}
      <div className="p-4">
        <Button 
          className={cn(
            "w-full bg-gradient-primary hover:opacity-90 text-white shadow-md",
            isCollapsed && "px-2"
          )}
        >
          <PlusCircle className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Novo Lançamento</span>}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavigate(item.href)}
            className={cn(
              "w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors relative",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActivePage(item.href) && "bg-sidebar-accent text-sidebar-accent-foreground",
              isCollapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center">
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
            </div>
            {!isCollapsed && renderNotificationIndicators(item.name)}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
              U
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                Usuário
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                usuario@email.com
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}