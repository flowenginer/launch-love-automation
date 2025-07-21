-- Adicionar campo image_url na tabela launches para foto do lançamento
ALTER TABLE launches ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Adicionar alguns campos adicionais para datas dos lançamentos
ALTER TABLE launches ADD COLUMN IF NOT EXISTS lead_capture_start DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS lead_capture_end DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS event_start DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS event_end DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS cart_open DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS cart_close DATE;