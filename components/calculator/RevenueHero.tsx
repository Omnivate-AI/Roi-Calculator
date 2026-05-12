"use client";

import { formatCurrency, formatInteger } from "@/lib/utils";
import { TweenedNumber } from "./TweenedNumber";

interface RevenueHeroProps {
  revenuePerYear: number;
  revenuePerMonth: number;
  deals: number;
  contactsReached: number;
}

/**
 * Single biggest number on the page: projected annual revenue. Backed up by
 * three supporting cards (monthly revenue, deals per month, leads reached)
 * so the headline never sits without context.
 */
export function RevenueHero({
  revenuePerYear,
  revenuePerMonth,
  deals,
  contactsReached,
}: RevenueHeroProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Projected annual revenue
        </p>
        <p
          className="font-mono text-5xl font-semibold leading-none tracking-tight tabular-nums sm:text-6xl md:text-7xl"
          style={{
            backgroundImage:
              "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 4px 16px hsl(var(--brand-primary) / 0.16))",
          }}
        >
          <TweenedNumber
            value={revenuePerYear}
            format={(n) => formatCurrency(n)}
          />
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SupportCard
          label="Revenue per month"
          value={revenuePerMonth}
          format={(n) => formatCurrency(n)}
        />
        <SupportCard
          label="Deals per month"
          value={deals}
          format={formatInteger}
        />
        <SupportCard
          label="Leads reached per month"
          value={contactsReached}
          format={formatInteger}
        />
      </div>
    </div>
  );
}

interface SupportCardProps {
  label: string;
  value: number;
  format: (n: number) => string;
}

function SupportCard({ label, value, format }: SupportCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-mono text-xl font-semibold tabular-nums text-foreground sm:text-2xl">
        <TweenedNumber value={value} format={format} />
      </p>
    </div>
  );
}
