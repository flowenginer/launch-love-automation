"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LaunchLayout from "./LaunchLayout";

interface DashboardMetrics {
  totalLeads: number;
  leadsInGroups: number;
  groupConversionRate: number;
  approvedSales: number;
  totalRevenue: number;
}

export default function LaunchDashboard() {
  const { id: launchId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    leadsInGroups: 0,
    groupConversionRate: 0,
    approvedSales: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (launchId) {
      fetchDashboardMetrics();
    }
  }, [launchId]);

  const fetchDashboardMetrics = async () => {
    try {
      // Buscar leads totais
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id, tags")
        .eq("launch_id", launchId);

      if (leadsError) throw leadsError;

      // Buscar vendas aprovadas
      const { data: salesData, error: salesError } = await supabase
        .from("sales")
        .select("id, amount_cents, status")
        .eq("launch_id", launchId);

      if (salesError) throw salesError;

      const totalLeads = leadsData?.length || 0;
      
      // Contar leads nos grupos (com tag in_whatsapp_group)
      const leadsInGroups = leadsData?.filter(lead => 
        lead.tags && Array.isArray(lead.tags) && lead.tags.includes("in_whatsapp_group")
      ).length || 0;

      // Calcular taxa de conversão para grupo
      const groupConversionRate = totalLeads > 0 ? (leadsInGroups / totalLeads) * 100 : 0;

      // Contar vendas aprovadas
      const approvedSales = salesData?.filter(sale => sale.status === "paid").length || 0;

      // Calcular faturamento total
      const totalRevenue = salesData?.reduce((sum, sale) => 
        sale.status === "paid" ? sum + (sale.amount_cents || 0) : sum, 0) || 0;

      setMetrics({
        totalLeads,
        leadsInGroups,
        groupConversionRate,
        approvedSales,
        totalRevenue,
      });
    } catch (error) {
      console.error("Erro ao buscar métricas:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar métricas do dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  const cards = [
    {
      title: "Leads Capturados",
      value: metrics.totalLeads.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Leads nos Grupos",
      value: metrics.leadsInGroups.toLocaleString(),
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Taxa de Conversão para Grupo",
      value: `${metrics.groupConversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Vendas Aprovadas",
      value: metrics.approvedSales.toLocaleString(),
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Faturamento",
      value: `R$ ${(metrics.totalRevenue / 100).toLocaleString('pt-BR', {
        minimumFractionDigits: 2
      })}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground">
            Acompanhe os KPIs vitais do seu lançamento em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <Card key={index} className="border border-border">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {card.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Área para gráficos futuros */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Leads vs. Vendas por Dia</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
              Gráfico em desenvolvimento
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feed de Vendas ao Vivo</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
              Feed em desenvolvimento
            </CardContent>
          </Card>
        </div>
      </div>
    );
}