import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Users, DollarSign, Target, ShoppingCart } from "lucide-react";

interface AnalyticsData {
  visitors: number;
  leads: number;
  leadsInGroup: number;
  buyers: number;
  totalRevenue: number;
  conversionRate: number;
  groupConversionRate: number;
  salesConversionRate: number;
}

interface UtmPerformance {
  source: string;
  medium: string;
  campaign: string;
  leads: number;
  buyers: number;
  conversionRate: number;
  revenue: number;
}

export default function LaunchAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    visitors: 0,
    leads: 0,
    leadsInGroup: 0,
    buyers: 0,
    totalRevenue: 0,
    conversionRate: 0,
    groupConversionRate: 0,
    salesConversionRate: 0,
  });
  const [utmData, setUtmData] = useState<UtmPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAnalytics();
    }
  }, [id]);

  const fetchAnalytics = async () => {
    if (!id) return;

    setLoading(true);

    try {
      // Fetch basic metrics
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('*')
        .eq('launch_id', id);

      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .eq('launch_id', id)
        .eq('status', 'paid');

      if (leadsError || salesError) {
        console.error('Error fetching analytics:', leadsError || salesError);
        return;
      }

      const totalLeads = leads?.length || 0;
      const leadsInGroup = leads?.filter(lead => 
        lead.tags && Array.isArray(lead.tags) && lead.tags.includes('in_whatsapp_group')
      ).length || 0;
      const totalBuyers = sales?.length || 0;
      const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.amount_cents || 0), 0) || 0;

      // Calculate conversion rates
      const groupConversionRate = totalLeads > 0 ? (leadsInGroup / totalLeads) * 100 : 0;
      const salesConversionRate = totalLeads > 0 ? (totalBuyers / totalLeads) * 100 : 0;

      setAnalytics({
        visitors: totalLeads * 3, // Estimated visitors (assuming 33% conversion rate)
        leads: totalLeads,
        leadsInGroup,
        buyers: totalBuyers,
        totalRevenue: totalRevenue / 100, // Convert from cents to reais
        conversionRate: totalLeads > 0 ? (totalLeads / (totalLeads * 3)) * 100 : 0,
        groupConversionRate,
        salesConversionRate,
      });

      // Fetch UTM performance data
      await fetchUtmPerformance(leads || [], sales || []);

    } catch (error) {
      console.error('Error in fetchAnalytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUtmPerformance = async (leads: any[], sales: any[]) => {
    // Group leads by UTM parameters
    const utmGroups: { [key: string]: { leads: any[], sales: any[] } } = {};

    leads.forEach(lead => {
      if (lead.metadata && typeof lead.metadata === 'object') {
        const source = lead.metadata.utm_source || 'Direto';
        const medium = lead.metadata.utm_medium || 'Sem medium';
        const campaign = lead.metadata.utm_campaign || 'Sem campanha';
        const key = `${source}-${medium}-${campaign}`;

        if (!utmGroups[key]) {
          utmGroups[key] = { leads: [], sales: [] };
        }
        utmGroups[key].leads.push(lead);
      }
    });

    // Match sales with leads
    sales.forEach(sale => {
      const matchingLead = leads.find(lead => lead.email === sale.lead_id);
      if (matchingLead && matchingLead.metadata) {
        const source = matchingLead.metadata.utm_source || 'Direto';
        const medium = matchingLead.metadata.utm_medium || 'Sem medium';
        const campaign = matchingLead.metadata.utm_campaign || 'Sem campanha';
        const key = `${source}-${medium}-${campaign}`;

        if (utmGroups[key]) {
          utmGroups[key].sales.push(sale);
        }
      }
    });

    // Convert to array format
    const utmPerformance = Object.entries(utmGroups).map(([key, data]) => {
      const [source, medium, campaign] = key.split('-');
      const leadsCount = data.leads.length;
      const buyersCount = data.sales.length;
      const revenue = data.sales.reduce((sum, sale) => sum + (sale.amount_cents || 0), 0) / 100;
      const conversionRate = leadsCount > 0 ? (buyersCount / leadsCount) * 100 : 0;

      return {
        source,
        medium,
        campaign,
        leads: leadsCount,
        buyers: buyersCount,
        conversionRate,
        revenue,
      };
    }).sort((a, b) => b.leads - a.leads);

    setUtmData(utmPerformance);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Inteligência de negócio do seu lançamento
        </p>
      </div>

      {/* Funil de Conversão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Funil de Conversão
          </CardTitle>
          <CardDescription>
            Acompanhe a jornada dos seus visitantes até a conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Visitantes */}
            <div className="text-center">
              <div className="bg-blue-100 p-4 rounded-lg mb-2">
                <Users className="h-8 w-8 text-blue-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg">{analytics.visitors.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Visitantes</p>
              <Progress value={100} className="mt-2" />
              <span className="text-xs text-muted-foreground">100%</span>
            </div>

            {/* Leads */}
            <div className="text-center">
              <div className="bg-green-100 p-4 rounded-lg mb-2">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg">{analytics.leads.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Leads Capturados</p>
              <Progress value={analytics.conversionRate} className="mt-2" />
              <span className="text-xs text-muted-foreground">{analytics.conversionRate.toFixed(1)}%</span>
            </div>

            {/* Leads no Grupo */}
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-lg mb-2">
                <Users className="h-8 w-8 text-yellow-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg">{analytics.leadsInGroup.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Leads no Grupo</p>
              <Progress value={analytics.groupConversionRate} className="mt-2" />
              <span className="text-xs text-muted-foreground">{analytics.groupConversionRate.toFixed(1)}%</span>
            </div>

            {/* Compradores */}
            <div className="text-center">
              <div className="bg-purple-100 p-4 rounded-lg mb-2">
                <ShoppingCart className="h-8 w-8 text-purple-600 mx-auto" />
              </div>
              <h3 className="font-semibold text-lg">{analytics.buyers.toLocaleString()}</h3>
              <p className="text-sm text-muted-foreground">Compradores</p>
              <Progress value={analytics.salesConversionRate} className="mt-2" />
              <span className="text-xs text-muted-foreground">{analytics.salesConversionRate.toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="bg-gradient-primary text-white p-4 rounded-lg inline-block">
              <DollarSign className="h-6 w-6 inline mr-2" />
              <span className="text-lg font-semibold">
                Faturamento Total: {formatCurrency(analytics.totalRevenue)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance por Origem */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Origem</CardTitle>
          <CardDescription>
            Análise detalhada por UTM source, medium e campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Origem</th>
                  <th className="text-left p-2">Medium</th>
                  <th className="text-left p-2">Campanha</th>
                  <th className="text-right p-2">Leads</th>
                  <th className="text-right p-2">Compradores</th>
                  <th className="text-right p-2">Taxa de Conversão</th>
                  <th className="text-right p-2">Faturamento</th>
                </tr>
              </thead>
              <tbody>
                {utmData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{item.source}</td>
                    <td className="p-2">{item.medium}</td>
                    <td className="p-2">{item.campaign}</td>
                    <td className="p-2 text-right">{item.leads}</td>
                    <td className="p-2 text-right">{item.buyers}</td>
                    <td className="p-2 text-right">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        item.conversionRate >= 5 
                          ? 'bg-green-100 text-green-800' 
                          : item.conversionRate >= 2 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.conversionRate >= 5 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {item.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2 text-right font-semibold">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))}
                {utmData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum dado de UTM encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}