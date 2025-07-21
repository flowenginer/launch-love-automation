import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Zap, 
  DollarSign, 
  Mail, 
  MessageSquare, 
  Webhook,
  ArrowRight,
  CheckCircle,
  Circle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import hotmartLogo from "@/assets/integrations/hotmart.jpg";
import eduzzLogo from "@/assets/integrations/eduzz.jpg";
import monetizzeLogo from "@/assets/integrations/monetizze.jpg";
import activecampaignLogo from "@/assets/integrations/activecampaign.jpg";
import manychatLogo from "@/assets/integrations/manychat.jpg";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: any;
  logo?: string;
  status: 'active' | 'inactive';
  category: 'sales' | 'marketing' | 'automation' | 'generic';
}

interface WebhookIntegration {
  id: string;
  name: string;
  platform: string;
  permanent_webhook_id: string;
  is_active: boolean;
  created_at: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'hotmart',
    name: 'Hotmart',
    description: 'Receba automaticamente dados de vendas da Hotmart',
    icon: ShoppingCart,
    logo: hotmartLogo,
    status: 'inactive',
    category: 'sales'
  },
  {
    id: 'eduzz',
    name: 'Eduzz',
    description: 'Integre vendas e comissões da plataforma Eduzz',
    icon: Zap,
    logo: eduzzLogo,
    status: 'inactive',
    category: 'sales'
  },
  {
    id: 'monetizze',
    name: 'Monetizze',
    description: 'Conecte vendas e afiliados do Monetizze',
    icon: DollarSign,
    logo: monetizzeLogo,
    status: 'inactive',
    category: 'sales'
  },
  {
    id: 'activecampaign',
    name: 'ActiveCampaign',
    description: 'Sincronize contatos e automações de email',
    icon: Mail,
    logo: activecampaignLogo,
    status: 'inactive',
    category: 'marketing'
  },
  {
    id: 'manychat',
    name: 'Manychat',
    description: 'Integre automações de WhatsApp e Messenger',
    icon: MessageSquare,
    logo: manychatLogo,
    status: 'inactive',
    category: 'automation'
  },
  {
    id: 'webhook',
    name: 'Webhook Genérico',
    description: 'Configure webhook personalizado para qualquer plataforma',
    icon: Webhook,
    status: 'inactive',
    category: 'generic'
  }
];

export default function LaunchIntegrations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [activeIntegrations, setActiveIntegrations] = useState<WebhookIntegration[]>([]);

  useEffect(() => {
    if (id) {
      fetchActiveIntegrations();
    }
  }, [id]);

  const fetchActiveIntegrations = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('webhook_integrations')
      .select('*')
      .eq('launch_id', id);

    if (error) {
      console.error('Erro ao carregar integrações:', error);
      return;
    }

    setActiveIntegrations(data || []);
    
    // Atualizar status das integrações
    const updatedIntegrations = integrations.map(integration => {
      const isActive = data?.some(webhook => 
        webhook.platform?.toLowerCase() === integration.id && webhook.is_active
      );
      return {
        ...integration,
        status: isActive ? 'active' as const : 'inactive' as const
      };
    });
    
    setIntegrations(updatedIntegrations);
  };

  const handleIntegrationClick = (integrationId: string) => {
    navigate(`/launch/${id}/integrations/${integrationId}`);
  };

  const IntegrationCard = ({ integration }: { integration: Integration }) => {
    const Icon = integration.icon;
    const isActive = integration.status === 'active';

    return (
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 group"
        onClick={() => handleIntegrationClick(integration.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {integration.logo ? (
                <img 
                  src={integration.logo} 
                  alt={integration.name}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <div className="flex items-center space-x-2 mt-1">
                  {isActive ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      <Circle className="w-3 h-3 mr-1" />
                      Conectar
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {integration.description}
          </p>
        </CardContent>
      </Card>
    );
  };

  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const categoryTitles = {
    sales: '💰 Plataformas de Vendas',
    marketing: '📧 Marketing e E-mail',
    automation: '🤖 Automação',
    generic: '🔗 Webhooks Personalizados'
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground">
          Conecte suas plataformas favoritas e automatize seu fluxo de trabalho
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Integrações Ativas</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Circle className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-muted-foreground">Disponíveis</p>
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'inactive').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Webhook className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Webhooks Ativos</p>
                <p className="text-2xl font-bold">{activeIntegrations.filter(i => i.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Galeria de Integrações por Categoria */}
      <div className="space-y-8">
        {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4">
              {categoryTitles[category as keyof typeof categoryTitles]}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryIntegrations.map(integration => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Webhooks Ativos */}
      {activeIntegrations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Webhooks Configurados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeIntegrations.map(webhook => (
                <div key={webhook.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="font-medium">{webhook.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Plataforma: {webhook.platform || 'Genérico'}
                    </p>
                  </div>
                  <Badge className={webhook.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {webhook.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}