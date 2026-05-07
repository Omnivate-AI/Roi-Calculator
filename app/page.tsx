"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { calculateRoi } from "@/lib/calculations";
import { DEFAULT_INPUTS, getDefaultsForMotion } from "@/lib/defaults";
import type { CalculatorInputs, SalesMotion, TimeHorizon } from "@/lib/types";
import { readInputsFromUrl, writeInputsToUrl } from "@/lib/url-state";
import { ControlsPanel } from "@/components/calculator/ControlsPanel";
import { FunnelViz } from "@/components/calculator/FunnelViz";
import { HeroNumber } from "@/components/calculator/HeroNumber";
import { RoiSummary } from "@/components/calculator/RoiSummary";
import { ComparisonView } from "@/components/calculator/ComparisonView";
import { PdfCaptureForm } from "@/components/calculator/PdfCaptureForm";
import { TimeHorizonToggle } from "@/components/calculator/TimeHorizonToggle";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const hasHydratedRef = useRef(false);

  // On first mount, hydrate inputs from URL search params if any. Server side
  // render uses defaults; this effect runs only on the client and replaces
  // state if the visitor landed on a shared URL.
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const fromUrl = readInputsFromUrl();
    if (fromUrl !== DEFAULT_INPUTS) {
      setInputs(fromUrl);
    }
  }, []);

  // Whenever inputs change, mirror them into the URL (replaceState, not push,
  // so the back button is not cluttered). Skipped until after hydration so
  // we do not overwrite shared URLs with defaults on first render.
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

  function setMotion(motion: SalesMotion) {
    // When motion changes, reset motion specific defaults but keep volume,
    // conversion rates, halo, and cost the visitor has tweaked.
    const motionDefaults = getDefaultsForMotion(motion);
    setInputs((prev) => ({
      ...prev,
      salesMotion: motion,
      closeRate: motionDefaults.closeRate,
      dealType: motionDefaults.dealType,
      dealValue: motionDefaults.dealValue,
      monthlySubscriptionValue: motionDefaults.monthlySubscriptionValue,
      monthlyChurnRate: motionDefaults.monthlyChurnRate,
    }));
  }

  function setTimeHorizon(horizon: TimeHorizon) {
    setInputs((prev) => ({ ...prev, timeHorizonMonths: horizon }));
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, hsl(var(--brand-primary) / 0.06), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16 md:py-20 space-y-20 sm:space-y-24">
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
        <section className="space-y-8">
          <HeroNumber
            roiMultiple={outputs.roiMultiple}
            totalRevenueLow={outputs.totalRevenueLow}
            totalRevenueHigh={outputs.totalRevenueHigh}
            timeHorizonMonths={inputs.timeHorizonMonths}
          />
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Time horizon
            </span>
            <TimeHorizonToggle
              value={inputs.timeHorizonMonths}
              onValueChange={setTimeHorizon}
            />
          </div>
        </section>

        {/* Controls + Funnel viz */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
          <div className="lg:order-2">
            <FunnelViz
              contactsReached={outputs.contactsReachedPerMonth}
              opens={outputs.opensPerMonth}
              replies={outputs.repliesPerMonth}
              positiveReplies={outputs.positiveRepliesPerMonth}
              meetings={outputs.meetingsPerMonth}
              deals={outputs.dealsPerMonth}
              rates={{
                open: inputs.openRate,
                reply: inputs.replyRate,
                positive: inputs.positiveReplyRate,
                meeting: inputs.meetingBookingRate,
                close: inputs.closeRate,
              }}
            />
          </div>
          <div className="lg:order-1">
            <ControlsPanel
              inputs={inputs}
              onChange={setInput}
              onMotionChange={setMotion}
            />
          </div>
        </section>

        {/* ROI summary */}
        <RoiSummary
          directRevenue={outputs.directRevenueAnnualised}
          hiddenRevenue={outputs.hiddenRevenueAnnualised}
          haloRevenue={outputs.haloRevenueAnnualised}
          totalRevenue={outputs.totalRevenueAnnualised}
          totalRevenueLow={outputs.totalRevenueLow}
          totalRevenueHigh={outputs.totalRevenueHigh}
          dealsPerMonth={outputs.dealsPerMonth}
          hiddenDealsPerMonth={outputs.hiddenDealsPerMonth}
          haloUpliftRate={inputs.haloUpliftRate}
          timeHorizonMonths={inputs.timeHorizonMonths}
        />

        {/* Without vs with comparison */}
        <ComparisonView
          totalRevenue={outputs.totalRevenueAnnualised}
          totalCost={outputs.omnivateCostAnnualised}
          roiNet={outputs.roiNet}
          roiMultiple={outputs.roiMultiple}
          timeHorizonMonths={inputs.timeHorizonMonths}
        />

        {/* PDF capture */}
        <PdfCaptureForm />

        {/* Footer */}
        <footer className="border-t border-border pt-8">
          <div className="flex flex-col items-start justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
            <p>Built by Omnivate AI</p>
            <div className="flex items-center gap-4">
              <a
                href="https://omnivate.ai/privacy-policy"
                className="hover:text-foreground transition-colors"
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
