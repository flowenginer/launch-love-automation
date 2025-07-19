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
import { useWorkspace } from "@/hooks/useWorkspace";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DashboardMetrics {
  totalLeads: number;
  totalRevenue: number;
  conversionRate: number;
  messagesSent: number;
}

const Index = () => {
  const { selectedLaunch, loading } = useWorkspace();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    totalRevenue: 0,
    conversionRate: 0,
    messagesSent: 0
  });
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    if (selectedLaunch) {
      fetchMetrics();
    }
  }, [selectedLaunch]);

  const fetchMetrics = async () => {
    if (!selectedLaunch) return;
    
    setLoadingMetrics(true);
    try {
      // Fetch leads count
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('launch_id', selectedLaunch.id);

      // Fetch sales data
      const { data: salesData } = await supabase
        .from('sales')
        .select('amount_cents, status')
        .eq('launch_id', selectedLaunch.id);

      const paidSales = salesData?.filter(sale => sale.status === 'paid') || [];
      const totalRevenue = paidSales.reduce((sum, sale) => sum + (sale.amount_cents || 0), 0);
      const conversionRate = leadsCount && leadsCount > 0 ? (paidSales.length / leadsCount) * 100 : 0;

      // Fetch copy assets IDs for this launch
      const { data: copyAssets } = await supabase
        .from('copy_assets')
        .select('id')
        .eq('launch_id', selectedLaunch.id);

      const copyAssetIds = copyAssets?.map(asset => asset.id) || [];

      // Fetch scheduled messages count
      const { count: messagesCount } = await supabase
        .from('scheduled_messages')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'sent')
        .in('copy_asset_id', copyAssetIds);

      setMetrics({
        totalLeads: leadsCount || 0,
        totalRevenue: totalRevenue / 100, // Convert from cents
        conversionRate: conversionRate,
        messagesSent: messagesCount || 0
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

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
                {selectedLaunch && (
                  <span className="text-lg font-normal text-muted-foreground ml-2">
                    - {selectedLaunch.name}
                  </span>
                )}
              </h1>
              <p className="text-muted-foreground">
                {selectedLaunch 
                  ? "Acompanhe o desempenho do seu lançamento em tempo real"
                  : "Crie seu primeiro lançamento para começar"
                }
              </p>
            </div>

            {selectedLaunch ? (
              <>
                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total de Leads"
                    value={loadingMetrics ? "..." : metrics.totalLeads.toLocaleString()}
                    description="Capturados"
                    icon={Users}
                    trend={{ value: 0, label: "vs período anterior", positive: true }}
                  />
                  <MetricCard
                    title="Vendas"
                    value={loadingMetrics ? "..." : formatCurrency(metrics.totalRevenue)}
                    description="Receita total"
                    icon={CreditCard}
                    trend={{ value: 0, label: "vs período anterior", positive: true }}
                  />
                  <MetricCard
                    title="Taxa de Conversão"
                    value={loadingMetrics ? "..." : `${metrics.conversionRate.toFixed(1)}%`}
                    description="Lead para venda"
                    icon={Target}
                    trend={{ value: 0, label: "vs período anterior", positive: true }}
                  />
                  <MetricCard
                    title="Mensagens Enviadas"
                    value={loadingMetrics ? "..." : metrics.messagesSent.toLocaleString()}
                    description="Via WhatsApp"
                    icon={MessageSquare}
                    trend={{ value: 0, label: "vs período anterior", positive: true }}
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
              </>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum lançamento selecionado</h3>
                  <p className="text-muted-foreground">
                    Crie ou selecione um lançamento para ver as métricas
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
