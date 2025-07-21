import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Target, ThumbsUp, ShoppingCart, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CampaignLink {
  id: string;
  title: string;
  purpose: string;
  destination_url: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  generated_url: string;
  created_at: string;
}

const PURPOSE_OPTIONS = [
  { value: 'landing', label: '🎯 Página de Captura', icon: Target },
  { value: 'thank_you', label: '🙏 Página de Obrigado', icon: ThumbsUp },
  { value: 'sales', label: '📺 Página de Vendas', icon: Gift },
  { value: 'checkout', label: '🛒 URL de Check-out', icon: ShoppingCart },
];

const UTM_SOURCES = [
  { value: 'facebook', label: 'Facebook', mediums: ['cpc', 'stories', 'post', 'bio'] },
  { value: 'instagram', label: 'Instagram', mediums: ['cpc', 'stories', 'post', 'bio'] },
  { value: 'youtube', label: 'YouTube', mediums: ['video', 'community', 'shorts'] },
  { value: 'whatsapp', label: 'WhatsApp', mediums: ['status', 'message', 'group'] },
  { value: 'email', label: 'E-mail', mediums: ['newsletter', 'sequence', 'broadcast'] },
  { value: 'google', label: 'Google Ads', mediums: ['cpc', 'display', 'search'] },
  { value: 'direct', label: 'Direto', mediums: ['none'] },
];

