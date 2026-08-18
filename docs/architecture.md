# Apex Living Architecture

```mermaid
flowchart TB
  subgraph Public["Public experience"]
    Visitor["Visitor browser"]
    Cookie["Cookie preference\nSameSite=Lax"]
    BookingUI["Booking modal\nprivacy consent required"]
    ChatUI["AI concierge"]
  end

  subgraph Next["Next.js App Router"]
    Page["Landing page"]
    BookingAPI["POST /api/bookings\nZod validation"]
    ChatAPI["POST /api/chat\nPrompt guardrails"]
    Fallback["Listing-guided fallback"]
    AdminSession["POST /api/admin/session\nHttpOnly session cookie"]
    AdminCookie["Admin session cookie\nHttpOnly · SameSite=Strict"]
    AdminAPI["GET /api/admin/bookings\nToken verification"]
  end

  subgraph Admin["Protected staff experience"]
    Staff["Authorised administrator\n/admin"]
  end

  subgraph Supabase["Supabase"]
    Auth["Supabase Auth"]
    RLS["RLS policies"]
    DB[("bookings\nprivacy_consent_at")]
    Allowlist[("admin_users")]
  end

  LLM["OpenAI API"]

  Visitor --> Page
  Visitor --> Cookie
  Visitor --> BookingUI --> BookingAPI --> RLS --> DB
  Visitor --> ChatUI --> ChatAPI --> LLM
  ChatAPI -.->|No key or API failure| Fallback

  Staff --> AdminSession --> Auth
  AdminSession --> AdminCookie --> Staff
  Staff --> AdminAPI --> Auth
  AdminAPI --> RLS
  RLS --> Allowlist
  RLS --> DB

  classDef public fill:#edf1eb,stroke:#405047,color:#14211e
  classDef secure fill:#f4e8c9,stroke:#92743b,color:#14211e
  classDef data fill:#14211e,stroke:#d5b87a,color:#f7f4ee
  class Visitor,Cookie,BookingUI,ChatUI,Page public
  class AdminSession,AdminCookie,AdminAPI,Auth,RLS secure
  class DB,Allowlist,LLM data
```

## Access rules

- The public publishable key can create a booking only when its RLS integrity checks pass; the Next.js route adds validation and bot protection.
- Booking information has no public read, update or delete policy.
- The admin portal must authenticate with Supabase Auth and match an `admin_users` allowlist entry before it can query bookings.
- The browser never receives a Service Role Key, customer booking data in cookies, or AI conversation history as persistent storage.
