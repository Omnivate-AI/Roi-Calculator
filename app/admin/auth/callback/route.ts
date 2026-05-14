import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Magic-link callback. Supabase appends ?code=... to the redirect URL.
 * We exchange the code for a session, then redirect to the admin page.
 * The admin page itself checks whether the email is in the allowlist.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Bad code or error: send back to login with an error flag.
  return NextResponse.redirect(`${origin}/admin/login?error=invalid_link`);
}
