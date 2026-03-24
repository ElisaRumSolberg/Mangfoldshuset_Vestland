-- Kjør denne i SQL Editor -> New query.
-- Samler henvendelser fra "Bli med"-siden: frivillig, ide, samarbeid.

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('frivillig', 'ide', 'samarbeid')),
  name text not null,
  email text not null,
  phone text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table applications enable row level security;

create policy "Alle kan sende inn skjema" on applications
  for insert with check (true);

create policy "Innloggede kan lese skjema" on applications
  for select using (auth.role() = 'authenticated');

create policy "Innloggede kan slette skjema" on applications
  for delete using (auth.role() = 'authenticated');
