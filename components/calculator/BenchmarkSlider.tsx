"use client";

import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  BENCHMARK_THRESHOLDS,
  SLIDER_ANCHORS,
  SLIDER_EXPLAINERS,
  SLIDER_LIMITS,
  statusFor,
} from "@/lib/defaults";
import type { BenchmarkStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type FieldKey = keyof typeof SLIDER_LIMITS;

interface BenchmarkSliderProps {
  field: FieldKey;
  label: string;
  helper?: string;
  value: number;
  unit?: string;
  formatValue?: (n: number) => string;
  onValueChange: (value: number) => void;
  /** Extra content rendered below the status row (e.g. ChannelMix). */
  footerSlot?: ReactNode;
}

const STATUS_LABEL: Record<BenchmarkStatus, string> = {
  poor: "Poor",
  average: "Average",
  healthy: "Healthy",
  benchmark: "Benchmark",
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
  healthy: {
    dot: "bg-brand-primary",
    text: "text-brand-primary",
    bg: "bg-brand-primary/10",
    ring: "ring-brand-primary/20",
  },
  benchmark: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
    ring: "ring-success/20",
  },
};

/**
 * Refined slider card with anchor labels at the slider extremities, a
 * larger gradient track via the upgraded Slider primitive, a help icon
 * popover for educational context, and a richer status pill below the
 * track. Supports an optional footerSlot for slider-specific guidance
 * (e.g. the channel mix on meeting booked rate).
 */
export function BenchmarkSlider({
  field,
  label,
  helper,
  value,
  unit,
  formatValue,
  onValueChange,
  footerSlot,
}: BenchmarkSliderProps) {
  const limits = SLIDER_LIMITS[field];
  const thresholds = BENCHMARK_THRESHOLDS[field];
  const anchors = SLIDER_ANCHORS[field];
  const status = statusFor(field, value);
  const styles = STATUS_STYLES[status];
  const explainer = SLIDER_EXPLAINERS[field];

  const formatted = formatValue
    ? formatValue(value)
    : `${formatDefault(value, limits.step)}${unit ?? ""}`;

  const tickMarkers = thresholds
    .filter((t) => t.threshold > limits.min && t.tick)
    .map((t) => ({
      tick: t.tick!,
      percent: ((t.threshold - limits.min) / (limits.max - limits.min)) * 100,
    }));

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-primary/30 hover:shadow-[0_8px_24px_-8px_hsl(var(--brand-primary)/0.15)]">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-foreground">{label}</label>
          <HelpIcon title={explainer.title} body={explainer.body} />
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {formatted}
        </span>
      </div>

      <div className="relative mt-4 pb-3">
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

      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="truncate uppercase tracking-[0.08em]">{anchors.left}</span>
        <span className="truncate text-right uppercase tracking-[0.08em]">
          {anchors.right}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
            styles.bg,
            styles.text,
            styles.ring
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
          {STATUS_LABEL[status]}
        </div>
        {tickMarkers.length > 0 && (
          <span className="truncate text-xs font-medium text-foreground/70">
            {currentTickLabel(value, BENCHMARK_THRESHOLDS[field])}
          </span>
        )}
      </div>

      {footerSlot && <div className="mt-3">{footerSlot}</div>}

      {helper && (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          {helper}
        </p>
      )}
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

function currentTickLabel(
  value: number,
  thresholds: { tick?: string; threshold: number }[]
): string {
  let label = "";
  for (const t of thresholds) {
    if (value >= t.threshold && t.tick) label = t.tick;
  }
  return label;
}
