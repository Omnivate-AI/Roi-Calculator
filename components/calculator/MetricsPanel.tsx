"use client";

import { TrendingUp, Handshake, Coins } from "lucide-react";
import { formatCurrency, formatInteger } from "@/lib/utils";
import { TweenedNumber } from "./TweenedNumber";

interface MetricsPanelProps {
  revenuePerYear: number;
  revenuePerMonth: number;
  dealsPerMonth: number;
}

/**
 * Bottom-right results panel. Three metrics stacked with icons and a
 * gradient anchor on the annual revenue. Subtle purple wash in the
 * background to give the card more visual presence than a flat surface.
 */
export function MetricsPanel({
  revenuePerYear,
  revenuePerMonth,
  dealsPerMonth,
}: MetricsPanelProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_0_hsl(220_43%_11%_/_0.04)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 60% at 100% 0%, hsl(var(--brand-primary) / 0.08), transparent 70%)",
        }}
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Projected results
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <Metric
            icon={<Handshake className="h-3 w-3" strokeWidth={2.5} />}
            label="Deals per month"
            value={dealsPerMonth}
            format={(n) => formatInteger(n)}
          />
          <div className="h-px bg-border" />
          <Metric
            icon={<Coins className="h-3 w-3" strokeWidth={2.5} />}
            label="Revenue per month"
            value={revenuePerMonth}
            format={(n) => formatCurrency(n)}
          />
        </div>

        <div className="mt-5 rounded-xl border border-brand-primary/20 bg-brand-primary/[0.04] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-primary/80">
            Projected annual revenue
          </p>
          <p
            className="mt-1.5 font-mono text-3xl font-bold leading-none tracking-tight tabular-nums sm:text-4xl"
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
    </div>
  );
}

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format: (n: number) => string;
}

function Metric({ icon, label, value, format }: MetricProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {icon}
        </span>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="font-mono text-xl font-bold tabular-nums text-foreground">
        <TweenedNumber value={value} format={format} />
      </p>
    </div>
  );
}
