"use client";

import { Target, BarChart3 } from "lucide-react";
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
 * Two-section controls panel. Each section has an icon header that
 * matches the visual weight of the funnel/metrics panels on the right.
 */
export function ControlsPanel({
  inputs,
  onChange,
  onStrategyChange,
}: ControlsPanelProps) {
  return (
    <div className="space-y-6">
      <Section
        icon={<Target className="h-3.5 w-3.5" strokeWidth={2.5} />}
        title="Strategy"
        subtitle="Pick how broad your outbound program runs."
      >
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

      <Section
        icon={<BarChart3 className="h-3.5 w-3.5" strokeWidth={2.5} />}
        title="Campaign performance"
        subtitle="Tune the conversion at each funnel stage."
      >
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
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-primary/30">
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

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

function Section({ icon, title, subtitle, children }: SectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
