-- Betalingsoversikt: én rad per person per medlemsår. Hver person har sin egen betaling,
-- også barn, slik at antall betalende medlemmer kan dokumenteres i søknader.
-- covers_year er siste medlemsår betalingen dekker (medlemskapet gjelder ut 31. desember det året).
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.

create table if not exists member_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  covers_year int not null check (covers_year between 2000 and 2100),
  amount int not null check (amount >= 0),
  method text not null default 'bank'
    check (method in ('vipps', 'bank', 'kontant', 'kort', 'annet', 'ukjent')),
  reference text,
  paid_at date not null default ((now() at time zone 'Europe/Oslo')::date),
  created_at timestamptz not null default now(),
  unique (member_id, covers_year)
);

create index if not exists member_payments_paid_idx on member_payments (paid_at);

alter table member_payments enable row level security;

drop policy if exists "Owner kan lese betalinger" on member_payments;
create policy "Owner kan lese betalinger" on member_payments
  for select using (public.admin_role() = 'owner');

drop policy if exists "Owner kan registrere betalinger" on member_payments;
create policy "Owner kan registrere betalinger" on member_payments
  for insert with check (public.admin_role() = 'owner');

drop policy if exists "Owner kan endre betalinger" on member_payments;
create policy "Owner kan endre betalinger" on member_payments
  for update using (public.admin_role() = 'owner') with check (public.admin_role() = 'owner');

drop policy if exists "Owner kan slette betalinger" on member_payments;
create policy "Owner kan slette betalinger" on member_payments
  for delete using (public.admin_role() = 'owner');

-- Tidligere betalinger: lag én rad for hvert medlem som allerede står som betalt.
-- Beløpet er satsen etter alder på betalingsdagen (100 kr fra 16 år, 25 kr under), ikke et
-- bankbeløp, og metoden er ukjent. Rader som finnes fra før, røres ikke.
insert into member_payments (member_id, covers_year, amount, method, reference, paid_at)
select
  m.id,
  extract(year from m.paid_at)::int,
  case
    when m.birth_date is not null and age(m.paid_at, m.birth_date) < interval '16 years' then 25
    else 100
  end,
  'ukjent',
  'Importert fra tidligere registrering (sats etter alder)',
  m.paid_at
from members m
where m.paid_at is not null
  and not exists (select 1 from member_payments p where p.member_id = m.id)
on conflict (member_id, covers_year) do nothing;
