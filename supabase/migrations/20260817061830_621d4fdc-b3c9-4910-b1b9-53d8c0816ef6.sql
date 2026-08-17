
-- =========================
-- CHAT CONVERSATIONS
-- =========================
CREATE TABLE public.chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  module text NOT NULL DEFAULT 'AMS',
  allowed_roles text[] NOT NULL DEFAULT ARRAY['user','admin','super_admin']::text[],
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_conversations TO authenticated;
GRANT ALL ON public.chat_conversations TO service_role;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- =========================
-- PARTICIPANTS
-- =========================
CREATE TABLE public.chat_participants (
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_participants TO authenticated;
GRANT ALL ON public.chat_participants TO service_role;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- =========================
-- MESSAGES
-- =========================
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX chat_messages_conv_created_idx ON public.chat_messages(conversation_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- =========================
-- Security-definer helpers (avoid RLS recursion)
-- =========================
CREATE OR REPLACE FUNCTION public.is_chat_participant(_conv uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE conversation_id = _conv AND user_id = _user
  );
$$;

CREATE OR REPLACE FUNCTION public.can_post_in_chat(_conv uuid, _user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants p
    JOIN public.chat_conversations c ON c.id = p.conversation_id
    WHERE p.conversation_id = _conv
      AND p.user_id = _user
      AND (
        p.role = ANY (c.allowed_roles)
        OR public.is_admin(_user)
      )
  );
$$;

-- =========================
-- RLS POLICIES
-- =========================

CREATE POLICY "chat_conv_select_participants"
ON public.chat_conversations FOR SELECT TO authenticated
USING (public.is_chat_participant(id, auth.uid()));

CREATE POLICY "chat_conv_insert_self"
ON public.chat_conversations FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "chat_conv_update_creator_or_admin"
ON public.chat_conversations FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR public.is_admin(auth.uid()))
WITH CHECK (created_by = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "chat_part_select_same_conv"
ON public.chat_participants FOR SELECT TO authenticated
USING (public.is_chat_participant(conversation_id, auth.uid()));

CREATE POLICY "chat_part_insert_creator_or_admin"
ON public.chat_participants FOR INSERT TO authenticated
WITH CHECK (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.chat_conversations c
    WHERE c.id = conversation_id AND c.created_by = auth.uid()
  )
  OR user_id = auth.uid()
);

CREATE POLICY "chat_part_delete_self_or_admin"
ON public.chat_participants FOR DELETE TO authenticated
USING (user_id = auth.uid() OR public.is_admin(auth.uid()));

CREATE POLICY "chat_msg_select_participants"
ON public.chat_messages FOR SELECT TO authenticated
USING (public.is_chat_participant(conversation_id, auth.uid()));

CREATE POLICY "chat_msg_insert_authorized_role"
ON public.chat_messages FOR INSERT TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND public.can_post_in_chat(conversation_id, auth.uid())
);

CREATE POLICY "chat_msg_delete_own_or_admin"
ON public.chat_messages FOR DELETE TO authenticated
USING (sender_id = auth.uid() OR public.is_admin(auth.uid()));

-- =========================
-- Touch updated_at
-- =========================
CREATE TRIGGER chat_conversations_touch
BEFORE UPDATE ON public.chat_conversations
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.bump_chat_conversation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.chat_conversations SET updated_at = now() WHERE id = NEW.conversation_id;
  RETURN NEW;
END; $$;

CREATE TRIGGER chat_messages_bump_conv
AFTER INSERT ON public.chat_messages
FOR EACH ROW EXECUTE FUNCTION public.bump_chat_conversation();

-- =========================
-- Realtime
-- =========================
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.chat_conversations REPLICA IDENTITY FULL;
ALTER TABLE public.chat_participants REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;

REVOKE EXECUTE ON FUNCTION public.is_chat_participant(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.can_post_in_chat(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.bump_chat_conversation() FROM PUBLIC, anon, authenticated;
