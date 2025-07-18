import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Users, 
  FileText, 
  Settings, 
  Zap,
  TrendingUp
} from "lucide-react";

const actions = [
  {
    title: "Conectar WhatsApp",
    description: "Configure sua instância do WhatsApp",
    icon: MessageSquare,
    action: "connect",
    variant: "default" as const
  },
  {
    title: "Importar Leads",
    description: "Adicione leads em massa via CSV",
    icon: Users,
    action: "import",
    variant: "secondary" as const
  },
  {
    title: "Criar Copy",
    description: "Novo conteúdo para campanhas",
    icon: FileText,
    action: "create-copy",
    variant: "secondary" as const
  },
  {
    title: "Ver Analytics",
    description: "Relatórios e métricas detalhadas",
    icon: TrendingUp,
    action: "analytics",
    variant: "secondary" as const
  },
];

export function QuickActions() {
  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-primary" />
          <span>Ações Rápidas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.action}
              variant={action.variant}
              className="h-auto p-4 justify-start text-left hover:shadow-sm transition-all"
            >
              <div className="flex items-start space-x-3 w-full">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}