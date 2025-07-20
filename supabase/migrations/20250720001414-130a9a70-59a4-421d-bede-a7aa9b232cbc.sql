-- Criar tabela de perfis para dados adicionais dos usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADM', 'Gestor', 'Copywriter')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(id, workspace_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view profiles in their workspace" 
ON public.profiles 
FOR SELECT 
USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles in their workspace" 
ON public.profiles 
FOR ALL 
USING (
  is_workspace_member(workspace_id) 
  AND (
    (SELECT role FROM public.profiles WHERE id = auth.uid() AND workspace_id = profiles.workspace_id) = 'ADM'
    OR id = auth.uid()
  )
);

-- Função para buscar o papel do usuário atual (evita recursão infinita)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$;

-- Função para buscar o papel do usuário em um workspace específico
CREATE OR REPLACE FUNCTION public.get_my_role_in_workspace(p_workspace_id UUID)
RETURNS TEXT 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() AND workspace_id = p_workspace_id LIMIT 1);
END;
$$;

-- Atualizar a função handle_new_user para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Criar workspace padrão
  INSERT INTO public.workspaces (owner_id, name)
  VALUES (NEW.id, 'Meu Workspace')
  RETURNING id INTO new_workspace_id;
  
  -- Criar perfil como ADM do workspace
  INSERT INTO public.profiles (id, workspace_id, role, full_name)
  VALUES (NEW.id, new_workspace_id, 'ADM', COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário'));
  
  RETURN NEW;
END;
$$;

-- Trigger para atualizar updated_at na tabela profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela para gerenciar convites pendentes
CREATE TABLE public.team_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADM', 'Gestor', 'Copywriter')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, email)
);

-- Enable RLS for team_invites
ALTER TABLE public.team_invites ENABLE ROW LEVEL SECURITY;

-- Create policy for team invites
CREATE POLICY "Admins can manage invites in their workspace" 
ON public.team_invites 
FOR ALL 
USING (
  is_workspace_member(workspace_id) 
  AND get_my_role_in_workspace(workspace_id) = 'ADM'
);