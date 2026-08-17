
-- =========================================================
-- DEMO SEED
-- =========================================================
DO $seed$
DECLARE
  u_super uuid := '11111111-1111-1111-1111-111111111111';
  u_admin uuid := '22222222-2222-2222-2222-222222222222';
  u_maya  uuid := '33333333-3333-3333-3333-333333333333';
  u_kai   uuid := '44444444-4444-4444-4444-444444444444';
  u_zara  uuid := '55555555-5555-5555-5555-555555555555';
  u_leo   uuid := '66666666-6666-6666-6666-666666666666';
  cat_perf uuid := gen_random_uuid();
  cat_team uuid := gen_random_uuid();
  cat_grow uuid := gen_random_uuid();
  ach_first uuid := gen_random_uuid();
  ach_streak uuid := gen_random_uuid();
  ach_mentor uuid := gen_random_uuid();
  ach_top uuid := gen_random_uuid();
  ach_night uuid := gen_random_uuid();
  ach_legend uuid := gen_random_uuid();
  src_peer uuid := gen_random_uuid();
  src_mgr  uuid := gen_random_uuid();
  src_mile uuid := gen_random_uuid();
  src_train uuid := gen_random_uuid();
  t1 uuid := gen_random_uuid();
  t2 uuid := gen_random_uuid();
  t3 uuid := gen_random_uuid();
  t4 uuid := gen_random_uuid();
  t5 uuid := gen_random_uuid();
  t6 uuid := gen_random_uuid();
  t7 uuid := gen_random_uuid();
  t8 uuid := gen_random_uuid();
BEGIN

-- ---------- auth.users ----------
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
)
VALUES
  ('00000000-0000-0000-0000-000000000000', u_super, 'authenticated', 'authenticated', 'super@demo.app', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sasha Reyes"}', now() - interval '120 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', u_admin, 'authenticated', 'authenticated', 'admin@demo.app', crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Jordan Blake"}', now() - interval '110 days', now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', u_maya,  'authenticated', 'authenticated', 'maya@demo.app',  crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Maya Chen"}',    now() - interval '90 days',  now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', u_kai,   'authenticated', 'authenticated', 'kai@demo.app',   crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kai Nakamura"}', now() - interval '75 days',  now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', u_zara,  'authenticated', 'authenticated', 'zara@demo.app',  crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Zara Ahmed"}',   now() - interval '60 days',  now(), '', '', '', ''),
  ('00000000-0000-0000-0000-000000000000', u_leo,   'authenticated', 'authenticated', 'leo@demo.app',   crypt('Password123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Leo Martins"}',  now() - interval '45 days',  now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), u_super, jsonb_build_object('sub', u_super::text, 'email','super@demo.app'), 'email', u_super::text, now(), now(), now()),
  (gen_random_uuid(), u_admin, jsonb_build_object('sub', u_admin::text, 'email','admin@demo.app'), 'email', u_admin::text, now(), now(), now()),
  (gen_random_uuid(), u_maya,  jsonb_build_object('sub', u_maya::text,  'email','maya@demo.app'),  'email', u_maya::text,  now(), now(), now()),
  (gen_random_uuid(), u_kai,   jsonb_build_object('sub', u_kai::text,   'email','kai@demo.app'),   'email', u_kai::text,   now(), now(), now()),
  (gen_random_uuid(), u_zara,  jsonb_build_object('sub', u_zara::text,  'email','zara@demo.app'),  'email', u_zara::text,  now(), now(), now()),
  (gen_random_uuid(), u_leo,   jsonb_build_object('sub', u_leo::text,   'email','leo@demo.app'),   'email', u_leo::text,   now(), now(), now())
ON CONFLICT DO NOTHING;

