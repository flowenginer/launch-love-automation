-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Admins can manage all profiles in their workspace" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can view profiles in their workspace" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Drop and recreate functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS public.get_my_role_in_workspace(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;

-- Create new non-recursive functions
CREATE OR REPLACE FUNCTION public.get_my_role_in_workspace(p_workspace_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles 
  WHERE id = auth.uid() 
  AND workspace_id = p_workspace_id 
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT role FROM profiles 
  WHERE id = auth.uid() 
  LIMIT 1;
$$;

-- Recreate the new policies without recursion
CREATE POLICY "Users can view profiles in their workspace" 
ON public.profiles 
FOR SELECT 
USING (is_workspace_member(workspace_id));

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Create a simple admin policy without recursion
CREATE POLICY "Admins can manage all profiles in their workspace" 
ON public.profiles 
FOR ALL 
USING (
  is_workspace_member(workspace_id) AND 
  (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM workspaces w 
      WHERE w.id = profiles.workspace_id 
      AND w.owner_id = auth.uid()
    )
  )
);

-- Recreate dependent policies
CREATE POLICY "Admins can manage invites in their workspace" 
ON public.team_invites 
FOR ALL 
USING (is_workspace_member(workspace_id) AND get_my_role_in_workspace(workspace_id) = 'ADM');

CREATE POLICY "Allow admins to insert launches" 
ON public.launches 
FOR INSERT 
WITH CHECK (is_workspace_member(workspace_id) AND get_my_role_in_workspace(workspace_id) = 'ADM');

CREATE POLICY "Allow admins to update launches" 
ON public.launches 
FOR UPDATE 
USING (is_workspace_member(workspace_id) AND get_my_role_in_workspace(workspace_id) = 'ADM');

CREATE POLICY "Allow admins to delete launches" 
ON public.launches 
FOR DELETE 
USING (is_workspace_member(workspace_id) AND get_my_role_in_workspace(workspace_id) = 'ADM');