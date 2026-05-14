"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminEmail } from "@/lib/admin-auth";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import type { CalculatorConfig } from "@/lib/config-types";

/**
 * Save a new full config payload. Caller must already be authenticated
 * and in the admin allowlist; we re-verify server side here too.
 *
 * Writes the new payload to roi_calc.config and inserts an audit row
 * into roi_calc.config_changes capturing the previous and new payloads.
 * Then revalidates the calculator-config tag so the calculator picks up
 * the change within seconds.
 */
export async function saveConfig(newPayload: CalculatorConfig): Promise<{
  ok: boolean;
  error?: string;
}> {
  const email = await getAdminEmail();
  if (!email) {
    return { ok: false, error: "Not authorized" };
  }

  try {
    const admin = createAdminClient();

    // Fetch the previous payload for the audit log.
    const { data: existing } = await admin
      .schema("roi_calc")
      .from("config")
      .select("payload")
      .eq("id", 1)
      .single();

    // Upsert the new payload.
    const { error: upsertError } = await admin
      .schema("roi_calc")
      .from("config")
      .upsert(
        {
          id: 1,
          payload: newPayload,
          updated_by: email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      return { ok: false, error: upsertError.message };
    }

    // Log the change.
    await admin.schema("roi_calc").from("config_changes").insert({
      changed_by: email,
      previous_payload: existing?.payload ?? null,
      new_payload: newPayload,
    });

    // Invalidate the calculator config cache. Next.js 16 requires a
    // profile string ("max" = revalidate everywhere immediately).
    revalidateTag("calculator-config", "max");

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Sign the admin user out and redirect to the login page.
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
