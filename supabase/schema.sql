-- Save Me A Seat waitlist (docs/smas-site-brief.md §6).
-- Apply in the Supabase dashboard: SQL Editor → paste → Run.

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  postcode_area text,
  created_at timestamptz not null default now()
);

-- `name` arrived after the first deploy; this upgrades an existing table.
-- The whole file is safe to re-run.
alter table public.waitlist_signups add column if not exists name text;

alter table public.waitlist_signups enable row level security;

-- The site may add a signup; anonymous visitors may never read,
-- change, or delete anything.
create policy "anon can join the waitlist"
  on public.waitlist_signups
  for insert
  to anon
  with check (true);

-- One row per address. The client treats the conflict as success, so a
-- second signup never reveals whether an email already exists.
create unique index if not exists waitlist_signups_email_unique
  on public.waitlist_signups (lower(email));
