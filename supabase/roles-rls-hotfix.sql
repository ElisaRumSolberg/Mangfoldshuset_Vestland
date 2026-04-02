-- AKUTT RETTELSE: admin_role() ga "owner" til HELT ANONYME forespørsler
-- (ingen innlogging i det hele tatt), fordi den bare sjekket om
-- app_metadata->>'role' manglet — noe som også er tilfelle for den
-- offentlige anon-nøkkelen uten sesjon. Dette gjorde at HVEM SOM HELST på
-- internett kunne lese hele medlemslisten (navn + e-post) uten å logge inn.
--
-- Bekreftet med et anonymt testkall mot /rest/v1/members rett før denne
-- filen ble skrevet — ekte medlemsdata ble returnert.
--
-- Kjør denne STRAKS i Supabase SQL Editor.

create or replace function public.admin_role() returns text
language sql stable
as $$
  select case
    when auth.role() = 'authenticated'
      then coalesce(auth.jwt() -> 'app_metadata' ->> 'role', 'owner')
    else 'anon'
  end;
$$;
