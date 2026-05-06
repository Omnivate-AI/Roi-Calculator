// Pure ROI math. No React, no UI, no side effects.
// Every formula here matches docs/m3-requirements-stack.md exactly. The math
// is the same math specified in docs/m1-cold-email-funnel.md. Tests in
// tests/calculations.test.ts prove the M1 worked examples reproduce.

import type { CalculatorInputs, CalculatorOutputs } from "./types";
import { LIFETIME_CAP_MONTHS, SENSITIVITY_VARIANCE } from "./defaults";

/**
 * Compute every output the calculator displays from a complete input set.
 *
 * This is the public entry point. It also computes the sensitivity band by
 * recomputing the funnel with each conversion rate scaled by ±10 percent and
 * including those totals in the output.
 */
export function calculateRoi(inputs: CalculatorInputs): CalculatorOutputs {
  const central = computeCore(inputs);

  const lowInputs = scaleConversionRates(inputs, 1 - SENSITIVITY_VARIANCE);
  const highInputs = scaleConversionRates(inputs, 1 + SENSITIVITY_VARIANCE);
  const totalRevenueLow = computeCore(lowInputs).totalRevenueAnnualised;
  const totalRevenueHigh = computeCore(highInputs).totalRevenueAnnualised;

  // Time horizon scaling.
  const timeFactor = inputs.timeHorizonMonths / 12;
  const revenueAtHorizon = central.totalRevenueAnnualised * timeFactor;
  const costAtHorizon = central.omnivateCostAnnualised * timeFactor;
  const netAtHorizon = revenueAtHorizon - costAtHorizon;

  return {
    ...central,
    totalRevenueLow,
    totalRevenueHigh,
    revenueAtHorizon,
    costAtHorizon,
    netAtHorizon,
  };
}

/**
 * Internal: compute every output except sensitivity band and horizon scaling.
 * Separated so calculateRoi can call this three times (central, low, high)
 * without infinite recursion.
 */
type CoreOutputs = Omit<
  CalculatorOutputs,
  "totalRevenueLow" | "totalRevenueHigh" | "revenueAtHorizon" | "costAtHorizon" | "netAtHorizon"
>;

function computeCore(inputs: CalculatorInputs): CoreOutputs {
  // Layer 1: monthly sending capacity.
  const monthlySendingCapacity =
    inputs.domains *
    inputs.mailboxesPerDomain *
    inputs.emailsPerMailboxPerDay *
    inputs.workingDaysPerMonth;

  // Layer 2: contacts reached per month.
  const contactsReachedPerMonth =
    inputs.sequenceSteps > 0
      ? monthlySendingCapacity / inputs.sequenceSteps
      : 0;

  // Layer 3: funnel stages. Open rate is informational; replies are computed
  // from contacts independently (per M1 reasoning that real outbound tools
  // measure replies as replies/contacts, not replies/opens).
  const opensPerMonth = contactsReachedPerMonth * (inputs.openRate / 100);
  const repliesPerMonth = contactsReachedPerMonth * (inputs.replyRate / 100);
  const positiveRepliesPerMonth = repliesPerMonth * (inputs.positiveReplyRate / 100);
  const meetingsPerMonth = positiveRepliesPerMonth * (inputs.meetingBookingRate / 100);
  const dealsPerMonth = meetingsPerMonth * (inputs.closeRate / 100);

  // Direct revenue: branches on deal type.
  let directRevenueAnnualised = 0;
  let mrrAddedAnnualised: number | null = null;
  let customerLtv: number | null = null;
  let averageLifetimeMonths: number | null = null;

  if (inputs.dealType === "one_time") {
    directRevenueAnnualised = dealsPerMonth * inputs.dealValue * 12;
  } else {
    // Subscription motion. Lifetime is capped to avoid infinity when churn = 0.
    averageLifetimeMonths =
      inputs.monthlyChurnRate > 0
        ? Math.min(LIFETIME_CAP_MONTHS, 100 / inputs.monthlyChurnRate)
        : LIFETIME_CAP_MONTHS;

    customerLtv = inputs.monthlySubscriptionValue * averageLifetimeMonths;
    mrrAddedAnnualised = dealsPerMonth * inputs.monthlySubscriptionValue * 12;

    // Lifetime cohort revenue: each month's deals contribute their full LTV,
    // summed across 12 months.
    directRevenueAnnualised = dealsPerMonth * customerLtv * 12;
  }

  // Hidden pipeline: engaged silent contacts converting in the long tail.
  const engagedSilentPerMonth = Math.max(0, opensPerMonth - repliesPerMonth);
  const hiddenDealsPerMonth =
    engagedSilentPerMonth * (inputs.hiddenConversionRate / 100);

  let hiddenRevenueAnnualised = 0;
  if (inputs.dealType === "one_time") {
    hiddenRevenueAnnualised = hiddenDealsPerMonth * inputs.dealValue * 12;
  } else {
    hiddenRevenueAnnualised = hiddenDealsPerMonth * (customerLtv ?? 0) * 12;
  }

  // Halo bonus: small uplift on direct + hidden.
  const haloRevenueAnnualised =
    (directRevenueAnnualised + hiddenRevenueAnnualised) *
    (inputs.haloUpliftRate / 100);

  // Total and ROI.
  const totalRevenueAnnualised =
    directRevenueAnnualised + hiddenRevenueAnnualised + haloRevenueAnnualised;

  const omnivateCostAnnualised = inputs.omnivateMonthlyFee * 12;
  const roiNet = totalRevenueAnnualised - omnivateCostAnnualised;
  const roiMultiple =
    omnivateCostAnnualised > 0 ? totalRevenueAnnualised / omnivateCostAnnualised : 0;

  return {
    monthlySendingCapacity,
    contactsReachedPerMonth,
    opensPerMonth,
    repliesPerMonth,
    positiveRepliesPerMonth,
    meetingsPerMonth,
    dealsPerMonth,
    directRevenueAnnualised,
    mrrAddedAnnualised,
    customerLtv,
    averageLifetimeMonths,
    engagedSilentPerMonth,
    hiddenDealsPerMonth,
    hiddenRevenueAnnualised,
    haloRevenueAnnualised,
    totalRevenueAnnualised,
    omnivateCostAnnualised,
    roiNet,
    roiMultiple,
  };
}

/**
 * Returns a copy of inputs with each conversion rate multiplied by the given
 * factor and clamped to [0, 100]. Used for sensitivity band computation.
 *
 * Volume inputs and deal economics are not scaled because the sensitivity band
 * is meant to express uncertainty in conversion performance, not in user
 * provided business assumptions.
 */
function scaleConversionRates(inputs: CalculatorInputs, factor: number): CalculatorInputs {
  const clamp = (value: number): number => Math.max(0, Math.min(100, value));

  return {
    ...inputs,
    openRate: clamp(inputs.openRate * factor),
    replyRate: clamp(inputs.replyRate * factor),
    positiveReplyRate: clamp(inputs.positiveReplyRate * factor),
    meetingBookingRate: clamp(inputs.meetingBookingRate * factor),
    closeRate: clamp(inputs.closeRate * factor),
  };
}
