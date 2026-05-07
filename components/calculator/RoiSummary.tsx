import { formatCurrency, formatInteger } from "@/lib/utils";
import { TweenedNumber } from "./TweenedNumber";

interface RoiSummaryProps {
  directRevenue: number;
  hiddenRevenue: number;
  haloRevenue: number;
  totalRevenue: number;
  totalRevenueLow: number;
  totalRevenueHigh: number;
  dealsPerMonth: number;
  hiddenDealsPerMonth: number;
  haloUpliftRate: number;
  timeHorizonMonths: number;
}

/**
 * Three column summary: direct outbound, hidden pipeline, halo bonus.
 * Plus the headline total with sensitivity band. Every visible number tweens
 * when inputs change.
 */
export function RoiSummary({
  directRevenue,
  hiddenRevenue,
  haloRevenue,
  totalRevenue,
  totalRevenueLow,
  totalRevenueHigh,
  dealsPerMonth,
  hiddenDealsPerMonth,
  haloUpliftRate,
  timeHorizonMonths,
}: RoiSummaryProps) {
  const horizonFactor = timeHorizonMonths / 12;

  return (
    <section className="space-y-6">
      <div className="flex items-baseline justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Revenue breakdown
        </p>
        <p className="text-xs text-muted-foreground">
          Over {timeHorizonMonths} months
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          eyebrow="Direct outbound"
          value={directRevenue * horizonFactor}
          subtitle={
            <>
              <TweenedNumber value={dealsPerMonth} format={formatInteger} /> deals per month
            </>
          }
        />
        <SummaryCard
          eyebrow="Hidden pipeline"
          value={hiddenRevenue * horizonFactor}
          subtitle={
            <>
              <TweenedNumber value={hiddenDealsPerMonth} format={formatInteger} /> deals per month from engaged silent contacts
            </>
          }
        />
        <SummaryCard
          eyebrow="Halo bonus"
          value={haloRevenue * horizonFactor}
          subtitle={`${haloUpliftRate}% uplift on direct + hidden`}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Total projected revenue
          </p>
          <p className="font-mono text-4xl font-semibold tabular-nums text-foreground sm:text-5xl">
            <TweenedNumber
              value={totalRevenue * horizonFactor}
              format={(n) => formatCurrency(n)}
            />
          </p>
          <p className="text-sm text-muted-foreground">
            Sensitivity band:{" "}
            <span className="font-mono tabular-nums text-foreground/80">
              <TweenedNumber
                value={totalRevenueLow * horizonFactor}
                format={(n) => formatCurrency(n, { compact: true })}
              />
            </span>{" "}
            to{" "}
            <span className="font-mono tabular-nums text-foreground/80">
              <TweenedNumber
                value={totalRevenueHigh * horizonFactor}
                format={(n) => formatCurrency(n, { compact: true })}
              />
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

interface SummaryCardProps {
  eyebrow: string;
  value: number;
  subtitle: React.ReactNode;
}

function SummaryCard({ eyebrow, value, subtitle }: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      <p className="mt-3 font-mono text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
        <TweenedNumber value={value} format={(n) => formatCurrency(n)} />
      </p>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
    </div>
  );
}
