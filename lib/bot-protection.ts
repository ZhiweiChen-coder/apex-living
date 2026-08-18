type BotCheckResult = { ok: true } | { ok: false; error: string };

function getClientAddress(request: Request) {
  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim();
}

export async function verifyBookingBotProtection(
  request: Request,
  { website, turnstileToken }: { website?: string; turnstileToken?: string },
): Promise<BotCheckResult> {
  if (website?.trim()) return { ok: false, error: "We could not accept this booking request." };

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true };
  if (!turnstileToken) return { ok: false, error: "Please complete the security check and try again." };

  try {
    const form = new URLSearchParams({ secret, response: turnstileToken });
    const address = getClientAddress(request);
    if (address) form.set("remoteip", address);

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(5_000),
    });
    const result = await response.json() as { success?: boolean };
    return result.success ? { ok: true } : { ok: false, error: "The security check did not complete. Please try again." };
  } catch {
    return { ok: false, error: "The security check is temporarily unavailable. Please try again shortly." };
  }
}
