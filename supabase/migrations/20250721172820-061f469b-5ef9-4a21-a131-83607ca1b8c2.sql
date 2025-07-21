-- Criar funções security definer para evitar recursão infinita nas políticas RLS
CREATE OR REPLACE FUNCTION public.user_can_access_launch(launch_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM launches l
    JOIN profiles p ON p.workspace_id = l.workspace_id
    WHERE l.id = launch_id 
    AND p.id = auth.uid()
  );
$$;

-- Remover todas as políticas problemáticas e recriar com as funções security definer
DROP POLICY IF EXISTS "Allow workspace members to manage copy assets" ON public.copy_assets;
DROP POLICY IF EXISTS "Allow workspace members to manage campaign links" ON public.campaign_links;
DROP POLICY IF EXISTS "Allow workspace members to access leads" ON public.leads;
DROP POLICY IF EXISTS "Allow workspace members to access sales" ON public.sales;
DROP POLICY IF EXISTS "Allow workspace members to access integrations" ON public.webhook_integrations;
DROP POLICY IF EXISTS "Allow workspace members to access notifications" ON public.copy_notifications;

-- Recrear políticas usando a função security definer
CREATE POLICY "Allow workspace members to manage copy assets" 
ON public.copy_assets 
FOR ALL 
USING (public.user_can_access_launch(launch_id))
WITH CHECK (public.user_can_access_launch(launch_id));

CREATE POLICY "Allow workspace members to manage campaign links" 
ON public.campaign_links 
FOR ALL 
USING (public.user_can_access_launch(launch_id))
WITH CHECK (public.user_can_access_launch(launch_id));

CREATE POLICY "Allow workspace members to access leads" 
ON public.leads 
FOR ALL 
USING (public.user_can_access_launch(launch_id))
WITH CHECK (public.user_can_access_launch(launch_id));

CREATE POLICY "Allow workspace members to access sales" 
ON public.sales 
FOR ALL 
USING (public.user_can_access_launch(launch_id))
WITH CHECK (public.user_can_access_launch(launch_id));

CREATE POLICY "Allow workspace members to access integrations" 
ON public.webhook_integrations 
FOR ALL 
USING (public.user_can_access_launch(launch_id))
WITH CHECK (public.user_can_access_launch(launch_id));

-- Para copy_notifications precisamos de uma função específica
CREATE OR REPLACE FUNCTION public.user_can_access_copy_notification(copy_asset_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM launches l
    JOIN copy_assets ca ON ca.launch_id = l.id
    JOIN profiles p ON p.workspace_id = l.workspace_id
    WHERE ca.id = copy_asset_id 
    AND p.id = auth.uid()
  );
$$;

CREATE POLICY "Allow workspace members to access notifications" 
ON public.copy_notifications 
FOR ALL 
USING (public.user_can_access_copy_notification(copy_asset_id))
WITH CHECK (public.user_can_access_copy_notification(copy_asset_id));