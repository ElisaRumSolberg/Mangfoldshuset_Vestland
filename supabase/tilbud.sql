-- Faste tilbud (gjentakende aktiviteter: hver uke / hver måned).
-- Kjør i Supabase Dashboard -> SQL Editor -> New query. Trygt å kjøre flere ganger.

create table if not exists recurring_programs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  frequency text not null check (frequency in ('weekly', 'monthly')),
  weekday int not null check (weekday between 0 and 6), -- 0 = søndag ... 6 = lørdag
  nth int check (nth in (1, 2, 3, 4, -1)),               -- kun månedlig: 1.-4. eller -1 = siste
  start_time text,                                       -- "12:00"
  end_time text,
  start_date date,                                       -- første dato (valgfri)
  end_date date,                                         -- siste dato (valgfri)
  place text not null,
  note text,                                             -- f.eks. "Ingen påmelding – bare kom"
  contact text,
  external_link text,
  image_url text,                                        -- plakat
  skipped_dates date[] not null default '{}',            -- avlyste datoer
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint monthly_needs_nth check (frequency <> 'monthly' or nth is not null)
);

alter table recurring_programs enable row level security;

drop policy if exists "Alle kan lese faste tilbud" on recurring_programs;
create policy "Alle kan lese faste tilbud" on recurring_programs
  for select using (true);

drop policy if exists "Innloggede kan endre faste tilbud" on recurring_programs;
create policy "Innloggede kan endre faste tilbud" on recurring_programs
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Utgangspunkt: de tre tilbudene fra plakatene (legges bare inn hvis tabellen er tom).
insert into recurring_programs
  (title, description, frequency, weekday, nth, start_time, end_time, start_date,
   place, note, contact, image_url, sort_order)
select * from (values
  (
    'Barseltreff',
    'Et trygt og varmt møtested for foreldre og babyer. Åpent for alle, uansett bakgrunn, språk og erfaring.',
    'weekly', 5, null::int, '12:00', '14:00', null::date,
    'Mangfoldhuset, Arne Abrahamsens vei 1, 5161 Laksevåg (bak Coop Prix Melkeplassen)',
    'Ingen påmelding – bare kom',
    'barseltreff.mangfoldhuset@gmail.com',
    '/tilbud/barseltreff.jpg', 1
  ),
  (
    'Språkkafé',
    'Møt nye mennesker og øv på norsk! Vi drikker kaffe og serverer noe enkelt å spise. Åpent for alle som ønsker å øve på norsk. Et samarbeid mellom Mangfoldshuset og lokale aktører.',
    'weekly', 2, null::int, '19:00', '20:30', date '2026-09-22',
    'Mangfoldhuset, Arne Abrahamsens vei 1, 5161 Laksevåg',
    'Kom som du er',
    null,
    '/tilbud/sprakkafe.jpg', 2
  ),
  (
    'Familiebrunsj',
    'Felles brunsj for hele familien. Vi starter kl. 11.30, har temainnslag kl. 13.15 og rydder sammen kl. 14.15.',
    'monthly', 0, -1, '11:30', null, null::date,
    'Holen skole, Øvre Holen 6, 5163 Laksevåg',
    null,
    null,
    '/tilbud/familiebrunsj.jpg', 3
  )
) as v(title, description, frequency, weekday, nth, start_time, end_time, start_date,
       place, note, contact, image_url, sort_order)
where not exists (select 1 from recurring_programs);
