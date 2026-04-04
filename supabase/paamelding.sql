-- Påmelding til enkeltaktiviteter. Admin kan slå på "Åpne for påmelding" per
-- aktivitet, og se hvem som har meldt seg på i redigeringssiden.
-- Kjør i Supabase SQL Editor. Trygt å kjøre flere ganger.

alter table activities add column if not exists registration_open boolean not null default false;

create table if not exists activity_signups (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  participants int not null default 1,
  comment text,
  created_at timestamptz not null default now()
);

alter table activity_signups enable row level security;

drop policy if exists "Alle kan melde seg på aktivitet" on activity_signups;
create policy "Alle kan melde seg på aktivitet" on activity_signups
  for insert with check (true);

drop policy if exists "Owner og editor kan lese påmeldinger" on activity_signups;
create policy "Owner og editor kan lese påmeldinger" on activity_signups
  for select using (public.admin_role() in ('owner', 'editor'));

drop policy if exists "Owner og editor kan slette påmeldinger" on activity_signups;
create policy "Owner og editor kan slette påmeldinger" on activity_signups
  for delete using (public.admin_role() in ('owner', 'editor'));
