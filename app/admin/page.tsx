import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getCalculatorConfig } from "@/lib/config-loader";
import { AdminEditor } from "./AdminEditor";

/**
 * Admin landing page. Verifies the visitor has a valid admin session
 * cookie server side. Anyone else gets redirected to /admin/login.
 */
export default async function AdminPage() {
  const allowed = await isAdmin();
  if (!allowed) {
    redirect("/admin/login");
  }

  const config = await getCalculatorConfig();
  return <AdminEditor initialConfig={config} />;
}
