-- Utvalg (undergrupper i foreningen, f.eks. Kvinneutvalget og Mangfoldhuset Ungdom).
-- Hver utvalg får en enkel side: hva de gjør, deres aktiviteter og bilder.
-- Kjør i Supabase Dashboard -> SQL Editor -> New query. Trygt å kjøre flere ganger.

create table if not exists utvalg (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,           -- brukes i adressen: /utvalg/<slug>
  title text not null,
  description text not null default '',
  activity_match text,                 -- ord som brukes til å finne deres aktiviteter (matcher kategori)
  external_link text,                  -- f.eks. Facebook-side (valgfritt)
  contact text,                        -- e-post (valgfritt)
  photos text[] not null default '{}',
  active boolean not null default true,
  color_from text,                     -- valgfri egen fargeprofil (hex), f.eks. "#1E1E36"
  color_to text,                       -- gradientens andre farge (hex)
  accent text,                         -- knapper/glød-farge (hex)
  created_at timestamptz not null default now()
);

-- For de som allerede kjørte filen før fargefeltene kom til:
alter table utvalg add column if not exists color_from text;
alter table utvalg add column if not exists color_to text;
alter table utvalg add column if not exists accent text;

alter table utvalg enable row level security;

drop policy if exists "Alle kan lese utvalg" on utvalg;
create policy "Alle kan lese utvalg" on utvalg
  for select using (true);

drop policy if exists "Innloggede kan endre utvalg" on utvalg;
create policy "Innloggede kan endre utvalg" on utvalg
  for all using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Utgangspunkt: de to utvalgene vi har i dag (legges bare inn hvis tabellen er tom).
insert into utvalg (slug, title, description, activity_match, external_link)
select * from (values
  (
    'kvinneutvalget',
    'Kvinneutvalget',
    'Kvinneutvalget er et trygt møtested og fellesskap for kvinner i lokalmiljøet. Utvalget planlegger egne samlinger og aktiviteter innenfor Mangfoldhuset Vestland.',
    'kvinne',
    null
  ),
  (
    'ungdom',
    'Mangfoldhuset Ungdom',
    'Mangfoldhuset Ungdom er ungdommenes eget utvalg i Mangfoldhuset Vestland. Utvalget drives av og for ungdom, og planlegger egne aktiviteter, samlinger og arrangementer innenfor foreningens rammer.',
    'ungdom',
    'https://www.facebook.com/p/Mangfoldhuset-Ungdom-61590498068476/'
  )
) as v(slug, title, description, activity_match, external_link)
where not exists (select 1 from utvalg);

-- Fargeprofil for Mangfoldhuset Ungdom: livlig lilla (ungdommelig) + gull fra logoen.
-- Denne kjøres alltid og setter fargen direkte (ikke bare når den mangler),
-- slik at en oppdatering av standardfargen her slår igjennom. Har du endret
-- fargen selv i admin, kjør ikke denne delen på nytt (eller juster verdiene).
update utvalg
set
  color_from = '#5B21B6',
  color_to = '#9333EA',
  accent = '#F2C847'
where slug = 'ungdom';
