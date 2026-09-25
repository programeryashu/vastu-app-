-- Supabase migration (feature 11) — run once in Supabase SQL Editor.
-- Every fact retains its source reference via vastu_facts.source_id
-- and the 1:1 source_references table (page/chapter/original_text).

create table if not exists sources (
  source_id        text primary key,
  title            text not null,
  author           text default '',
  language         text default 'en',
  publication_year integer,
  source_type      text default 'other',
  location         text default '',
  license_status   text default 'unknown',
  notes            text default '',
  extraction_status text default 'pending',
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create table if not exists chapters (
  id         bigserial primary key,
  source_id  text not null references sources(source_id) on delete cascade,
  title      text not null,
  unique (source_id, title)
);

create table if not exists vastu_facts (
  id                  text primary key,
  source_id           text not null references sources(source_id) on delete cascade,
  record_type         text not null default 'source_fact'
                      check (record_type in ('source_fact','interpretation','app_rule')),
  interpretation_note text,
  topic               text default '',
  subcategory         text default '',
  claim               text not null,
  description         text default '',
  direction           text default '',
  room                text default '',
  element             text default '',
  planet              text default '',
  remedy              text default '',
  conditions          jsonb default '[]'::jsonb,
  language            text default 'en',
  confidence          numeric(4,3) default 0,
  verification_status text default 'unverified'
                      check (verification_status in
                        ('unverified','approved','rejected','conflict','variant','duplicate')),
  review_notes        text default '',
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
create index if not exists idx_vf_source on vastu_facts(source_id);
create index if not exists idx_vf_status on vastu_facts(verification_status);

create table if not exists source_references (
  fact_id       text primary key references vastu_facts(id) on delete cascade,
  source_id     text not null references sources(source_id) on delete cascade,
  chapter       text default '',
  page          text default '',
  original_text text not null
);

create table if not exists directions (
  name text primary key
);

create table if not exists rooms (
  name text primary key
);

create table if not exists remedies (
  id        bigserial primary key,
  fact_id   text references vastu_facts(id) on delete cascade,
  source_id text not null references sources(source_id) on delete cascade,
  text      text not null,
  direction text default '',
  room      text default ''
);

create table if not exists terms (
  id        bigserial primary key,
  fact_id   text references vastu_facts(id) on delete cascade,
  term      text not null,
  meaning   text default '',
  source_id text not null references sources(source_id) on delete cascade
);

-- Row Level Security: pipeline service key writes; anon read denied by default.
alter table sources            enable row level security;
alter table chapters           enable row level security;
alter table vastu_facts        enable row level security;
alter table source_references  enable row level security;
alter table directions         enable row level security;
alter table rooms              enable row level security;
alter table remedies           enable row level security;
alter table terms              enable row level security;

-- Optional: allow the app to read APPROVED facts only (uncomment to use).
-- create policy "approved facts readable"
--   on vastu_facts for select using (verification_status = 'approved');
