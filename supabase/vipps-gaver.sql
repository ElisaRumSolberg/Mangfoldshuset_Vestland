-- Gaver via Vipps («Støtt oss»): én rad per forsøk. Ingen personopplysninger lagres hos oss;
-- Vipps sender kvittering til giveren. Tabellen leses og skrives bare av serveren (service role),
-- og owner kan lese den i admin.
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.

create table if not exists vipps_donations (
  reference text primary key,
  amount_ore int not null check (amount_ore between 1000 and 10000000),
  status text not null default 'created'
    check (status in ('created', 'authorized', 'captured', 'failed')),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create index if not exists vipps_donations_status_idx on vipps_donations (status, created_at);

alter table vipps_donations enable row level security;

drop policy if exists "Owner kan lese gaver" on vipps_donations;
create policy "Owner kan lese gaver" on vipps_donations
  for select using (public.admin_role() = 'owner');
