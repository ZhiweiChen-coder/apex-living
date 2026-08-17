-- The publishable key can insert leads, but cannot read, modify, or delete them.
drop policy if exists "Public can create booking leads" on public.bookings;

create policy "Public can create booking leads"
on public.bookings
for insert
to anon, authenticated
with check (lead_status = 'new');
