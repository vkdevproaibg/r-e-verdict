
-- 1. PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. properties: geography column + city_slug
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS city_slug TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS geog GEOGRAPHY(Point, 4326)
    GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) STORED;

CREATE INDEX IF NOT EXISTS properties_geog_gix ON public.properties USING GIST (geog);
CREATE INDEX IF NOT EXISTS properties_city_slug_idx ON public.properties (city_slug);
CREATE INDEX IF NOT EXISTS properties_public_own_idx
  ON public.properties (city_slug)
  WHERE side = 'own_listing' AND is_public = true;

-- Keep client_packs.is_public in sync with properties.is_public for own_listing.
-- Simplest: expose a helper view isn't needed; we already have client_packs.is_public.
-- We'll rely on side='own_listing' + properties.is_public for map/share visibility.

-- 3. Public read policy for own_listing + is_public
DROP POLICY IF EXISTS "Public can view own_listing public properties" ON public.properties;
CREATE POLICY "Public can view own_listing public properties"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (side = 'own_listing' AND is_public = true);

GRANT SELECT ON public.properties TO anon;

-- 4. buyer_queries
CREATE TABLE IF NOT EXISTS public.buyer_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_kind TEXT NOT NULL,               -- 'address' | 'url' | 'geo'
  input_payload JSONB,                    -- { address, url, lat, lng }
  purpose TEXT,                           -- 'live' | 'invest' | 'rent' | 'business'
  area_sqm NUMERIC,
  price NUMERIC,
  currency TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  geog GEOGRAPHY(Point, 4326)
    GENERATED ALWAYS AS (
      CASE WHEN lat IS NOT NULL AND lng IS NOT NULL
           THEN ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
           ELSE NULL END
    ) STORED,
  matched_property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS buyer_queries_device_idx ON public.buyer_queries (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS buyer_queries_geog_gix ON public.buyer_queries USING GIST (geog);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buyer_queries TO authenticated;
GRANT SELECT, INSERT ON public.buyer_queries TO anon;
GRANT ALL ON public.buyer_queries TO service_role;

ALTER TABLE public.buyer_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer sees own queries by device"
  ON public.buyer_queries FOR SELECT
  TO anon, authenticated
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Buyer inserts queries with own device"
  ON public.buyer_queries FOR INSERT
  TO anon, authenticated
  WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id');

CREATE POLICY "Buyer updates own queries"
  ON public.buyer_queries FOR UPDATE
  TO anon, authenticated
  USING (device_id = current_setting('request.headers', true)::json->>'x-device-id');

-- 5. Radius match RPC: find nearest public own_listing within N meters
CREATE OR REPLACE FUNCTION public.find_own_listing_nearby(
  _lat DOUBLE PRECISION,
  _lng DOUBLE PRECISION,
  _radius_m INTEGER DEFAULT 50
)
RETURNS TABLE (
  property_id UUID,
  share_slug TEXT,
  distance_m DOUBLE PRECISION,
  title TEXT,
  city TEXT,
  city_slug TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS property_id,
    cp.share_slug,
    ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography) AS distance_m,
    p.title,
    p.city,
    p.city_slug
  FROM public.properties p
  JOIN public.client_packs cp
    ON cp.object_id = p.id AND cp.is_public = true
  WHERE p.side = 'own_listing'
    AND p.is_public = true
    AND p.geog IS NOT NULL
    AND ST_DWithin(
      p.geog,
      ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography,
      _radius_m
    )
  ORDER BY p.geog <-> ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.find_own_listing_nearby(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER)
  TO anon, authenticated;

-- 6. Nearby public listings for buyer verdict "Предложения рядом"
CREATE OR REPLACE FUNCTION public.list_public_nearby(
  _lat DOUBLE PRECISION,
  _lng DOUBLE PRECISION,
  _radius_m INTEGER DEFAULT 3000,
  _limit INTEGER DEFAULT 8
)
RETURNS TABLE (
  property_id UUID,
  share_slug TEXT,
  distance_m DOUBLE PRECISION,
  title TEXT,
  city TEXT,
  price NUMERIC,
  currency TEXT,
  area_sqm NUMERIC,
  cover_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id, cp.share_slug,
    ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography) AS distance_m,
    p.title, p.city, p.price, p.currency, p.area_sqm, p.cover_url
  FROM public.properties p
  JOIN public.client_packs cp
    ON cp.object_id = p.id AND cp.is_public = true
  WHERE p.side = 'own_listing'
    AND p.is_public = true
    AND p.geog IS NOT NULL
    AND ST_DWithin(
      p.geog,
      ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography,
      _radius_m
    )
  ORDER BY p.geog <-> ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.list_public_nearby(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER, INTEGER)
  TO anon, authenticated;
