import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  UserPlus, 
  Shield, 
  Edit, 
  Trash2,
  Crown,
  Users,
  PenTool
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  full_name: string | null;
  role: string;
  avatar_url: string | null;
  created_at: string;
  email?: string;
}

interface TeamInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

const ROLES = [
  { 
    value: 'Copywriter', 
    label: 'Copywriter', 
    description: 'Pode criar e editar copys',
    icon: PenTool,
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    value: 'Gestor', 
    label: 'Gestor', 
    description: 'Pode aprovar copys e ver analytics',
    icon: Shield,
    color: 'bg-green-100 text-green-800'
  },
  { 
    value: 'ADM', 
    label: 'Administrador', 
    description: 'Acesso total ao sistema',
    icon: Crown,
    color: 'bg-purple-100 text-purple-800'
  }
];

export default function LaunchTeam() {
  const { id } = useParams<{ id: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [workspace, setWorkspace] = useState<any>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Form state for invite
  const [inviteForm, setInviteForm] = useState({
    email: '',
    fullName: '',
    role: 'Copywriter'
  });

  useEffect(() => {
    if (id) {
      fetchWorkspaceAndMembers();
      fetchInvites();
      fetchCurrentUserRole();
    }
  }, [id]);

  const fetchWorkspaceAndMembers = async () => {
    if (!id) return;

    try {
      // Buscar workspace do lançamento
      const { data: launchData, error: launchError } = await supabase
        .from('launches')
        .select('workspace_id, workspaces(name)')
        .eq('id', id)
        .single();

      if (launchError) {
        console.error('Erro ao buscar lançamento:', launchError);
        return;
      }

      setWorkspace(launchData.workspaces);

      // Buscar membros do workspace
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          role,
          avatar_url,
          created_at
        `)
        .eq('workspace_id', launchData.workspace_id);

      if (profilesError) {
        console.error('Erro ao buscar membros:', profilesError);
        return;
      }

      // Buscar emails dos usuários (somente para admins)
      if (profilesData) {
        const membersWithEmails = await Promise.all(
          profilesData.map(async (profile) => {
            const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
            return {
              ...profile,
              email: userData.user?.email || 'N/A'
            };
          })
        );
        setMembers(membersWithEmails);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  const fetchInvites = async () => {
    if (!id) return;

    const { data: launchData } = await supabase
      .from('launches')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (!launchData) return;

    const { data, error } = await supabase
      .from('team_invites')
      .select('*')
      .eq('workspace_id', launchData.workspace_id)
      .eq('status', 'pending');

    if (error) {
      console.error('Erro ao buscar convites:', error);
      return;
    }

    setInvites(data || []);
  };

  const fetchCurrentUserRole = async () => {
    if (!id) return;

    try {
      const { data: launchData } = await supabase
        .from('launches')
        .select('workspace_id')
        .eq('id', id)
        .single();

      if (!launchData) {
        console.error('Launch data not found for ID:', id);
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error('User not authenticated');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('workspace_id', launchData.workspace_id)
        .eq('id', userData.user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar papel do usuário:', error);
        console.error('Workspace ID:', launchData.workspace_id);
        console.error('User ID:', userData.user.id);
        return;
      }

      console.log('User role found:', data?.role);
      setCurrentUserRole(data?.role || '');
    } catch (error) {
      console.error('Erro inesperado ao buscar papel do usuário:', error);
    }
  };

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setLoading(true);

    try {
      // Buscar workspace ID
      const { data: launchData } = await supabase
        .from('launches')
        .select('workspace_id')
        .eq('id', id)
        .single();

      if (!launchData) {
        toast({
          title: "Erro",
          description: "Lançamento não encontrado",
          variant: "destructive",
        });
        return;
      }

      // Criar convite na tabela
      const { error: inviteError } = await supabase
        .from('team_invites')
        .insert({
          workspace_id: launchData.workspace_id,
          email: inviteForm.email,
          role: inviteForm.role,
          invited_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (inviteError) {
        toast({
          title: "Erro",
          description: "Erro ao criar convite: " + inviteError.message,
          variant: "destructive",
        });
        return;
      }

      // Enviar convite por email usando Supabase Auth
      const { error: authError } = await supabase.auth.admin.inviteUserByEmail(
        inviteForm.email,
        {
          data: {
            full_name: inviteForm.fullName,
            workspace_id: launchData.workspace_id,
            role: inviteForm.role
          }
        }
      );

      if (authError) {
        console.warn('Erro ao enviar email de convite:', authError);
        // Não bloquear o fluxo se o email falhar
      }

      toast({
        title: "Sucesso",
        description: "Convite enviado com sucesso!",
      });

      // Reset form e fechar modal
      setInviteForm({
        email: '',
        fullName: '',
        role: 'Copywriter'
      });
      setIsInviteModalOpen(false);
      fetchInvites();

    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao enviar convite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (userId: string, newRole: string) => {
    if (!id) return;

    const { data: launchData } = await supabase
      .from('launches')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (!launchData) return;

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .eq('workspace_id', launchData.workspace_id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar papel do usuário",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Papel do usuário atualizado com sucesso!",
    });

    fetchWorkspaceAndMembers();
  };

  const removeMember = async (userId: string) => {
    if (!id) return;

    const { data: launchData } = await supabase
      .from('launches')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (!launchData) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
      .eq('workspace_id', launchData.workspace_id);

    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover membro",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Membro removido com sucesso!",
    });

    fetchWorkspaceAndMembers();
  };

  const getRoleInfo = (role: string) => {
    return ROLES.find(r => r.value === role) || ROLES[0];
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const canManageTeam = currentUserRole === 'ADM';

  if (!canManageTeam) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">
            Apenas administradores podem gerenciar a equipe
          </p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para visualizar ou gerenciar membros da equipe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os membros do workspace "{workspace?.name}"
          </p>
        </div>
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Convidar Membro
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Novo Membro</DialogTitle>
            </DialogHeader>
            <form onSubmit={sendInvite} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={inviteForm.fullName}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nome do convidado"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role">Cargo</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => {
                      const Icon = role.icon;
                      return (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <div>
                              <p className="font-medium">{role.label}</p>
                              <p className="text-xs text-muted-foreground">{role.description}</p>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-primary hover:opacity-90 text-white">
                  {loading ? "Enviando..." : "Enviar Convite"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Membros</p>
                <p className="text-2xl font-bold">{members.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Convites Pendentes</p>
                <p className="text-2xl font-bold">{invites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">{members.filter(m => m.role === 'ADM').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Membros */}
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Data de Entrada</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(member => {
                const roleInfo = getRoleInfo(member.role);
                const RoleIcon = roleInfo.icon;
                
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={member.avatar_url || undefined} />
                          <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{member.full_name || 'Sem nome'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge className={roleInfo.color}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(member.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {/* Implementar edição */}}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Cargo
                          </DropdownMenuItem>
                          {member.role !== 'ADM' && (
                            <DropdownMenuItem 
                              onClick={() => removeMember(member.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remover
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum membro encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Convites Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invites.map(invite => {
                const roleInfo = getRoleInfo(invite.role);
                const RoleIcon = roleInfo.icon;
                
                return (
                  <div key={invite.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <div className="flex items-center space-x-2">
                          <Badge className={roleInfo.color}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}