import { cookies } from "next/headers";
import { adminSessionCookie, getVerifiedAdminClient } from "@/lib/admin";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getSupabaseBookingClient } from "@/lib/supabase";
import { adminLoginSchema } from "@/lib/validation";

const sessionOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60,
};

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "admin-login");
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Please enter a valid email and password." }, { status: 400 });

  const supabase = getSupabaseBookingClient();
  if (!supabase) return Response.json({ error: "Admin access is not configured." }, { status: 503 });

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.session) return Response.json({ error: "Invalid email or password." }, { status: 401 });

  const verifiedAdmin = await getVerifiedAdminClient(data.session.access_token);
  if (!verifiedAdmin) return Response.json({ error: "This account is not authorised to access booking leads." }, { status: 403 });

  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, data.session.access_token, { ...sessionOptions, maxAge: Math.min(data.session.expires_in || 3600, 3600) });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, "", { ...sessionOptions, maxAge: 0 });
  return Response.json({ ok: true });
}
