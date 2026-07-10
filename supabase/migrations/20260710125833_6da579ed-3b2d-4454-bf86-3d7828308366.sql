
-- ========== ENUMS ==========
CREATE TYPE public.agent_subscription_status AS ENUM ('none','trial','active');
CREATE TYPE public.object_source_type AS ENUM ('link','photo','pdf','manual');
CREATE TYPE public.object_side AS ENUM ('own_listing','client_search');
CREATE TYPE public.object_deal_type AS ENUM ('sale','rent');
CREATE TYPE public.object_property_type AS ENUM ('residential','land','micro_commercial');
CREATE TYPE public.object_status AS ENUM ('active','sold','withdrawn','rented');
CREATE TYPE public.lead_notification_channel AS ENUM ('email','telegram');
CREATE TYPE public.lead_notification_status AS ENUM ('sent','failed');

-- ========== AGENTS ==========
CREATE TABLE public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  photo_url text,
  company text,
  region text,
  contact_phone text,
  contact_email text,
  telegram_chat_id text,
  activity_score integer NOT NULL DEFAULT 0,
  subscription_status public.agent_subscription_status NOT NULL DEFAULT 'none',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.agents TO authenticated;
GRANT ALL ON public.agents TO service_role;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agents_select_own" ON public.agents
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "agents_insert_own" ON public.agents
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agents_update_own" ON public.agents
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_agents_updated
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- helper: current agent id
CREATE OR REPLACE FUNCTION public.current_agent_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT id FROM public.agents WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.agent_has_active_subscription(_agent_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.agents
    WHERE id = _agent_id AND subscription_status = 'active'
  )
$$;

-- ========== PROPERTIES: extend ==========
ALTER TABLE public.properties
  ADD COLUMN agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
  ADD COLUMN source_type public.object_source_type,
  ADD COLUMN side public.object_side,
  ADD COLUMN deal_type public.object_deal_type,
  ADD COLUMN property_type public.object_property_type,
  ADD COLUMN object_status public.object_status NOT NULL DEFAULT 'active',
  ADD COLUMN last_confirmed_at timestamptz;

CREATE INDEX idx_properties_agent ON public.properties(agent_id);

-- Allow the owning agent to read/update their own objects (adds to existing device-scoped policies without replacing them).
CREATE POLICY "properties_agent_select" ON public.properties
  FOR SELECT TO authenticated
  USING (agent_id IS NOT NULL AND agent_id = public.current_agent_id());
CREATE POLICY "properties_agent_update" ON public.properties
  FOR UPDATE TO authenticated
  USING (agent_id IS NOT NULL AND agent_id = public.current_agent_id())
  WITH CHECK (agent_id IS NOT NULL AND agent_id = public.current_agent_id());
CREATE POLICY "properties_agent_insert" ON public.properties
  FOR INSERT TO authenticated
  WITH CHECK (agent_id = public.current_agent_id());

-- ========== CLIENT PACKS ==========
CREATE TABLE public.client_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  client_name text,
  share_slug text NOT NULL UNIQUE,
  is_public boolean NOT NULL,
  verdict_text text,
  client_explanation jsonb,
  risks jsonb,
  price_argument text,
  next_step text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_packs TO authenticated;
GRANT ALL ON public.client_packs TO service_role;
ALTER TABLE public.client_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_packs_agent_select" ON public.client_packs
  FOR SELECT TO authenticated USING (agent_id = public.current_agent_id());
CREATE POLICY "client_packs_agent_update" ON public.client_packs
  FOR UPDATE TO authenticated
  USING (agent_id = public.current_agent_id())
  WITH CHECK (agent_id = public.current_agent_id());
CREATE POLICY "client_packs_agent_delete" ON public.client_packs
  FOR DELETE TO authenticated USING (agent_id = public.current_agent_id());
-- INSERT deliberately not policyed for anon/authenticated at row level:
-- creation goes via edge function `create-share-link` (service_role) that enforces the paywall gate.
-- authenticated INSERT policy is added so an agent WITH active subscription can also create directly via RLS when needed.
CREATE POLICY "client_packs_agent_insert" ON public.client_packs
  FOR INSERT TO authenticated
  WITH CHECK (
    agent_id = public.current_agent_id()
    AND public.agent_has_active_subscription(agent_id)
  );

CREATE INDEX idx_client_packs_agent ON public.client_packs(agent_id);
CREATE INDEX idx_client_packs_object ON public.client_packs(object_id);

CREATE TRIGGER trg_client_packs_updated
  BEFORE UPDATE ON public.client_packs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== LEADS ==========
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_pack_id uuid NOT NULL REFERENCES public.client_packs(id) ON DELETE CASCADE,
  object_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_phone_or_email text NOT NULL,
  message text,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.leads TO authenticated;
GRANT ALL ON public.leads TO service_role;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_agent_select" ON public.leads
  FOR SELECT TO authenticated USING (agent_id = public.current_agent_id());
-- INSERT is server-side only (edge function via service_role); no authenticated/anon policy.

CREATE INDEX idx_leads_agent ON public.leads(agent_id);
CREATE INDEX idx_leads_pack ON public.leads(client_pack_id);
CREATE INDEX idx_leads_object ON public.leads(object_id);

-- ========== LEAD NOTIFICATIONS ==========
CREATE TABLE public.lead_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  channel public.lead_notification_channel NOT NULL,
  status public.lead_notification_status NOT NULL,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.lead_notifications TO authenticated;
GRANT ALL ON public.lead_notifications TO service_role;
ALTER TABLE public.lead_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lead_notifications_agent_select" ON public.lead_notifications
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.leads l
    WHERE l.id = lead_notifications.lead_id
      AND l.agent_id = public.current_agent_id()
  ));

CREATE INDEX idx_lead_notifs_lead ON public.lead_notifications(lead_id);

-- ========== OBJECT STATUSES LOG ==========
CREATE TABLE public.object_statuses_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  status public.object_status NOT NULL,
  confirmed_by uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.object_statuses_log TO authenticated;
GRANT ALL ON public.object_statuses_log TO service_role;
ALTER TABLE public.object_statuses_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "object_statuses_agent_select" ON public.object_statuses_log
  FOR SELECT TO authenticated USING (confirmed_by = public.current_agent_id());
CREATE POLICY "object_statuses_agent_insert" ON public.object_statuses_log
  FOR INSERT TO authenticated
  WITH CHECK (
    confirmed_by = public.current_agent_id()
    AND EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = object_statuses_log.object_id
        AND p.agent_id = public.current_agent_id()
    )
  );

CREATE INDEX idx_statuses_object ON public.object_statuses_log(object_id);

-- ========== PAYWALL EVENTS ==========
CREATE TABLE public.paywall_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  object_id uuid REFERENCES public.properties(id) ON DELETE SET NULL,
  clicked_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.paywall_events TO authenticated;
GRANT ALL ON public.paywall_events TO service_role;
ALTER TABLE public.paywall_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "paywall_events_agent_select" ON public.paywall_events
  FOR SELECT TO authenticated USING (agent_id = public.current_agent_id());
CREATE POLICY "paywall_events_agent_insert" ON public.paywall_events
  FOR INSERT TO authenticated
  WITH CHECK (agent_id = public.current_agent_id());

CREATE INDEX idx_paywall_events_agent ON public.paywall_events(agent_id);