export default function LaunchLinks() {
  const { id } = useParams<{ id: string }>();
  const [links, setLinks] = useState<CampaignLink[]>([]);
  const [launch, setLaunch] = useState<any>(null);
  const { toast } = useToast();

  // Form state
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    destinationUrl: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: ''
  });
  const [generatedUrl, setGeneratedUrl] = useState('');

  useEffect(() => {
    if (id) {
      fetchLaunch();
      fetchLinks();
    }
  }, [id]);

  // Atualizar URL gerada em tempo real
  useEffect(() => {
    if (formData.destinationUrl && formData.utmSource && formData.utmCampaign) {
      generateUrl();
    }
  }, [formData]);

  const fetchLaunch = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from('launches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao carregar lançamento:', error);
      return;
    }

    setLaunch(data);
    // Pré-preencher campanha com código do lançamento
    setFormData(prev => ({
      ...prev,
      utmCampaign: data.launch_code + '_'
    }));
  };

  const fetchLinks = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('campaign_links')
      .select('*')
      .eq('launch_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao carregar links:', error);
      return;
    }

    setLinks(data || []);
  };

  const generateUrl = () => {
    const url = new URL(formData.destinationUrl);
    
    // Adicionar parâmetros UTM
    url.searchParams.set('utm_source', formData.utmSource);
    if (formData.utmMedium) url.searchParams.set('utm_medium', formData.utmMedium);
    if (formData.utmCampaign) url.searchParams.set('utm_campaign', formData.utmCampaign);
    if (formData.utmContent) url.searchParams.set('utm_content', formData.utmContent);
    if (formData.utmTerm) url.searchParams.set('utm_term', formData.utmTerm);

    setGeneratedUrl(url.toString());
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência",
    });
  };

  const saveLink = async () => {
    if (!id || !formData.title || !generatedUrl) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('campaign_links')
        .insert({
          launch_id: id,
          title: formData.title,
          purpose: formData.purpose,
          destination_url: formData.destinationUrl,
          utm_source: formData.utmSource,
          utm_medium: formData.utmMedium || null,
          utm_campaign: formData.utmCampaign,
          utm_content: formData.utmContent || null,
          utm_term: formData.utmTerm || null,
          generated_url: generatedUrl
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Link salvo com sucesso!",
      });

      // Reset form
      setFormData({
        title: '',
        purpose: '',
        destinationUrl: '',
        utmSource: '',
        utmMedium: '',
        utmCampaign: launch?.launch_code + '_' || '',
        utmContent: '',
        utmTerm: ''
      });
      setGeneratedUrl('');
      setStep(1);
      fetchLinks();
    } catch (error) {
      console.error('Error saving link:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar link: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const getPurposeIcon = (purpose: string) => {
    const option = PURPOSE_OPTIONS.find(opt => opt.value === purpose);
    return option?.icon || Target;
  };

  const getPurposeLabel = (purpose: string) => {
    const option = PURPOSE_OPTIONS.find(opt => opt.value === purpose);
    return option?.label || purpose;
  };

  const getAvailableMediums = () => {
    const source = UTM_SOURCES.find(s => s.value === formData.utmSource);
    return source?.mediums || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Links de Campanha</h1>
        <p className="text-muted-foreground">
          Crie links inteligentes com rastreamento de funil completo
        </p>
      </div>

      {/* Assistente de Criação */}
      <Card>
        <CardHeader>
          <CardTitle>Assistente de Criação de Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Passo 1: Propósito */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                1
              </div>
              <Label className="text-lg font-semibold">Qual é o Propósito deste Link?</Label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PURPOSE_OPTIONS.map(purpose => {
                const Icon = purpose.icon;
                return (
                  <Card 
                    key={purpose.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formData.purpose === purpose.value ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, purpose: purpose.value }))}
                  >
                    <CardContent className="p-4 text-center">
                      <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-sm font-medium">{purpose.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Passo 2: URL de Destino */}
          {formData.purpose && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  2
                </div>
                <Label className="text-lg font-semibold">Qual a URL de Destino?</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Nome do Link</Label>
                <Input
                  id="title"
                  placeholder="Ex: Landing Page Principal"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL de Destino</Label>
                <Input
                  id="url"
                  placeholder="https://exemplo.com/pagina"
                  value={formData.destinationUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, destinationUrl: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Passo 3: UTMs */}
          {formData.destinationUrl && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  3
                </div>
                <Label className="text-lg font-semibold">De Onde Vem o Tráfego? (UTMs)</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fonte do Tráfego</Label>
                  <Select value={formData.utmSource} onValueChange={(value) => setFormData(prev => ({ ...prev, utmSource: value, utmMedium: '' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      {UTM_SOURCES.map(source => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formData.utmSource && (
                  <div className="space-y-2">
                    <Label>Mídia/Formato</Label>
                    <Select value={formData.utmMedium} onValueChange={(value) => setFormData(prev => ({ ...prev, utmMedium: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a mídia" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableMediums().map(medium => (
                          <SelectItem key={medium} value={medium}>
                            {medium.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Campanha</Label>
                  <Input
                    placeholder={`${launch?.launch_code || 'codigo'}_nome_da_campanha`}
                    value={formData.utmCampaign}
                    onChange={(e) => setFormData(prev => ({ ...prev, utmCampaign: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Conteúdo (Opcional)</Label>
                  <Input
                    placeholder="Ex: banner_superior"
                    value={formData.utmContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, utmContent: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}

          {/* URL Gerada */}
          {generatedUrl && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <Label className="text-lg font-semibold">Link Gerado:</Label>
              <div className="flex items-center space-x-2">
                <Input value={generatedUrl} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(generatedUrl)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={() => copyToClipboard(generatedUrl)} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </Button>
                <Button onClick={saveLink} className="bg-gradient-primary hover:opacity-90 text-white">
                  Salvar Link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Links Salvos */}
      <Card>
        <CardHeader>
          <CardTitle>Links Salvos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Propósito</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Fonte/Mídia</TableHead>
                <TableHead>URL de Destino</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map(link => {
                const Icon = getPurposeIcon(link.purpose);
                return (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="text-sm">{getPurposeLabel(link.purpose)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {link.utm_source}{link.utm_medium ? ` / ${link.utm_medium}` : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <a 
                        href={link.destination_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center space-x-1"
                      >
                        <span className="max-w-xs truncate">{link.destination_url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.generated_url)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {links.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum link criado ainda
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}