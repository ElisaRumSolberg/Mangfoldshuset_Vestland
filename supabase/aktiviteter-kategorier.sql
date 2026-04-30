-- Flere kategorier per aktivitet (f.eks. både "Ungdom" og "Digital" på samme
-- aktivitet), i stedet for én enkelt tekst.
-- Kjør i Supabase Dashboard -> SQL Editor -> New query. Trygt å kjøre flere ganger.

alter table activities add column if not exists categories text[] not null default '{}';

-- Flytt gammel enkelt-kategori inn i den nye listen (kun for rader som ikke
-- allerede har fått en liste).
update activities
set categories = array[category]
where categories = '{}' and coalesce(category, '') <> '';

-- Den gamle kolonnen "category" var "not null", men admin skriver ikke lenger
-- til den (kun "categories"), så nye rader feilet på denne kravet. Fjerner
-- kravet slik at innlegging fungerer igjen.
alter table activities alter column category drop not null;
