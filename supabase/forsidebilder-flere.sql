-- Tillater å velge flere bilder per aktivitet/tilbud til karusellen på forsiden
-- (i stedet for kun ett). Gamle *_image_url-kolonner beholdes, men brukes ikke lenger.
alter table activities add column if not exists homepage_image_urls text[] not null default '{}';
alter table recurring_programs add column if not exists homepage_image_urls text[] not null default '{}';
