"use client";

import type { CalculatorInputs } from "@/lib/types";
import { SalesMotionToggle } from "./SalesMotionToggle";
import { SliderInput } from "./SliderInput";
import { NumberInput } from "./NumberInput";

interface ControlsPanelProps {
  inputs: CalculatorInputs;
  onChange: <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => void;
  onMotionChange: (motion: CalculatorInputs["salesMotion"]) => void;
}

/**
 * The full panel of inputs the visitor controls. Grouped by category to
 * mirror the M3 spec: sales motion, volume, conversion rates, deal economics,
 * halo effects, and cost.
 */
export function ControlsPanel({ inputs, onChange, onMotionChange }: ControlsPanelProps) {
  return (
    <div className="space-y-8">
      <SalesMotionToggle value={inputs.salesMotion} onValueChange={onMotionChange} />

      <Section title="Volume">
        <SliderInput
          label="Domains"
          helper="How many sending domains you run."
          value={inputs.domains}
          min={1}
          max={100}
          onValueChange={(v) => onChange("domains", v)}
        />
        <SliderInput
          label="Mailboxes per domain"
          helper="Mailboxes on each domain. Two to three is standard."
          value={inputs.mailboxesPerDomain}
          min={1}
          max={5}
          onValueChange={(v) => onChange("mailboxesPerDomain", v)}
        />
        <SliderInput
          label="Emails per mailbox per day"
          helper="Cold emails per mailbox per day after warmup. Industry safe limit is around thirty."
          value={inputs.emailsPerMailboxPerDay}
          min={10}
          max={50}
          onValueChange={(v) => onChange("emailsPerMailboxPerDay", v)}
        />
        <SliderInput
          label="Working days per month"
          helper="Business days per month."
          value={inputs.workingDaysPerMonth}
          min={15}
          max={25}
          unit=" days"
          onValueChange={(v) => onChange("workingDaysPerMonth", v)}
        />
        <SliderInput
          label="Sequence steps"
          helper="Total emails one prospect receives across the sequence."
          value={inputs.sequenceSteps}
          min={1}
          max={8}
          onValueChange={(v) => onChange("sequenceSteps", v)}
        />
      </Section>

      <Section title="Conversion rates">
        <SliderInput
          label="Open rate"
          helper="Percent of contacts who open at least one email."
          value={inputs.openRate}
          min={0}
          max={100}
          unit="%"
          onValueChange={(v) => onChange("openRate", v)}
        />
        <SliderInput
          label="Reply rate"
          helper="Percent of contacts who reply at all."
          value={inputs.replyRate}
          min={0}
          max={100}
          step={0.1}
          unit="%"
          onValueChange={(v) => onChange("replyRate", v)}
        />
        <SliderInput
          label="Positive reply rate"
          helper="Percent of replies that are interested rather than dismissive."
          value={inputs.positiveReplyRate}
          min={0}
          max={100}
          unit="%"
          onValueChange={(v) => onChange("positiveReplyRate", v)}
        />
        <SliderInput
          label="Meeting booking rate"
          helper="Percent of positive replies that turn into a calendar meeting."
          value={inputs.meetingBookingRate}
          min={0}
          max={100}
          unit="%"
          onValueChange={(v) => onChange("meetingBookingRate", v)}
        />
        <SliderInput
          label="Close rate"
          helper="Percent of meetings that close to deals."
          value={inputs.closeRate}
          min={0}
          max={100}
          unit="%"
          onValueChange={(v) => onChange("closeRate", v)}
        />
      </Section>

      <Section title="Deal economics">
        {inputs.dealType === "one_time" ? (
          <NumberInput
            label="Deal value"
            helper="Average deal value for one time deals or annualised contract value."
            value={inputs.dealValue}
            min={100}
            max={1_000_000}
            step={500}
            prefix="$"
            onValueChange={(v) => onChange("dealValue", v)}
          />
        ) : (
          <>
            <NumberInput
              label="Monthly subscription value"
              helper="Monthly subscription price per customer."
              value={inputs.monthlySubscriptionValue}
              min={10}
              max={10_000}
              step={10}
              prefix="$"
              onValueChange={(v) => onChange("monthlySubscriptionValue", v)}
            />
            <SliderInput
              label="Monthly churn rate"
              helper="Percent of customers who cancel each month."
              value={inputs.monthlyChurnRate}
              min={0}
              max={100}
              step={0.5}
              unit="%"
              onValueChange={(v) => onChange("monthlyChurnRate", v)}
            />
          </>
        )}
      </Section>

      <Section title="Halo effects">
        <SliderInput
          label="Hidden pipeline conversion"
          helper="Percent of engaged silent contacts (opened, did not reply) who convert later."
          value={inputs.hiddenConversionRate}
          min={0}
          max={1}
          step={0.05}
          unit="%"
          onValueChange={(v) => onChange("hiddenConversionRate", v)}
        />
        <SliderInput
          label="Halo uplift"
          helper="Additional pipeline generated by halo effects beyond the direct funnel."
          value={inputs.haloUpliftRate}
          min={0}
          max={20}
          unit="%"
          onValueChange={(v) => onChange("haloUpliftRate", v)}
        />
      </Section>

      <Section title="Cost">
        <NumberInput
          label="Omnivate fee per month"
          helper="Monthly cost of running outbound through Omnivate. Adjust to test ROI at different price points."
          value={inputs.omnivateMonthlyFee}
          min={1_000}
          max={20_000}
          step={500}
          prefix="$"
          onValueChange={(v) => onChange("omnivateMonthlyFee", v)}
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
    <div className="space-y-5">
      <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
