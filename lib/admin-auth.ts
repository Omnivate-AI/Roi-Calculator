import "server-only";
import { createClient as createServerSupabase } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

/**
 * Returns the currently authenticated user's email if and only if they
 * are in the admin allowlist. Returns null otherwise.
 *
 * Allowlist source order (first hit wins):
 *   1. ADMIN_EMAILS env var (comma separated). Useful for bootstrap and
 *      for quick lockout recovery.
 *   2. roi_calc.admins table in Supabase. Updated by the admin page.
 */
export async function getAdminEmail(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;
  const email = user.email.toLowerCase();

  // 1. Static allowlist via env var.
  const envAllowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  if (envAllowlist.includes(email)) return user.email;

  // 2. Dynamic allowlist in Supabase (table read via service role).
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .schema("roi_calc")
      .from("admins")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[admin-auth] DB allowlist check failed:", error.message);
      return null;
    }
    if (data?.email) return user.email;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[admin-auth] DB unreachable for allowlist check:", err);
    return null;
  }

  return null;
}
