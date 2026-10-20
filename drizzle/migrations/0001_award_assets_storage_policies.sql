CREATE POLICY "Authenticated read award assets"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'award-assets');

CREATE POLICY "Authenticated upload award assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'award-assets');

CREATE POLICY "Authenticated update award assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'award-assets') WITH CHECK (bucket_id = 'award-assets');

CREATE POLICY "Authenticated delete award assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'award-assets');