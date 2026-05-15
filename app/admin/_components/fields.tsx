"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldRowProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  span?: "full" | "half";
}

/** Label + control on one row, hint below. */
export function FieldRow({ label, hint, children, span = "full" }: FieldRowProps) {
  return (
    <div className={cn("space-y-1", span === "half" && "sm:max-w-xs")}>
      <label className="block text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground/80">{hint}</p>}
    </div>
  );
}

interface TextFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  span?: "full" | "half";
  placeholder?: string;
}

export function TextField({ label, hint, value, onChange, span, placeholder }: TextFieldProps) {
  return (
    <FieldRow label={label} hint={hint} span={span}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      />
    </FieldRow>
  );
}

interface TextAreaFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}

export function TextAreaField({ label, hint, value, onChange, rows = 3 }: TextAreaFieldProps) {
  return (
    <FieldRow label={label} hint={hint}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="block w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed text-foreground transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
      />
    </FieldRow>
  );
}

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  span?: "full" | "half";
  suffix?: string;
  prefix?: string;
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  step = 1,
  min,
  max,
  span = "half",
  suffix,
  prefix,
}: NumberFieldProps) {
  return (
    <FieldRow label={label} hint={hint} span={span}>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <input
          type="number"
          inputMode="decimal"
          value={value}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) onChange(next);
          }}
          className={cn(
            "block w-full rounded-md border border-border bg-background py-2 font-mono text-sm tabular-nums text-foreground transition-colors focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
            prefix ? "pl-7" : "pl-3",
            suffix ? "pr-9" : "pr-3"
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </FieldRow>
  );
}

interface SectionProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}

/** Collapsible card. Header click toggles. Children rendered when open. */
export function Section({ title, subtitle, defaultOpen = false, badge, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
      >
        <div className="flex items-baseline gap-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-brand-primary">
              {badge}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform",
              open && "rotate-180"
            )}
            strokeWidth={2.5}
          />
        </div>
      </button>
      {open && (
        <div className="border-t border-border bg-background/50 p-4">{children}</div>
      )}
    </div>
  );
}
