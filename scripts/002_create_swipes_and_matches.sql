-- Create swipes table to track user interactions
create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  swiper_id uuid references public.profiles(id) on delete cascade,
  swiped_id uuid references public.profiles(id) on delete cascade,
  liked boolean not null,
  created_at timestamp with time zone default now(),
  unique(swiper_id, swiped_id)
);

-- Create matches table for mutual likes
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid references public.profiles(id) on delete cascade,
  user2_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user1_id, user2_id),
  check (user1_id < user2_id)
);

-- Enable RLS
alter table public.swipes enable row level security;
alter table public.matches enable row level security;

-- Swipes policies
create policy "swipes_select_own"
  on public.swipes for select
  using (auth.uid() = swiper_id);

create policy "swipes_insert_own"
  on public.swipes for insert
  with check (auth.uid() = swiper_id);

-- Matches policies - users can see their own matches
create policy "matches_select_own"
  on public.matches for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "matches_insert_system"
  on public.matches for insert
  with check (true);

-- Function to create a match when there's a mutual like
create or replace function public.check_and_create_match()
returns trigger
language plpgsql
security definer
as $$
declare
  mutual_like boolean;
begin
  -- Only proceed if this is a like
  if new.liked = true then
    -- Check if the other user also liked
    select exists(
      select 1 from public.swipes
      where swiper_id = new.swiped_id
        and swiped_id = new.swiper_id
        and liked = true
    ) into mutual_like;

    -- If mutual like, create a match
    if mutual_like then
      insert into public.matches (user1_id, user2_id)
      values (
        least(new.swiper_id, new.swiped_id),
        greatest(new.swiper_id, new.swiped_id)
      )
      on conflict (user1_id, user2_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

-- Trigger to automatically create matches
create trigger create_match_on_mutual_like
  after insert on public.swipes
  for each row
  execute function public.check_and_create_match();
