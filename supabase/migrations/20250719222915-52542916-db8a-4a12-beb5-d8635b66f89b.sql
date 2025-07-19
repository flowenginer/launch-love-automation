-- Atualizar tabela copy_assets para incluir status se não existir
-- (A coluna já existe na migração anterior, então verificamos se precisa ser alterada)

-- Criar nova tabela webhook_integrations
CREATE TABLE webhook_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    launch_id UUID REFERENCES launches(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- Ex: "Venda Aprovada - Hotmart"
    platform TEXT, -- Ex: "hotmart", "hubla", "elementor"
    permanent_webhook_id TEXT NOT NULL UNIQUE, -- ID único para a URL final
    field_mappings JSONB NOT NULL, -- Armazena as regras de tradução
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS na nova tabela
ALTER TABLE webhook_integrations ENABLE ROW LEVEL SECURITY;

-- Política de RLS para webhook_integrations
CREATE POLICY "Allow members to manage webhook integrations" ON webhook_integrations
    FOR ALL USING (is_workspace_member((SELECT workspace_id FROM launches WHERE id = launch_id)));