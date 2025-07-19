-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types para status e categorias
CREATE TYPE launch_status AS ENUM ('planning', 'active', 'closed');
CREATE TYPE sale_status AS ENUM ('waiting_payment', 'paid', 'refunded', 'abandoned_checkout');
CREATE TYPE copy_status AS ENUM ('draft', 'review', 'approved');
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'document');

-- Tabela de Workspaces (para multi-tenancy)
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Projetos de Lançamento
CREATE TABLE launches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    launch_code TEXT NOT NULL UNIQUE,
    status launch_status DEFAULT 'planning',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Leads
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    launch_id UUID REFERENCES launches(id) ON DELETE CASCADE NOT NULL,
    name TEXT,
    email TEXT,
    phone TEXT,
    tags JSONB DEFAULT '[]',
    metadata JSONB, -- Para UTMs e outros dados de origem
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(launch_id, email) -- Email deve ser único por lançamento
);

-- Tabela de Vendas
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL, -- Se o lead for deletado, a venda permanece
    launch_id UUID REFERENCES launches(id) ON DELETE CASCADE NOT NULL,
    product_name TEXT,
    amount_cents INTEGER,
    status sale_status NOT NULL,
    payment_method TEXT,
    platform TEXT,
    transaction_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para o Banco de Conteúdo (Copy)
CREATE TABLE copy_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    launch_id UUID REFERENCES launches(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    media_url TEXT, -- Para URL de imagem/vídeo a ser enviado
    type message_type NOT NULL,
    status copy_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para Instâncias da EVO API
CREATE TABLE whatsapp_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    launch_id UUID REFERENCES launches(id) ON DELETE CASCADE NOT NULL,
    instance_name TEXT NOT NULL UNIQUE, -- O nome usado na EVO API
    api_key TEXT, -- Chave da API da instância
    status TEXT DEFAULT 'disconnected', -- Ex: connected, disconnected, connecting
    qr_code_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela para Grupos de WhatsApp
CREATE TABLE whatsapp_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID REFERENCES whatsapp_instances(id) ON DELETE CASCADE NOT NULL,
    group_id TEXT NOT NULL UNIQUE, -- ID do grupo (ex: 12036304@g.us)
    group_name TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Tabela para Agendamento de Mensagens
CREATE TABLE scheduled_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    copy_asset_id UUID REFERENCES copy_assets(id) ON DELETE CASCADE NOT NULL,
    target_group_id UUID REFERENCES whatsapp_groups(id) ON DELETE CASCADE NOT NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending', -- Ex: pending, sent, failed
    sent_at TIMESTAMPTZ,
    error_message TEXT
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE launches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE copy_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_messages ENABLE ROW LEVEL SECURITY;

-- Função auxiliar para checar propriedade do workspace
CREATE OR REPLACE FUNCTION is_workspace_member(p_workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM workspaces
        WHERE id = p_workspace_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de RLS
CREATE POLICY "Allow owner to manage their own workspaces" ON workspaces
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Allow members to manage launch data" ON launches
    FOR ALL USING (is_workspace_member(workspace_id));

CREATE POLICY "Allow members to manage lead data" ON leads
    FOR ALL USING (is_workspace_member((SELECT workspace_id FROM launches WHERE id = launch_id)));

CREATE POLICY "Allow members to manage sales data" ON sales
    FOR ALL USING (is_workspace_member((SELECT workspace_id FROM launches WHERE id = launch_id)));

CREATE POLICY "Allow members to manage copy assets" ON copy_assets
    FOR ALL USING (is_workspace_member((SELECT workspace_id FROM launches WHERE id = launch_id)));

CREATE POLICY "Allow members to manage whatsapp instances" ON whatsapp_instances
    FOR ALL USING (is_workspace_member((SELECT workspace_id FROM launches WHERE id = launch_id)));

CREATE POLICY "Allow members to manage whatsapp groups" ON whatsapp_groups
    FOR ALL USING (is_workspace_member((SELECT workspace_id FROM launches WHERE id = (SELECT launch_id FROM whatsapp_instances WHERE id = instance_id))));

CREATE POLICY "Allow members to manage scheduled messages" ON scheduled_messages
    FOR ALL USING (is_workspace_member((SELECT workspace_id FROM launches WHERE id = (SELECT launch_id FROM copy_assets WHERE id = copy_asset_id))));

-- Função para criar workspace inicial
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspaces (owner_id, name)
    VALUES (NEW.id, 'Meu Workspace');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar workspace automaticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();