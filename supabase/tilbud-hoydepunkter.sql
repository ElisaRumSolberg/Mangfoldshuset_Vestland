-- Historikk over enkelthendelser i et fast tilbud (gjestebesøk, temadager osv.),
-- uten å måtte skrive om hele oppsummeringen hver gang. Ett høydepunkt per linje,
-- format: DD.MM.ÅÅÅÅ: Tekst
alter table recurring_programs add column if not exists highlights text;
