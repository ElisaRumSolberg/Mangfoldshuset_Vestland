-- Støtte for aktiviteter som varer flere dager (f.eks. en helg).
-- Tom/NULL betyr at aktiviteten kun varer på event_date (som før).
alter table activities add column if not exists end_date date;
