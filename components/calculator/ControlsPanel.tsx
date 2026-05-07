"use client";

import type { CalculatorInputs } from "@/lib/types";
import { formatCurrency, formatInteger } from "@/lib/utils";
import { SalesMotionToggle } from "./SalesMotionToggle";
import { SliderInput } from "./SliderInput";
import { NumberInput } from "./NumberInput";
import { Warning } from "./Warning";

interface ControlsPanelProps {
  inputs: CalculatorInputs;
  onChange: <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => void;
  onMotionChange: (motion: CalculatorInputs["salesMotion"]) => void;
  /**
   * Subscription specific computed values, when applicable. Used to render
   * the LTV badge under the churn slider so the visitor sees the consequence
   * of their churn assumption immediately.
   */
  subscriptionInfo?: {
    customerLtv: number;
    averageLifetimeMonths: number;
  } | null;
}

/**
 * The full panel of inputs the visitor controls. Grouped by category to
 * mirror the M3 spec: sales motion, volume, conversion rates, deal economics,
 * halo effects, and cost. Inline warnings appear when an input value puts
 * the calculator in an edge case (zero deals, 100% churn, tiny deal size).
 */
export function ControlsPanel({
  inputs,
  onChange,
  onMotionChange,
  subscriptionInfo,
}: ControlsPanelProps) {
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
        <div className="space-y-2">
          <SliderInput
            label="Close rate"
            helper="Percent of meetings that close to deals."
            value={inputs.closeRate}
            min={0}
            max={100}
            unit="%"
            onValueChange={(v) => onChange("closeRate", v)}
          />
          {inputs.closeRate === 0 && (
            <Warning>
              At zero percent close rate the program produces no deals. Even
              the best meetings need to convert to revenue.
            </Warning>
          )}
        </div>
      </Section>

      <Section title="Deal economics">
        {inputs.dealType === "one_time" ? (
          <div className="space-y-2">
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
            {inputs.dealValue < 1_000 && (
              <Warning>
                Deal value below one thousand dollars rarely justifies cold
                outbound at this volume. Consider whether your offering fits
                the channel.
              </Warning>
            )}
          </div>
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
            <div className="space-y-2">
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
              {subscriptionInfo && (
                <LtvBadge
                  ltv={subscriptionInfo.customerLtv}
                  lifetimeMonths={subscriptionInfo.averageLifetimeMonths}
                  isCapped={
                    inputs.monthlyChurnRate === 0 ||
                    subscriptionInfo.averageLifetimeMonths >= 60
                  }
                />
              )}
              {inputs.monthlyChurnRate === 100 && (
                <Warning>
                  At one hundred percent monthly churn every customer cancels
                  in their first month. Lifetime value collapses to a single
                  month of subscription.
                </Warning>
              )}
              {inputs.monthlyChurnRate >= 50 && inputs.monthlyChurnRate < 100 && (
                <Warning>
                  High churn rate. Lifetime is short which suppresses cohort
                  revenue compared to lower churn benchmarks.
                </Warning>
              )}
            </div>
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

interface LtvBadgeProps {
  ltv: number;
  lifetimeMonths: number;
  isCapped: boolean;
}

function LtvBadge({ ltv, lifetimeMonths, isCapped }: LtvBadgeProps) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 px-3 py-2 text-xs leading-relaxed">
      <span className="text-muted-foreground">Customer LTV:</span>{" "}
      <span className="font-mono tabular-nums text-foreground">
        {formatCurrency(ltv)}
      </span>{" "}
      <span className="text-muted-foreground">
        over {formatInteger(lifetimeMonths)} months
        {isCapped && " (capped at five years)"}
      </span>
    </div>
  );
}
