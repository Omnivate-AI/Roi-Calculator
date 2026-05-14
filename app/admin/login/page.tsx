"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "./actions";

/**
 * Simple password-gate login. The submitted password is checked
 * server-side against ADMIN_PASSWORD env var; on match the server sets
 * a signed session cookie and redirects to /admin.
 */
export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

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
              Enter the admin password to access the configuration editor.
            </p>
          </div>

          <form action={formAction} className="space-y-3">
            <Input
              type="password"
              name="password"
              required
              placeholder="Admin password"
              aria-label="Admin password"
              autoComplete="current-password"
              autoFocus
              disabled={pending}
              className="font-mono"
            />
            <Button
              type="submit"
              disabled={pending}
              className="h-10 w-full font-medium text-primary-foreground"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
              }}
            >
              {pending ? "Signing in..." : "Sign in"}
            </Button>
            {state && !state.ok && state.error && (
              <p className="text-xs text-destructive">{state.error}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
