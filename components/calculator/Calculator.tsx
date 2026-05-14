"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { calculateRoi } from "@/lib/calculations";
import type { CalculatorConfig } from "@/lib/config-types";
import type { CalculatorInputs, SequenceSteps } from "@/lib/types";
import { readInputsFromUrl, writeInputsToUrl } from "@/lib/url-state";
import { CalculatorConfigProvider } from "./CalculatorConfigContext";
import { ControlsPanel } from "./ControlsPanel";
import { FunnelViz } from "./FunnelViz";
import { MetricsPanel } from "./MetricsPanel";
import { PdfCaptureForm } from "./PdfCaptureForm";

interface CalculatorProps {
  config: CalculatorConfig;
}

/**
 * Client-side calculator surface. Receives runtime config from a server
 * component that loads it from Supabase (with fallback to defaults).
 * All inputs hydrate from URL; URL persistence + tweening still work
 * exactly as before.
 */
export function Calculator({ config }: CalculatorProps) {
  const [inputs, setInputs] = useState<CalculatorInputs>(config.defaultInputs);
  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const fromUrl = readInputsFromUrl();
    // readInputsFromUrl uses the build-time DEFAULT_INPUTS as the baseline,
    // but for the runtime config flow we prefer config.defaultInputs. Only
    // override if the URL actually carried params; otherwise keep config.
    if (typeof window !== "undefined") {
      const hasParams = new URLSearchParams(window.location.search).toString().length > 0;
      if (hasParams) setInputs(fromUrl);
    }
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
      leadsReached: config.leadsBySequence[steps],
    }));
  }

  return (
    <CalculatorConfigProvider value={config}>
      <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Left column: scrollable inputs with metrics pinned at the bottom */}
        <div className="flex flex-col lg:h-[calc(100vh-220px)] lg:min-h-[600px]">
          <div className="space-y-2.5 lg:flex-1 lg:overflow-y-auto lg:pr-2 lg:[scrollbar-width:thin]">
            <ControlsPanel
              inputs={inputs}
              onChange={setInput}
              onStrategyChange={setStrategy}
            />
          </div>
          {/* Sticky metrics at the bottom of the left column */}
          <div className="mt-2.5 shrink-0 lg:border-t lg:border-border lg:pt-2.5">
            <MetricsPanel
              revenuePerMonth={outputs.revenuePerMonth}
              dealsPerMonth={outputs.deals}
            />
          </div>
        </div>

        {/* Right column: funnel viz, fixed (no scroll) */}
        <div className="lg:h-[calc(100vh-220px)] lg:min-h-[600px] lg:sticky lg:top-4 lg:self-start">
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
        </div>
      </section>

      <section className="mt-6">
        <PdfCaptureForm />
      </section>
    </CalculatorConfigProvider>
  );
}
