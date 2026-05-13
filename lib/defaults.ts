// Default values, constants, and benchmark thresholds for the calculator
// (V2 simplified). Everything that ships in the UI as a default value or
// gets used to label slider positions lives here and only here.

import type {
  BenchmarkStatus,
  CalculatorInputs,
  SequenceSteps,
} from "./types";

/**
 * Total monthly cold email sending capacity. Fixed in V2; the calculator no
 * longer asks the visitor to model the underlying infrastructure (domains,
 * mailboxes, send limits). 24,000 emails per month represents a
 * conventional Omnivate setup.
 */
export const MONTHLY_EMAIL_CAPACITY = 24_000;

/**
 * Sequence steps determine the natural number of unique leads reached when
 * the full monthly capacity is used. The visitor can then adjust the leads
 * slider away from this default if they want to model a smaller program.
 */
export const LEADS_BY_SEQUENCE: Record<SequenceSteps, number> = {
  1: 24_000,
  2: 12_000,
  3: 8_000,
};

/**
 * Strategy framing shown next to each sequence step option. Sequence step
 * choice is a GTM strategy decision: broader TAM gets fewer touches per
 * lead, narrower TAM gets more.
 */
export const STRATEGY_BY_SEQUENCE: Record<
  SequenceSteps,
  { label: string; tam: string; description: string }
> = {
  1: {
    label: "1 step",
    tam: "Large TAM",
    description: "Maximum breadth. One shot per lead, 24,000 reached.",
  },
  2: {
    label: "2 steps",
    tam: "Moderate TAM",
    description: "Balanced. Two touches per lead, 12,000 reached.",
  },
  3: {
    label: "3 steps",
    tam: "Small TAM",
    description: "Maximum depth. Three touches per lead, 8,000 reached.",
  },
};

/**
 * Slider range caps. Reply rate is purposefully capped at 5 because anything
 * higher is unrealistic for cold email and visitors entering 30% would
 * produce nonsense projections.
 */
export const SLIDER_LIMITS = {
  leadsReached: { min: 0, max: 30_000, step: 100 },
  openRate: { min: 0, max: 100, step: 1 },
  replyRate: { min: 0, max: 5, step: 0.1 },
  positiveReplyRate: { min: 0, max: 100, step: 1 },
  meetingBookedRate: { min: 0, max: 100, step: 1 },
  closeRate: { min: 0, max: 100, step: 1 },
  dealValue: { min: 100, max: 1_000_000, step: 500 },
} as const;

/**
 * Benchmark thresholds for the dynamic status labels under each slider.
 * Each entry lists the lower bound at which a status begins. The status for
 * a value is the highest entry whose threshold the value meets or exceeds.
 *
 * Tick markers on the slider tracks line up with the threshold values.
 */
export const BENCHMARK_THRESHOLDS: Record<
  keyof typeof SLIDER_LIMITS,
  { status: BenchmarkStatus; threshold: number; tick?: string }[]
> = {
  leadsReached: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 4_000 },
    { status: "healthy", threshold: 12_000 },
    { status: "benchmark", threshold: 20_000 },
  ],
  openRate: [
    { status: "poor", threshold: 0, tick: "Deliverability issue" },
    { status: "average", threshold: 30, tick: "Moderate" },
    { status: "healthy", threshold: 50, tick: "Healthy" },
    { status: "benchmark", threshold: 75, tick: "Benchmark" },
  ],
  replyRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 1.5, tick: "Average" },
    { status: "healthy", threshold: 2.5, tick: "Healthy" },
    { status: "benchmark", threshold: 4, tick: "Benchmark" },
  ],
  positiveReplyRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 15, tick: "Average" },
    { status: "healthy", threshold: 25, tick: "Healthy" },
    { status: "benchmark", threshold: 35, tick: "Benchmark" },
  ],
  meetingBookedRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 25, tick: "Email only" },
    { status: "healthy", threshold: 50, tick: "Email + LinkedIn" },
    { status: "benchmark", threshold: 75, tick: "Email + LI + calling" },
  ],
  closeRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 10, tick: "Average" },
    { status: "healthy", threshold: 18, tick: "Healthy" },
    { status: "benchmark", threshold: 25, tick: "Benchmark" },
  ],
  dealValue: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 1_000 },
    { status: "healthy", threshold: 10_000 },
    { status: "benchmark", threshold: 50_000 },
  ],
};

