-- Atualizar senha do usuário admin existente
UPDATE auth.users 
SET 
  encrypted_password = crypt('Mudar123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'chel.94.santos@gmail.com';

-- Garantir que o perfil existe como ADM
INSERT INTO public.profiles (id, workspace_id, role, full_name)
SELECT 
  u.id,
  w.id,
  'ADM',
  'Admin Geral'
FROM auth.users u
CROSS JOIN public.workspaces w
WHERE u.email = 'chel.94.santos@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = u.id AND p.workspace_id = w.id
)
LIMIT 1;

-- Corrigir políticas RLS para serem mais permissivas e funcionais
DROP POLICY IF EXISTS "Allow role-based access to copy assets" ON public.copy_assets;

-- Nova política mais permissiva para copy_assets
CREATE POLICY "Allow workspace members to manage copy assets" 
ON public.copy_assets 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = copy_assets.launch_id 
        AND p.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = copy_assets.launch_id 
        AND p.id = auth.uid()
    )
);

-- Corrigir política de campaign_links
DROP POLICY IF EXISTS "Allow managers and admins to access campaign links" ON public.campaign_links;

CREATE POLICY "Allow workspace members to manage campaign links" 
ON public.campaign_links 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = campaign_links.launch_id 
        AND p.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = campaign_links.launch_id 
        AND p.id = auth.uid()
    )
);

-- Corrigir política de leads
DROP POLICY IF EXISTS "Allow managers and admins to access leads" ON public.leads;

CREATE POLICY "Allow workspace members to access leads" 
ON public.leads 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = leads.launch_id 
        AND p.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = leads.launch_id 
        AND p.id = auth.uid()
    )
);

-- Corrigir política de sales
DROP POLICY IF EXISTS "Allow managers and admins to access sales" ON public.sales;

CREATE POLICY "Allow workspace members to access sales" 
ON public.sales 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = sales.launch_id 
        AND p.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = sales.launch_id 
        AND p.id = auth.uid()
    )
);

-- Corrigir política de webhook_integrations
DROP POLICY IF EXISTS "Allow managers and admins to access integrations" ON public.webhook_integrations;

CREATE POLICY "Allow workspace members to access integrations" 
ON public.webhook_integrations 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = webhook_integrations.launch_id 
        AND p.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE l.id = webhook_integrations.launch_id 
        AND p.id = auth.uid()
    )
);

-- Corrigir política de copy_notifications
DROP POLICY IF EXISTS "Allow managers and admins to access notifications" ON public.copy_notifications;

CREATE POLICY "Allow workspace members to access notifications" 
ON public.copy_notifications 
FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN copy_assets ca ON ca.launch_id = l.id
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE ca.id = copy_notifications.copy_asset_id 
        AND p.id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM launches l
        JOIN copy_assets ca ON ca.launch_id = l.id
        JOIN profiles p ON p.workspace_id = l.workspace_id
        WHERE ca.id = copy_notifications.copy_asset_id 
        AND p.id = auth.uid()
    )
);