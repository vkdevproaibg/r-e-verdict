
-- Enums
CREATE TYPE public.app_role AS ENUM ('agent','buyer');
CREATE TYPE public.verdict_t AS ENUM ('green','yellow','red');
CREATE TYPE public.goal_t AS ENUM ('live','invest','rent','business');
CREATE TYPE public.assignment_status AS ENUM ('new','sent','viewed','interested','rejected','offer','closed');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

-- PROPERTIES (public catalog of demo objects)
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  address TEXT,
  city TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  bedrooms INT,
  bathrooms INT,
  area_sqm NUMERIC,
  goal public.goal_t,
  verdict public.verdict_t,
  score INT,
  cover_url TEXT,
  description TEXT,
  yield_pct NUMERIC,
  monthly_cost NUMERIC,
  owner_device_id TEXT,           -- agent who created it (anon)
  is_demo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "properties_public_read" ON public.properties FOR SELECT USING (true);
CREATE POLICY "properties_anon_insert" ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "properties_owner_update" ON public.properties FOR UPDATE
  USING (owner_device_id IS NOT NULL AND owner_device_id = current_setting('request.headers',true)::json->>'x-device-id');
CREATE POLICY "properties_owner_delete" ON public.properties FOR DELETE
  USING (owner_device_id IS NOT NULL AND owner_device_id = current_setting('request.headers',true)::json->>'x-device-id');
CREATE TRIGGER trg_properties_updated BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_properties_geo ON public.properties (lat,lng);
CREATE INDEX idx_properties_owner ON public.properties (owner_device_id);

-- SAVED PROPERTIES (per device)
CREATE TABLE public.saved_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (device_id, property_id)
);
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_device_all" ON public.saved_properties FOR ALL
  USING (device_id = current_setting('request.headers',true)::json->>'x-device-id')
  WITH CHECK (device_id = current_setting('request.headers',true)::json->>'x-device-id');
CREATE INDEX idx_saved_device ON public.saved_properties (device_id);

-- CLIENTS (agent CRM-lite, per device)
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,         -- agent device
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  goal public.goal_t,
  budget_min NUMERIC,
  budget_max NUMERIC,
  areas TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_device_all" ON public.clients FOR ALL
  USING (device_id = current_setting('request.headers',true)::json->>'x-device-id')
  WITH CHECK (device_id = current_setting('request.headers',true)::json->>'x-device-id');
CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_clients_device ON public.clients (device_id);

-- ASSIGNMENTS (property assigned to client by an agent)
CREATE TABLE public.assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status public.assignment_status NOT NULL DEFAULT 'new',
  notes TEXT,
  tags TEXT[],
  shown_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (device_id, client_id, property_id)
);
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_device_all" ON public.assignments FOR ALL
  USING (device_id = current_setting('request.headers',true)::json->>'x-device-id')
  WITH CHECK (device_id = current_setting('request.headers',true)::json->>'x-device-id');
CREATE TRIGGER trg_assignments_updated BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_assignments_device ON public.assignments (device_id);

-- ALERTS (per device, attached to a saved search or property)
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  kind TEXT NOT NULL,              -- price_drop | new_listing | verdict_change | weekly
  title TEXT NOT NULL,
  body TEXT,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alerts_device_all" ON public.alerts FOR ALL
  USING (device_id = current_setting('request.headers',true)::json->>'x-device-id')
  WITH CHECK (device_id = current_setting('request.headers',true)::json->>'x-device-id');
CREATE INDEX idx_alerts_device ON public.alerts (device_id);

-- ANALYSES (saved AI verdicts per device)
CREATE TABLE public.analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  input_kind TEXT NOT NULL,        -- photo|location|address|link|text|voice|document
  input_payload JSONB,
  verdict public.verdict_t,
  score INT,
  reasons JSONB,
  red_flags JSONB,
  next_steps JSONB,
  confidence INT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analyses_device_all" ON public.analyses FOR ALL
  USING (device_id = current_setting('request.headers',true)::json->>'x-device-id')
  WITH CHECK (device_id = current_setting('request.headers',true)::json->>'x-device-id');
CREATE INDEX idx_analyses_device ON public.analyses (device_id);
