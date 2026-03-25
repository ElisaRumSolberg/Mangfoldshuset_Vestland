-- Kjør denne i SQL Editor -> New query.

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

-- Hvis tabellen allerede var opprettet uten disse kolonnene:
alter table members add column if not exists last_reminder_for date;
alter table members add column if not exists last_reminder_offset integer;

alter table members enable row level security;

-- Nye medlemmer kan melde seg selv, men kan ikke sette betaling/utløp.
create policy "Alle kan melde seg inn" on members
  for insert with check (paid_at is null and expires_at is null);

create policy "Innloggede kan lese medlemmer" on members
  for select using (auth.role() = 'authenticated');

create policy "Innloggede kan endre medlemmer" on members
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy "Innloggede kan legge til medlemmer" on members
  for insert with check (auth.role() = 'authenticated');

create policy "Innloggede kan slette medlemmer" on members
  for delete using (auth.role() = 'authenticated');
