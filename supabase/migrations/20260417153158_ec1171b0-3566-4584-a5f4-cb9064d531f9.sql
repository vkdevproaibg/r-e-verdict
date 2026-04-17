
DROP POLICY IF EXISTS "properties_anon_insert" ON public.properties;
CREATE POLICY "properties_owner_insert" ON public.properties FOR INSERT
  WITH CHECK (
    owner_device_id IS NOT NULL
    AND owner_device_id = current_setting('request.headers',true)::json->>'x-device-id'
  );
