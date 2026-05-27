-- ---------------------------------------------------------------------------
-- PasteCV — phase 4 migration: per-user ownership + templates + RLS
-- Run this once in the Supabase SQL editor. SAFE TO RE-RUN.
-- ---------------------------------------------------------------------------

-- 1. Nuke existing portfolios (per product decision — no real traffic yet)
drop table if exists portfolios cascade;

-- 2. Recreate with owner_id + template + updated_at
create table portfolios (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  data        jsonb not null,
  template    text not null default 'linear-dark',
  owner_id    uuid not null references auth.users(id) on delete cascade,
  views       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index portfolios_slug_idx on portfolios(slug);
create index portfolios_owner_idx on portfolios(owner_id);

-- 3. Keep updated_at fresh on any UPDATE
create or replace function portfolios_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolios_updated_at on portfolios;
create trigger portfolios_updated_at
  before update on portfolios
  for each row execute function portfolios_set_updated_at();

-- 4. RLS — public read, owner-only write
alter table portfolios enable row level security;

drop policy if exists "portfolios are publicly readable" on portfolios;
create policy "portfolios are publicly readable"
  on portfolios for select
  using (true);

drop policy if exists "users insert their own portfolios" on portfolios;
create policy "users insert their own portfolios"
  on portfolios for insert
  with check (auth.uid() = owner_id);

drop policy if exists "users update their own portfolios" on portfolios;
create policy "users update their own portfolios"
  on portfolios for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "users delete their own portfolios" on portfolios;
create policy "users delete their own portfolios"
  on portfolios for delete
  using (auth.uid() = owner_id);

-- Service role bypasses RLS by default, so the existing admin layer still works.

-- 5. admin_config from phase 3 (unchanged — included so a fresh DB has it too)
create table if not exists admin_config (
  id smallint primary key default 1,
  password_hash text not null,
  updated_at timestamptz not null default now(),
  constraint admin_config_singleton check (id = 1)
);
