"use server";

import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { clearSession, isAdmin } from "@/lib/admin-auth";
import type { CalculatorConfig } from "@/lib/config-types";

/**
 * Save a new full config payload. Verifies the caller has a valid
 * admin session cookie. Writes to roi_calc.config and inserts an
 * audit row into roi_calc.config_changes. Revalidates the calculator
 * config cache so changes are visible within ~60 seconds.
 */
export async function saveConfig(newPayload: CalculatorConfig): Promise<{
  ok: boolean;
  error?: string;
}> {
  const allowed = await isAdmin();
  if (!allowed) {
    return { ok: false, error: "Not authorized" };
  }

  try {
    const admin = createAdminClient();

    const { data: existing } = await admin
      .schema("roi_calc")
      .from("config")
      .select("payload")
      .eq("id", 1)
      .single();

    const { error: upsertError } = await admin
      .schema("roi_calc")
      .from("config")
      .upsert(
        {
          id: 1,
          payload: newPayload,
          updated_by: "admin",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      return { ok: false, error: upsertError.message };
    }

    await admin.schema("roi_calc").from("config_changes").insert({
      changed_by: "admin",
      previous_payload: existing?.payload ?? null,
      new_payload: newPayload,
    });

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
 * Clear the session cookie and redirect to the login page.
 */
export async function signOut(): Promise<void> {
  await clearSession();
  redirect("/admin/login");
}
