"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateRoi } from "@/lib/calculations";
import { DEFAULT_INPUTS, LEADS_BY_SEQUENCE } from "@/lib/defaults";
import type { CalculatorInputs, SequenceSteps } from "@/lib/types";
import { readInputsFromUrl, writeInputsToUrl } from "@/lib/url-state";
import { ControlsPanel } from "@/components/calculator/ControlsPanel";
import { FunnelViz } from "@/components/calculator/FunnelViz";
import { MetricsPanel } from "@/components/calculator/MetricsPanel";
import { PdfCaptureForm } from "@/components/calculator/PdfCaptureForm";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const fromUrl = readInputsFromUrl();
    if (fromUrl !== DEFAULT_INPUTS) setInputs(fromUrl);
  }, []);

  useEffect(() => {
    if (!hasHydratedRef.current) return;
    writeInputsToUrl(inputs);
  }, [inputs]);

  const outputs = useMemo(() => calculateRoi(inputs), [inputs]);

  function setInput<K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) {
    setInputs((prev) => ({ ...prev, [key]: value }));
  }

  function setStrategy(steps: SequenceSteps) {
    setInputs((prev) => ({
      ...prev,
      sequenceSteps: steps,
      leadsReached: LEADS_BY_SEQUENCE[steps],
    }));
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Background gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 40% at 15% 0%, hsl(var(--brand-primary) / 0.08), transparent 55%),
            radial-gradient(ellipse 50% 35% at 90% 10%, hsl(var(--brand-accent) / 0.06), transparent 55%),
            radial-gradient(ellipse 40% 30% at 50% 100%, hsl(var(--brand-secondary) / 0.04), transparent 50%)
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

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 md:py-8">
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

        {/* Title + live metrics, side by side at top */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-primary">
              Run the numbers
            </p>
            <h1 className="text-balance text-2xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-3xl">
              See the revenue an outbound program can generate.
            </h1>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Pick a sequence strategy, tune the performance, set your average
              deal value. Tap the help icons inside each card for plain English
              explanations.
            </p>
          </div>
          <MetricsPanel
            revenuePerMonth={outputs.revenuePerMonth}
            dealsPerMonth={outputs.deals}
          />
        </section>

        {/* Controls take the bulk of the page */}
        <section className="mt-6">
          <ControlsPanel
            inputs={inputs}
            onChange={setInput}
            onStrategyChange={setStrategy}
          />
        </section>

        {/* Funnel viz below the fold for the curious */}
        <section className="mt-5">
          <FunnelViz
            emailsSent={outputs.emailsSentPerMonth}
            sequenceSteps={inputs.sequenceSteps}
            contactsReached={outputs.contactsReached}
            opens={outputs.opens}
            replies={outputs.replies}
            positiveReplies={outputs.positiveReplies}
            meetings={outputs.meetings}
            deals={outputs.deals}
            rates={{
              open: inputs.openRate,
              reply: inputs.replyRate,
              positive: inputs.positiveReplyRate,
              meeting: inputs.meetingBookedRate,
              close: inputs.closeRate,
            }}
          />
        </section>

        {/* PDF capture */}
        <section className="mt-6">
          <PdfCaptureForm />
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t border-border pt-4">
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
