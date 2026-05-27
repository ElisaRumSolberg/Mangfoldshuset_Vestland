alter table recurring_programs add column if not exists show_on_homepage boolean not null default false;
alter table recurring_programs add column if not exists homepage_image_url text;
