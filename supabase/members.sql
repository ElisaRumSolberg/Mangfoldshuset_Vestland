-- Kjør denne i SQL Editor -> New query. Kan kjøres flere ganger uten feil.

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  birth_date date,
  address text,
  email text not null,
  phone text,
  guardian text,
  comment text,
  accepted_terms boolean not null default false,
  paid_at date,
  expires_at date,
  last_reminder_for date,
  last_reminder_offset integer,
  created_at timestamptz not null default now()
);

-- Kolonner som kom senere (trygt å kjøre på nytt).
alter table members add column if not exists last_reminder_for date;
alter table members add column if not exists last_reminder_offset integer;

-- Medlemskapstype (enkelt 100 kr / familie 150 kr). Én betaling og ett
-- medlemskap per familie; øvrige familiemedlemmer ligger i family_members.
alter table members add column if not exists membership_type text not null default 'enkelt'
  check (membership_type in ('enkelt', 'familie'));
alter table members add column if not exists family_members jsonb not null default '[]'::jsonb;

alter table members enable row level security;

drop policy if exists "Alle kan melde seg inn" on members;
create policy "Alle kan melde seg inn" on members
  for insert with check (paid_at is null and expires_at is null);

drop policy if exists "Innloggede kan lese medlemmer" on members;
create policy "Innloggede kan lese medlemmer" on members
  for select using (auth.role() = 'authenticated');

drop policy if exists "Innloggede kan endre medlemmer" on members;
create policy "Innloggede kan endre medlemmer" on members
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "Innloggede kan legge til medlemmer" on members;
create policy "Innloggede kan legge til medlemmer" on members
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "Innloggede kan slette medlemmer" on members;
create policy "Innloggede kan slette medlemmer" on members
  for delete using (auth.role() = 'authenticated');
