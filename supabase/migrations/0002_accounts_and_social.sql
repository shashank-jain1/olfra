-- ─────────────────────────────────────────────────────────────
-- OLFRA™ — Accounts, wardrobe, social, marketplace
--
-- Everything here is user-owned data, so every table gets Row Level
-- Security. The rule throughout: you may read what is public, and you may
-- only write rows you own. These policies are the actual authorisation
-- boundary — the client holds an anon key and talks to Postgres directly,
-- so a missing policy is a data leak, not just a bug.
-- ─────────────────────────────────────────────────────────────

-- ─── Profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique,
  display_name text,
  bio          text,
  location     text,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  constraint profiles_username_format
    check (username ~ '^[a-zA-Z0-9_]{3,30}$')
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Create a profile automatically on signup, deriving a username from the
-- email local part and de-duplicating with a short suffix if taken.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix integer := 0;
begin
  base_username := regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_]', '', 'g');
  if length(base_username) < 3 then
    base_username := 'olfra' || base_username;
  end if;
  base_username := left(base_username, 24);
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (new.id, final_username, new.raw_user_meta_data ->> 'full_name');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── ScentDNA profiles ───────────────────────────────────────
-- Private by default: a skin-chemistry profile is personal data.
create table if not exists public.dna_profiles (
  user_id     uuid primary key references public.profiles (id) on delete cascade,
  answers     jsonb not null,
  result      jsonb not null,
  is_public   boolean not null default false,
  computed_at timestamptz not null default now()
);

alter table public.dna_profiles enable row level security;

drop policy if exists "dna readable by owner or when public" on public.dna_profiles;
create policy "dna readable by owner or when public"
  on public.dna_profiles for select
  using (auth.uid() = user_id or is_public);

drop policy if exists "users write own dna" on public.dna_profiles;
create policy "users write own dna"
  on public.dna_profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Wardrobe ────────────────────────────────────────────────
create table if not exists public.wardrobe_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles (id) on delete cascade,
  fragrance_id   text references public.fragrances (id) on delete set null,
  -- Denormalised so a wardrobe entry survives a catalogue record going away,
  -- and so users can add bottles we don't have in the catalogue at all.
  name           text not null,
  brand          text not null,
  bottle_size_ml integer,
  purchase_price numeric(10, 2),
  purchase_date  date,
  notes          text,
  is_public      boolean not null default true,
  created_at     timestamptz not null default now()
);

create index if not exists wardrobe_items_user_idx
  on public.wardrobe_items (user_id, created_at desc);

alter table public.wardrobe_items enable row level security;

drop policy if exists "wardrobe readable by owner or when public" on public.wardrobe_items;
create policy "wardrobe readable by owner or when public"
  on public.wardrobe_items for select
  using (auth.uid() = user_id or is_public);

drop policy if exists "users write own wardrobe" on public.wardrobe_items;
create policy "users write own wardrobe"
  on public.wardrobe_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Social feed ─────────────────────────────────────────────
create table if not exists public.posts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  fragrance_id text references public.fragrances (id) on delete set null,
  fragrance_label text not null,
  caption      text not null,
  created_at   timestamptz not null default now(),

  constraint posts_caption_length check (char_length(caption) between 1 and 2000)
);

create index if not exists posts_created_idx on public.posts (created_at desc);

alter table public.posts enable row level security;

drop policy if exists "posts are publicly readable" on public.posts;
create policy "posts are publicly readable"
  on public.posts for select using (true);

drop policy if exists "users write own posts" on public.posts;
create policy "users write own posts"
  on public.posts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.post_likes (
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "likes are publicly readable" on public.post_likes;
create policy "likes are publicly readable"
  on public.post_likes for select using (true);

drop policy if exists "users manage own likes" on public.post_likes;
create policy "users manage own likes"
  on public.post_likes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.post_comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now(),

  constraint post_comments_body_length check (char_length(body) between 1 and 1000)
);

create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at);

alter table public.post_comments enable row level security;

drop policy if exists "comments are publicly readable" on public.post_comments;
create policy "comments are publicly readable"
  on public.post_comments for select using (true);

drop policy if exists "users manage own comments" on public.post_comments;
create policy "users manage own comments"
  on public.post_comments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.follows (
  follower_id  uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self check (follower_id <> following_id)
);

alter table public.follows enable row level security;

drop policy if exists "follows are publicly readable" on public.follows;
create policy "follows are publicly readable"
  on public.follows for select using (true);

drop policy if exists "users manage own follows" on public.follows;
create policy "users manage own follows"
  on public.follows for all
  using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

-- ─── Marketplace (ScentCircle) ───────────────────────────────
create type public.listing_kind as enum ('swap', 'sale', 'sample');
create type public.listing_status as enum ('active', 'reserved', 'completed', 'withdrawn');

create table if not exists public.listings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles (id) on delete cascade,
  fragrance_id text references public.fragrances (id) on delete set null,
  title        text not null,
  kind         public.listing_kind not null,
  status       public.listing_status not null default 'active',
  price_usd    numeric(10, 2),
  volume_ml    integer,
  fill_percent smallint,
  seeking      text,
  location     text,
  created_at   timestamptz not null default now(),

  -- A sale needs a price; a swap needs to say what it wants.
  constraint listings_sale_has_price
    check (kind <> 'sale' or price_usd is not null),
  constraint listings_swap_has_seeking
    check (kind <> 'swap' or seeking is not null),
  constraint listings_fill_range
    check (fill_percent is null or fill_percent between 1 and 100)
);

create index if not exists listings_active_idx
  on public.listings (status, created_at desc);

alter table public.listings enable row level security;

drop policy if exists "active listings are publicly readable" on public.listings;
create policy "active listings are publicly readable"
  on public.listings for select
  using (status = 'active' or auth.uid() = user_id);

drop policy if exists "users manage own listings" on public.listings;
create policy "users manage own listings"
  on public.listings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── Trend signal (feeds ScentCulture) ───────────────────────
-- ScentCulture aggregates real user behaviour instead of publishing
-- invented percentages. Rows are anonymous by design: we keep the region,
-- never the user, so trend queries can't be used to profile individuals.
create table if not exists public.trend_events (
  id           bigserial primary key,
  fragrance_id text references public.fragrances (id) on delete cascade,
  event_type   text not null check (event_type in ('search', 'wardrobe_add', 'post', 'listing')),
  region       text,
  created_at   timestamptz not null default now()
);

create index if not exists trend_events_recent_idx
  on public.trend_events (created_at desc);

alter table public.trend_events enable row level security;

drop policy if exists "trend events are publicly readable" on public.trend_events;
create policy "trend events are publicly readable"
  on public.trend_events for select using (true);
-- Writes happen server-side via the service-role key only; no insert policy
-- is granted to anon or authenticated on purpose.
