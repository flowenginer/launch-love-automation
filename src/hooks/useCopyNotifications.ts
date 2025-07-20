import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CopyNotification {
  id: string;
  type: 'email' | 'whatsapp';
  status: 'pending' | 'read';
  created_at: string;
}

interface NotificationCount {
  email: number;
  whatsapp: number;
  total: number;
}

export function useCopyNotifications(launchId?: string) {
  const [notifications, setNotifications] = useState<CopyNotification[]>([]);
  const [count, setCount] = useState<NotificationCount>({ email: 0, whatsapp: 0, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!launchId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('copy_notifications')
        .select(`
          id,
          type,
          status,
          created_at,
          copy_asset_id,
          copy_assets!inner(launch_id)
        `)
        .eq('copy_assets.launch_id', launchId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar notificações:', error);
        return;
      }

      const typedNotifications = data?.map(n => ({
        id: n.id,
        type: n.type as 'email' | 'whatsapp',
        status: n.status as 'pending' | 'read',
        created_at: n.created_at
      })) || [];

      setNotifications(typedNotifications);

      // Calcular contadores
      const emailCount = typedNotifications.filter(n => n.type === 'email').length;
      const whatsappCount = typedNotifications.filter(n => n.type === 'whatsapp').length;
      
      setCount({
        email: emailCount,
        whatsapp: whatsappCount,
        total: emailCount + whatsappCount
      });
    } catch (err) {
      console.error('Erro inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (copyAssetId: string) => {
    try {
      await supabase
        .from('copy_notifications')
        .update({ status: 'read', read_at: new Date().toISOString() })
        .eq('copy_asset_id', copyAssetId)
        .eq('status', 'pending');
      
      await fetchNotifications();
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [launchId]);

  return {
    notifications,
    count,
    loading,
    refetch: fetchNotifications,
    markAsRead
  };
}