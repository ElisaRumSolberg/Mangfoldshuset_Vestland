-- REVIEW/STAGING ONLY: not applied by this audit.
-- Before rollout, explicitly assign owner/editor/utvalg in app_metadata to
-- legitimate administrators. Missing roles will NO LONGER grant owner access.
-- Apply after the historical roles-rls-fix.sql and roles-rls-hotfix.sql files.
begin;
create or replace function public.admin_role() returns text
language sql stable
as $$
  select case
    when auth.role() = 'authenticated'
      and auth.jwt() -> 'app_metadata' ->> 'role' in ('owner', 'editor', 'utvalg')
    then auth.jwt() -> 'app_metadata' ->> 'role'
    else 'anon'
  end;
$$;

-- Anonymous signup must not bypass the registration switch or target past events.
drop policy if exists "Alle kan melde seg på aktivitet" on public.activity_signups;
create policy "Alle kan melde seg på aktivitet" on public.activity_signups
for insert with check (
  participants between 1 and 50
  and char_length(name) between 1 and 100
  and char_length(email) between 3 and 200
  and exists (
    select 1 from public.activities a
    where a.id = activity_id and a.registration_open = true
      and greatest(a.event_date, coalesce(a.end_date, a.event_date)) >=
        (now() at time zone 'Europe/Oslo')::date
  )
);
commit;

-- IMPORTANT: Audit pg_policies in staging for leftover permissive policies.
-- Policies combine with OR; rerunning older setup SQL can restore broad access.
-- Anonymous direct INSERT still bypasses application rate limits. A follow-up
-- design must restrict grants or route inserts through a validated/rate-limited
-- endpoint/RPC. This script alone does NOT solve that problem.
