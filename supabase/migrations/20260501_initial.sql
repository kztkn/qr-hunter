-- QR scan records (one per user per URL)
create table public.qr_records (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  url         text        not null,
  domain      text        not null,
  scanned_at  timestamptz not null default now(),
  number      integer     not null,
  unique (user_id, url)
);

alter table public.qr_records enable row level security;

create policy "own records"
  on public.qr_records for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Unlocked achievements (composite PK prevents duplicates)
create table public.user_achievements (
  user_id        uuid        not null references auth.users(id) on delete cascade,
  achievement_id text        not null,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "own achievements"
  on public.user_achievements for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
