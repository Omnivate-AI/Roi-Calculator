"use client";

import type { CalculatorInputs } from "@/lib/types";
import { BenchmarkSlider } from "./BenchmarkSlider";
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
 * Simplified V2 controls panel. Three sections only: strategy, performance,
 * and deal value. No more infrastructure (domains, mailboxes, send limits),
 * no more cost inputs, no subscription branching.
 */
export function ControlsPanel({
  inputs,
  onChange,
  onStrategyChange,
}: ControlsPanelProps) {
  return (
    <div className="space-y-10">
      <Section title="Strategy">
        <StrategyToggle
          value={inputs.sequenceSteps}
          onValueChange={onStrategyChange}
        />
        <BenchmarkSlider
          field="leadsReached"
          label="Unique leads reached per month"
          helper="Total prospects the program touches each month. Sequence strategy picks a recommended value; drag to override."
          value={inputs.leadsReached}
          onValueChange={(v) => onChange("leadsReached", v)}
        />
      </Section>

      <Section title="Campaign performance">
        <BenchmarkSlider
          field="openRate"
          label="Open rate"
          helper="Percent of leads who open at least one email."
          value={inputs.openRate}
          unit="%"
          onValueChange={(v) => onChange("openRate", v)}
        />
        <BenchmarkSlider
          field="replyRate"
          label="Reply rate"
          helper="Percent of leads who reply to the sequence. Cold email rarely exceeds five percent."
          value={inputs.replyRate}
          unit="%"
          onValueChange={(v) => onChange("replyRate", v)}
        />
        <BenchmarkSlider
          field="positiveReplyRate"
          label="Positive reply rate"
          helper="Percent of replies that are interested rather than dismissive."
          value={inputs.positiveReplyRate}
          unit="%"
          onValueChange={(v) => onChange("positiveReplyRate", v)}
        />
        <BenchmarkSlider
          field="meetingBookedRate"
          label="Meeting booked rate"
          helper="Percent of positive replies that convert to a meeting. Multi channel follow up lifts this number."
          value={inputs.meetingBookedRate}
          unit="%"
          onValueChange={(v) => onChange("meetingBookedRate", v)}
        />
        <BenchmarkSlider
          field="closeRate"
          label="Close rate"
          helper="Percent of meetings that turn into a closed deal."
          value={inputs.closeRate}
          unit="%"
          onValueChange={(v) => onChange("closeRate", v)}
        />
      </Section>

      <Section title="Deal value">
        <NumberInput
          label="Average deal value"
          helper="Revenue from one closed deal. Use annualised contract value if you sell SaaS."
          value={inputs.dealValue}
          min={100}
          max={1_000_000}
          step={500}
          prefix="$"
          onValueChange={(v) => onChange("dealValue", v)}
        />
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="space-y-6">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-7">{children}</div>
    </section>
  );
}
