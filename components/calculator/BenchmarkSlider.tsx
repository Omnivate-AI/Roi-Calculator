"use client";

import { Slider } from "@/components/ui/slider";
import {
  BENCHMARK_THRESHOLDS,
  statusFor,
  SLIDER_LIMITS,
} from "@/lib/defaults";
import type { BenchmarkStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type FieldKey = keyof typeof SLIDER_LIMITS;

interface BenchmarkSliderProps {
  /** Field key — drives benchmark thresholds and slider min/max/step. */
  field: FieldKey;
  /** Visible label for the field. */
  label: string;
  /** One-line plain-English explainer below the slider. */
  helper?: string;
  /** Current numeric value. */
  value: number;
  /** Unit suffix shown next to the value (e.g. "%"). */
  unit?: string;
  /** Optional formatter for the inline numeric value display. */
  formatValue?: (n: number) => string;
  onValueChange: (value: number) => void;
}

const STATUS_LABEL: Record<BenchmarkStatus, string> = {
  poor: "Poor",
  average: "Average",
  healthy: "Healthy",
  benchmark: "Benchmark",
};

const STATUS_STYLES: Record<BenchmarkStatus, { dot: string; text: string; bg: string }> = {
  poor: {
    dot: "bg-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
  },
  average: {
    dot: "bg-warning",
    text: "text-warning",
    bg: "bg-warning/10",
  },
  healthy: {
    dot: "bg-brand-primary",
    text: "text-brand-primary",
    bg: "bg-brand-primary/10",
  },
  benchmark: {
    dot: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
  },
};

/**
 * Slider with inline label, value display, tick marks at benchmark
 * thresholds, and a dynamic status badge below the track that updates as
 * the visitor drags. The status badge tells the visitor whether their
 * current value is poor, average, healthy, or benchmark, color coded.
 */
export function BenchmarkSlider({
  field,
  label,
  helper,
  value,
  unit,
  formatValue,
  onValueChange,
}: BenchmarkSliderProps) {
  const limits = SLIDER_LIMITS[field];
  const thresholds = BENCHMARK_THRESHOLDS[field];
  const status = statusFor(field, value);
  const styles = STATUS_STYLES[status];

  const formatted = formatValue
    ? formatValue(value)
    : `${formatDefault(value, limits.step)}${unit ?? ""}`;

  // Tick marker percentages along the slider track (skip the first threshold
  // at 0 to avoid a marker at the very edge).
  const tickMarkers = thresholds
    .filter((t) => t.threshold > limits.min && t.tick)
    .map((t) => ({
      tick: t.tick!,
      status: t.status,
      percent: ((t.threshold - limits.min) / (limits.max - limits.min)) * 100,
    }));

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="font-mono text-sm tabular-nums text-foreground">
          {formatted}
        </span>
      </div>

      <div className="relative pb-6">
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

      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            styles.bg,
            styles.text
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
          {STATUS_LABEL[status]}
        </div>
        {tickMarkers.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {currentTickLabel(value, thresholds)}
          </span>
        )}
      </div>

      {helper && (
        <p className="text-xs leading-relaxed text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

function formatDefault(value: number, step: number): string {
  if (step < 1) return value.toFixed(1);
  return Math.round(value).toLocaleString("en-US");
}

/** Returns the label of the highest threshold the current value crosses. */
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
