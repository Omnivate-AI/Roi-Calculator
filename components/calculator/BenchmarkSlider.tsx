"use client";

import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { BenchmarkStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useCalculatorConfig } from "./CalculatorConfigContext";

type FieldKey =
  | "openRate"
  | "replyRate"
  | "positiveReplyRate"
  | "meetingBookedRate"
  | "closeRate"
  | "dealValue";

interface BenchmarkSliderProps {
  field: FieldKey;
  label: string;
  value: number;
  unit?: string;
  formatValue?: (n: number) => string;
  onValueChange: (value: number) => void;
  footerSlot?: ReactNode;
  showStatus?: boolean;
  helper?: string;
}

const STATUS_LABEL: Record<BenchmarkStatus, string> = {
  poor: "Low",
  average: "Average",
  good: "Good",
};

const STATUS_STYLES: Record<
  BenchmarkStatus,
  { dot: string; text: string; bg: string; ring: string }
> = {
  poor: {
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    ring: "ring-destructive/20",
  },
  average: {
    dot: "bg-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    ring: "ring-warning/20",
  },
  good: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
    ring: "ring-success/20",
  },
};

function statusFor(
  thresholds: { status: BenchmarkStatus; threshold: number }[],
  value: number
): BenchmarkStatus {
  let current: BenchmarkStatus = "poor";
  for (const entry of thresholds) {
    if (value >= entry.threshold) current = entry.status;
  }
  return current;
}

/**
 * Reads everything from the runtime calculator config (Supabase-backed,
 * editable via /admin) — slider limits, thresholds, anchor labels,
 * explainer copy, status feedback all come from context.
 */
export function BenchmarkSlider({
  field,
  label,
  value,
  unit,
  formatValue,
  onValueChange,
  footerSlot,
  showStatus = true,
  helper,
}: BenchmarkSliderProps) {
  const config = useCalculatorConfig();
  const limits = config.sliderLimits[field];
  const thresholds = config.benchmarkThresholds[field];
  const anchors = config.sliderAnchors[field];
  const explainer = config.sliderExplainers[field];

  const status = showStatus ? statusFor(thresholds, value) : null;
  const styles = status ? STATUS_STYLES[status] : null;
  const context = status ? config.statusContext[field][status] : null;

  const formatted = formatValue
    ? formatValue(value)
    : `${formatDefault(value, limits.step)}${unit ?? ""}`;

  const tickMarkers = showStatus
    ? thresholds
        .filter((t) => t.threshold > limits.min && t.tick)
        .map((t) => ({
          tick: t.tick!,
          percent: ((t.threshold - limits.min) / (limits.max - limits.min)) * 100,
        }))
    : [];

  return (
    <div className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-brand-primary/30 hover:shadow-[0_8px_24px_-8px_hsl(var(--brand-primary)/0.15)]">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-foreground">{label}</label>
          <HelpIcon title={explainer.title} body={explainer.body} />
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {formatted}
        </span>
      </div>

      <div className="relative mt-3 pb-2">
        <Slider
          value={[value]}
          min={limits.min}
          max={limits.max}
          step={limits.step}
          onValueChange={(values) => onValueChange(values[0])}
          className="cursor-pointer"
        />
        {tickMarkers.length > 0 && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-2 h-1"
          >
            {tickMarkers.map((marker) => (
              <span
                key={marker.tick}
                className="absolute h-1 w-px -translate-x-1/2 rounded-full bg-foreground/30"
                style={{ left: `${marker.percent}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {showStatus && (
        <>
          <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <span className="truncate uppercase tracking-[0.08em]">
              {anchors.left}
            </span>
            <span className="truncate text-right uppercase tracking-[0.08em]">
              {anchors.right}
            </span>
          </div>

          {status && styles && (
            <div className="mt-2.5 flex items-center gap-2">
              <div
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1",
                  styles.bg,
                  styles.text,
                  styles.ring
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                {STATUS_LABEL[status]}
              </div>
            </div>
          )}

          {context && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              {context}
            </p>
          )}
        </>
      )}

      {!showStatus && helper && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          {helper}
        </p>
      )}

      {footerSlot && <div className="mt-2.5">{footerSlot}</div>}
    </div>
  );
}

interface HelpIconProps {
  title: string;
  body: string;
}

function HelpIcon({ title, body }: HelpIconProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-brand-primary focus:outline-none focus:text-brand-primary"
        aria-label={`Explain ${title}`}
        aria-expanded={open}
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {open && (
        <span
          role="dialog"
          aria-label={title}
          className="absolute left-0 top-6 z-30 w-72 rounded-lg border border-border bg-popover p-3 text-left shadow-[0_12px_32px_-8px_hsl(220_43%_11%_/_0.2)]"
        >
          <span className="block text-xs font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
            {body}
          </span>
        </span>
      )}
    </span>
  );
}

function formatDefault(value: number, step: number): string {
  if (step < 1) return value.toFixed(1);
  return Math.round(value).toLocaleString("en-US");
}
