"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import type { CalculatorConfig } from "@/lib/config-types";
import { saveConfig, signOut } from "./actions";
import { Section } from "./_components/fields";
import { GlobalsEditor } from "./_components/GlobalsEditor";
import { SliderConfigCard } from "./_components/SliderConfigCard";
import { StrategyEditor } from "./_components/StrategyEditor";

interface AdminEditorProps {
  initialConfig: CalculatorConfig;
}

const SLIDER_FIELDS: { field: Parameters<typeof SliderConfigCard>[0]["field"]; displayName: string }[] = [
  { field: "openRate", displayName: "Open rate" },
  { field: "replyRate", displayName: "Reply rate" },
  { field: "positiveReplyRate", displayName: "Positive reply rate" },
  { field: "meetingBookedRate", displayName: "Meeting booked rate" },
  { field: "closeRate", displayName: "Close rate" },
  { field: "dealValue", displayName: "Average deal value" },
];

/**
 * Admin editor with a structured form UI. Each slider field has its
 * own collapsible card; strategy and globals have their own sections.
 * The raw JSON escape hatch sits at the bottom for power-user edits.
 */
export function AdminEditor({ initialConfig }: AdminEditorProps) {
  const [config, setConfig] = useState<CalculatorConfig>(initialConfig);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [signingOut, setSigningOut] = useState(false);
  const [showJson, setShowJson] = useState(false);

  const dirty = useMemo(
    () => JSON.stringify(config) !== JSON.stringify(initialConfig),
    [config, initialConfig]
  );

  function handleSave() {
    setStatus("saving");
    setErrorMsg(null);
    startTransition(async () => {
      const result = await saveConfig(config);
      if (result.ok) {
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 2500);
      } else {
        setStatus("error");
        setErrorMsg(result.error ?? "Save failed");
      }
    });
  }

  function handleReset() {
    setConfig(initialConfig);
    setStatus("idle");
    setErrorMsg(null);
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
      <div className="mx-auto max-w-5xl px-4 pb-32 pt-6 sm:px-6 sm:pt-8">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </header>

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Each section below edits part of the live calculator. Click a section
          header to expand. Save changes when ready. Updates appear on the live
          calculator within 60 seconds.
        </p>

        {/* Form sections */}
        <div className="mt-6 space-y-3">
          <GlobalsEditor config={config} setConfig={setConfig} />
          <StrategyEditor config={config} setConfig={setConfig} />

          {SLIDER_FIELDS.map(({ field, displayName }) => (
            <SliderConfigCard
              key={field}
              field={field}
              displayName={displayName}
              config={config}
              setConfig={setConfig}
            />
          ))}

          {/* Raw JSON escape hatch */}
          <Section title="Advanced: raw JSON" subtitle="Power-user edit fallback">
            <RawJsonEditor config={config} setConfig={setConfig} />
          </Section>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            {status === "saved" && (
              <p
                className="truncate text-xs font-semibold"
                style={{ color: "hsl(var(--success))" }}
              >
                ✓ Saved. Live calculator updates within a minute.
              </p>
            )}
            {status === "error" && (
              <p className="truncate text-xs font-semibold text-destructive">
                {errorMsg ?? "Save failed"}
              </p>
            )}
            {status !== "saved" && status !== "error" && (
              <p className="truncate text-xs text-muted-foreground">
                {dirty
                  ? "Unsaved changes"
                  : "All changes saved"}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={saving || !dirty}
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saving || !dirty}
              className="h-9 text-primary-foreground"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
              }}
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RawJsonEditorProps {
  config: CalculatorConfig;
  setConfig: (updater: (draft: CalculatorConfig) => CalculatorConfig) => void;
}

function RawJsonEditor({ config, setConfig }: RawJsonEditorProps) {
  const [draft, setDraft] = useState(() => JSON.stringify(config, null, 2));
  const [error, setError] = useState<string | null>(null);

  function handleApply() {
    setError(null);
    try {
      const parsed = JSON.parse(draft) as CalculatorConfig;
      setConfig(() => parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON");
    }
  }

  function handleSync() {
    setDraft(JSON.stringify(config, null, 2));
    setError(null);
  }

  return (
    <div className="space-y-3">
      <p className="text-[11px] text-muted-foreground/80">
        Edit the raw JSON, then click <strong>Apply to form</strong> to push
        changes into the structured editor. The Save button at the bottom of
        the page commits to the server.
      </p>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        spellCheck={false}
        className="block h-96 w-full resize-y rounded-md border border-border bg-background p-3 font-mono text-[11px] leading-relaxed text-foreground focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      />
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleSync}>
          Sync from form
        </Button>
        <Button type="button" size="sm" onClick={handleApply}>
          Apply to form
        </Button>
        {error && (
          <span className="text-[11px] font-semibold text-destructive">{error}</span>
        )}
      </div>
    </div>
  );
}
