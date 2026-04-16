
-- Drop overly permissive storage policies
DROP POLICY IF EXISTS "Authenticated users can upload attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete attachments" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view attachments" ON storage.objects;

-- Admins only can upload
CREATE POLICY "Admins can upload attachments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));

-- Admins only can delete
CREATE POLICY "Admins can delete attachments" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'attachments' AND public.has_role(auth.uid(), 'admin'));

-- Anyone can view/download individual files (needed for public notice attachments)
-- but use a scoped policy that doesn't allow listing
CREATE POLICY "Public can view attachment files" ON storage.objects
  FOR SELECT USING (bucket_id = 'attachments');
