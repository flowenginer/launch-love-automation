import { Rocket, Plus, Calendar, Target } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Launches = () => {
  const launches = [
    {
      id: 1,
      name: "Curso de Marketing Digital",
      code: "CMD2024",
      status: "active",
      leads: 1247,
      sales: 89,
      revenue: 47350
    },
    {
      id: 2,
      name: "Mentoria de Vendas",
      code: "MV2024",
      status: "planning",
      leads: 0,
      sales: 0,
      revenue: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "planning": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "closed": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active": return "Ativo";
      case "planning": return "Planejamento";
      case "closed": return "Finalizado";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header />
      
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Lançamentos
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus lançamentos de infoprodutos
            </p>
          </div>
          
          <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-md">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {launches.map((launch) => (
            <Card key={launch.id} className="gradient-card border-border/50 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center space-x-2">
                      <Rocket className="h-5 w-5 text-primary" />
                      <span>{launch.name}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Código: {launch.code}</p>
                  </div>
                  <Badge className={getStatusColor(launch.status)}>
                    {getStatusText(launch.status)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{launch.leads.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">{launch.sales}</p>
                    <p className="text-xs text-muted-foreground">Vendas</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-foreground">R$ {launch.revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Receita</p>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Analisar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Launches;