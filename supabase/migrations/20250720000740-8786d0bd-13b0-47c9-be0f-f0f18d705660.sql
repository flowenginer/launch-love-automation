-- Criar tabela para links gerados
CREATE TABLE public.campaign_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  launch_id UUID NOT NULL REFERENCES launches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purpose TEXT NOT NULL CHECK (purpose IN ('landing', 'thank_you', 'sales', 'checkout')),
  destination_url TEXT NOT NULL,
  utm_source TEXT NOT NULL,
  utm_medium TEXT,
  utm_campaign TEXT NOT NULL,
  utm_content TEXT,
  utm_term TEXT,
  generated_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_links ENABLE ROW LEVEL SECURITY;

-- Create policy for campaign links
CREATE POLICY "Allow members to manage campaign links" 
ON public.campaign_links 
FOR ALL 
USING (is_workspace_member((
  SELECT launches.workspace_id
  FROM launches
  WHERE launches.id = campaign_links.launch_id
)));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_links_updated_at
  BEFORE UPDATE ON public.campaign_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();