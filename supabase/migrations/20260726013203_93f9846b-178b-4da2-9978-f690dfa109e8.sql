
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');
CREATE TYPE public.rarity_tier AS ENUM ('common', 'rare', 'epic', 'legendary', 'mythic');
CREATE TYPE public.trophy_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
CREATE TYPE public.entity_status AS ENUM ('active', 'inactive', 'archived', 'draft');
CREATE TYPE public.mission_cadence AS ENUM ('daily', 'weekly', 'monthly', 'seasonal');
CREATE TYPE public.claim_status AS ENUM ('pending', 'approved', 'rejected', 'fulfilled');
CREATE TYPE public.wallet_kind AS ENUM ('coins', 'tokens', 'rewards');

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $fn$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $fn$;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT, username TEXT UNIQUE, avatar_url TEXT, email TEXT,
  country TEXT, state TEXT, city TEXT, territory TEXT, team TEXT,
  role_title TEXT, bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all_auth" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_self_upsert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER trg_profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$fn$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID) RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $fn$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin','admin'))
$fn$;

CREATE POLICY "user_roles_self_read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "user_roles_super_admin_write" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TABLE public.achievement_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  icon TEXT, color TEXT, sort_order INT DEFAULT 0,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.badge_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  icon TEXT, color TEXT,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  category_id UUID REFERENCES public.achievement_categories(id) ON DELETE SET NULL,
  rarity public.rarity_tier NOT NULL DEFAULT 'common',
  icon TEXT, color TEXT, image_url TEXT,
  xp_reward INT NOT NULL DEFAULT 0,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  is_secret BOOLEAN NOT NULL DEFAULT false,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  collection_id UUID REFERENCES public.badge_collections(id) ON DELETE SET NULL,
  rarity public.rarity_tier NOT NULL DEFAULT 'common',
  icon TEXT, color TEXT, image_url TEXT,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  tier public.trophy_tier NOT NULL DEFAULT 'bronze',
  icon TEXT, color TEXT, image_url TEXT,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.xp_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
  description TEXT, default_xp INT NOT NULL DEFAULT 0,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.xp_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT,
  source_id UUID REFERENCES public.xp_sources(id) ON DELETE CASCADE,
  xp_value INT NOT NULL DEFAULT 0,
  multiplier NUMERIC NOT NULL DEFAULT 1.0,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  cooldown_seconds INT DEFAULT 0, max_per_day INT,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_number INT NOT NULL UNIQUE, name TEXT NOT NULL,
  xp_required INT NOT NULL,
  rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon TEXT, color TEXT,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank_number INT NOT NULL UNIQUE, name TEXT NOT NULL, min_xp INT NOT NULL,
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  icon TEXT, color TEXT,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_xp (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp BIGINT NOT NULL DEFAULT 0,
  current_level INT NOT NULL DEFAULT 1,
  current_rank INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INT NOT NULL,
  source_id UUID REFERENCES public.xp_sources(id) ON DELETE SET NULL,
  rule_id UUID REFERENCES public.xp_rules(id) ON DELETE SET NULL,
  reason TEXT, metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_tx_user ON public.xp_transactions(user_id, created_at DESC);
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  progress NUMERIC NOT NULL DEFAULT 0, unlocked_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE (user_id, achievement_id)
);
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
CREATE TABLE public.user_trophies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trophy_id UUID NOT NULL REFERENCES public.trophies(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, trophy_id)
);
CREATE TABLE public.user_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_xp (user_id, total_xp) VALUES (NEW.id, 0) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $fn$;

CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL,
  theme JSONB DEFAULT '{}'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  rewards JSONB DEFAULT '[]'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  rewards JSONB DEFAULT '[]'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT,
  cadence public.mission_cadence NOT NULL DEFAULT 'daily',
  season_id UUID REFERENCES public.seasons(id) ON DELETE SET NULL,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp_reward INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp_reward INT NOT NULL DEFAULT 0,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, description TEXT,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  rewards JSONB NOT NULL DEFAULT '[]'::jsonb,
  xp_reward INT NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ, ends_at TIMESTAMPTZ,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.user_mission_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  progress NUMERIC NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ, period_key TEXT,
  UNIQUE (user_id, mission_id, period_key)
);

CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  cost_coins INT NOT NULL DEFAULT 0, cost_tokens INT NOT NULL DEFAULT 0,
  stock INT, image_url TEXT, icon TEXT,
  eligibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  rarity public.rarity_tier NOT NULL DEFAULT 'common',
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.reward_wallets (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.wallet_kind NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, kind)
);
CREATE TABLE public.claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  status public.claim_status NOT NULL DEFAULT 'pending',
  cost_coins INT NOT NULL DEFAULT 0, cost_tokens INT NOT NULL DEFAULT 0,
  notes TEXT, decided_by UUID REFERENCES auth.users(id),
  decided_at TIMESTAMPTZ, fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_claims_user ON public.claims(user_id, created_at DESC);

CREATE TABLE public.leaderboard_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, description TEXT,
  scope TEXT NOT NULL DEFAULT 'global', scope_value TEXT,
  metric TEXT NOT NULL DEFAULT 'xp',
  formula JSONB DEFAULT '{}'::jsonb,
  refresh_minutes INT NOT NULL DEFAULT 15,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id UUID NOT NULL REFERENCES public.leaderboard_definitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INT NOT NULL, score BIGINT NOT NULL DEFAULT 0,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (definition_id, user_id)
);
CREATE INDEX idx_lb_def_rank ON public.leaderboard_entries(definition_id, rank);

CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title_template TEXT NOT NULL, body_template TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'in_app',
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, trigger TEXT NOT NULL,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  conditions JSONB DEFAULT '{}'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL, body TEXT,
  kind TEXT NOT NULL DEFAULT 'info',
  read_at TIMESTAMPTZ, data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, created_at DESC);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL, entity_id TEXT, action TEXT NOT NULL,
  before JSONB, after JSONB, ip TEXT, user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON public.audit_logs(entity_type, created_at DESC);
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activity TEXT NOT NULL, metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_activity_user ON public.activity_logs(user_id, created_at DESC);
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_analytics_event ON public.analytics_events(event_type, created_at DESC);

CREATE TABLE public.ai_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'google/gemini-3-flash-preview',
  config JSONB DEFAULT '{}'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, trigger TEXT NOT NULL,
  conditions JSONB DEFAULT '[]'::jsonb,
  actions JSONB DEFAULT '[]'::jsonb,
  status public.entity_status NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.system_settings (
  key TEXT PRIMARY KEY, value JSONB NOT NULL, description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $do$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'achievement_categories','badge_collections','achievements','badges','trophies',
    'xp_sources','xp_rules','levels','ranks','user_xp','xp_transactions',
    'user_achievements','user_badges','user_trophies','user_streaks',
    'seasons','campaigns','events','missions','quests','challenges','user_mission_progress',
    'rewards','reward_wallets','claims',
    'leaderboard_definitions','leaderboard_entries',
    'notification_templates','notification_rules','notifications',
    'audit_logs','activity_logs','analytics_events',
    'ai_prompts','automation_rules','system_settings'
  ]) LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated;', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role;', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $do$;

CREATE POLICY "cat_read_all" ON public.achievement_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "cat_admin_write" ON public.achievement_categories FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "col_read_all" ON public.badge_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "col_admin_write" ON public.badge_collections FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ach_read_all" ON public.achievements FOR SELECT TO authenticated USING (true);
CREATE POLICY "ach_admin_write" ON public.achievements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "bdg_read_all" ON public.badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "bdg_admin_write" ON public.badges FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "trp_read_all" ON public.trophies FOR SELECT TO authenticated USING (true);
CREATE POLICY "trp_admin_write" ON public.trophies FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "xpsrc_read" ON public.xp_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "xpsrc_admin" ON public.xp_sources FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "xprule_read" ON public.xp_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "xprule_admin" ON public.xp_rules FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "lvl_read" ON public.levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "lvl_admin" ON public.levels FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "rnk_read" ON public.ranks FOR SELECT TO authenticated USING (true);
CREATE POLICY "rnk_admin" ON public.ranks FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "uxp_self" ON public.user_xp FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "uxp_admin_write" ON public.user_xp FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "xptx_self_read" ON public.xp_transactions FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "xptx_admin_write" ON public.xp_transactions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "uach_self_read" ON public.user_achievements FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "uach_admin_write" ON public.user_achievements FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ubdg_self_read" ON public.user_badges FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "ubdg_admin_write" ON public.user_badges FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "utrp_self_read" ON public.user_trophies FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "utrp_admin_write" ON public.user_trophies FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ustr_self_read" ON public.user_streaks FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "ustr_admin_write" ON public.user_streaks FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ssn_read" ON public.seasons FOR SELECT TO authenticated USING (true);
CREATE POLICY "ssn_admin" ON public.seasons FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "cmp_read" ON public.campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "cmp_admin" ON public.campaigns FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "evt_read" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "evt_admin" ON public.events FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "msn_read" ON public.missions FOR SELECT TO authenticated USING (true);
CREATE POLICY "msn_admin" ON public.missions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "qst_read" ON public.quests FOR SELECT TO authenticated USING (true);
CREATE POLICY "qst_admin" ON public.quests FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "chl_read" ON public.challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "chl_admin" ON public.challenges FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ump_self_read" ON public.user_mission_progress FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "ump_admin_write" ON public.user_mission_progress FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "rwd_read" ON public.rewards FOR SELECT TO authenticated USING (true);
CREATE POLICY "rwd_admin" ON public.rewards FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "wal_self_read" ON public.reward_wallets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "wal_admin_write" ON public.reward_wallets FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "clm_self_read" ON public.claims FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "clm_self_insert" ON public.claims FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "clm_admin_update" ON public.claims FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "clm_admin_delete" ON public.claims FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "lbd_read" ON public.leaderboard_definitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "lbd_admin" ON public.leaderboard_definitions FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "lbe_read" ON public.leaderboard_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "lbe_admin_write" ON public.leaderboard_entries FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "ntpl_read" ON public.notification_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "ntpl_admin" ON public.notification_templates FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "nrul_read" ON public.notification_rules FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "nrul_admin" ON public.notification_rules FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "nfy_self_read" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "nfy_self_update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "nfy_admin_write" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "nfy_admin_del" ON public.notifications FOR DELETE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "aud_admin_read" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "act_admin_read" ON public.activity_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "act_self_read" ON public.activity_logs FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "ane_admin_read" ON public.analytics_events FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "aip_admin" ON public.ai_prompts FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "atr_admin" ON public.automation_rules FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "sys_admin" ON public.system_settings FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

DO $do$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'achievement_categories','badge_collections','achievements','badges','trophies',
    'xp_sources','xp_rules','levels','ranks',
    'seasons','campaigns','events','missions','quests','challenges',
    'rewards','claims',
    'leaderboard_definitions','notification_templates','notification_rules',
    'ai_prompts','automation_rules'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_touch BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();', t, t);
  END LOOP;
END $do$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
