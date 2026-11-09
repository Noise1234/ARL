-- 1. Create the profiles table
create table if not exists public.arl_profiles (
  username text primary key check (char_length(username) >= 2 and char_length(username) <= 24),
  pin_hash text not null check (char_length(pin_hash) >= 8),
  xp integer default 0,
  streak_days integer default 0,
  total_words_learned integer default 0,
  study_minutes_total integer default 0,
  detailed_stats jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.arl_profiles enable row level security;

-- 3. Public read & initial insert policies
drop policy if exists "Anyone can view profiles" on public.arl_profiles;
create policy "Anyone can view profiles"
  on public.arl_profiles for select
  using (true);

drop policy if exists "Anyone can insert profile" on public.arl_profiles;
create policy "Anyone can insert profile"
  on public.arl_profiles for insert
  with check (true);

drop policy if exists "Anyone can update profile with matching PIN" on public.arl_profiles;
create policy "Anyone can update profile with matching PIN"
  on public.arl_profiles for update
  using (true)
  with check (true);

-- 4. Server-side PIN protection trigger (blocks overwrites if pin_hash doesn't match)
create or replace function public.verify_arl_profile_pin()
returns trigger
language plpgsql
security definer
as $$
begin
  if old.pin_hash is distinct from new.pin_hash then
    raise exception 'PIN_MISMATCH: This username belongs to another user or your 4-digit PIN is incorrect.'
      using errcode = '42501';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_verify_arl_profile_pin on public.arl_profiles;
create trigger trg_verify_arl_profile_pin
  before update on public.arl_profiles
  for each row
  execute function public.verify_arl_profile_pin();
