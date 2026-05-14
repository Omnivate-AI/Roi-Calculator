import { redirect } from "next/navigation";
import { getAdminEmail } from "@/lib/admin-auth";
import { getCalculatorConfig } from "@/lib/config-loader";
import { AdminEditor } from "./AdminEditor";

/**
 * Admin landing page. Verifies the visitor is signed in and on the
 * allowlist server side. Anyone else gets redirected to /admin/login.
 */
export default async function AdminPage() {
  const email = await getAdminEmail();
  if (!email) {
    redirect("/admin/login");
  }

  const config = await getCalculatorConfig();
  return <AdminEditor initialConfig={config} adminEmail={email} />;
}
