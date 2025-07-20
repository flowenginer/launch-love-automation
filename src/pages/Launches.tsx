import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Rocket, 
  Settings, 
  BarChart3,
  Users,
  Calendar,
  Play,
  Pause,
  Archive,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Launch {
  id: string;
  name: string;
  launch_code: string;
  status: 'planning' | 'active' | 'closed';
  created_at: string;
  workspace_id: string;
}

const STATUS_CONFIG = {
  planning: { label: 'Planejamento', color: 'bg-gray-100 text-gray-800', icon: Settings },
  active: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: Play },
  closed: { label: 'Finalizado', color: 'bg-blue-100 text-blue-800', icon: Archive }
};

export default function Launches() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    launch_code: ''
  });

  useEffect(() => {
    fetchWorkspaceAndLaunches();
    fetchUserRole();
  }, []);

  const fetchWorkspaceAndLaunches = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Buscar workspace do usuário
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.user.id)
        .single();

      if (workspaceError) {
        console.error('Erro ao buscar workspace:', workspaceError);
        return;
      }

      setWorkspace(workspaceData);

      // Buscar lançamentos do workspace
      const { data: launchesData, error: launchesError } = await supabase
        .from('launches')
        .select('*')
        .eq('workspace_id', workspaceData.id)
        .order('created_at', { ascending: false });

      if (launchesError) {
        console.error('Erro ao buscar lançamentos:', launchesError);
        return;
      }

      setLaunches(launchesData || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  const fetchUserRole = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.user.id)
        .single();

      setUserRole(profile?.role || '');
    } catch (error) {
      console.error('Erro ao buscar papel do usuário:', error);
    }
  };

  const createLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('launches')
        .insert({
          workspace_id: workspace.id,
          name: createForm.name,
          launch_code: createForm.launch_code,
          status: 'planning'
        });

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar lançamento: " + error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso!",
      });

      setCreateForm({ name: '', launch_code: '' });
      setIsCreateModalOpen(false);
      fetchWorkspaceAndLaunches();

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar lançamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLaunchStatus = async (launchId: string, newStatus: 'planning' | 'active' | 'closed') => {
    const { error } = await supabase
      .from('launches')
      .update({ status: newStatus })
      .eq('id', launchId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Status atualizado com sucesso!",
    });

    fetchWorkspaceAndLaunches();
  };

  const deleteLaunch = async (launchId: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento? Esta ação não pode ser desfeita.')) {
      return;
    }

    const { error } = await supabase
      .from('launches')
      .delete()
      .eq('id', launchId);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir lançamento",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Lançamento excluído com sucesso!",
    });

    fetchWorkspaceAndLaunches();
  };

  const canManageLaunches = userRole === 'ADM';

  const LaunchCard = ({ launch }: { launch: Launch }) => {
    const statusConfig = STATUS_CONFIG[launch.status as keyof typeof STATUS_CONFIG];
    const StatusIcon = statusConfig.icon;

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{launch.name}</CardTitle>
                <p className="text-sm text-muted-foreground">#{launch.launch_code}</p>
              </div>
            </div>
            {canManageLaunches && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {launch.status === 'planning' && (
                    <DropdownMenuItem onClick={() => updateLaunchStatus(launch.id, 'active')}>
                      <Play className="w-4 h-4 mr-2" />
                      Ativar Lançamento
                    </DropdownMenuItem>
                  )}
                  {launch.status === 'active' && (
                    <DropdownMenuItem onClick={() => updateLaunchStatus(launch.id, 'closed')}>
                      <Archive className="w-4 h-4 mr-2" />
                      Finalizar Lançamento
                    </DropdownMenuItem>
                  )}
                  {launch.status === 'closed' && (
                    <DropdownMenuItem onClick={() => updateLaunchStatus(launch.id, 'active')}>
                      <Play className="w-4 h-4 mr-2" />
                      Reativar Lançamento
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => deleteLaunch(launch.id)}
                    className="text-red-600"
                  >
                    <Archive className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge className={statusConfig.color}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(launch.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => navigate(`/launch/${launch.id}/dashboard`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-primary hover:opacity-90 text-white"
                onClick={() => navigate(`/launch/${launch.id}/dashboard`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lançamentos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os seus lançamentos do workspace "{workspace?.name}"
            </p>
          </div>
          {canManageLaunches && (
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Lançamento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Lançamento</DialogTitle>
                </DialogHeader>
                <form onSubmit={createLaunch} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Lançamento</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Lançamento Black Friday 2024"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="launch_code">Código do Lançamento</Label>
                    <Input
                      id="launch_code"
                      value={createForm.launch_code}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, launch_code: e.target.value.toUpperCase() }))}
                      placeholder="Ex: BF2024"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Este código será usado nas campanhas e links de rastreamento
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-gradient-primary hover:opacity-90 text-white">
                      {loading ? "Criando..." : "Criar Lançamento"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Rocket className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{launches.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Planejamento</p>
                  <p className="text-2xl font-bold">{launches.filter(l => l.status === 'planning').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{launches.filter(l => l.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Archive className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Finalizados</p>
                  <p className="text-2xl font-bold">{launches.filter(l => l.status === 'closed').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid de Lançamentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {launches.map(launch => (
            <LaunchCard key={launch.id} launch={launch} />
          ))}
          {launches.length === 0 && (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-8 text-center">
                  <Rocket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold mb-2">Nenhum lançamento encontrado</h2>
                  <p className="text-muted-foreground mb-4">
                    Crie seu primeiro lançamento para começar a organizar suas campanhas.
                  </p>
                  {canManageLaunches && (
                    <Button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-gradient-primary hover:opacity-90 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Criar Primeiro Lançamento
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}