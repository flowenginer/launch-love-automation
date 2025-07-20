-- Atualizar políticas RLS para aplicar restrições por papéis

-- Política para copy_assets (Copywriter, Gestor e ADM podem acessar)
DROP POLICY IF EXISTS "Allow members to manage copy assets" ON public.copy_assets;
CREATE POLICY "Allow role-based access to copy assets" 
ON public.copy_assets 
FOR ALL 
USING (
  is_workspace_member((SELECT launches.workspace_id FROM launches WHERE launches.id = copy_assets.launch_id))
  AND (
    get_my_role_in_workspace((SELECT launches.workspace_id FROM launches WHERE launches.id = copy_assets.launch_id)) IN ('ADM', 'Gestor', 'Copywriter')
  )
);

-- Política para leads (apenas Gestor e ADM podem acessar)
DROP POLICY IF EXISTS "Allow members to manage lead data" ON public.leads;
CREATE POLICY "Allow managers and admins to access leads" 
ON public.leads 
FOR ALL 
USING (
  is_workspace_member((SELECT launches.workspace_id FROM launches WHERE launches.id = leads.launch_id))
  AND (
    get_my_role_in_workspace((SELECT launches.workspace_id FROM launches WHERE launches.id = leads.launch_id)) IN ('ADM', 'Gestor')
  )
);

-- Política para sales (apenas Gestor e ADM podem acessar)
DROP POLICY IF EXISTS "Allow members to manage sales data" ON public.sales;
CREATE POLICY "Allow managers and admins to access sales" 
ON public.sales 
FOR ALL 
USING (
  is_workspace_member((SELECT launches.workspace_id FROM launches WHERE launches.id = sales.launch_id))
  AND (
    get_my_role_in_workspace((SELECT launches.workspace_id FROM launches WHERE launches.id = sales.launch_id)) IN ('ADM', 'Gestor')
  )
);

-- Política para campaign_links (apenas Gestor e ADM podem acessar)
DROP POLICY IF EXISTS "Allow members to manage campaign links" ON public.campaign_links;
CREATE POLICY "Allow managers and admins to access campaign links" 
ON public.campaign_links 
FOR ALL 
USING (
  is_workspace_member((SELECT launches.workspace_id FROM launches WHERE launches.id = campaign_links.launch_id))
  AND (
    get_my_role_in_workspace((SELECT launches.workspace_id FROM launches WHERE launches.id = campaign_links.launch_id)) IN ('ADM', 'Gestor')
  )
);

-- Política para webhook_integrations (apenas Gestor e ADM podem acessar)
DROP POLICY IF EXISTS "Allow members to manage webhook integrations" ON public.webhook_integrations;
CREATE POLICY "Allow managers and admins to access integrations" 
ON public.webhook_integrations 
FOR ALL 
USING (
  is_workspace_member((SELECT launches.workspace_id FROM launches WHERE launches.id = webhook_integrations.launch_id))
  AND (
    get_my_role_in_workspace((SELECT launches.workspace_id FROM launches WHERE launches.id = webhook_integrations.launch_id)) IN ('ADM', 'Gestor')
  )
);

-- Política para copy_notifications (apenas para o gestor que deve ser notificado)
DROP POLICY IF EXISTS "Allow members to manage copy notifications" ON public.copy_notifications;
CREATE POLICY "Allow managers and admins to access notifications" 
ON public.copy_notifications 
FOR ALL 
USING (
  is_workspace_member((
    SELECT launches.workspace_id
    FROM launches
    JOIN copy_assets ON copy_assets.launch_id = launches.id
    WHERE copy_assets.id = copy_notifications.copy_asset_id
  ))
  AND (
    get_my_role_in_workspace((
      SELECT launches.workspace_id
      FROM launches
      JOIN copy_assets ON copy_assets.launch_id = launches.id
      WHERE copy_assets.id = copy_notifications.copy_asset_id
    )) IN ('ADM', 'Gestor')
  )
);

-- Política para launches (todos os papéis podem visualizar, apenas ADM pode modificar)
DROP POLICY IF EXISTS "Allow members to manage launch data" ON public.launches;
CREATE POLICY "Allow role-based access to launches" 
ON public.launches 
FOR SELECT 
USING (is_workspace_member(workspace_id));

CREATE POLICY "Allow admins to manage launches" 
ON public.launches 
FOR INSERT, UPDATE, DELETE
USING (
  is_workspace_member(workspace_id)
  AND get_my_role_in_workspace(workspace_id) = 'ADM'
);