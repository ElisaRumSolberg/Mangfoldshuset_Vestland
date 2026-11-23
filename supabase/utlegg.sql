-- Utlegg (masraf formu): innlevering med kvitteringer, godkjenning og arkiv.
-- Owner og editor kan levere inn utlegg i admin. Frivillige uten konto bruker siden /utlegg med et fellesord
-- (source = 'lenke'); de skrives inn av serveren, aldri direkte fra nettleseren. Editor ser bare sine egne; owner ser og godkjenner alt.
-- Kvitteringene ligger i en PRIVAT lagringsbøtte («receipts»), ikke på åpne bildeadresser.
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid default auth.uid(),
  created_by_name text,
  created_by_email text,
  created_by_phone text,
  created_by_address text,
  created_by_postcode text,
  bank_account text,
  signature text,
  signed_at timestamptz,
  source text not null default 'admin' check (source in ('admin', 'lenke')),
  expense_date date not null,
  purpose text not null,
  description text,
  currency text not null default 'NOK' check (currency in ('NOK', 'TRY', 'EUR')),
  exchange_rate numeric not null default 1 check (exchange_rate > 0),
  lines jsonb not null default '[]'::jsonb,
  total_original numeric not null check (total_original >= 0),
  total_nok numeric not null check (total_nok >= 0),
  receipts text[] not null default '{}',
  no_receipt boolean not null default false,
  status text not null default 'ny' check (status in ('ny', 'godkjent', 'utbetalt', 'avvist')),
  decision_note text,
  decided_by_email text,
  decided_at timestamptz,
  paid_at date,
  created_at timestamptz not null default now()
);

-- Hvis tabellen ble laget med en eldre versjon av dette skjemaet, legges de nye feltene til her.
alter table expenses alter column created_by drop not null;
alter table expenses add column if not exists created_by_phone text;
alter table expenses add column if not exists created_by_address text;
alter table expenses add column if not exists created_by_postcode text;
alter table expenses add column if not exists bank_account text;
alter table expenses add column if not exists signature text;
alter table expenses add column if not exists signed_at timestamptz;
alter table expenses add column if not exists source text not null default 'admin';
alter table expenses drop constraint if exists expenses_source_check;
alter table expenses add constraint expenses_source_check check (source in ('admin', 'lenke'));

create index if not exists expenses_status_idx on expenses (status);
create index if not exists expenses_date_idx on expenses (expense_date);
create index if not exists expenses_created_by_idx on expenses (created_by);

alter table expenses enable row level security;

drop policy if exists "Owner og editor kan levere utlegg" on expenses;
create policy "Owner og editor kan levere utlegg" on expenses
  for insert with check (public.admin_role() in ('owner', 'editor') and created_by = auth.uid() and status = 'ny');

drop policy if exists "Owner ser alle utlegg, editor ser egne" on expenses;
create policy "Owner ser alle utlegg, editor ser egne" on expenses
  for select using (public.admin_role() = 'owner' or (public.admin_role() = 'editor' and created_by = auth.uid()));

drop policy if exists "Owner kan behandle utlegg" on expenses;
create policy "Owner kan behandle utlegg" on expenses
  for update using (public.admin_role() = 'owner') with check (public.admin_role() = 'owner');

drop policy if exists "Owner kan slette utlegg, innleveren kan trekke sitt eget" on expenses;
create policy "Owner kan slette utlegg, innleveren kan trekke sitt eget" on expenses
  for delete using (
    public.admin_role() = 'owner'
    or (public.admin_role() = 'editor' and created_by = auth.uid() and status = 'ny')
  );

-- Privat bøtte for kvitteringer (bilder og PDF). Filene ligger i en mappe per bruker: <bruker-id>/<fil>.
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

drop policy if exists "Owner og editor kan laste opp kvitteringer" on storage.objects;
create policy "Owner og editor kan laste opp kvitteringer" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'receipts'
    and public.admin_role() in ('owner', 'editor')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Owner ser alle kvitteringer, editor egne" on storage.objects;
create policy "Owner ser alle kvitteringer, editor egne" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and (
      public.admin_role() = 'owner'
      or (public.admin_role() = 'editor' and (storage.foldername(name))[1] = auth.uid()::text)
    )
  );

drop policy if exists "Owner kan slette kvitteringer" on storage.objects;
create policy "Owner kan slette kvitteringer" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts' and public.admin_role() = 'owner');
