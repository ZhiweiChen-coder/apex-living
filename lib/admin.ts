import { getSupabaseAuthenticatedClient } from "@/lib/supabase";

export const adminSessionCookie = "apex_admin_session";

export async function getVerifiedAdminClient(accessToken: string | undefined) {
  if (!accessToken) return null;
  const client = getSupabaseAuthenticatedClient(accessToken);
  if (!client) return null;

  const { data: userData, error: userError } = await client.auth.getUser(accessToken);
  if (userError || !userData.user) return null;

  const { data: isAdmin, error: adminError } = await client.rpc("is_booking_admin");
  if (adminError || !isAdmin) return null;

  return client;
}
