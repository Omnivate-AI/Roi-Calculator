"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateRoi } from "@/lib/calculations";
import {
  DEFAULT_INPUTS,
  LEADS_BY_SEQUENCE,
} from "@/lib/defaults";
import type { CalculatorInputs, SequenceSteps } from "@/lib/types";
import { readInputsFromUrl, writeInputsToUrl } from "@/lib/url-state";
import { ControlsPanel } from "@/components/calculator/ControlsPanel";
import { FunnelViz } from "@/components/calculator/FunnelViz";
import { PdfCaptureForm } from "@/components/calculator/PdfCaptureForm";
import { RevenueHero } from "@/components/calculator/RevenueHero";

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
    // When the visitor picks a new sequence strategy, snap leadsReached to
    // the natural value for that strategy. They can still drag the leads
    // slider afterward to override.
    setInputs((prev) => ({
      ...prev,
      sequenceSteps: steps,
      leadsReached: LEADS_BY_SEQUENCE[steps],
    }));
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, hsl(var(--brand-primary) / 0.05), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14 md:py-18">
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
              className="h-8 w-auto sm:h-9"
            />
          </a>
          <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            ROI Calculator
          </span>
        </header>

        {/* Hero */}
        <section className="mt-14 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Outbound GTM impact
          </p>
          <h1 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl">
            See the revenue your outbound program can generate.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Pick a sequence strategy, tune the performance, set your average
            deal value. Every change updates the funnel and the projected
            revenue immediately.
          </p>
        </section>

        {/* Headline result */}
        <section className="mt-12">
          <RevenueHero
            revenuePerYear={outputs.revenuePerYear}
            revenuePerMonth={outputs.revenuePerMonth}
            deals={outputs.deals}
            contactsReached={outputs.contactsReached}
          />
        </section>

        {/* Controls + funnel viz */}
        <section className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12">
          <div className="order-1">
            <ControlsPanel
              inputs={inputs}
              onChange={setInput}
              onStrategyChange={setStrategy}
            />
          </div>
          <div className="order-2 lg:sticky lg:top-8 lg:self-start">
            <FunnelViz
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
          </div>
        </section>

        {/* PDF capture */}
        <section className="mt-20">
          <PdfCaptureForm />
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8">
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
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
