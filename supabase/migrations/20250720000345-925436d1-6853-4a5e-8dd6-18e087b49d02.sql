-- Criar tabela de notificações para copys em revisão
CREATE TABLE public.copy_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  copy_asset_id UUID NOT NULL REFERENCES copy_assets(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'whatsapp')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.copy_notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for notifications
CREATE POLICY "Allow members to manage copy notifications" 
ON public.copy_notifications 
FOR ALL 
USING (is_workspace_member((
  SELECT launches.workspace_id
  FROM launches
  JOIN copy_assets ON copy_assets.launch_id = launches.id
  WHERE copy_assets.id = copy_notifications.copy_asset_id
)));

-- Função para criar notificação quando copy vai para revisão
CREATE OR REPLACE FUNCTION public.handle_copy_review_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se a copy foi movida para 'review', criar notificação
  IF NEW.status = 'review' AND OLD.status != 'review' THEN
    -- Buscar o owner do workspace para notificar
    INSERT INTO public.copy_notifications (copy_asset_id, manager_id, type)
    SELECT 
      NEW.id,
      w.owner_id,
      NEW.type
    FROM launches l
    JOIN workspaces w ON w.id = l.workspace_id
    WHERE l.id = NEW.launch_id;
  END IF;
  
  -- Se a copy foi aprovada ou rejeitada, marcar notificação como lida
  IF NEW.status IN ('approved', 'draft') AND OLD.status = 'review' THEN
    UPDATE public.copy_notifications 
    SET status = 'read', read_at = now()
    WHERE copy_asset_id = NEW.id AND status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para notificações automáticas
CREATE TRIGGER copy_review_notification_trigger
  AFTER UPDATE ON public.copy_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_copy_review_notification();