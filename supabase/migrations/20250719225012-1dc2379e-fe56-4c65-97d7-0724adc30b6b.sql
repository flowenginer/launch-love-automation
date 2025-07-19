-- First check current copy_assets structure and fix the enum type
-- Update existing enum to include email and whatsapp types
ALTER TYPE public.message_type ADD VALUE IF NOT EXISTS 'email';
ALTER TYPE public.message_type ADD VALUE IF NOT EXISTS 'whatsapp';