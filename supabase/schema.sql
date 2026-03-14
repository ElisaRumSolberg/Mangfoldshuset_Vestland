-- Mangfoldshuset Vestlandet - database schema
-- Kjør denne i Supabase Dashboard -> SQL Editor -> New query

-- 1. Aktiviteter
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  event_date date not null,
  event_time text,
  place text not null,
  description text not null,
  image_url text,
  created_at timestamptz not null default now()
);

-- 2. Nyheter
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  content text,
  image_url text,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

-- 3. Statistikk-tellere (Aktiviteter i år / Deltakere / Frivillige timer)
create table if not exists impact_stats (
  key text primary key,
  value integer not null default 0,
  label text not null
);

insert into impact_stats (key, value, label) values
  ('activities', 48, 'Aktiviteter i år'),
  ('participants', 1350, 'Deltakere'),
  ('volunteer_hours', 1820, 'Frivillige timer')
on conflict (key) do nothing;

-- Row Level Security: alle kan LESE, kun innloggede admin-brukere kan ENDRE
alter table activities enable row level security;
alter table news enable row level security;
alter table impact_stats enable row level security;

create policy "Alle kan lese aktiviteter" on activities for select using (true);
create policy "Innloggede kan endre aktiviteter" on activities for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Alle kan lese nyheter" on news for select using (true);
create policy "Innloggede kan endre nyheter" on news for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

create policy "Alle kan lese statistikk" on impact_stats for select using (true);
create policy "Innloggede kan endre statistikk" on impact_stats for all
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
