# Apex Living — The Aster House

A premium, responsive real-estate lead-generation MVP built for the PowerFlux Next.js / AI application assessment. The listing is a fictional demonstration project.

## What it includes

- Editorial, mobile-first landing page with tailored motion and booking CTA.
- AI property concierge using OpenAI when configured, with a reliable listing-grounded fallback when it is not.
- Server-validated viewing request form persisted to Supabase.
- Architecture deliverables in [`docs/system-architecture.mmd`](docs/system-architecture.mmd), SVG and PNG.

## Local setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and add the required values.
3. Run the SQL in [`supabase/migrations/001_create_bookings.sql`](supabase/migrations/001_create_bookings.sql) using the Supabase SQL editor.
4. Start the app: `npm run dev`

The visual site and AI fallback work without environment variables. Booking persistence requires both Supabase values. The publishable key is safe to expose, but RLS permits inserts only; it never permits reading, updating or deleting bookings.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | No | Enables live concierge responses. |
| `OPENAI_MODEL` | No | Defaults to `gpt-4.1-mini`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes, for bookings | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes, for bookings | Publishable Supabase key used under the insert-only RLS policy. |

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deploy to Vercel

Import this repository as a Next.js project, add the four environment variables in Vercel Project Settings, then deploy. The booking endpoint uses the publishable key under an insert-only RLS policy; it holds no privileged database credential.
