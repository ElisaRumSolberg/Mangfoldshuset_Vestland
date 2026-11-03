-- Pris og påmelding for faste tilbud (f.eks. Torsdagssuppe).
-- Hver påmelding gjelder én bestemt dato (session_date).
-- Kjør i Supabase SQL Editor. Trygt å kjøre flere ganger.

alter table recurring_programs add column if not exists price text;
alter table recurring_programs add column if not exists registration_open boolean not null default false;

create table if not exists program_signups (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references recurring_programs(id) on delete cascade,
  session_date date not null,
  name text not null,
  email text not null,
  phone text,
  participants int not null default 1,
  comment text,
  photo_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists program_signups_program_date_idx on program_signups (program_id, session_date);

alter table program_signups enable row level security;

drop policy if exists "Alle kan melde seg på fast tilbud" on program_signups;
create policy "Alle kan melde seg på fast tilbud" on program_signups
  for insert with check (
    participants between 1 and 50
    and char_length(name) between 1 and 100
    and char_length(email) between 3 and 200
    and session_date >= (now() at time zone 'Europe/Oslo')::date
    and exists (
      select 1 from recurring_programs p
      where p.id = program_id and p.registration_open = true and p.active = true
    )
  );

drop policy if exists "Owner og editor kan lese tilbudspåmeldinger" on program_signups;
create policy "Owner og editor kan lese tilbudspåmeldinger" on program_signups
  for select using (public.admin_role() in ('owner', 'editor'));

drop policy if exists "Owner og editor kan slette tilbudspåmeldinger" on program_signups;
create policy "Owner og editor kan slette tilbudspåmeldinger" on program_signups
  for delete using (public.admin_role() in ('owner', 'editor'));
