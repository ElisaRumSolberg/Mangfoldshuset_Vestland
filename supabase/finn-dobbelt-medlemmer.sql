-- Finner personer som står flere ganger i medlemsregisteret (samme e-post, navn og fødselsdato).
-- Bare en spørring som leser; den endrer ingenting. Slett overflødige rader i admin → Medlemmer.
-- Behold raden med nyeste betaling, og slett de andre.

select
  lower(btrim(first_name)) as fornavn,
  lower(btrim(last_name)) as etternavn,
  birth_date as fodselsdato,
  lower(btrim(email)) as epost,
  count(*) as antall,
  array_agg(id order by created_at) as ider,
  array_agg(paid_at order by created_at) as betalt,
  array_agg(expires_at order by created_at) as utloper
from members
group by 1, 2, 3, 4
having count(*) > 1
order by antall desc, etternavn;
