import { Settings as SettingsIcon, Smartphone, Database, Bell, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const Settings = () => {
  const whatsappInstances = [
    {
      id: 1,
      name: "Instância Principal",
      status: "connected",
      phone: "+55 11 99999-9999"
    },
    {
      id: 2,
      name: "Instância Backup",
      status: "disconnected",
      phone: "+55 11 88888-8888"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "disconnected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected": return "Conectado";
      case "disconnected": return "Desconectado";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Configure sua conta e integrações
        </p>
      </div>

        <Tabs defaultValue="whatsapp" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="integrations">Integrações</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="whatsapp" className="space-y-6">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    <span>Conexões WhatsApp</span>
                  </CardTitle>
                  <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-md">
                    Nova Conexão
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {whatsappInstances.map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Smartphone className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-medium">{instance.name}</h4>
                          <p className="text-sm text-muted-foreground">{instance.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(instance.status)}>
                          {getStatusText(instance.status)}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Configurar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span>Integrações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hotmart">Hotmart</Label>
                    <Switch id="hotmart" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hubla">Hubla</Label>
                    <Switch id="hubla" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="perfectpay">PerfectPay</Label>
                    <Switch id="perfectpay" />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input 
                    id="webhook-url" 
                    placeholder="https://sua-url.com/webhook"
                    value="https://lovable-saas.com/api/webhook/capture/CMD2024"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span>Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Novas vendas</Label>
                      <p className="text-sm text-muted-foreground">Receber notificação por email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Novos leads</Label>
                      <p className="text-sm text-muted-foreground">Receber notificação por email</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Relatórios semanais</Label>
                      <p className="text-sm text-muted-foreground">Relatório automático toda segunda-feira</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input id="current-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>

                <Button className="bg-gradient-primary hover:opacity-90 text-white shadow-md">
                  Alterar Senha
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
    </div>
  );
};

export default Settings;