CREATE TABLE public.trophy_details (
  id text PRIMARY KEY,
  name text,
  category text,
  issuer text,
  description text,
  image_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','archived')),
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trophy_details TO authenticated;
GRANT ALL ON public.trophy_details TO service_role;

ALTER TABLE public.trophy_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read trophy details"
  ON public.trophy_details FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated insert trophy details"
  ON public.trophy_details FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated update trophy details"
  ON public.trophy_details FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete trophy details"
  ON public.trophy_details FOR DELETE TO authenticated USING (true);