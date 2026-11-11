-- Vipps-betalinger: én rad per forsøk. Selve medlemsbetalingen havner i member_payments
-- først når Vipps har bekreftet at pengene er trukket.
-- Tabellen leses og skrives bare av serveren (service role); vanlige brukere har ingen tilgang,
-- bortsett fra at owner kan lese den i admin.
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.

create table if not exists vipps_payments (
  reference text primary key,
  member_id uuid not null references members(id) on delete cascade,
  covers_year int not null check (covers_year between 2000 and 2100),
  amount_ore int not null check (amount_ore > 0),
  status text not null default 'created'
    check (status in ('created', 'authorized', 'captured', 'failed')),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index if not exists vipps_payments_status_idx on vipps_payments (status, created_at);
create index if not exists vipps_payments_member_idx on vipps_payments (member_id);

alter table vipps_payments enable row level security;

drop policy if exists "Owner kan lese vipps-betalinger" on vipps_payments;
create policy "Owner kan lese vipps-betalinger" on vipps_payments
  for select using (public.admin_role() = 'owner');
