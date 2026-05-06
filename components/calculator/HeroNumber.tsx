import { formatCurrency, formatMultiple } from "@/lib/utils";

interface HeroNumberProps {
  roiMultiple: number;
  totalRevenueLow: number;
  totalRevenueHigh: number;
  timeHorizonMonths: number;
  companyName?: string;
}

/**
 * The biggest number on the page. Massive ROI multiple in brand-electric, with
 * the sensitivity band beneath in muted text. This is the headline visitors
 * remember and screenshot.
 */
export function HeroNumber({
  roiMultiple,
  totalRevenueLow,
  totalRevenueHigh,
  timeHorizonMonths,
  companyName,
}: HeroNumberProps) {
  const personalised = companyName?.trim() ? ` for ${companyName}` : "";

  return (
    <div className="space-y-6 text-center sm:text-left">
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Projected impact
        </p>
        <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
          See the revenue an Omnivate outbound program can generate
          {personalised}.
        </h1>
      </div>

      <div className="relative inline-flex flex-col items-start gap-2">
        <span
          className="bg-clip-text text-7xl font-bold tracking-tight text-transparent tabular-nums sm:text-8xl md:text-9xl"
          style={{
            backgroundImage:
              "linear-gradient(135deg, hsl(var(--brand-electric)) 0%, hsl(var(--brand-primary)) 100%)",
            filter: "drop-shadow(0 0 60px hsl(var(--brand-primary) / 0.45))",
          }}
        >
          {formatMultiple(roiMultiple)}
        </span>
        <span className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Return on investment
        </span>
      </div>

      <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
        Between{" "}
        <span className="font-mono tabular-nums text-foreground">
          {formatCurrency(totalRevenueLow, { compact: true })}
        </span>{" "}
        and{" "}
        <span className="font-mono tabular-nums text-foreground">
          {formatCurrency(totalRevenueHigh, { compact: true })}
        </span>{" "}
        over {timeHorizonMonths} months
      </p>
    </div>
  );
}
