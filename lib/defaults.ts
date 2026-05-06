// Default values for the calculator.
// Source: docs/m3-requirements-stack.md, sections "Visitor inputs" and
// "Sales motion presets". Anything that ships in the UI as a default value
// lives here and only here.

import type { CalculatorInputs, SalesMotion } from "./types";

/**
 * Defaults that change when the visitor toggles between sales motions.
 */
export const SALES_LED_DEFAULTS = {
  closeRate: 18,
  dealType: "one_time" as const,
  dealValue: 25_000,
  monthlySubscriptionValue: 200, // not used when dealType is one_time, but present for consistency
  monthlyChurnRate: 2,
};

export const SELF_SERVICE_DEFAULTS = {
  closeRate: 30,
  dealType: "subscription" as const,
  dealValue: 25_000, // not used when dealType is subscription, but present for consistency
  monthlySubscriptionValue: 200,
  monthlyChurnRate: 5,
};

/**
 * Defaults that do not change between sales motions.
 */
export const SHARED_DEFAULTS = {
  // Volume (Layer 1)
  domains: 10,
  mailboxesPerDomain: 3,
  emailsPerMailboxPerDay: 30,
  workingDaysPerMonth: 22,

  // Sequence (Layer 2)
  sequenceSteps: 4,

  // Conversion rates (Layer 3, motion independent)
  openRate: 55,
  replyRate: 5,
  positiveReplyRate: 30,
  meetingBookingRate: 70,

  // Halo effects
  hiddenConversionRate: 0.3,
  haloUpliftRate: 8,

  // Cost
  omnivateMonthlyFee: 4_000,

  // Display
  timeHorizonMonths: 12 as const,
};

/**
 * Hard limits.
 */
export const LIFETIME_CAP_MONTHS = 60;
export const SENSITIVITY_VARIANCE = 0.1; // plus or minus 10 percent on each conversion rate

/**
 * Returns the full input object for a given sales motion. Used to populate the
 * calculator on first paint and to reset motion specific defaults when the
 * visitor toggles motions.
 */
export function getDefaultsForMotion(motion: SalesMotion): CalculatorInputs {
  const motionDefaults =
    motion === "sales_led" ? SALES_LED_DEFAULTS : SELF_SERVICE_DEFAULTS;

  return {
    salesMotion: motion,
    ...SHARED_DEFAULTS,
    ...motionDefaults,
  };
}

/**
 * The default sales motion the calculator opens with.
 */
export const DEFAULT_SALES_MOTION: SalesMotion = "sales_led";

/**
 * Convenience: full default inputs for the default motion.
 */
export const DEFAULT_INPUTS = getDefaultsForMotion(DEFAULT_SALES_MOTION);
