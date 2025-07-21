-- Primeiro, vamos habilitar anonymous signups para permitir criação de usuários
-- Criar usuário admin funcional
DO $$
DECLARE
    admin_user_id uuid;
    workspace_id uuid;
BEGIN
    -- Deletar usuário existente se houver
    DELETE FROM auth.users WHERE email = 'chel.94.santos@gmail.com';
    
    -- Criar novo usuário admin
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        confirmation_sent_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'chel.94.santos@gmail.com',
        crypt('Mudar123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Admin Geral","email":"chel.94.santos@gmail.com"}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_user_id;

    -- Criar workspace para o admin
    INSERT INTO public.workspaces (owner_id, name)
    VALUES (admin_user_id, 'Admin Workspace')
    RETURNING id INTO workspace_id;
    
    -- Criar perfil como ADM
    INSERT INTO public.profiles (id, workspace_id, role, full_name)
    VALUES (admin_user_id, workspace_id, 'ADM', 'Admin Geral');
    
END $$;

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