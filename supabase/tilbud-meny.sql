-- Ukemeny for faste tilbud (f.eks. hvilken suppe det er hver torsdag).
-- Én linje per uke: «45: Linsesuppe – røde linser, gulrot, løk».
-- Kjør i Supabase SQL Editor. Trygt å kjøre flere ganger.

alter table recurring_programs add column if not exists menu text;
