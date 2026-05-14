import Image from "next/image";
import { getCalculatorConfig } from "@/lib/config-loader";
import { Calculator } from "@/components/calculator/Calculator";

/**
 * Server-rendered calculator page. Pulls the editable config from
 * Supabase (cached for 60 seconds, falls back to lib/defaults if
 * Supabase is unreachable) and hands it to the client Calculator
 * component as a prop.
 */
export default async function Home() {
  const config = await getCalculatorConfig();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Subtle background gradients */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 15% 0%, hsl(var(--brand-primary) / 0.08), transparent 55%),
            radial-gradient(ellipse 50% 35% at 90% 10%, hsl(var(--brand-accent) / 0.06), transparent 55%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <a
            href="/"
            aria-label="Omnivate ROI Calculator home"
            className="inline-flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/omnivate-logo.png"
              alt="Omnivate"
              width={1400}
              height={300}
              priority
              className="h-7 w-auto sm:h-8"
            />
          </a>
          <div className="flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 py-1.5">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-primary">
              Outbound ROI Calculator
            </span>
          </div>
        </header>

        {/* Title */}
        <section className="mt-5 space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Run the numbers
          </p>
          <h1 className="text-balance text-2xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-3xl">
            See the revenue an outbound program can generate.
          </h1>
          <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Tune each input on the left. The funnel and projected results
            update live on the right. Tap the help icons inside any card for
            plain English explanations.
          </p>
        </section>

        {/* Interactive calculator (client) */}
        <Calculator config={config} />

        {/* Footer */}
        <footer className="mt-6 border-t border-border pt-4">
          <div className="flex flex-col items-start justify-between gap-3 text-[11px] text-muted-foreground sm:flex-row">
            <p>Built by Omnivate AI</p>
            <div className="flex items-center gap-4">
              <a
                href="https://omnivate.ai/privacy-policy"
                className="transition-colors hover:text-foreground"
              >
                Privacy
              </a>
              <span>roi.omnivate.ai</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
