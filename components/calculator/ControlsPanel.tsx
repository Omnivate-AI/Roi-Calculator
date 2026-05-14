"use client";

import type { CalculatorInputs } from "@/lib/types";
import { BenchmarkSlider } from "./BenchmarkSlider";
import { ChannelMix } from "./ChannelMix";
import { NumberInput } from "./NumberInput";
import { StrategyToggle } from "./StrategyToggle";

interface ControlsPanelProps {
  inputs: CalculatorInputs;
  onChange: <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => void;
  onStrategyChange: (steps: CalculatorInputs["sequenceSteps"]) => void;
}

/**
 * V6 vertical stack. Every input lives in its own box, all the same width,
 * arranged top-to-bottom in the same order as the funnel below them:
 * deal value, strategy, open, reply, positive reply, meeting booked,
 * close rate. No section headers. Reads as a single ordered list of
 * boxes the visitor walks down.
 */
export function ControlsPanel({
  inputs,
  onChange,
  onStrategyChange,
}: ControlsPanelProps) {
  return (
    <div className="space-y-2.5">
      <DealValueCard
        value={inputs.dealValue}
        onValueChange={(v) => onChange("dealValue", v)}
      />

      <StrategyToggle
        value={inputs.sequenceSteps}
        onValueChange={onStrategyChange}
      />

      <BenchmarkSlider
        field="openRate"
        label="Open rate"
        value={inputs.openRate}
        unit="%"
        onValueChange={(v) => onChange("openRate", v)}
      />
      <BenchmarkSlider
        field="replyRate"
        label="Reply rate"
        value={inputs.replyRate}
        unit="%"
        onValueChange={(v) => onChange("replyRate", v)}
      />
      <BenchmarkSlider
        field="positiveReplyRate"
        label="Positive reply rate"
        value={inputs.positiveReplyRate}
        unit="%"
        onValueChange={(v) => onChange("positiveReplyRate", v)}
      />
      <BenchmarkSlider
        field="meetingBookedRate"
        label="Meeting booked rate"
        value={inputs.meetingBookedRate}
        unit="%"
        onValueChange={(v) => onChange("meetingBookedRate", v)}
        footerSlot={<ChannelMix meetingBookedRate={inputs.meetingBookedRate} />}
      />
      <BenchmarkSlider
        field="closeRate"
        label="Close rate"
        value={inputs.closeRate}
        unit="%"
        onValueChange={(v) => onChange("closeRate", v)}
        showStatus={false}
        helper="Close rate varies significantly by industry and sales motion. Sales-led B2B SaaS typically lands between 15 and 25 percent; self service can run higher or lower depending on product trial dynamics."
      />
    </div>
  );
}

interface DealValueCardProps {
  value: number;
  onValueChange: (value: number) => void;
}

function DealValueCard({ value, onValueChange }: DealValueCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-3.5 transition-all hover:border-brand-primary/30 hover:shadow-[0_8px_24px_-8px_hsl(var(--brand-primary)/0.15)]">
      <NumberInput
        label="Average deal value"
        value={value}
        min={100}
        max={1_000_000}
        step={500}
        prefix="$"
        onValueChange={onValueChange}
        helper="One time price or annualised contract value."
      />
    </div>
  );
}
