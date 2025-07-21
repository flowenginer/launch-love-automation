import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Mail, MessageCircle, Edit3, Send, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCopyNotifications } from "@/hooks/useCopyNotifications";

interface CopyAsset {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  media_url?: string;
  created_at: string;
}

export default function LaunchCopy() {
  const { id } = useParams<{ id: string }>();
  const [copies, setCopies] = useState<CopyAsset[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCopy, setSelectedCopy] = useState<CopyAsset | null>(null);
  const [activeTab, setActiveTab] = useState("email");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "email" as "email" | "whatsapp",
    subject: "",
    preheader: "",
  });
  const { toast } = useToast();
  const { markAsRead } = useCopyNotifications(id);

  useEffect(() => {
    if (id) {
      fetchCopies();
    }
  }, [id]);

  const fetchCopies = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('copy_assets')
      .select('*')
      .eq('launch_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar copies",
        variant: "destructive",
      });
      return;
    }

    // Filter only email and whatsapp types
    const filteredData = (data || []).filter(asset => 
      asset.type === 'email' || asset.type === 'whatsapp'
    );
    setCopies(filteredData);
  };

  const handleCreateCopy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast({
        title: "Erro",
        description: "ID do lançamento não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title || !formData.content) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const content = formData.type === 'email' 
        ? JSON.stringify({
            subject: formData.subject,
            preheader: formData.preheader,
            body: formData.content
          })
        : formData.content;

      const { error } = await supabase
        .from('copy_assets')
        .insert({
          launch_id: id,
          title: formData.title,
          content,
          type: formData.type,
          status: 'draft'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Copy criada com sucesso!",
      });

      setIsModalOpen(false);
      setFormData({
        title: "",
        content: "",
        type: "email",
        subject: "",
        preheader: "",
      });
      fetchCopies();
    } catch (error) {
      console.error('Error creating copy:', error);
      toast({
        title: "Erro",
        description: `Erro ao criar copy: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const updateCopyStatus = async (copyId: string, status: 'draft' | 'review' | 'approved') => {
    const { error } = await supabase
      .from('copy_assets')
      .update({ status })
      .eq('id', copyId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
      return;
    }

    // Se a copy foi aprovada ou rejeitada (voltou para draft), marcar notificação como lida
    if (status === 'approved' || status === 'draft') {
      await markAsRead(copyId);
    }

    toast({
      title: "Sucesso",
      description: "Status atualizado com sucesso!",
    });

    fetchCopies();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit3 className="h-4 w-4" />;
      case 'review': return <Send className="h-4 w-4" />;
      case 'approved': return <Check className="h-4 w-4" />;
      default: return <Edit3 className="h-4 w-4" />;
    }
  };

  const filterCopiesByStatus = (status: string, type: string) => {
    return copies.filter(copy => copy.status === status && copy.type === type);
  };

  const CopyCard = ({ copy }: { copy: CopyAsset }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{copy.title}</CardTitle>
          <div className="flex items-center space-x-2">
            {copy.type === 'email' ? <Mail className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
            <Badge className={getStatusColor(copy.status)}>
              {getStatusIcon(copy.status)}
              <span className="ml-1 capitalize">{copy.status}</span>
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {copy.type === 'email' 
            ? JSON.parse(copy.content || '{}').subject || 'Sem assunto'
            : copy.content.substring(0, 100) + '...'
          }
        </p>
        <div className="flex justify-end space-x-2 mt-3">
          {copy.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateCopyStatus(copy.id, 'review')}
            >
              Enviar para Revisão
            </Button>
          )}
          {copy.status === 'review' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateCopyStatus(copy.id, 'approved')}
                className="text-green-600"
              >
                <Check className="h-4 w-4 mr-1" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateCopyStatus(copy.id, 'draft')}
                className="text-red-600"
              >
                <X className="h-4 w-4 mr-1" />
                Solicitar Ajustes
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const KanbanColumn = ({ title, status, type }: { title: string; status: string; type: string }) => (
    <div className="flex-1 bg-muted/30 rounded-lg p-4">
      <h3 className="font-semibold mb-4 text-center">{title}</h3>
      <div className="space-y-3">
        {filterCopiesByStatus(status, type).map(copy => (
          <CopyCard key={copy.id} copy={copy} />
        ))}
        {filterCopiesByStatus(status, type).length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Nenhuma copy neste status
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Copy</h1>
          <p className="text-muted-foreground">
            Gerencie todo o conteúdo do seu lançamento
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Nova Copy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Copy</DialogTitle>
              <DialogDescription>
                Crie um novo conteúdo para seu lançamento
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCopy} className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Copy</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: E-mail de Boas-Vindas"
                  required
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Tabs 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as "email" | "whatsapp" }))}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">E-mail</TabsTrigger>
                    <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {formData.type === 'email' && (
                <>
                  <div>
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder="Assunto do e-mail"
                    />
                  </div>
                  <div>
                    <Label htmlFor="preheader">Preheader</Label>
                    <Input
                      id="preheader"
                      value={formData.preheader}
                      onChange={(e) => setFormData(prev => ({ ...prev, preheader: e.target.value }))}
                      placeholder="Texto de prévia"
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="content">
                  {formData.type === 'email' ? 'Corpo do E-mail' : 'Mensagem WhatsApp'}
                </Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder={formData.type === 'email' 
                    ? "Digite o conteúdo do e-mail..." 
                    : "Digite a mensagem do WhatsApp..."
                  }
                  rows={8}
                  required
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-primary hover:opacity-90 text-white">
                  Criar Copy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="email">E-mail</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <div className="flex space-x-6">
            <KanbanColumn title="Rascunho" status="draft" type="email" />
            <KanbanColumn title="Em Revisão" status="review" type="email" />
            <KanbanColumn title="Aprovado" status="approved" type="email" />
          </div>
        </TabsContent>

        <TabsContent value="whatsapp" className="mt-6">
          <div className="flex space-x-6">
            <KanbanColumn title="Rascunho" status="draft" type="whatsapp" />
            <KanbanColumn title="Em Revisão" status="review" type="whatsapp" />
            <KanbanColumn title="Aprovado" status="approved" type="whatsapp" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}