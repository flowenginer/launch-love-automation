"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, FileText, Image, Video, File, MoreHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LaunchLayout from "./LaunchLayout";

interface CopyAsset {
  id: string;
  title: string;
  content: string;
  media_url: string;
  type: "text" | "image" | "video" | "document";
  status: "draft" | "review" | "approved";
  created_at: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "draft":
      return "bg-gray-500";
    case "review":
      return "bg-yellow-500";
    case "approved":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "draft":
      return "Rascunho";
    case "review":
      return "Em Revisão";
    case "approved":
      return "Aprovado";
    default:
      return status;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "text":
      return FileText;
    case "image":
      return Image;
    case "video":
      return Video;
    case "document":
      return File;
    default:
      return FileText;
  }
};

export default function LaunchCommunication() {
  const { id: launchId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [copyAssets, setCopyAssets] = useState<CopyAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CopyAsset | null>(null);

  // Form state para criação
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    media_url: "",
    type: "text" as "text" | "image" | "video" | "document",
  });

  useEffect(() => {
    if (launchId) {
      fetchCopyAssets();
    }
  }, [launchId]);

  const fetchCopyAssets = async () => {
    try {
      const { data, error } = await supabase
        .from("copy_assets")
        .select("*")
        .eq("launch_id", launchId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCopyAssets(data || []);
    } catch (error) {
      console.error("Erro ao buscar copy assets:", error);
      toast({
        title: "Erro",
        description: "Falha ao carregar conteúdo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async () => {
    try {
      const { error } = await supabase
        .from("copy_assets")
        .insert({
          launch_id: launchId,
          title: formData.title,
          content: formData.content,
          media_url: formData.media_url,
          type: formData.type,
          status: "draft",
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Copy criada com sucesso",
      });

      setIsCreateModalOpen(false);
      setFormData({ title: "", content: "", media_url: "", type: "text" });
      fetchCopyAssets();
    } catch (error) {
      console.error("Erro ao criar copy asset:", error);
      toast({
        title: "Erro",
        description: "Falha ao criar copy",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (assetId: string, newStatus: "draft" | "review" | "approved") => {
    try {
      const { error } = await supabase
        .from("copy_assets")
        .update({ status: newStatus })
        .eq("id", assetId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status atualizado",
      });

      fetchCopyAssets();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Falha ao atualizar status",
        variant: "destructive",
      });
    }
  };

  const renderKanbanColumn = (status: "draft" | "review" | "approved", title: string) => {
    const assets = copyAssets.filter(asset => asset.status === status);
    
    return (
      <div className="flex-1 min-w-0">
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">{title}</h3>
            <Badge variant="secondary">{assets.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {assets.map((asset) => {
              const IconComponent = getTypeIcon(asset.type);
              return (
                <Card
                  key={asset.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedAsset(asset);
                    setIsReviewModalOpen(true);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm truncate">{asset.title}</h4>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {asset.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(asset.status)} variant="default">
                        {getStatusText(asset.status)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            
            {assets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum item em {title.toLowerCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <LaunchLayout launchId={launchId!}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </LaunchLayout>
    );
  }

  return (
    <LaunchLayout launchId={launchId!}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Hub de Comunicação</h2>
            <p className="text-muted-foreground">
              Centralize a criação, revisão e aprovação de conteúdo
            </p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Nova Copy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Nova Copy</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Digite o título da copy"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Texto</SelectItem>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="document">Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Digite o conteúdo da copy"
                    rows={4}
                  />
                </div>

                {formData.type !== "text" && (
                  <div>
                    <Label htmlFor="media_url">URL da Mídia</Label>
                    <Input
                      id="media_url"
                      value={formData.media_url}
                      onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                      placeholder="URL da imagem/vídeo/documento"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAsset}>
                    Salvar como Rascunho
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto min-h-[600px]">
          {renderKanbanColumn("draft", "Rascunho")}
          {renderKanbanColumn("review", "Em Revisão")}
          {renderKanbanColumn("approved", "Aprovado")}
        </div>

        {/* Modal de Revisão */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedAsset?.title}</DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4">
                <div>
                  <Badge className={getStatusColor(selectedAsset.status)}>
                    {getStatusText(selectedAsset.status)}
                  </Badge>
                </div>
                
                <div>
                  <Label>Conteúdo</Label>
                  <div className="p-3 bg-muted rounded-md">
                    <p className="whitespace-pre-wrap">{selectedAsset.content}</p>
                  </div>
                </div>

                {selectedAsset.media_url && (
                  <div>
                    <Label>URL da Mídia</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <a 
                        href={selectedAsset.media_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {selectedAsset.media_url}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  {selectedAsset.status === "draft" && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        handleStatusChange(selectedAsset.id, "review");
                        setIsReviewModalOpen(false);
                      }}
                    >
                      Enviar para Revisão
                    </Button>
                  )}
                  
                  {selectedAsset.status === "review" && (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          handleStatusChange(selectedAsset.id, "draft");
                          setIsReviewModalOpen(false);
                        }}
                      >
                        Solicitar Alterações
                      </Button>
                      <Button 
                        onClick={() => {
                          handleStatusChange(selectedAsset.id, "approved");
                          setIsReviewModalOpen(false);
                        }}
                      >
                        Aprovar
                      </Button>
                    </>
                  )}
                  
                  <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </LaunchLayout>
  );
}