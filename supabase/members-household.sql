-- Hver person i en husstand er nå sitt eget medlem (egen betaling, eget utløp).
-- household_id knytter personer som meldte seg inn sammen. pay_token brukes senere i
-- personlige betalingslenker (/betal/<token>) og må være uforutsigbar.
-- Kjør i Supabase -> SQL Editor -> New query. Trygt å kjøre flere ganger.

alter table members add column if not exists household_id uuid;
alter table members add column if not exists pay_token uuid not null default gen_random_uuid();
create unique index if not exists members_pay_token_idx on members (pay_token);
create index if not exists members_household_idx on members (household_id);

-- Gamle familiemedlemskap: del family_members (JSON) ut til egne rader.
-- Hver person arver betalings- og utløpsdato fra familiemedlemskapet de allerede har betalt.
-- Kjøres bare på rader som fortsatt har familiemedlemmer, så den er trygg å kjøre på nytt.
do $$
declare
  m record;
  f jsonb;
  full_name text;
  fam_first text;
  fam_last text;
begin
  for m in select * from members where jsonb_array_length(family_members) > 0 loop
    update members set household_id = coalesce(household_id, m.id) where id = m.id;
    for f in select * from jsonb_array_elements(m.family_members) loop
      full_name := btrim(f->>'name');
      if position(' ' in full_name) > 0 then
        fam_first := regexp_replace(full_name, '\s+\S+$', '');
        fam_last := regexp_replace(full_name, '^.*\s', '');
      else
        fam_first := full_name;
        fam_last := m.last_name;
      end if;
      insert into members (
        first_name, last_name, birth_date, gender, address, email, phone, guardian,
        accepted_terms, paid_at, expires_at, last_reminder_for, last_reminder_offset,
        membership_type, family_members, household_id, created_at
      ) values (
        fam_first, fam_last, nullif(f->>'birth_date', '')::date, nullif(f->>'gender', ''), m.address, m.email, m.phone,
        case when nullif(f->>'birth_date', '')::date > (now() at time zone 'Europe/Oslo')::date - interval '18 years'
             then m.first_name || ' ' || m.last_name end,
        m.accepted_terms, m.paid_at, m.expires_at, m.last_reminder_for, m.last_reminder_offset,
        'familie', '[]'::jsonb, coalesce(m.household_id, m.id), m.created_at
      );
    end loop;
    update members set family_members = '[]'::jsonb where id = m.id;
  end loop;
end $$;
