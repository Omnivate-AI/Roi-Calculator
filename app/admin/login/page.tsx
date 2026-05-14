"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Admin sign-in page. Sends a magic link to the entered email via
 * Supabase auth. Email is not validated against the allowlist here;
 * the callback checks whether the signed-in user is actually allowed.
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin/auth/callback`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4">
        <div className="w-full space-y-6 rounded-2xl border border-border bg-card p-7 shadow-[0_4px_24px_-8px_hsl(220_43%_11%_/_0.08)]">
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
              Admin
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Sign in to edit the calculator
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We will send a one time link to your inbox. Only allowlisted
              emails can access this page.
            </p>
          </div>

          {status === "sent" ? (
            <div className="space-y-2 rounded-lg border border-success/30 bg-success/5 p-4">
              <p
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: "hsl(var(--success))" }}
              >
                Link sent
              </p>
              <p className="text-sm text-foreground">
                Check{" "}
                <span className="font-semibold">{email}</span> for a sign in
                link. The link expires in 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                required
                placeholder="you@omnivate.ai"
                aria-label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "sending"}
                className="font-mono"
              />
              <Button
                type="submit"
                disabled={status === "sending" || !email.trim()}
                className="h-10 w-full font-medium text-primary-foreground"
                style={{
                  background:
                    "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
                }}
              >
                {status === "sending" ? "Sending..." : "Send sign in link"}
              </Button>
              {errorMsg && (
                <p className="text-xs text-destructive">{errorMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
