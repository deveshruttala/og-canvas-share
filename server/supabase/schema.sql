-- Wall — Supabase schema
-- Run in Supabase Studio → SQL Editor (one-time) after creating a project.
-- Then set in `.env.local`:
--   VITE_AUTH_MODE=supabase
--   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
--   VITE_SUPABASE_ANON_KEY=<your public anon key>

-- Required extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- =========================================================================
-- walls table — one row per /u/:username
-- =========================================================================
create table if not exists public.walls (
  username     text primary key,
  owner_id     uuid not null references auth.users(id) on delete cascade,
  doc          jsonb not null,
  published_at timestamptz,
  updated_at   timestamptz not null default now()
);

create index if not exists walls_owner_idx on public.walls(owner_id);
create index if not exists walls_published_idx on public.walls(published_at)
  where published_at is not null;

-- =========================================================================
-- Row-Level Security
-- Anyone (anon or signed-in) can READ published walls (published_at IS NOT NULL).
-- Only the owner can INSERT or UPDATE their own row.
-- =========================================================================
alter table public.walls enable row level security;

drop policy if exists "Public can read published walls" on public.walls;
create policy "Public can read published walls"
  on public.walls
  for select
  using (published_at is not null);

drop policy if exists "Owners can read their own wall" on public.walls;
create policy "Owners can read their own wall"
  on public.walls
  for select
  using (auth.uid() = owner_id);

drop policy if exists "Owners can upsert their own wall" on public.walls;
create policy "Owners can upsert their own wall"
  on public.walls
  for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can update their own wall" on public.walls;
create policy "Owners can update their own wall"
  on public.walls
  for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Owners can delete their own wall" on public.walls;
create policy "Owners can delete their own wall"
  on public.walls
  for delete
  using (auth.uid() = owner_id);

-- Auto-refresh updated_at on row updates
create or replace function public.touch_walls_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists walls_touch_updated_at on public.walls;
create trigger walls_touch_updated_at
  before update on public.walls
  for each row execute function public.touch_walls_updated_at();