/**
 * First-paint default inputs. Values picked to land on the boundary of
 * "healthy" for every conversion rate, giving the visitor a calibrated
 * starting point.
 */
export const DEFAULT_INPUTS: CalculatorInputs = {
  sequenceSteps: 2,
  leadsReached: 12_000,
  openRate: 70,
  replyRate: 3,
  positiveReplyRate: 30,
  meetingBookedRate: 50,
  closeRate: 20,
  dealValue: 25_000,
};

/**
 * Returns the status bucket for a given input value by walking the
 * thresholds for that field.
 */
export function statusFor(
  field: keyof typeof BENCHMARK_THRESHOLDS,
  value: number
): BenchmarkStatus {
  const thresholds = BENCHMARK_THRESHOLDS[field];
  let current: BenchmarkStatus = "poor";
  for (const entry of thresholds) {
    if (value >= entry.threshold) current = entry.status;
  }
  return current;
}

/**
 * Anchor labels rendered at the extremes of each slider track, in the
 * spirit of the reference cold-email-roi-calculator.com ("Solo → 20 reps",
 * "Sticky → high churn"). Gives visitors immediate context for what the
 * minimum and maximum values represent.
 */
export const SLIDER_ANCHORS: Record<
  keyof typeof SLIDER_LIMITS,
  { left: string; right: string }
> = {
  leadsReached: { left: "Narrow reach", right: "Maximum reach" },
  openRate: { left: "Deliverability issue", right: "Best in class" },
  replyRate: { left: "Cold and quiet", right: "Best in class" },
  positiveReplyRate: { left: "Wrong audience", right: "Top of market" },
  meetingBookedRate: { left: "Email only", right: "Multi channel" },
  closeRate: { left: "Pipeline leak", right: "Top of market" },
  dealValue: { left: "Tiny tickets", right: "Enterprise" },
};

/**
 * Plain-English explainer content shown in the popover when a visitor taps
 * the help icon next to a slider label. Keeps the helper text short and
 * lets curious visitors dig deeper without crowding the surface UI.
 */
export const SLIDER_EXPLAINERS: Record<
  keyof typeof SLIDER_LIMITS,
  { title: string; body: string }
> = {
  leadsReached: {
    title: "Unique leads reached",
    body: "How many distinct prospects your outbound campaign touches each month. Higher reach means more pipeline at the top of the funnel; lower reach means deeper personalisation per lead. Capacity caps at 24,000 emails per month, so reach trades off with sequence length.",
  },
  openRate: {
    title: "Open rate",
    body: "Percent of contacted leads who open at least one email in the sequence. Strong open rates depend on warm domains, clean lists, and compelling subject lines. Industry healthy range is 50 to 75 percent; below 30 percent usually signals a deliverability problem.",
  },
  replyRate: {
    title: "Reply rate",
    body: "Percent of contacted leads who reply at all (positive or negative). Cold email rarely exceeds five percent reply rate; healthy programs typically sit between two and four percent. Lift comes from better targeting, sharper offers, and well written follow ups.",
  },
  positiveReplyRate: {
    title: "Positive reply rate",
    body: "Of the people who reply, what share express genuine interest rather than asking to be removed, saying wrong person, or sending a polite no. Healthy positive reply rate is 25 to 35 percent. Below 15 percent suggests your offer or audience targeting is off.",
  },
  meetingBookedRate: {
    title: "Meeting booked rate",
    body: "Of the positive replies, what share convert to a confirmed meeting on the calendar. This is the metric most affected by follow up motion. Email only follow up typically lands around 25 percent. Adding LinkedIn brings it to 50. Layering in cold calling pushes it past 75.",
  },
  closeRate: {
    title: "Close rate",
    body: "Of the meetings booked, what share become signed deals. Driven by your sales motion, offer fit, and pipeline rigour. Sales led B2B SaaS sits between 15 and 25 percent. Self service product led motions can land higher because the product can be tried before the buyer commits.",
  },
  dealValue: {
    title: "Average deal value",
    body: "Revenue from one closed deal. Use the average for one time deals, or annualised contract value for subscription products. The calculator multiplies this by deals per month to project revenue.",
  },
};
