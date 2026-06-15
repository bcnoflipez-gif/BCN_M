-- ================================================================
-- BCN Metro Live — Supabase Schema Setup Script
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ─────────────────────────────────────────────
-- 1. Add missing column to reports
-- ─────────────────────────────────────────────
alter table reports
  add column if not exists author_session_id text;

-- ─────────────────────────────────────────────
-- 2. Create station_overrides table
-- ─────────────────────────────────────────────
create table if not exists station_overrides (
  station_id    text primary key,
  info_text_ru  text default '',
  info_text_en  text default '',
  photo_url     text default '',
  updated_at    timestamptz default now()
);
alter table station_overrides enable row level security;
create policy "public read overrides"  on station_overrides for select using (true);
create policy "public write overrides" on station_overrides for insert with check (true);
create policy "public update overrides" on station_overrides for update using (true);

-- ─────────────────────────────────────────────
-- 3. Create spam_bans table (reputation system)
-- ─────────────────────────────────────────────
create table if not exists spam_bans (
  session_id   text primary key,
  flag_count   int default 0,
  banned_until timestamptz,
  updated_at   timestamptz default now()
);
alter table spam_bans enable row level security;
create policy "public read bans"   on spam_bans for select using (true);
create policy "public insert bans" on spam_bans for insert with check (true);
create policy "public update bans" on spam_bans for update using (true);

-- ─────────────────────────────────────────────
-- 4. Row Level Security for existing tables
-- ─────────────────────────────────────────────

-- reports: anyone can read, insert, delete
alter table reports enable row level security;
drop policy if exists "public read reports"   on reports;
drop policy if exists "public insert reports" on reports;
drop policy if exists "public delete reports" on reports;
create policy "public read reports"   on reports for select using (true);
create policy "public insert reports" on reports for insert with check (true);
create policy "public delete reports" on reports for delete using (true);

-- comments: anyone can read, insert; update flags/reactions for all
alter table comments enable row level security;
drop policy if exists "public read comments"   on comments;
drop policy if exists "public insert comments" on comments;
drop policy if exists "public update comments" on comments;
drop policy if exists "public delete comments" on comments;
create policy "public read comments"   on comments for select using (true);
create policy "public insert comments" on comments for insert with check (true);
create policy "public update comments" on comments for update using (true);
create policy "public delete comments" on comments for delete using (true);

-- profiles: anyone can read; users can update their own
alter table profiles enable row level security;
drop policy if exists "public read profiles"  on profiles;
drop policy if exists "public update profiles" on profiles;
create policy "public read profiles"   on profiles for select using (true);
create policy "public insert profiles" on profiles for insert with check (true);
create policy "public update profiles" on profiles for update using (true);

-- ─────────────────────────────────────────────
-- 5. Enable Realtime on all tables
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table reports;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table station_overrides;

-- ─────────────────────────────────────────────
-- 6. Helper function: increment flag on comment
-- ─────────────────────────────────────────────
create or replace function increment_flag_comment(comment_id text)
returns void language plpgsql as $$
begin
  update comments
  set flags_count = flags_count + 1
  where id = comment_id;
end;
$$;

-- ─────────────────────────────────────────────
-- Done! Run this entire script, then restart the app.
-- ─────────────────────────────────────────────
