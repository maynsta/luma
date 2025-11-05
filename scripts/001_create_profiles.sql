-- Create profiles table for user data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  age integer not null check (age >= 18 and age <= 100),
  bio text,
  gender text check (gender in ('male', 'female', 'other')),
  looking_for text check (looking_for in ('male', 'female', 'everyone')),
  location text,
  profile_image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create hobbies table
create table if not exists public.hobbies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  hobby text not null,
  created_at timestamp with time zone default now()
);

-- Create personality traits table
create table if not exists public.personality_traits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  trait text not null,
  value integer check (value >= 1 and value <= 5),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.hobbies enable row level security;
alter table public.personality_traits enable row level security;

-- Profiles policies
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Hobbies policies
create policy "hobbies_select_all"
  on public.hobbies for select
  using (true);

create policy "hobbies_insert_own"
  on public.hobbies for insert
  with check (auth.uid() = user_id);

create policy "hobbies_update_own"
  on public.hobbies for update
  using (auth.uid() = user_id);

create policy "hobbies_delete_own"
  on public.hobbies for delete
  using (auth.uid() = user_id);

-- Personality traits policies
create policy "traits_select_all"
  on public.personality_traits for select
  using (true);

create policy "traits_insert_own"
  on public.personality_traits for insert
  with check (auth.uid() = user_id);

create policy "traits_update_own"
  on public.personality_traits for update
  using (auth.uid() = user_id);

create policy "traits_delete_own"
  on public.personality_traits for delete
  using (auth.uid() = user_id);

-- Create trigger function to update updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Add trigger to profiles
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
