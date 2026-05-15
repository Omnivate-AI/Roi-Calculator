"use client";

import { Handshake, Coins } from "lucide-react";
import { dealFrequencyLabel, formatCurrency, formatDeals } from "@/lib/utils";
import { TweenedNumber } from "./TweenedNumber";

interface MetricsPanelProps {
  revenuePerMonth: number;
  dealsPerMonth: number;
}

/**
 * Compact two-metric strip showing projected outcomes per month. Deals
 * scale precision with size and pick up a frequency caption when below
 * one (so a $200k deal value with 0.25 deals reads as "≈ 1 deal every
 * 4 months", not a rounded zero).
 */
export function MetricsPanel({ revenuePerMonth, dealsPerMonth }: MetricsPanelProps) {
  const frequency = dealFrequencyLabel(dealsPerMonth);
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <MetricCard
        icon={<Handshake className="h-3.5 w-3.5" strokeWidth={2.5} />}
        label="Deals / month"
        value={dealsPerMonth}
        format={formatDeals}
        caption={frequency}
      />
      <MetricCard
        icon={<Coins className="h-3.5 w-3.5" strokeWidth={2.5} />}
        label="Revenue / month"
        value={revenuePerMonth}
        format={(n) => formatCurrency(n)}
        accent
      />
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  format: (n: number) => string;
  accent?: boolean;
  caption?: string | null;
}

function MetricCard({ icon, label, value, format, accent, caption }: MetricCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border bg-card p-3"
      style={
        accent
          ? {
              background:
                "linear-gradient(135deg, hsl(var(--brand-primary) / 0.06) 0%, hsl(var(--brand-secondary) / 0.03) 100%)",
              borderColor: "hsl(var(--brand-primary) / 0.25)",
            }
          : undefined
      }
    >
      <div className="flex items-center gap-1.5">
        <span
          className={
            accent
              ? "inline-flex h-6 w-6 items-center justify-center rounded-md bg-brand-primary/10 text-brand-primary"
              : "inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted text-muted-foreground"
          }
        >
          {icon}
        </span>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
      </div>
      <p
        className={
          accent
            ? "mt-1.5 font-mono text-2xl font-bold tabular-nums sm:text-3xl"
            : "mt-1.5 font-mono text-2xl font-bold tabular-nums text-foreground sm:text-3xl"
        }
        style={
          accent
            ? {
                backgroundImage:
                  "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }
            : undefined
        }
      >
        <TweenedNumber value={value} format={format} />
      </p>
      {caption ? (
        <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">
          {caption}
        </p>
      ) : null}
    </div>
  );
}
