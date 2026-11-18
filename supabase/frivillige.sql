-- Frivilligregister + status og notat på søknader (frivillig / idé / samarbeid).
-- Bare owner kan lese og endre. Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.

create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  interests text[] not null default '{}',
  availability text[] not null default '{}',
  programs text,
  status text not null default 'aktiv' check (status in ('ny', 'aktiv', 'pause', 'sluttet')),
  note text,
  application_id uuid unique references applications(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists volunteers_status_idx on volunteers (status);

alter table volunteers enable row level security;

drop policy if exists "Owner kan lese frivillige" on volunteers;
create policy "Owner kan lese frivillige" on volunteers
  for select using (public.admin_role() = 'owner');

drop policy if exists "Owner kan legge til frivillige" on volunteers;
create policy "Owner kan legge til frivillige" on volunteers
  for insert with check (public.admin_role() = 'owner');

drop policy if exists "Owner kan endre frivillige" on volunteers;
create policy "Owner kan endre frivillige" on volunteers
  for update using (public.admin_role() = 'owner') with check (public.admin_role() = 'owner');

drop policy if exists "Owner kan slette frivillige" on volunteers;
create policy "Owner kan slette frivillige" on volunteers
  for delete using (public.admin_role() = 'owner');

-- Søknader: status (ny / behandlet) og et fritt notat.
alter table applications add column if not exists status text not null default 'ny';
alter table applications drop constraint if exists applications_status_check;
alter table applications add constraint applications_status_check check (status in ('ny', 'behandlet'));
alter table applications add column if not exists note text;

drop policy if exists "Owner kan endre skjema" on applications;
create policy "Owner kan endre skjema" on applications
  for update using (public.admin_role() = 'owner') with check (public.admin_role() = 'owner');
