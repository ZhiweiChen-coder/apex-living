alter table public.bookings
  add column if not exists privacy_consent_at timestamptz;

create index if not exists bookings_created_at_idx on public.bookings (created_at desc);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_booking_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_booking_admin() from public;
grant execute on function public.is_booking_admin() to authenticated;

drop policy if exists "Booking admins can read booking leads" on public.bookings;
create policy "Booking admins can read booking leads"
on public.bookings
for select
to authenticated
using ((select public.is_booking_admin()));

-- Add an authenticated Supabase user, then grant that specific user access:
-- insert into public.admin_users (user_id) values ('AUTH_USER_UUID');
