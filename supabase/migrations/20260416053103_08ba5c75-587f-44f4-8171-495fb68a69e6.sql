
-- 1. Fix storage: restrict SELECT on attachments to authenticated users
DROP POLICY IF EXISTS "Public can view attachment files" ON storage.objects;
CREATE POLICY "Authenticated users can view attachments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'attachments');

-- 2. Fix user_roles: add explicit admin-only INSERT/UPDATE/DELETE policies
CREATE POLICY "Only admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. Fix has_role: restrict to caller's own ID to prevent role enumeration
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow checking your own role via RPC; RLS policies always pass auth.uid()
  IF _user_id <> auth.uid() THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
END;
$$;
