# Apex Living — The Aster House

A premium, responsive real-estate lead-generation MVP built for the PowerFlux Next.js / AI application assessment. The listing is a fictional demonstration project.

## What it includes

- Editorial, mobile-first landing page with tailored motion and booking CTA.
- AI property concierge using OpenAI when configured, with a reliable listing-grounded fallback when it is not.
- Server-validated viewing request form with recorded privacy consent, persisted to Supabase.
- Cookie-preference notice and a Supabase Auth-protected lead portal at `/admin`.
- Architecture diagram in [`docs/architecture.md`](docs/architecture.md), with the Mermaid source at [`docs/system-architecture.mmd`](docs/system-architecture.mmd).

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add the required values.
3. Run all SQL files in [`supabase/migrations/`](supabase/migrations/) in numeric order using the Supabase SQL editor.
4. Start the app: `npm run dev`

The visual site and AI fallback work without environment variables. Booking persistence requires both Supabase values. The publishable key is safe to expose, but RLS permits anonymous inserts only; it never permits reading, updating or deleting bookings.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Enables live concierge responses. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4.1-mini`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes, for bookings | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes, for bookings | Publishable Supabase key used under the insert-only RLS policy. |

## Administrator setup

1. Run migrations `003_admin_access_and_privacy_consent.sql` and `004_harden_public_booking_insert.sql`.
2. In Supabase Dashboard, create an email/password user under **Authentication → Users**.
3. In the SQL Editor, grant that specific user access (replace the UUID):

   ```sql
   insert into public.admin_users (user_id) values ('AUTH_USER_UUID');
   ```

4. Visit `/admin` and sign in with that user’s email and password.

The portal uses a one-hour `HttpOnly`, `SameSite=Strict` session cookie. The publishable key never gains broad read access: the database allows booking reads only when `auth.uid()` belongs to `admin_users`.

## Privacy and security

- The public booking form requires consent and records the consent time separately from booking details.
- Booking details are never sent to the AI concierge, stored in browser cookies, or exposed through a public read API. Obvious email addresses and phone numbers entered into chat are redacted before sending to OpenAI.
- The public site only sets a one-year preference cookie; it has no advertising or analytics cookies.
- Security headers restrict framing, browser capabilities, content types, referrers, content sources and enforce HTTPS in production.
- Chat, booking and admin-login endpoints are rate-limited. Upstash Redis makes those limits durable across instances; without it, a local in-memory safety net is used for development and demo deployments.
- Cloudflare Turnstile is enforced whenever both Turnstile keys are configured; a server-validated honeypot is always enabled.

### Publishable-key limitation

This MVP intentionally uses a Supabase publishable key and allows anonymous inserts only. Migration `004` enforces consent, field length and the configured viewing choices at the database layer, but it cannot prove that a request originated in the Next.js booking route. For high-volume production traffic, move booking insertion to a server-side privileged boundary (for example, a Supabase Edge Function with a server-only secret) so that no direct anonymous table insert is allowed.

See the in-product [privacy notice](/privacy) before collecting real customer information. Replace the demonstration contact and policy text with your business&apos;s final legal copy before launch.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy to Vercel

Import this repository as a Next.js project, add the four environment variables in Vercel Project Settings, then deploy. The booking endpoint uses the publishable key under an insert-only RLS policy; it holds no privileged database credential.
