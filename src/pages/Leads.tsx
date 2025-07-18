import { Users, Search, Filter, Download } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Leads = () => {
  const leads = [
    {
      id: 1,
      name: "Ana Silva",
      email: "ana.silva@email.com",
      phone: "(11) 99999-9999",
      source: "Facebook Ads",
      tags: ["Interessado", "WhatsApp"],
      createdAt: "2024-01-15T10:30:00Z"
    },
    {
      id: 2,
      name: "Carlos Santos",
      email: "carlos.santos@email.com",
      phone: "(21) 88888-8888",
      source: "Google Ads",
      tags: ["Quente", "E-mail"],
      createdAt: "2024-01-14T15:45:00Z"
    },
    {
      id: 3,
      name: "Maria Oliveira",
      email: "maria.oliveira@email.com",
      phone: "(31) 77777-7777",
      source: "Indicação",
      tags: ["VIP", "WhatsApp"],
      createdAt: "2024-01-13T09:15:00Z"
    }
  ];

  const getTagColor = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "quente": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "interessado": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "vip": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "whatsapp": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "e-mail": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header />
      
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Leads
            </h1>
            <p className="text-muted-foreground">
              Gerencie e acompanhe todos os seus leads
            </p>
          </div>
          
          <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-md">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Filtros e Busca</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  className="w-full"
                />
              </div>
              <Button variant="outline">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Lista de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{lead.email}</div>
                        <div className="text-xs text-muted-foreground">{lead.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{lead.source}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {lead.tags.map((tag, index) => (
                          <Badge key={index} className={getTagColor(tag)}>
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Leads;