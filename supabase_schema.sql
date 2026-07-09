-- 002_FatLossTracker_Cloud: 資料表與 RLS 設定
-- 使用方式：Supabase Dashboard → SQL Editor → New query → 貼上全部 → Run

create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight numeric,
  body_fat numeric,
  visceral_fat numeric,
  chest numeric,
  arm numeric,
  waist numeric,
  hip numeric,
  thigh numeric,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.records enable row level security;

create policy "Users can view their own records"
  on public.records for select
  using (auth.uid() = user_id);

create policy "Users can insert their own records"
  on public.records for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own records"
  on public.records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own records"
  on public.records for delete
  using (auth.uid() = user_id);
