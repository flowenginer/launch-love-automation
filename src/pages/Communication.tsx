import { MessageSquare, Calendar, Send, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Communication = () => {
  const scheduledMessages = [
    {
      id: 1,
      title: "Mensagem de Boas-vindas",
      type: "text",
      group: "Grupo Principal",
      scheduledFor: "2024-01-20T09:00:00Z",
      status: "pending"
    },
    {
      id: 2,
      title: "Vídeo Explicativo",
      type: "video",
      group: "Grupo VIP",
      scheduledFor: "2024-01-19T15:30:00Z",
      status: "sent"
    }
  ];

  const copyBank = [
    {
      id: 1,
      title: "Copy de Abertura do Lançamento",
      type: "text",
      status: "approved",
      content: "🚀 LANÇAMENTO OFICIAL! Chegou a hora de transformar sua vida..."
    },
    {
      id: 2,
      title: "Imagem de Prova Social",
      type: "image",
      status: "review",
      content: "Depoimento de cliente satisfeito"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "sent": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "approved": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "review": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "draft": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Pendente";
      case "sent": return "Enviado";
      case "approved": return "Aprovado";
      case "review": return "Em Revisão";
      case "draft": return "Rascunho";
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />;
      case "image": return <MessageSquare className="h-4 w-4" />;
      case "video": return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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
              Comunicação
            </h1>
            <p className="text-muted-foreground">
              Gerencie mensagens, agendamentos e banco de conteúdo
            </p>
          </div>
          
          <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-md">
            <Send className="h-4 w-4 mr-2" />
            Nova Mensagem
          </Button>
        </div>

        <Tabs defaultValue="scheduled" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scheduled">Mensagens Agendadas</TabsTrigger>
            <TabsTrigger value="copy">Banco de Copy</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled" className="space-y-6">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>Mensagens Agendadas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledMessages.map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(message.type)}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{message.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {message.group} • {formatDate(message.scheduledFor)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(message.status)}>
                        {getStatusText(message.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copy" className="space-y-6">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Banco de Conteúdo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {copyBank.map((copy) => (
                    <div key={copy.id} className="flex items-start justify-between p-4 border border-border/50 rounded-lg">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          {getTypeIcon(copy.type)}
                        </div>
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{copy.title}</h4>
                            <Badge className={getStatusColor(copy.status)}>
                              {getStatusText(copy.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {copy.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Communication;