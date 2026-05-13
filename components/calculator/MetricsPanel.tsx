"use client";

import { formatCurrency, formatInteger } from "@/lib/utils";
import { TweenedNumber } from "./TweenedNumber";

interface MetricsPanelProps {
  revenuePerYear: number;
  revenuePerMonth: number;
  dealsPerMonth: number;
}

/**
 * Bottom-right results panel. Three numbers, vertically stacked, with the
 * yearly revenue as the visual anchor at the bottom in the brand gradient.
 */
export function MetricsPanel({
  revenuePerYear,
  revenuePerMonth,
  dealsPerMonth,
}: MetricsPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Projected results
      </p>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <Metric
          label="Deals per month"
          value={dealsPerMonth}
          format={(n) => formatInteger(n)}
        />
        <Metric
          label="Revenue per month"
          value={revenuePerMonth}
          format={(n) => formatCurrency(n)}
        />
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Annual revenue
        </p>
        <p
          className="mt-1 font-mono text-3xl font-semibold leading-tight tracking-tight tabular-nums sm:text-4xl"
          style={{
            backgroundImage:
              "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          <TweenedNumber
            value={revenuePerYear}
            format={(n) => formatCurrency(n)}
          />
        </p>
      </div>
    </div>
  );
}

interface MetricProps {
  label: string;
  value: number;
  format: (n: number) => string;
}

function Metric({ label, value, format }: MetricProps) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">
        <TweenedNumber value={value} format={format} />
      </p>
    </div>
  );
}
