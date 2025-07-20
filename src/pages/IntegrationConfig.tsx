import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Copy,
  CheckCircle,
  Settings,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IntegrationConfig {
  name: string;
  platform: string;
  description: string;
  instructions: string[];
  fieldMappings: Record<string, any>;
}

const INTEGRATION_CONFIGS: Record<string, IntegrationConfig> = {
  hotmart: {
    name: "Hotmart",
    platform: "hotmart",
    description: "Ative esta integração para receber automaticamente os dados de suas vendas (compras aprovadas, boletos gerados, etc.) da Hotmart diretamente no seu CRM.",
    instructions: [
      "1. Acesse sua conta da Hotmart",
      "2. Vá em Configurações > Postback/Webhook",
      "3. Cole a URL do webhook gerada abaixo",
      "4. Selecione os eventos que deseja receber",
      "5. Salve as configurações"
    ],
    fieldMappings: {
      email: "buyer_email",
      name: "buyer_name", 
      amount: "price",
      product: "prod_name",
      status: "status",
      transaction_id: "transaction"
    }
  },
  eduzz: {
    name: "Eduzz",
    platform: "eduzz",
    description: "Conecte sua conta Eduzz para receber dados de vendas, comissões e conversões automaticamente.",
    instructions: [
      "1. Acesse o painel do Eduzz",
      "2. Vá em Integrações > Webhooks",
      "3. Crie um novo webhook",
      "4. Cole a URL gerada abaixo",
      "5. Configure os eventos desejados",
      "6. Ative o webhook"
    ],
    fieldMappings: {
      email: "cliente_email",
      name: "cliente_nome",
      amount: "valor_produto",
      product: "nome_produto",
      status: "situacao",
      transaction_id: "codigo_transacao"
    }
  },
  monetizze: {
    name: "Monetizze",
    platform: "monetizze",
    description: "Integre com o Monetizze para automatizar o recebimento de dados de vendas e afiliados.",
    instructions: [
      "1. Entre no painel do Monetizze",
      "2. Vá em Ferramentas > Postbacks",
      "3. Adicione um novo postback",
      "4. Cole a URL do webhook",
      "5. Configure os eventos de venda",
      "6. Salve as configurações"
    ],
    fieldMappings: {
      email: "email",
      name: "nome",
      amount: "valor",
      product: "produto",
      status: "status",
      transaction_id: "transacao_id"
    }
  },
  activecampaign: {
    name: "ActiveCampaign",
    platform: "activecampaign",
    description: "Sincronize contatos e automações entre o ActiveCampaign e sua base de leads.",
    instructions: [
      "1. Acesse sua conta ActiveCampaign",
      "2. Vá em Settings > Integrations",
      "3. Procure por 'Webhooks'",
      "4. Adicione a URL do webhook",
      "5. Configure os eventos de contato",
      "6. Teste a integração"
    ],
    fieldMappings: {
      email: "contact[email]",
      name: "contact[name]",
      tags: "contact[tags]",
      custom_fields: "contact[fields]"
    }
  },
  manychat: {
    name: "Manychat",
    platform: "manychat",
    description: "Conecte automações do Manychat para capturar leads do WhatsApp e Messenger.",
    instructions: [
      "1. Abra o Manychat",
      "2. Vá em Settings > Integrations",
      "3. Procure por 'External Request'",
      "4. Cole a URL do webhook",
      "5. Configure os dados a enviar",
      "6. Teste a conexão"
    ],
    fieldMappings: {
      email: "user_email",
      name: "user_name",
      phone: "user_phone",
      source: "source",
      message: "last_message"
    }
  },
  webhook: {
    name: "Webhook Genérico",
    platform: "generic",
    description: "Configure um webhook personalizado para capturar dados de qualquer plataforma ou formulário.",
    instructions: [
      "1. Use a URL gerada abaixo na sua plataforma",
      "2. Configure o método POST",
      "3. Envie dados em formato JSON",
      "4. Teste enviando dados de exemplo",
      "5. Configure o mapeamento de campos se necessário"
    ],
    fieldMappings: {}
  }
};

export default function IntegrationConfig() {
  const { id, integrationId } = useParams<{ id: string; integrationId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [integrationName, setIntegrationName] = useState("");

  const config = integrationId ? INTEGRATION_CONFIGS[integrationId] : null;

  useEffect(() => {
    if (id && integrationId) {
      checkExistingIntegration();
    }
  }, [id, integrationId]);

  const checkExistingIntegration = async () => {
    if (!id || !integrationId) return;

    const { data, error } = await supabase
      .from('webhook_integrations')
      .select('*')
      .eq('launch_id', id)
      .eq('platform', integrationId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar integração:', error);
      return;
    }

    if (data) {
      setWebhookUrl(`https://tivqenmrdcuubqrhvsjo.supabase.co/functions/v1/webhook-capture/${data.permanent_webhook_id}`);
      setIsActive(data.is_active);
      setIntegrationName(data.name);
    }
  };

  const activateIntegration = async () => {
    if (!id || !integrationId || !config) return;

    setLoading(true);

    try {
      // Gerar ID único para o webhook
      const permanentWebhookId = crypto.randomUUID();
      
      const integrationData = {
        launch_id: id,
        name: integrationName || `${config.name} Integration`,
        platform: integrationId,
        permanent_webhook_id: permanentWebhookId,
        field_mappings: config.fieldMappings,
        is_active: true
      };

      const { error } = await supabase
        .from('webhook_integrations')
        .insert(integrationData);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao ativar integração",
          variant: "destructive",
        });
        return;
      }

      const generatedUrl = `https://tivqenmrdcuubqrhvsjo.supabase.co/functions/v1/webhook-capture/${permanentWebhookId}`;
      setWebhookUrl(generatedUrl);
      setIsActive(true);

      toast({
        title: "Sucesso",
        description: "Integração ativada com sucesso!",
      });

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao ativar integração",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copiado!",
      description: "URL do webhook copiada para a área de transferência",
    });
  };

  if (!config) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate(`/launch/${id}/integrations`)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Integrações
        </Button>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Integração não encontrada</h2>
            <p className="text-muted-foreground">A integração solicitada não existe.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate(`/launch/${id}/integrations`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Conectar com {config.name}</h1>
          <p className="text-muted-foreground">
            {config.description}
          </p>
        </div>
      </div>

      {/* Status da Integração */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Status da Integração</span>
            </CardTitle>
            <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {isActive ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ativo
                </>
              ) : (
                "Inativo"
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!isActive ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration-name">Nome da Integração</Label>
                <Input
                  id="integration-name"
                  value={integrationName}
                  onChange={(e) => setIntegrationName(e.target.value)}
                  placeholder={`${config.name} Integration`}
                />
              </div>
              <Button 
                onClick={activateIntegration}
                disabled={loading}
                className="bg-gradient-primary hover:opacity-90 text-white"
              >
                {loading ? "Ativando..." : "Ativar Integração e Gerar Webhook"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>URL do Webhook</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Input 
                    value={webhookUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Integração ativada! Use a URL acima na sua plataforma.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Configurar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {config.instructions.map((instruction, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mapeamento de Campos */}
      {Object.keys(config.fieldMappings).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mapeamento de Campos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(config.fieldMappings).map(([field, mapping]) => (
                <div key={field} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <span className="font-medium capitalize">{field.replace('_', ' ')}</span>
                  <code className="text-sm bg-background px-2 py-1 rounded">{mapping}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentação */}
      <Card>
        <CardHeader>
          <CardTitle>Documentação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Para mais informações sobre como configurar webhooks na {config.name}, 
              consulte a documentação oficial da plataforma.
            </p>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Documentação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}