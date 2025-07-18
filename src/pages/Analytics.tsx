import { BarChart3, TrendingUp, PieChart, Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header />
      
      <main className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho dos seus lançamentos
          </p>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Taxa de Conversão"
            value="3.8%"
            description="Lead para venda"
            icon={TrendingUp}
            trend={{ value: -2.1, label: "vs mês anterior", positive: false }}
          />
          <MetricCard
            title="Ticket Médio"
            value="R$ 532"
            description="Por venda"
            icon={BarChart3}
            trend={{ value: 15.3, label: "vs mês anterior", positive: true }}
          />
          <MetricCard
            title="ROI Campanhas"
            value="287%"
            description="Retorno sobre investimento"
            icon={PieChart}
            trend={{ value: 43.2, label: "vs mês anterior", positive: true }}
          />
          <MetricCard
            title="Lifetime Value"
            value="R$ 1.247"
            description="Valor por cliente"
            icon={Calendar}
            trend={{ value: 8.7, label: "vs mês anterior", positive: true }}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Funil de Vendas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráfico do funil de vendas (será implementado)
              </div>
            </CardContent>
          </Card>

          <Card className="gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Evolução de Leads</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Gráfico de evolução de leads (será implementado)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análise por Fonte */}
        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5 text-primary" />
              <span>Performance por Fonte de Tráfego</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              Análise detalhada por fonte de tráfego (será implementado)
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;