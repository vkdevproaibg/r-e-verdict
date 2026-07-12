
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
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id, cp.share_slug,
    ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography),
    p.title, p.city, p.city_slug
  FROM public.properties p
  JOIN public.client_packs cp ON cp.object_id = p.id AND cp.is_public = true
  WHERE p.side = 'own_listing' AND p.is_public = true AND p.geog IS NOT NULL
    AND ST_DWithin(p.geog, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography, _radius_m)
  ORDER BY p.geog <-> ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography
  LIMIT 1;
$$;

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
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    p.id, cp.share_slug,
    ST_Distance(p.geog, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography),
    p.title, p.city, p.price, p.currency, p.area_sqm, p.cover_url
  FROM public.properties p
  JOIN public.client_packs cp ON cp.object_id = p.id AND cp.is_public = true
  WHERE p.side = 'own_listing' AND p.is_public = true AND p.geog IS NOT NULL
    AND ST_DWithin(p.geog, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography, _radius_m)
  ORDER BY p.geog <-> ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography
  LIMIT _limit;
$$;
