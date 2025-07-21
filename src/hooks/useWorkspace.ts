import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

interface Launch {
  id: string;
  workspace_id: string;
  name: string;
  launch_code: string;
  status: 'planning' | 'active' | 'closed';
  created_at: string;
  image_url?: string;
  lead_capture_start?: string;
  lead_capture_end?: string;
  event_start?: string;
  event_end?: string;
  cart_open?: string;
  cart_close?: string;
}

export const useWorkspace = () => {
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [selectedLaunch, setSelectedLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWorkspace();
    }
  }, [user]);

  const fetchWorkspace = async () => {
    try {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (workspaceError) throw workspaceError;

      setWorkspace(workspaceData);

      // Fetch launches for this workspace
      const { data: launchesData, error: launchesError } = await supabase
        .from('launches')
        .select('*')
        .eq('workspace_id', workspaceData.id)
        .order('created_at', { ascending: false });

      if (launchesError) throw launchesError;

      setLaunches(launchesData || []);
      
      // Set the first launch as selected if exists
      if (launchesData && launchesData.length > 0) {
        setSelectedLaunch(launchesData[0]);
      }
    } catch (error) {
      console.error('Error fetching workspace:', error);
    } finally {
      setLoading(false);
    }
  };

  const createLaunch = async (name: string, launchCode: string, imageUrl?: string) => {
    if (!workspace) return null;

    try {
      const { data, error } = await supabase
        .from('launches')
        .insert({
          workspace_id: workspace.id,
          name,
          launch_code: launchCode,
          status: 'planning',
          image_url: imageUrl || null
        })
        .select()
        .single();

      if (error) throw error;

      setLaunches(prev => [data, ...prev]);
      setSelectedLaunch(data);
      
      return data;
    } catch (error) {
      console.error('Error creating launch:', error);
      return null;
    }
  };

  const updateLaunch = async (launchId: string, updates: Partial<Launch>) => {
    try {
      const { data, error } = await supabase
        .from('launches')
        .update(updates)
        .eq('id', launchId)
        .select()
        .single();

      if (error) throw error;

      setLaunches(prev => prev.map(launch => 
        launch.id === launchId ? { ...launch, ...updates } : launch
      ));
      
      if (selectedLaunch?.id === launchId) {
        setSelectedLaunch(prev => prev ? { ...prev, ...updates } : null);
      }

      return data;
    } catch (error) {
      console.error('Error updating launch:', error);
      return null;
    }
  };

  return {
    workspace,
    launches,
    selectedLaunch,
    setSelectedLaunch,
    loading,
    createLaunch,
    updateLaunch,
    refreshWorkspace: fetchWorkspace
  };
};