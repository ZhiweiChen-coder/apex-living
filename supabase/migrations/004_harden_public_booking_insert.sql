-- The public publishable key may create a lead, but only with the same basic
-- integrity requirements as the app's booking route. Existing legacy rows are
-- not rewritten; NOT VALID still enforces this check for all new rows.
alter table public.bookings
  add constraint bookings_privacy_consent_required
  check (privacy_consent_at is not null) not valid;

drop policy if exists "Public can create booking leads" on public.bookings;

create policy "Public can create validated booking leads"
on public.bookings
for insert
to anon, authenticated
with check (
  lead_status = 'new'
  and privacy_consent_at is not null
  and char_length(trim(name)) between 2 and 80
  and char_length(trim(email)) between 3 and 254
  and char_length(trim(phone)) between 8 and 30
  and char_length(coalesce(notes, '')) <= 600
  and viewing_date in ('Thursday, 21 August', 'Saturday, 23 August', 'Wednesday, 27 August')
  and viewing_slot in ('10:00 am', '11:30 am', '1:00 pm', '3:30 pm')
);
