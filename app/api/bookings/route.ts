import { verifyBookingBotProtection } from "@/lib/bot-protection";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { getSupabaseBookingClient } from "@/lib/supabase";
import { bookingSchema } from "@/lib/validation";
import { project } from "@/lib/project";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "booking");
  if (!rateLimit.allowed) return rateLimitResponse(rateLimit);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Please check your booking details.", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const botCheck = await verifyBookingBotProtection(request, parsed.data);
  if (!botCheck.ok) return Response.json({ error: botCheck.error }, { status: 400 });

  if (!project.viewingDates.includes(parsed.data.viewingDate as never) || !project.viewingSlots.includes(parsed.data.viewingSlot as never)) {
    return Response.json({ error: "Please choose an available viewing time." }, { status: 400 });
  }

  const supabase = getSupabaseBookingClient();
  if (!supabase) {
    return Response.json({ error: "Booking service is not configured." }, { status: 500 });
  }

  const bookingId = crypto.randomUUID();
  const { error } = await supabase
    .from("bookings")
    .insert({
      id: bookingId,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      viewing_date: parsed.data.viewingDate,
      viewing_slot: parsed.data.viewingSlot,
      notes: parsed.data.notes || null,
      lead_status: "new",
      privacy_consent_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Booking persistence failed", error.code || "unknown error");
    return Response.json({ error: "We could not save your booking. Please try again." }, { status: 500 });
  }

  return Response.json({ bookingId }, { status: 201 });
}