-- ---------- profiles ----------
INSERT INTO public.profiles (id, display_name, username, email, avatar_url, country, city, team, role_title, bio) VALUES
  (u_super, 'Sasha Reyes',   'sasha',  'super@demo.app', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sasha',  'USA',   'San Francisco', 'Leadership',  'Chief People Officer', 'Building recognition-first cultures.'),
  (u_admin, 'Jordan Blake',  'jordan', 'admin@demo.app', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan', 'UK',    'London',        'People Ops',  'HR Program Manager',   'Runs the recognition program day-to-day.'),
  (u_maya,  'Maya Chen',     'maya',   'maya@demo.app',  'https://api.dicebear.com/7.x/avataaars/svg?seed=maya',   'Canada','Toronto',       'Engineering', 'Staff Engineer',       'Loves shipping and mentoring.'),
  (u_kai,   'Kai Nakamura',  'kai',    'kai@demo.app',   'https://api.dicebear.com/7.x/avataaars/svg?seed=kai',    'Japan', 'Tokyo',         'Design',      'Product Designer',     'Design systems + micro-interactions.'),
  (u_zara,  'Zara Ahmed',    'zara',   'zara@demo.app',  'https://api.dicebear.com/7.x/avataaars/svg?seed=zara',   'UAE',   'Dubai',         'Sales',       'Account Executive',    'Closing deals, celebrating wins.'),
  (u_leo,   'Leo Martins',   'leo',    'leo@demo.app',   'https://api.dicebear.com/7.x/avataaars/svg?seed=leo',    'Brazil','São Paulo',     'Support',     'Support Lead',         'Customer-obsessed.')
ON CONFLICT (id) DO NOTHING;

-- ---------- roles ----------
INSERT INTO public.user_roles (user_id, role) VALUES
  (u_super, 'super_admin'),
  (u_admin, 'admin'),
  (u_maya,  'user'),
  (u_kai,   'user'),
  (u_zara,  'user'),
  (u_leo,   'user')
ON CONFLICT DO NOTHING;

-- ---------- user_xp ----------
INSERT INTO public.user_xp (user_id, total_xp, current_level, current_rank) VALUES
  (u_super, 12800, 12, 1),
  (u_admin, 9450,  10, 2),
  (u_maya,  8200,  9,  3),
  (u_kai,   6100,  7,  4),
  (u_zara,  4700,  6,  5),
  (u_leo,   2300,  4,  6)
ON CONFLICT (user_id) DO UPDATE SET total_xp=EXCLUDED.total_xp, current_level=EXCLUDED.current_level, current_rank=EXCLUDED.current_rank;

-- ---------- xp sources ----------
INSERT INTO public.xp_sources (id, name, slug, description, default_xp) VALUES
  (src_peer,  'Peer Recognition',    'peer-recognition',    'Kudos from a teammate',          50),
  (src_mgr,   'Manager Recognition', 'manager-recognition', 'Shout-out from a manager',       150),
  (src_mile,  'Milestone',           'milestone',           'Work anniversary or milestone',  500),
  (src_train, 'Training Completed',  'training-completed',  'Finished a learning module',     200);

-- ---------- xp transactions (recent activity) ----------
INSERT INTO public.xp_transactions (user_id, amount, source_id, reason, created_at) VALUES
  (u_maya, 150, src_mgr,  'Shipped the new onboarding flow',       now() - interval '2 hours'),
  (u_kai,   50, src_peer, 'Great design review feedback',          now() - interval '5 hours'),
  (u_zara, 500, src_mile, 'Closed the ACME expansion deal',        now() - interval '1 day'),
  (u_leo,  200, src_train,'Completed "Customer Empathy 201"',      now() - interval '1 day 3 hours'),
  (u_maya,  50, src_peer, 'Debugged prod incident with support',   now() - interval '2 days'),
  (u_kai,  150, src_mgr,  'Led the design system RFC',             now() - interval '3 days'),
  (u_zara,  50, src_peer, 'Helped a new AE with discovery call',   now() - interval '4 days'),
  (u_admin,150, src_mgr,  'Ran the Q3 recognition retro',          now() - interval '5 days'),
  (u_leo,   50, src_peer, 'Documented the top 10 support macros',  now() - interval '6 days'),
  (u_maya, 200, src_train,'Completed "Staff+ Communication"',      now() - interval '7 days');

-- ---------- achievement categories ----------
INSERT INTO public.achievement_categories (id, name, slug, description) VALUES
  (cat_perf, 'Performance',   'performance',   'Outcomes and delivery'),
  (cat_team, 'Teamwork',      'teamwork',      'Collaboration and support'),
  (cat_grow, 'Growth',        'growth',        'Learning and mentorship');

-- ---------- achievements ----------
INSERT INTO public.achievements (id, name, slug, description, category_id, rarity, xp_reward, icon, color) VALUES
  (ach_first,  'First Kudos',          'first-kudos',     'Received your first recognition',                cat_team, 'common',    50,  '🎉', '#22c55e'),
  (ach_streak, '7-Day Streak',         'seven-day-streak','Recognized 7 days in a row',                     cat_team, 'rare',      200, '🔥', '#f97316'),
  (ach_mentor, 'Mentor',               'mentor',          'Helped 5 teammates level up',                    cat_grow, 'epic',      500, '🧑‍🏫','#3b82f6'),
  (ach_top,    'Top Performer',        'top-performer',   'Ranked #1 on the leaderboard for a month',       cat_perf, 'legendary', 1000,'🏆', '#eab308'),
  (ach_night,  'Night Owl',            'night-owl',       'Shipped a fix after midnight',                   cat_perf, 'rare',      150, '🌙', '#8b5cf6'),
  (ach_legend, 'Recognition Legend',   'recognition-legend','Earned 10,000 XP total',                       cat_perf, 'mythic',    2500,'🌟', '#ec4899');

-- ---------- user_achievements ----------
INSERT INTO public.user_achievements (user_id, achievement_id, progress, unlocked_at) VALUES
  (u_maya, ach_first,  100, now() - interval '80 days'),
  (u_maya, ach_streak, 100, now() - interval '20 days'),
  (u_maya, ach_mentor, 100, now() - interval '10 days'),
  (u_maya, ach_top,     60, NULL),
  (u_kai,  ach_first,  100, now() - interval '65 days'),
  (u_kai,  ach_night,  100, now() - interval '30 days'),
  (u_kai,  ach_streak,  70, NULL),
  (u_zara, ach_first,  100, now() - interval '55 days'),
  (u_zara, ach_top,    100, now() - interval '3 days'),
  (u_leo,  ach_first,  100, now() - interval '40 days'),
  (u_super,ach_legend, 100, now() - interval '15 days'),
  (u_admin,ach_mentor, 100, now() - interval '25 days');

-- ---------- events / campaigns ----------
INSERT INTO public.events (name, slug, description, starts_at, ends_at, status) VALUES
  ('Q3 Kickoff Kudos',    'q3-kickoff-kudos',    'Recognize teammates for Q3 launch prep.',       now() - interval '30 days', now() + interval '5 days',  'active'),
  ('Customer Love Week',  'customer-love-week',  'Spotlight customer-obsessed moments.',          now() - interval '7 days',  now() + interval '7 days',  'active'),
  ('Learning Sprint',     'learning-sprint',     'Complete a course, get bonus XP.',              now() - interval '2 days',  now() + interval '14 days', 'active');

-- ---------- AMS tickets ----------
INSERT INTO public.ams_tickets (id, subject, description, product, category, priority, status, department, team, created_by, assignee_id, customer_id, tags, created_at, updated_at) VALUES
  (t1, 'SSO login failing for Google Workspace users', 'Users report "invalid redirect_uri" after upgrade.',        'Recognition Realm','auth',        'critical','in_progress',    'Engineering','Platform', u_leo,   u_maya,  u_zara, ARRAY['sso','p0'],       now() - interval '6 hours', now() - interval '1 hour'),
  (t2, 'Leaderboard shows stale ranks',                'Ranks are 24h behind after the migration.',                 'Recognition Realm','data',        'high',    'assigned',       'Engineering','Data',     u_admin, u_kai,   NULL,   ARRAY['leaderboard'],    now() - interval '1 day',   now() - interval '20 hours'),
  (t3, 'Bulk kudos import fails past 500 rows',        'CSV import throws timeout at row 512.',                     'Recognition Realm','import',      'medium',  'waiting_developer','Engineering','Platform', u_admin, u_maya,  NULL,   ARRAY['csv','import'],   now() - interval '2 days',  now() - interval '1 day'),
  (t4, 'Slack integration not posting to #wins',       'Channel selector saves but posts land in #general.',        'Integrations',     'slack',       'medium',  'submitted',      'Engineering','Integrations',u_leo,NULL,    u_zara, ARRAY['slack'],          now() - interval '3 days',  now() - interval '3 days'),
  (t5, 'Badge SVG rendering broken on Safari 17',      'Legendary badges render as blank on Safari 17.0.',          'Recognition Realm','ui',          'low',     'resolved',       'Design',     'Web',      u_kai,   u_kai,   NULL,   ARRAY['ui','safari'],    now() - interval '10 days', now() - interval '2 days'),
  (t6, 'Add CSV export for XP transactions',           'Admins want per-user XP export for payroll bonuses.',        'Recognition Realm','feature',     'low',     'accepted',       'Engineering','Reports',  u_admin, u_maya,  NULL,   ARRAY['feature','export'], now() - interval '5 days',  now() - interval '2 days'),
  (t7, 'Password reset email in spam folder',          'Users on Outlook getting reset link in Junk.',              'Recognition Realm','deliverability','high',  'waiting_customer','Support',   'Tier 2',   u_leo,   u_leo,   u_zara, ARRAY['email'],          now() - interval '8 days',  now() - interval '4 days'),
  (t8, 'Season rollover created duplicate seasons',    'Two active Q3 seasons after Sunday rollover job.',           'Recognition Realm','data',        'critical','testing',        'Engineering','Data',     u_admin, u_maya,  NULL,   ARRAY['seasons','p0'],   now() - interval '4 days',  now() - interval '6 hours');

UPDATE public.ams_tickets SET resolved_at = now() - interval '2 days' WHERE id = t5;

-- ---------- AMS comments ----------
INSERT INTO public.ams_comments (ticket_id, author_id, body, is_internal, created_at) VALUES
  (t1, u_leo,  'Repro on my end using a fresh incognito session. Sending HAR.', false, now() - interval '5 hours'),
  (t1, u_maya, 'Root cause: redirect_uri allowlist got clobbered in the last deploy. Rolling forward a patch.', false, now() - interval '2 hours'),
  (t1, u_maya, 'Deploying hotfix v3.14.2 to prod at :30.', true,  now() - interval '90 minutes'),
  (t2, u_kai,  'Materialized view refresh cadence is 24h — need to drop to 15m.', false, now() - interval '22 hours'),
  (t3, u_maya, 'Streaming the CSV parse instead of buffering. WIP branch pushed.', false, now() - interval '1 day'),
  (t5, u_kai,  'Fixed by swapping the SVG mask filter — Safari 17 dropped support.', false, now() - interval '2 days'),
  (t7, u_leo,  'Working with the customer to add SPF/DKIM entries.', false, now() - interval '4 days'),
  (t8, u_maya, 'Idempotency key added to rollover job; validating on staging.', false, now() - interval '8 hours');

-- ---------- AMS events (activity timeline) ----------
INSERT INTO public.ams_events (ticket_id, actor_id, kind, from_value, to_value, created_at) VALUES
  (t1, u_leo,  'created',        NULL,        NULL,          now() - interval '6 hours'),
  (t1, u_admin,'assigned',       NULL,        'Maya Chen',   now() - interval '5 hours 30 min'),
  (t1, u_maya, 'status_changed', 'assigned',  'in_progress', now() - interval '4 hours'),
  (t1, u_maya, 'escalated',      'high',      'critical',    now() - interval '3 hours'),
  (t2, u_admin,'created',        NULL,        NULL,          now() - interval '1 day'),
  (t2, u_admin,'assigned',       NULL,        'Kai Nakamura',now() - interval '22 hours'),
  (t3, u_admin,'created',        NULL,        NULL,          now() - interval '2 days'),
  (t3, u_maya, 'status_changed', 'accepted',  'waiting_developer', now() - interval '1 day 6 hours'),
  (t5, u_kai,  'created',        NULL,        NULL,          now() - interval '10 days'),
  (t5, u_kai,  'resolved',       'testing',   'resolved',    now() - interval '2 days'),
  (t8, u_admin,'created',        NULL,        NULL,          now() - interval '4 days'),
  (t8, u_maya, 'status_changed', 'in_progress','testing',    now() - interval '6 hours');

END $seed$;
