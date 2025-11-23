-- Fix RLS Policies to avoid infinite recursion

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Users can view messages they sent or received" ON messages;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;

-- Create a SECURITY DEFINER function to check group membership (bypasses RLS)
CREATE OR REPLACE FUNCTION public.user_is_group_member(group_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fix group_members SELECT policy (use function to avoid recursion)
CREATE POLICY "Users can view members of their groups"
  ON group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    group_id IN (SELECT id FROM groups WHERE created_by = auth.uid()) OR
    public.user_is_group_member(group_id)
  );

-- Fix groups policy
CREATE POLICY "Users can view groups they are members of"
  ON groups FOR SELECT
  USING (
    created_by = auth.uid() OR
    public.user_is_group_member(id)
  );

-- Fix messages policy to avoid recursion
CREATE POLICY "Users can view messages they sent or received"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR
    recipient_id = auth.uid() OR
    (group_id IS NOT NULL AND public.user_is_group_member(group_id))
  );

