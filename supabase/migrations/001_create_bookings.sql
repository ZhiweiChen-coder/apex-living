create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  viewing_date text not null,
  viewing_slot text not null,
  notes text,
  lead_status text not null default 'new' check (lead_status in ('new', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;
