"use server";

import { redirect } from "next/navigation";
import { tryLogin } from "@/lib/admin-auth";

/**
 * Server action invoked by the login form. Verifies the password and,
 * on success, sets the session cookie and redirects to /admin.
 */
export async function login(prevState: unknown, formData: FormData): Promise<{
  ok: boolean;
  error?: string;
}> {
  const password = String(formData.get("password") ?? "");
  if (!password) {
    return { ok: false, error: "Password is required" };
  }

  const success = await tryLogin(password);
  if (!success) {
    return { ok: false, error: "Wrong password" };
  }

  redirect("/admin");
}
