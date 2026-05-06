import { formatCurrency, formatMultiple } from "@/lib/utils";

interface ComparisonViewProps {
  totalRevenue: number;
  totalCost: number;
  roiNet: number;
  roiMultiple: number;
  timeHorizonMonths: number;
}

/**
 * Side by side: without Omnivate vs with Omnivate.
 * Without Omnivate is always zero from cold email; the comparison clarifies
 * the magnitude of the Omnivate uplift in the visitor's mind.
 */
export function ComparisonView({
  totalRevenue,
  totalCost,
  roiNet,
  roiMultiple,
  timeHorizonMonths,
}: ComparisonViewProps) {
  const horizonFactor = timeHorizonMonths / 12;

  return (
    <section className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Side by side
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Without Omnivate
          </p>
          <p className="mt-4 font-mono text-3xl font-semibold tabular-nums text-foreground/40 sm:text-4xl">
            $0
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Revenue from cold email over {timeHorizonMonths} months
          </p>
        </div>

        <div
          className="relative overflow-hidden rounded-2xl border border-brand-primary/30 bg-card p-6"
          style={{
            boxShadow: "0 0 60px hsl(var(--brand-primary) / 0.18)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at top right, hsl(var(--brand-primary) / 0.18), transparent 60%)",
            }}
          />
          <div className="relative space-y-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-brand-electric">
              With Omnivate
            </p>
            <p
              className="font-mono text-3xl font-semibold tabular-nums sm:text-4xl"
              style={{ color: "hsl(var(--brand-sunset))" }}
            >
              {formatCurrency(totalRevenue * horizonFactor)}
            </p>
            <div className="space-y-1 pt-3 text-sm">
              <Row label="Cost" value={formatCurrency(totalCost * horizonFactor)} muted />
              <Row label="Net" value={formatCurrency(roiNet * horizonFactor)} muted />
              <Row label="ROI" value={formatMultiple(roiMultiple)} highlight />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface RowProps {
  label: string;
  value: string;
  muted?: boolean;
  highlight?: boolean;
}

function Row({ label, value, muted, highlight }: RowProps) {
  return (
    <div className="flex items-baseline justify-between">
      <span className={muted ? "text-muted-foreground" : "text-foreground"}>{label}</span>
      <span
        className={`font-mono tabular-nums ${
          highlight ? "text-brand-electric font-semibold" : "text-foreground"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
