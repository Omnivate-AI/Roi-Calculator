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
 * Compact two-column controls panel for V3. Strategy and reach inputs at
 * the top, performance sliders in a responsive grid below. Each slider has
 * an inline help icon for educational popovers; meeting booked rate also
 * shows a channel mix visualization beneath the badge.
 */
export function ControlsPanel({
  inputs,
  onChange,
  onStrategyChange,
}: ControlsPanelProps) {
  return (
    <div className="space-y-6">
      <Section title="Strategy">
        <StrategyToggle
          value={inputs.sequenceSteps}
          onValueChange={onStrategyChange}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <BenchmarkSlider
            field="leadsReached"
            label="Unique leads reached / month"
            value={inputs.leadsReached}
            onValueChange={(v) => onChange("leadsReached", v)}
          />
          <DealValueCard
            value={inputs.dealValue}
            onValueChange={(v) => onChange("dealValue", v)}
          />
        </div>
      </Section>

      <Section title="Campaign performance">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
          />
        </div>
      </Section>
    </div>
  );
}

interface DealValueCardProps {
  value: number;
  onValueChange: (value: number) => void;
}

function DealValueCard({ value, onValueChange }: DealValueCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <NumberInput
        label="Average deal value"
        value={value}
        min={100}
        max={1_000_000}
        step={500}
        prefix="$"
        onValueChange={onValueChange}
        helper="One time deal price or annualised contract value."
      />
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
