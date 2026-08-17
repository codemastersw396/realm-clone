CREATE SEQUENCE IF NOT EXISTS public.ams_ticket_seq START 1001;
GRANT USAGE, SELECT ON SEQUENCE public.ams_ticket_seq TO authenticated, service_role;

CREATE TYPE public.ams_status AS ENUM (
  'draft','submitted','assigned','accepted','in_progress',
  'waiting_customer','waiting_developer','waiting_qa','testing',
  'resolved','closed','reopened','cancelled','archived'
);
CREATE TYPE public.ams_priority AS ENUM ('low','medium','high','critical');
CREATE TYPE public.ams_event_kind AS ENUM (
  'created','updated','status_changed','assigned','reassigned','transferred',
  'commented','internal_note','escalated','resolved','closed','reopened',
  'archived','restored','attachment_added','attachment_removed'
);
CREATE TYPE public.ams_chat_channel AS ENUM ('support','developer','qa','boss','ai','customer');

CREATE TABLE public.ams_tickets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_no       text UNIQUE NOT NULL DEFAULT ('AMS-' || lpad(nextval('public.ams_ticket_seq')::text, 6, '0')),
  subject         text NOT NULL,
  description     text,
  product         text,
  category        text,
  priority        public.ams_priority NOT NULL DEFAULT 'medium',
  status          public.ams_status   NOT NULL DEFAULT 'draft',
  department      text,
  team            text,
  expected_resolution_at timestamptz,
  created_by      uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  assignee_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_id     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  tags            text[] NOT NULL DEFAULT '{}',
  metadata        jsonb  NOT NULL DEFAULT '{}'::jsonb,
  resolved_at     timestamptz,
  closed_at       timestamptz,
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ams_tickets_status_idx     ON public.ams_tickets(status) WHERE deleted_at IS NULL;
CREATE INDEX ams_tickets_assignee_idx   ON public.ams_tickets(assignee_id);
CREATE INDEX ams_tickets_creator_idx    ON public.ams_tickets(created_by);
CREATE INDEX ams_tickets_priority_idx   ON public.ams_tickets(priority);
CREATE INDEX ams_tickets_created_at_idx ON public.ams_tickets(created_at DESC);
CREATE TRIGGER ams_tickets_touch BEFORE UPDATE ON public.ams_tickets
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ams_tickets TO authenticated;
GRANT ALL ON public.ams_tickets TO service_role;
ALTER TABLE public.ams_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ams_tickets read" ON public.ams_tickets FOR SELECT TO authenticated
USING (created_by = auth.uid() OR assignee_id = auth.uid() OR customer_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "ams_tickets insert" ON public.ams_tickets FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());
CREATE POLICY "ams_tickets update" ON public.ams_tickets FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR assignee_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "ams_tickets delete" ON public.ams_tickets FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TABLE public.ams_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.ams_tickets(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind public.ams_event_kind NOT NULL,
  from_value text, to_value text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ams_events_ticket_idx ON public.ams_events(ticket_id, created_at DESC);
GRANT SELECT, INSERT ON public.ams_events TO authenticated;
GRANT ALL ON public.ams_events TO service_role;
ALTER TABLE public.ams_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_events read" ON public.ams_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.ams_tickets t WHERE t.id = ticket_id));
CREATE POLICY "ams_events insert" ON public.ams_events FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid());

CREATE TABLE public.ams_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.ams_tickets(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ams_comments_ticket_idx ON public.ams_comments(ticket_id, created_at);
CREATE TRIGGER ams_comments_touch BEFORE UPDATE ON public.ams_comments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ams_comments TO authenticated;
GRANT ALL ON public.ams_comments TO service_role;
ALTER TABLE public.ams_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_comments read" ON public.ams_comments FOR SELECT TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.ams_tickets t WHERE t.id = ticket_id
    AND (t.created_by = auth.uid() OR t.assignee_id = auth.uid() OR t.customer_id = auth.uid() OR public.is_admin(auth.uid())))
  AND (is_internal = false OR public.is_admin(auth.uid())
       OR EXISTS (SELECT 1 FROM public.ams_tickets t2 WHERE t2.id = ticket_id AND t2.assignee_id = auth.uid()))
);
CREATE POLICY "ams_comments insert" ON public.ams_comments FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid());
CREATE POLICY "ams_comments update" ON public.ams_comments FOR UPDATE TO authenticated
USING (author_id = auth.uid());
CREATE POLICY "ams_comments delete" ON public.ams_comments FOR DELETE TO authenticated
USING (author_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE TABLE public.ams_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.ams_tickets(id) ON DELETE CASCADE,
  channel public.ams_chat_channel NOT NULL DEFAULT 'support',
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'user',
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  bookmarked boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ams_chat_ticket_idx ON public.ams_chat_messages(ticket_id, channel, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ams_chat_messages TO authenticated;
GRANT ALL ON public.ams_chat_messages TO service_role;
ALTER TABLE public.ams_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_chat read" ON public.ams_chat_messages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.ams_tickets t WHERE t.id = ticket_id
  AND (t.created_by = auth.uid() OR t.assignee_id = auth.uid() OR t.customer_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "ams_chat insert" ON public.ams_chat_messages FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid() OR author_id IS NULL);
CREATE POLICY "ams_chat update" ON public.ams_chat_messages FOR UPDATE TO authenticated
USING (author_id = auth.uid() OR public.is_admin(auth.uid()));
CREATE POLICY "ams_chat delete" ON public.ams_chat_messages FOR DELETE TO authenticated
USING (author_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE TABLE public.ams_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.ams_tickets(id) ON DELETE CASCADE,
  uploader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  mime_type text,
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ams_attachments_ticket_idx ON public.ams_attachments(ticket_id);
GRANT SELECT, INSERT, DELETE ON public.ams_attachments TO authenticated;
GRANT ALL ON public.ams_attachments TO service_role;
ALTER TABLE public.ams_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ams_att read" ON public.ams_attachments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.ams_tickets t WHERE t.id = ticket_id
  AND (t.created_by = auth.uid() OR t.assignee_id = auth.uid() OR t.customer_id = auth.uid() OR public.is_admin(auth.uid()))));
CREATE POLICY "ams_att insert" ON public.ams_attachments FOR INSERT TO authenticated
WITH CHECK (uploader_id = auth.uid());
CREATE POLICY "ams_att delete" ON public.ams_attachments FOR DELETE TO authenticated
USING (uploader_id = auth.uid() OR public.is_admin(auth.uid()));