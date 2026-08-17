-- ─────────────────────────────────────────────────────────────
-- OLFRA™ — Fragrance catalogue
--
-- The read-mostly reference table. Populated by the dataset import, then
-- topped up on demand by the Fragella gap-fill (see CompositeRepository).
--
-- accord_vector is the precomputed 32-dimension accord vector that powers
-- DupeShield. Storing it means similarity search happens in Postgres via
-- pgvector rather than by pulling the catalogue into Node.
-- ─────────────────────────────────────────────────────────────

create extension if not exists vector;
create extension if not exists pg_trgm;

create table if not exists public.fragrances (
  id                    text primary key,
  slug                  text not null unique,
  name                  text not null,
  brand                 text not null,
  year                  integer,
  concentration         text not null default 'Unknown',
  family                text,
  top_notes             text[] not null default '{}',
  heart_notes           text[] not null default '{}',
  base_notes            text[] not null default '{}',
  accords               jsonb  not null default '{}'::jsonb,
  longevity             smallint,
  sillage               smallint,
  rating                numeric(3, 2),
  price_usd             numeric(10, 2),
  image_url             text,
  description           text,
  source                text not null default 'local',

  -- Precomputed accord vector. Dimension MUST match ACCORD_DIMENSIONS in
  -- lib/fragrance/accords.ts. Bumping the accord space means backfilling
  -- this column for every row.
  accord_vector         vector(32),
  accord_space_version  integer not null default 1,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint fragrances_longevity_range check (longevity between 1 and 10),
  constraint fragrances_sillage_range   check (sillage between 1 and 10)
);

-- Trigram index for fuzzy name/brand search.
create index if not exists fragrances_name_trgm_idx
  on public.fragrances using gin (name gin_trgm_ops);
create index if not exists fragrances_brand_trgm_idx
  on public.fragrances using gin (brand gin_trgm_ops);

-- Cosine-distance index for similarity search. ivfflat needs data present
-- before it is useful — run `analyze` after the initial import.
create index if not exists fragrances_accord_vector_idx
  on public.fragrances using ivfflat (accord_vector vector_cosine_ops)
  with (lists = 100);

-- ─── Similarity search ───────────────────────────────────────
-- Returns the nearest candidates by accord direction. Final dupe scoring
-- still happens in the engine (note overlap, performance) — this is the
-- cheap pre-filter that keeps us from scoring the whole catalogue.
create or replace function public.match_fragrances(
  query_vector  vector(32),
  match_count   integer default 40,
  exclude_id    text default null
)
returns setof public.fragrances
language sql
stable
as $$
  select *
  from public.fragrances
  where accord_vector is not null
    and (exclude_id is null or id <> exclude_id)
  order by accord_vector <=> query_vector
  limit greatest(match_count, 1);
$$;

-- ─── Row Level Security ──────────────────────────────────────
-- The catalogue is public reference data: anyone may read, nobody may
-- write through the anon or authenticated roles. Imports and gap-fill
-- writes go through the service-role key on the server.
alter table public.fragrances enable row level security;

drop policy if exists "fragrances are publicly readable" on public.fragrances;
create policy "fragrances are publicly readable"
  on public.fragrances for select
  using (true);

-- ─── updated_at maintenance ──────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists fragrances_touch_updated_at on public.fragrances;
create trigger fragrances_touch_updated_at
  before update on public.fragrances
  for each row execute function public.touch_updated_at();
