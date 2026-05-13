// Default values, thresholds, and educational content for the calculator
// (V5 simplified). Three status bands only (poor/average/good), snappy
// slider steps, descriptive contextual feedback for each status, meeting
// booked rate capped at 50%.

import type {
  BenchmarkStatus,
  CalculatorInputs,
  SequenceSteps,
} from "./types";

/** Fixed monthly cold email sending capacity. */
export const MONTHLY_EMAIL_CAPACITY = 24_000;

/**
 * Strategy choice (sequence steps) directly determines unique leads
 * reached. Strategy cards are the only control; no separate leads slider.
 */
export const LEADS_BY_SEQUENCE: Record<SequenceSteps, number> = {
  1: 24_000,
  2: 12_000,
  3: 8_000,
};

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
 * Slider ranges. Steps are coarse so the sliders feel "snappy" instead of
 * free-floating. Meeting booked rate caps at 50% because cold email rarely
 * exceeds that even with multi channel follow up.
 */
export const SLIDER_LIMITS = {
  openRate: { min: 0, max: 100, step: 5 },
  replyRate: { min: 0, max: 5, step: 0.5 },
  positiveReplyRate: { min: 0, max: 100, step: 5 },
  meetingBookedRate: { min: 0, max: 50, step: 5 },
  closeRate: { min: 0, max: 100, step: 5 },
  dealValue: { min: 100, max: 1_000_000, step: 500 },
} as const;

/**
 * Three-band thresholds. The status for any value is the highest entry
 * whose threshold the value meets or exceeds.
 */
export const BENCHMARK_THRESHOLDS: Record<
  keyof typeof SLIDER_LIMITS,
  { status: BenchmarkStatus; threshold: number; tick?: string }[]
> = {
  openRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 30, tick: "Moderate" },
    { status: "good", threshold: 50, tick: "Healthy" },
  ],
  replyRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 1.5, tick: "Average" },
    { status: "good", threshold: 2.5, tick: "Healthy" },
  ],
  positiveReplyRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 15, tick: "Average" },
    { status: "good", threshold: 25, tick: "Healthy" },
  ],
  meetingBookedRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 10, tick: "Email only" },
    { status: "good", threshold: 25, tick: "Multi channel" },
  ],
  closeRate: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 10, tick: "Average" },
    { status: "good", threshold: 18, tick: "Healthy" },
  ],
  dealValue: [
    { status: "poor", threshold: 0 },
    { status: "average", threshold: 1_000 },
    { status: "good", threshold: 10_000 },
  ],
};

/** Anchor labels at the slider extremities. */
export const SLIDER_ANCHORS: Record<
  keyof typeof SLIDER_LIMITS,
  { left: string; right: string }
> = {
  openRate: { left: "Deliverability issue", right: "Best in class" },
  replyRate: { left: "Cold and quiet", right: "Best in class" },
  positiveReplyRate: { left: "Wrong audience", right: "Top of market" },
  meetingBookedRate: { left: "Email only", right: "Multi channel" },
  closeRate: { left: "Pipeline leak", right: "Top of market" },
  dealValue: { left: "Tiny tickets", right: "Enterprise" },
};

/**
 * Descriptive contextual feedback shown below the status badge. One short
 * sentence per (field, status) that reads in the language of an outbound
 * program, not a generic benchmark label.
 */
export const STATUS_CONTEXT: Record<
  keyof typeof SLIDER_LIMITS,
  Record<BenchmarkStatus, string>
> = {
  openRate: {
    poor: "Deliverability issue. Emails are landing in spam, not the primary inbox.",
    average: "Emails are reaching inboxes, but subject lines or sender reputation need work.",
    good: "Inboxes are hitting the primary tab. Subject lines and sender reputation are strong.",
  },
  replyRate: {
    poor: "Cold list or weak offer. Most leads are silent.",
    average: "Reasonable engagement. Refine targeting or tighten the offer to push higher.",
    good: "Sharp targeting and compelling messaging. The market is responding.",
  },
  positiveReplyRate: {
    poor: "Audience misfit. The wrong people are replying.",
    average: "Mixed reception. Tighten the ICP or the value proposition.",
    good: "Resonating with the right buyers consistently.",
  },
  meetingBookedRate: {
    poor: "No real follow up motion. Positive replies are going cold.",
    average: "Email follow up is working but you are leaving meetings on the table.",
    good: "Multi channel follow up is converting interested replies into meetings.",
  },
  closeRate: {
    poor: "Pipeline is leaking before close. Sales process needs work.",
    average: "Reasonable conversion. Tighten discovery, proposal, and follow up.",
    good: "Strong sales motion turning meetings into signed deals.",
  },
  dealValue: {
    poor: "Deal size may not justify the cold outbound channel cost.",
    average: "Reasonable economics for outbound.",
    good: "Strong deal economics. Every meeting carries real revenue weight.",
  },
};

/**
 * Plain-English explainer content shown in the popover when a visitor taps
 * the help icon next to a slider label.
 */
export const SLIDER_EXPLAINERS: Record<
  keyof typeof SLIDER_LIMITS,
  { title: string; body: string }
> = {
  openRate: {
    title: "Open rate",
    body: "Percent of contacted leads who open at least one email in the sequence. Strong open rates depend on warm domains, clean lists, and compelling subject lines. Industry healthy range is 50 to 75 percent; below 30 percent usually signals a deliverability problem.",
  },
  replyRate: {
    title: "Reply rate",
    body: "Percent of contacted leads who reply at all. Cold email rarely exceeds five percent; healthy programs typically sit between two and four percent. Lift comes from better targeting, sharper offers, and well written follow ups.",
  },
  positiveReplyRate: {
    title: "Positive reply rate",
    body: "Of the people who reply, what share express genuine interest rather than asking to be removed or saying wrong person. Healthy positive reply rate is 25 to 35 percent.",
  },
  meetingBookedRate: {
    title: "Meeting booked rate",
    body: "Of the positive replies, what share convert to a confirmed meeting. Email only follow up typically lands around 10 percent. Adding LinkedIn brings it to 25. Layering in cold calling pushes it past 40. The realistic ceiling for cold outbound is around 50 percent.",
  },
  closeRate: {
    title: "Close rate",
    body: "Of the meetings booked, what share become signed deals. Sales led B2B SaaS sits between 15 and 25 percent. Self service product led motions can land higher because the product can be tried before the buyer commits.",
  },
  dealValue: {
    title: "Average deal value",
    body: "Revenue from one closed deal. Use the average for one time deals, or annualised contract value for subscription products. The calculator multiplies this by deals per month to project revenue.",
  },
};

export const DEFAULT_INPUTS: CalculatorInputs = {
  sequenceSteps: 2,
  leadsReached: 12_000,
  openRate: 70,
  replyRate: 3,
  positiveReplyRate: 30,
  meetingBookedRate: 30,
  closeRate: 20,
  dealValue: 25_000,
};

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
