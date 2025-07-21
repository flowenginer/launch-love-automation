-- Criar usuário ADM GERAL
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
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
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Admin Geral"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Adicionar campo image_url na tabela launches para foto do lançamento
ALTER TABLE launches ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Adicionar alguns campos adicionais para datas dos lançamentos
ALTER TABLE launches ADD COLUMN IF NOT EXISTS lead_capture_start DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS lead_capture_end DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS event_start DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS event_end DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS cart_open DATE;
ALTER TABLE launches ADD COLUMN IF NOT EXISTS cart_close DATE;