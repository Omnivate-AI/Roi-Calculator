"use client";

import { useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  BENCHMARK_THRESHOLDS,
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
  /** Extra content rendered below the status badge (e.g. ChannelMix). */
  footerSlot?: ReactNode;
}

const STATUS_LABEL: Record<BenchmarkStatus, string> = {
  poor: "Poor",
  average: "Average",
  healthy: "Healthy",
  benchmark: "Benchmark",
};

const STATUS_STYLES: Record<BenchmarkStatus, { dot: string; text: string; bg: string }> = {
  poor: { dot: "bg-destructive", text: "text-destructive", bg: "bg-destructive/10" },
  average: { dot: "bg-warning", text: "text-warning", bg: "bg-warning/10" },
  healthy: { dot: "bg-brand-primary", text: "text-brand-primary", bg: "bg-brand-primary/10" },
  benchmark: { dot: "bg-success", text: "text-success", bg: "bg-success/10" },
};

/**
 * Compact slider card. Label with help icon (tap to read what the metric
 * means), value display, slider, tick markers at benchmark thresholds, and
 * a status badge below the track. Optional footerSlot for richer guidance
 * (e.g. a channel mix indicator on the meeting booked rate).
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
    <div className="space-y-2.5 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-[0_4px_12px_-4px_hsl(220_43%_11%_/_0.08)]">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-medium text-foreground">{label}</label>
          <HelpIcon title={explainer.title} body={explainer.body} />
        </div>
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
          {formatted}
        </span>
      </div>

      <div className="relative pb-3">
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
            className="pointer-events-none absolute inset-x-0 top-1.5 h-1"
          >
            {tickMarkers.map((marker) => (
              <span
                key={marker.tick}
                className="absolute h-1.5 w-px -translate-x-1/2 bg-border"
                style={{ left: `${marker.percent}%` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            styles.bg,
            styles.text
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
          {STATUS_LABEL[status]}
        </div>
        {tickMarkers.length > 0 && (
          <span className="truncate text-[11px] text-muted-foreground">
            {currentTickLabel(value, BENCHMARK_THRESHOLDS[field])}
          </span>
        )}
      </div>

      {footerSlot && <div className="pt-1">{footerSlot}</div>}

      {helper && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

interface HelpIconProps {
  title: string;
  body: string;
}

/**
 * Click to open educational popover. Plain CSS positioning, no Radix
 * Popover dependency. Closes on outside click or escape.
 */
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
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus:outline-none focus:text-brand-primary"
        aria-label={`Explain ${title}`}
        aria-expanded={open}
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {open && (
        <span
          role="dialog"
          aria-label={title}
          className="absolute left-0 top-6 z-30 w-72 rounded-lg border border-border bg-popover p-3 text-left shadow-[0_8px_24px_-8px_hsl(220_43%_11%_/_0.18)]"
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
