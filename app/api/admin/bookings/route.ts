import { cookies } from "next/headers";
import { adminSessionCookie, getVerifiedAdminClient } from "@/lib/admin";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = await getVerifiedAdminClient(cookieStore.get(adminSessionCookie)?.value);
  if (!supabase) return Response.json({ error: "Unauthorised." }, { status: 401 });

  const { data, error } = await supabase
    .from("bookings")
    .select("id, name, email, phone, viewing_date, viewing_slot, notes, lead_status, created_at, privacy_consent_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Admin booking query failed", error.code);
    return Response.json({ error: "We could not load booking leads." }, { status: 500 });
  }
  return Response.json({ bookings: data });
}
