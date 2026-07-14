
-- Allow buyers (anon) to read public client packs and file leads against them.
-- Also expose a minimal agent read for public packs so SharePage can show the brand.

GRANT SELECT ON public.client_packs TO anon;
GRANT INSERT ON public.leads TO anon, authenticated;

DROP POLICY IF EXISTS client_packs_public_select ON public.client_packs;
CREATE POLICY client_packs_public_select
  ON public.client_packs
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

DROP POLICY IF EXISTS leads_public_insert ON public.leads;
CREATE POLICY leads_public_insert
  ON public.leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    is_internal = false
    AND EXISTS (
      SELECT 1 FROM public.client_packs cp
      WHERE cp.id = client_pack_id
        AND cp.is_public = true
        AND cp.agent_id = leads.agent_id
        AND cp.object_id = leads.object_id
    )
  );
