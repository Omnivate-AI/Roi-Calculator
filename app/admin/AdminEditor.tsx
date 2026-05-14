"use client";

import { useState, useTransition } from "react";
import { saveConfig, signOut } from "./actions";
import { Button } from "@/components/ui/button";
import type { CalculatorConfig } from "@/lib/config-types";

interface AdminEditorProps {
  initialConfig: CalculatorConfig;
}

/**
 * Admin editor surface. Renders a JSON editor for the full config
 * payload. Pragmatic V1 - one big JSON textarea so every field is
 * editable. We add structured field-by-field editors later if needed.
 */
export function AdminEditor({ initialConfig }: AdminEditorProps) {
  const [draft, setDraft] = useState(() => JSON.stringify(initialConfig, null, 2));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [signingOut, setSigningOut] = useState(false);

  function handleReset() {
    setDraft(JSON.stringify(initialConfig, null, 2));
    setStatus("idle");
    setErrorMsg(null);
  }

  function handleSave() {
    setStatus("saving");
    setErrorMsg(null);

    let parsed: CalculatorConfig;
    try {
      parsed = JSON.parse(draft);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? `Invalid JSON: ${err.message}` : "Invalid JSON"
      );
      return;
    }

    startTransition(async () => {
      const result = await saveConfig(parsed);
      if (result.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Save failed");
      }
    });
  }

  function handleSignOut() {
    setSigningOut(true);
    startTransition(async () => {
      await signOut();
    });
  }

  const saving = status === "saving" || isPending;

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
              Admin
            </p>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Calculator configuration
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </header>

        <p className="mt-4 text-sm text-muted-foreground">
          Edit the JSON below to change calculator copy, thresholds, scales, and
          defaults. Save when ready. Changes appear on the live calculator
          within 60 seconds (cache revalidation). Every save is logged with the
          previous payload, so any change can be reverted.
        </p>

        {/* Action bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-9 text-primary-foreground"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
            }}
          >
            {saving ? "Saving..." : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={saving}
          >
            Reset to last saved
          </Button>
          {status === "saved" && (
            <span
              className="text-xs font-semibold"
              style={{ color: "hsl(var(--success))" }}
            >
              ✓ Saved. Calculator updates within a minute.
            </span>
          )}
          {status === "error" && (
            <span className="text-xs font-semibold text-destructive">
              {errorMsg ?? "Save failed"}
            </span>
          )}
        </div>

        {/* JSON editor */}
        <div className="mt-5 rounded-xl border border-border bg-card p-1">
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            spellCheck={false}
            className="block h-[640px] w-full resize-none rounded-lg bg-transparent p-4 font-mono text-xs leading-relaxed text-foreground focus:outline-none"
            disabled={saving}
          />
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground">
          Tip: open the live calculator in another tab to verify your changes
          after saving. Each save creates an audit log entry in{" "}
          <code className="font-mono">roi_calc.config_changes</code> with the
          previous and new payload.
        </p>
      </div>
    </div>
  );
}
