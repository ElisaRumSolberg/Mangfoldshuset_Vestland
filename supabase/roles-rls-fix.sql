-- KRITISK SIKKERHETSFIKS: Rollene (owner / editor / utvalg) har til nå bare
-- vært håndhevet i Next.js (proxy.ts + sidesjekker). Databasen (RLS) har
-- fortsatt sluppet gjennom ALT for enhver innlogget bruker, uansett rolle.
-- Det betyr at en "editor"- eller "utvalg"-bruker kunne omgå appen helt
-- (rett API-kall fra nettleserkonsollen) og lese/endre/slette medlemsdata,
-- andre utvalg, aktiviteter osv.
--
-- Denne filen gjør at databasen selv sjekker rollen (lagret i
-- auth.users.raw_app_meta_data, satt kun via SQL Editor, ikke av brukeren
-- selv) — ikke bare at man er innlogget.
--
-- Kjør i Supabase SQL Editor. Trygt å kjøre flere ganger.

-- Leser rollen fra JWT-en. Mangler rollen (vanlig innlogging uten satt
-- rolle) regnes brukeren som "owner" (samme standard som i appen).
create or replace function public.admin_role() returns text
language sql stable
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner');
$$;

-- Hvilket utvalg (rad-id) en "utvalg"-bruker er låst til.
create or replace function public.admin_utvalg_id() returns text
language sql stable
as $$
  select auth.jwt() -> 'app_metadata' ->> 'utvalg_id';
$$;

-- ============================================================
-- Kun "owner" (medlemsdata, søknader, meldinger, statistikk)
-- ============================================================

drop policy if exists "Innloggede kan lese medlemmer" on members;
drop policy if exists "Innloggede kan endre medlemmer" on members;
drop policy if exists "Innloggede kan legge til medlemmer" on members;
drop policy if exists "Innloggede kan slette medlemmer" on members;

create policy "Owner kan lese medlemmer" on members
  for select using (public.admin_role() = 'owner');
create policy "Owner kan endre medlemmer" on members
  for update using (public.admin_role() = 'owner') with check (public.admin_role() = 'owner');
create policy "Owner kan legge til medlemmer" on members
  for insert with check (public.admin_role() = 'owner');
create policy "Owner kan slette medlemmer" on members
  for delete using (public.admin_role() = 'owner');

drop policy if exists "Innloggede kan lese skjema" on applications;
drop policy if exists "Innloggede kan slette skjema" on applications;
create policy "Owner kan lese skjema" on applications
  for select using (public.admin_role() = 'owner');
create policy "Owner kan slette skjema" on applications
  for delete using (public.admin_role() = 'owner');

drop policy if exists "Innloggede kan lese kontaktmeldinger" on contact_messages;
drop policy if exists "Innloggede kan slette kontaktmeldinger" on contact_messages;
create policy "Owner kan lese kontaktmeldinger" on contact_messages
  for select using (public.admin_role() = 'owner');
create policy "Owner kan slette kontaktmeldinger" on contact_messages
  for delete using (public.admin_role() = 'owner');

drop policy if exists "Innloggede kan se abonnenter" on newsletter_subscribers;
create policy "Owner kan se abonnenter" on newsletter_subscribers
  for select using (public.admin_role() = 'owner');

drop policy if exists "Innloggede kan endre statistikk" on impact_stats;
create policy "Owner kan endre statistikk" on impact_stats
  for all using (public.admin_role() = 'owner') with check (public.admin_role() = 'owner');

-- ============================================================
-- "owner" og "editor" (innhold: aktiviteter, nyheter, faste tilbud,
-- Mangfoldsposten, forsidebilder)
-- ============================================================

drop policy if exists "Innloggede kan endre aktiviteter" on activities;
create policy "Owner og editor kan endre aktiviteter" on activities
  for all using (public.admin_role() in ('owner', 'editor'))
  with check (public.admin_role() in ('owner', 'editor'));

drop policy if exists "Innloggede kan endre nyheter" on news;
create policy "Owner og editor kan endre nyheter" on news
  for all using (public.admin_role() in ('owner', 'editor'))
  with check (public.admin_role() in ('owner', 'editor'));

drop policy if exists "Innloggede kan endre faste tilbud" on recurring_programs;
create policy "Owner og editor kan endre faste tilbud" on recurring_programs
  for all using (public.admin_role() in ('owner', 'editor'))
  with check (public.admin_role() in ('owner', 'editor'));

drop policy if exists "Innloggede kan endre magasinutgaver" on magazine_issues;
create policy "Owner og editor kan endre magasinutgaver" on magazine_issues
  for all using (public.admin_role() in ('owner', 'editor'))
  with check (public.admin_role() in ('owner', 'editor'));

drop policy if exists "Innloggede kan endre site_settings" on site_settings;
create policy "Owner og editor kan endre site_settings" on site_settings
  for all using (public.admin_role() in ('owner', 'editor'))
  with check (public.admin_role() in ('owner', 'editor'));

-- ============================================================
-- Utvalg: owner/editor kan endre alle, "utvalg"-rolle kun sin egen rad
-- ============================================================

drop policy if exists "Innloggede kan endre utvalg" on utvalg;
create policy "Owner og editor kan endre utvalg" on utvalg
  for all using (public.admin_role() in ('owner', 'editor'))
  with check (public.admin_role() in ('owner', 'editor'));

drop policy if exists "Utvalg-rolle kan endre eget utvalg" on utvalg;
create policy "Utvalg-rolle kan endre eget utvalg" on utvalg
  for update using (public.admin_role() = 'utvalg' and id::text = public.admin_utvalg_id())
  with check (public.admin_role() = 'utvalg' and id::text = public.admin_utvalg_id());

-- ============================================================
-- Bildeopplasting (storage): owner/editor overalt, "utvalg"-rolle bare i
-- "utvalg"-mappen (der deres eget skjema laster opp).
-- ============================================================

drop policy if exists "Innloggede kan laste opp bilder" on storage.objects;
create policy "Owner og editor kan laste opp bilder" on storage.objects
  for insert with check (bucket_id = 'images' and public.admin_role() in ('owner', 'editor'));
create policy "Utvalg-rolle kan laste opp til utvalg-mappen" on storage.objects
  for insert with check (
    bucket_id = 'images'
    and public.admin_role() = 'utvalg'
    and (storage.foldername(name))[1] = 'utvalg'
  );

drop policy if exists "Innloggede kan slette bilder" on storage.objects;
create policy "Owner og editor kan slette bilder" on storage.objects
  for delete using (bucket_id = 'images' and public.admin_role() in ('owner', 'editor'));

-- ============================================================
-- Begrens hvilke filtyper som kan lastes opp (kun bilder/video/PDF).
-- "accept"-attributtet i skjemaet er bare et forslag i nettleseren og kan
-- omgås; dette håndheves av Supabase selv.
-- ============================================================

update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf'
  ],
  file_size_limit = 52428800 -- 50 MB
where id = 'images';
