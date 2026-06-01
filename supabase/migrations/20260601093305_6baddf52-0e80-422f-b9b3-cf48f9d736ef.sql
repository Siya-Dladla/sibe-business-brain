
-- Restrict subscription Stripe IDs to owners/admins
DROP POLICY IF EXISTS "Users can view their organization subscriptions" ON public.subscriptions;
CREATE POLICY "Owners can view their organization subscriptions"
ON public.subscriptions
FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members
    WHERE user_id = auth.uid() AND role = ANY (ARRAY['owner'::text, 'admin'::text])
  )
);

-- Require sign-in to create organizations
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
CREATE POLICY "Authenticated users can create organizations"
ON public.organizations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Restrict business-documents storage policies to authenticated users + add UPDATE
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'business-documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Revoke EXECUTE on SECURITY DEFINER trigger function from API roles
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
