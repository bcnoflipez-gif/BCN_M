# Deployment & Integration Guide (GitHub, Vercel & Supabase)

This document provides a step-by-step walkthrough to deploy the **Barcelona Metro & Rodalies Live Map** application to production using **GitHub**, **Vercel**, and **Supabase**.

---

## 1. Supabase Database Schema Setup

Go to your **Supabase Dashboard**, select your project, open the **SQL Editor**, click **New Query**, paste the following script, and click **Run**:

```sql
-- 1. Create Profiles Table (Syncs with Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reports_count integer default 0 not null,
  comments_count integer default 0 not null,
  language text default 'ru'::text not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update their own profiles" on public.profiles
  for update using (auth.uid() = id);

-- Trigger to automatically create a profile for new auth users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'User_' || substr(new.id::text, 1, 5)),
    coalesce(new.raw_user_meta_data->>'language', 'ru')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create Reports Table (Station warning status)
create table public.reports (
  id text primary key,
  station_id text not null,
  type text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Enable RLS for Reports
alter table public.reports enable row level security;

create policy "Allow public read of reports" on public.reports
  for select using (true);

create policy "Allow public insert of reports" on public.reports
  for insert with check (true);

create policy "Allow public delete of reports" on public.reports
  for delete using (true);


-- 3. Create Comments Table
create table public.comments (
  id text primary key,
  station_id text not null,
  text text not null,
  author_name text not null,
  author_session_id text not null,
  flags_count integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reactions jsonb default '{"like":[], "dislike":[], "cop":[], "warning":[]}'::jsonb not null
);

-- Enable RLS for Comments
alter table public.comments enable row level security;

create policy "Allow public read of comments" on public.comments
  for select using (flags_count < 3);

create policy "Allow public insert of comments" on public.comments
  for insert with check (true);

create policy "Allow public delete of comments" on public.comments
  for delete using (true);

create policy "Allow public update of comments" on public.comments
  for update using (true);


-- 4. RPC Function for Comment Flagging
create or replace function public.increment_flag_comment(comment_id text)
returns void as $$
begin
  update public.comments
  set flags_count = flags_count + 1
  where id = comment_id;
end;
$$ language plpgsql security definer;
```

---

## 2. Push Your Local Project to GitHub

We have already initialized the local Git repository, added all files, committed them, and configured your remote origin as `git@github.com:bcnoflipez-gif/BCN_M.git`.

Since my terminal sandbox does not have access to your personal SSH keys, please run this single command in **your Mac terminal** to push the code to your GitHub:

```bash
git push -u origin main
```

---

## 3. Deploy to Vercel

1. Go to the **[Vercel Dashboard](https://vercel.com/)** and log in with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your `BCN_M` repository.
4. Under **Environment Variables**, add the following keys from your Supabase Dashboard settings (**Settings -> API**):

| Key | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-id.supabase.co` | Your Supabase Project API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ...` | Your Supabase Project public anon API key |

5. Click **Deploy**. Vercel will build the Next.js bundle and deploy it.

---

## 4. Setup Telegram Webhook Ingestion

To feed live reports from your Telegram channel or group to the application map:
1. Obtain a Telegram Bot API Token from `@BotFather`.
2. Configure a webhook pointing to your Vercel deployment URL by making a GET request to:
   ```
   https://api.telegram.org/bot<YOUR_TELEGRAM_BOT_TOKEN>/setWebhook?url=https://<YOUR-VERCEL-SUBDOMAIN>.vercel.app/api/telegram/webhook
   ```
3. Add your Bot to the Telegram chat/channel. The bot will automatically parse messages, match station names and keywords (e.g. `gossos`, `mosquits`), and instantly place them on the map.
