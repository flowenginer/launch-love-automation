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

const navigation = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Leads", icon: Users, href: "/leads" },
  { name: "Copy", icon: MessageSquare, href: "/copy" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Configurações", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          <a
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed ? "justify-center" : "justify-start"
            )}
          >
            <item.icon className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">{item.name}</span>}
          </a>
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