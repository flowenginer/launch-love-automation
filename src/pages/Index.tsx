import { 
  Users, 
  CreditCard, 
  MessageSquare, 
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1">
          <Header />
          
          <main className="p-6 space-y-6">
            {/* Welcome Section */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                Acompanhe o desempenho dos seus lançamentos em tempo real
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total de Leads"
                value="1,247"
                description="Este mês"
                icon={Users}
                trend={{ value: 12.5, label: "vs mês anterior", positive: true }}
              />
              <MetricCard
                title="Vendas"
                value="R$ 47.350"
                description="Receita total"
                icon={CreditCard}
                trend={{ value: 8.2, label: "vs mês anterior", positive: true }}
              />
              <MetricCard
                title="Taxa de Conversão"
                value="3.8%"
                description="Lead para venda"
                icon={Target}
                trend={{ value: -2.1, label: "vs mês anterior", positive: false }}
              />
              <MetricCard
                title="Mensagens Enviadas"
                value="12.5K"
                description="Esta semana"
                icon={MessageSquare}
                trend={{ value: 24.8, label: "vs semana anterior", positive: true }}
              />
            </div>

            {/* Chart Section */}
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Performance do Lançamento</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Gráfico de performance (será implementado com recharts)
                </div>
              </CardContent>
            </Card>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickActions />
              <RecentActivity />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
