-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can manage all profiles in their workspace" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their workspace" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new non-recursive policies
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

-- Also fix the functions to prevent recursion
DROP FUNCTION IF EXISTS public.get_my_role_in_workspace(uuid);

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

DROP FUNCTION IF EXISTS public.get_my_role();

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