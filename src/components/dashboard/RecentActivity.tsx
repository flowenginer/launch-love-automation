import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  User, 
  MessageCircle, 
  CreditCard,
  Clock
} from "lucide-react";

const activities = [
  {
    id: 1,
    type: "lead",
    title: "Novo lead capturado",
    description: "João Silva se inscreveu via landing page",
    time: "2 min atrás",
    icon: User,
    status: "success"
  },
  {
    id: 2,
    type: "sale",
    title: "Venda realizada",
    description: "Maria Santos - R$ 497,00",
    time: "15 min atrás",
    icon: CreditCard,
    status: "success"
  },
  {
    id: 3,
    type: "message",
    title: "Mensagem enviada",
    description: "Copy 'Oferta Especial' para 1.234 contatos",
    time: "1h atrás",
    icon: MessageCircle,
    status: "info"
  },
  {
    id: 4,
    type: "lead",
    title: "Lead qualificado",
    description: "Pedro Costa marcado como 'Hot Lead'",
    time: "2h atrás",
    icon: User,
    status: "warning"
  },
  {
    id: 5,
    type: "system",
    title: "Backup concluído",
    description: "Dados sincronizados com sucesso",
    time: "3h atrás",
    icon: Clock,
    status: "info"
  }
];

const statusColors = {
  success: "bg-success/10 text-success border-success/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-accent/10 text-accent border-accent/20"
};

export function RecentActivity() {
  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Atividade Recente</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <activity.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-foreground">
                    {activity.title}
                  </p>
                  <Badge variant="outline" className={statusColors[activity.status as keyof typeof statusColors]}>
                    {activity.time}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}