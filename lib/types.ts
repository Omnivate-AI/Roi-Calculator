// Calculator type definitions.
// Source of truth for the shape of every input the visitor controls and every
// output the calculator computes. Mirrors the variable list in
// docs/m3-requirements-stack.md.

export type SalesMotion = "sales_led" | "self_service";
export type DealType = "one_time" | "subscription";
export type TimeHorizon = 6 | 12 | 24;

/**
 * Every value the visitor can change in the calculator UI.
 * Percentages are stored as 0 to 100 (not 0 to 1) to match the slider semantics.
 */
export interface CalculatorInputs {
  // Sales motion
  salesMotion: SalesMotion;

  // Volume (Layer 1: sending infrastructure)
  domains: number;
  mailboxesPerDomain: number;
  emailsPerMailboxPerDay: number;
  workingDaysPerMonth: number;

  // Sequence (Layer 2)
  sequenceSteps: number;

  // Conversion rates (Layer 3, percentages 0 to 100)
  openRate: number;
  replyRate: number;
  positiveReplyRate: number;
  meetingBookingRate: number;
  closeRate: number;

  // Deal economics
  dealType: DealType;
  dealValue: number; // used when dealType === "one_time"
  monthlySubscriptionValue: number; // used when dealType === "subscription"
  monthlyChurnRate: number; // percent 0 to 100, used when dealType === "subscription"

  // Halo effects (percentages 0 to 100)
  hiddenConversionRate: number;
  haloUpliftRate: number;

  // Cost
  omnivateMonthlyFee: number;

  // Display
  timeHorizonMonths: TimeHorizon;
}

/**
 * Every number the calculator displays. All revenue values are USD.
 * Subscription specific outputs are null when dealType === "one_time".
 */
export interface CalculatorOutputs {
  // Capacity and reach
  monthlySendingCapacity: number;
  contactsReachedPerMonth: number;

  // Funnel stages
  opensPerMonth: number;
  repliesPerMonth: number;
  positiveRepliesPerMonth: number;
  meetingsPerMonth: number;
  dealsPerMonth: number;

  // Direct revenue
  directRevenueAnnualised: number;

  // Subscription only
  mrrAddedAnnualised: number | null;
  customerLtv: number | null;
  averageLifetimeMonths: number | null;

  // Hidden pipeline
  engagedSilentPerMonth: number;
  hiddenDealsPerMonth: number;
  hiddenRevenueAnnualised: number;

  // Halo bonus
  haloRevenueAnnualised: number;

  // Total and ROI
  totalRevenueAnnualised: number;
  omnivateCostAnnualised: number;
  roiNet: number;
  roiMultiple: number;

  // Sensitivity band (recomputed totalRevenueAnnualised with rates scaled)
  totalRevenueLow: number;
  totalRevenueHigh: number;

  // Time horizon scaled
  revenueAtHorizon: number;
  costAtHorizon: number;
  netAtHorizon: number;
}
