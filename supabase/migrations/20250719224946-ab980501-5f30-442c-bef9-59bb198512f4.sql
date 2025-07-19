-- Atualizar tabela copy_assets para suportar tipos email e whatsapp
DROP TYPE IF EXISTS copy_type;
CREATE TYPE copy_type AS ENUM ('email', 'whatsapp', 'text', 'image', 'video', 'document');

-- Alterar coluna type na tabela copy_assets
ALTER TABLE copy_assets ALTER COLUMN type TYPE copy_type USING type::copy_type;