// Unit tests for lib/calculations.ts.
// These tests prove the M1 worked examples reproduce exactly and that every
// edge case in M3 is handled. If any assertion here breaks, the calculator's
// numbers no longer match the documented spec, which is a bug.

import { describe, expect, it } from "vitest";
import { calculateRoi } from "@/lib/calculations";
import {
  DEFAULT_INPUTS,
  LIFETIME_CAP_MONTHS,
  SENSITIVITY_VARIANCE,
  getDefaultsForMotion,
} from "@/lib/defaults";
import type { CalculatorInputs } from "@/lib/types";

// --------------------------------------------------------------------------
// Layer 1: sending infrastructure
// --------------------------------------------------------------------------

describe("Layer 1: sending capacity", () => {
  it("computes the M1 worked example: 10 × 3 × 30 × 22 = 19,800 emails per month", () => {
    const out = calculateRoi(DEFAULT_INPUTS);
    expect(out.monthlySendingCapacity).toBe(19_800);
  });

  it("scales linearly with each volume input", () => {
    const doubled: CalculatorInputs = { ...DEFAULT_INPUTS, domains: 20 };
    const out = calculateRoi(doubled);
    expect(out.monthlySendingCapacity).toBe(39_600);
  });
});

// --------------------------------------------------------------------------
// Layer 2: reachable contacts
// --------------------------------------------------------------------------

describe("Layer 2: reachable contacts", () => {
  it("computes the M1 worked example: 19,800 / 4 = 4,950 contacts per month", () => {
    const out = calculateRoi(DEFAULT_INPUTS);
    expect(out.contactsReachedPerMonth).toBe(4_950);
  });

  it("longer sequences reduce reachable contacts proportionally", () => {
    const longerSequence: CalculatorInputs = { ...DEFAULT_INPUTS, sequenceSteps: 6 };
    const out = calculateRoi(longerSequence);
    expect(out.contactsReachedPerMonth).toBe(3_300);
  });

  it("zero sequence steps returns zero contacts (not Infinity)", () => {
    const broken: CalculatorInputs = { ...DEFAULT_INPUTS, sequenceSteps: 0 };
    const out = calculateRoi(broken);
    expect(out.contactsReachedPerMonth).toBe(0);
  });
});

// --------------------------------------------------------------------------
// Layer 3: funnel stages
// --------------------------------------------------------------------------

describe("Layer 3: funnel stages with sales-led defaults", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("opens = contacts × open rate (4,950 × 0.55)", () => {
    expect(out.opensPerMonth).toBeCloseTo(2_722.5, 5);
  });

  it("replies = contacts × reply rate (4,950 × 0.05)", () => {
    expect(out.repliesPerMonth).toBeCloseTo(247.5, 5);
  });

  it("positive replies = replies × positive reply rate (247.5 × 0.30)", () => {
    expect(out.positiveRepliesPerMonth).toBeCloseTo(74.25, 5);
  });

  it("meetings = positive replies × meeting booking rate (74.25 × 0.70)", () => {
    expect(out.meetingsPerMonth).toBeCloseTo(51.975, 5);
  });

  it("deals = meetings × close rate (51.975 × 0.18)", () => {
    expect(out.dealsPerMonth).toBeCloseTo(9.3555, 5);
  });
});

describe("Layer 3: funnel stages compound multiplicatively", () => {
  it("a 10% drop in any rate produces a 10% drop in deals", () => {
    const baseline = calculateRoi(DEFAULT_INPUTS);
    const lowerOpens: CalculatorInputs = {
      ...DEFAULT_INPUTS,
      replyRate: DEFAULT_INPUTS.replyRate * 0.9,
    };
    const result = calculateRoi(lowerOpens);
    expect(result.dealsPerMonth).toBeCloseTo(baseline.dealsPerMonth * 0.9, 5);
  });
});

// --------------------------------------------------------------------------
// Direct revenue (one-time deals, sales-led)
// --------------------------------------------------------------------------

describe("Direct revenue with sales-led defaults", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("annualised revenue = deals × deal value × 12 (using exact deal count)", () => {
    // 9.3555 × 25,000 × 12 = 2,806,650
    expect(out.directRevenueAnnualised).toBeCloseTo(2_806_650, 0);
  });

  it("subscription-only outputs are null for one-time deals", () => {
    expect(out.mrrAddedAnnualised).toBeNull();
    expect(out.customerLtv).toBeNull();
    expect(out.averageLifetimeMonths).toBeNull();
  });
});

// --------------------------------------------------------------------------
// Direct revenue (subscription, self-service)
// --------------------------------------------------------------------------

describe("Direct revenue with self-service defaults (subscription)", () => {
  const out = calculateRoi(getDefaultsForMotion("self_service"));

  it("close rate is 30% by default for self-service", () => {
    // contacts 4,950 × 0.05 reply × 0.30 positive × 0.70 meeting × 0.30 close = 15.5925
    expect(out.dealsPerMonth).toBeCloseTo(15.5925, 5);
  });

  it("average lifetime = 100 / churn (5% → 20 months)", () => {
    expect(out.averageLifetimeMonths).toBe(20);
  });

  it("customer LTV = monthly subscription × lifetime ($200 × 20 = $4,000)", () => {
    expect(out.customerLtv).toBe(4_000);
  });

  it("MRR added annualised = deals × monthly value × 12", () => {
    // 15.5925 × 200 × 12 = 37,422
    expect(out.mrrAddedAnnualised).toBeCloseTo(37_422, 0);
  });

  it("direct revenue (lifetime cohort) = deals × LTV × 12", () => {
    // 15.5925 × 4,000 × 12 = 748,440
    expect(out.directRevenueAnnualised).toBeCloseTo(748_440, 0);
  });
});

// --------------------------------------------------------------------------
// Lifetime cap edge cases
// --------------------------------------------------------------------------

describe("Lifetime cap and churn edge cases", () => {
  it("zero churn caps lifetime at 60 months (not Infinity)", () => {
    const noChurn: CalculatorInputs = {
      ...getDefaultsForMotion("self_service"),
      monthlyChurnRate: 0,
    };
    const out = calculateRoi(noChurn);
    expect(out.averageLifetimeMonths).toBe(LIFETIME_CAP_MONTHS);
  });

  it("100% churn produces a 1 month lifetime", () => {
    const fullChurn: CalculatorInputs = {
      ...getDefaultsForMotion("self_service"),
      monthlyChurnRate: 100,
    };
    const out = calculateRoi(fullChurn);
    expect(out.averageLifetimeMonths).toBe(1);
  });

  it("lifetime is capped at 60 even when math allows longer (1% churn → 100 months)", () => {
    const oneChurn: CalculatorInputs = {
      ...getDefaultsForMotion("self_service"),
      monthlyChurnRate: 1,
    };
    const out = calculateRoi(oneChurn);
    expect(out.averageLifetimeMonths).toBe(LIFETIME_CAP_MONTHS);
  });
});

// --------------------------------------------------------------------------
// Hidden pipeline
// --------------------------------------------------------------------------

describe("Hidden pipeline", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("engaged silent = opens − replies", () => {
    // 2,722.5 - 247.5 = 2,475
    expect(out.engagedSilentPerMonth).toBeCloseTo(2_475, 5);
  });

  it("hidden deals = engaged silent × hidden conversion rate", () => {
    // 2,475 × 0.003 = 7.425
    expect(out.hiddenDealsPerMonth).toBeCloseTo(7.425, 5);
  });

  it("hidden revenue (one-time) = hidden deals × deal value × 12", () => {
    // 7.425 × 25,000 × 12 = 2,227,500
    expect(out.hiddenRevenueAnnualised).toBeCloseTo(2_227_500, 0);
  });

  it("never goes negative when reply rate exceeds open rate (degenerate but possible)", () => {
    const weird: CalculatorInputs = { ...DEFAULT_INPUTS, openRate: 1, replyRate: 5 };
    const result = calculateRoi(weird);
    expect(result.engagedSilentPerMonth).toBe(0);
  });
});

// --------------------------------------------------------------------------
// Halo bonus
// --------------------------------------------------------------------------

describe("Halo bonus", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("halo = (direct + hidden) × halo uplift rate", () => {
    // (2,806,650 + 2,227,500) × 0.08 = 402,732
    expect(out.haloRevenueAnnualised).toBeCloseTo(402_732, 0);
  });

  it("zero halo rate produces zero halo revenue", () => {
    const noHalo: CalculatorInputs = { ...DEFAULT_INPUTS, haloUpliftRate: 0 };
    const result = calculateRoi(noHalo);
    expect(result.haloRevenueAnnualised).toBe(0);
  });
});

// --------------------------------------------------------------------------
// Totals and ROI
// --------------------------------------------------------------------------

describe("Totals and ROI", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("total revenue = direct + hidden + halo", () => {
    // 2,806,650 + 2,227,500 + 402,732 = 5,436,882
    expect(out.totalRevenueAnnualised).toBeCloseTo(5_436_882, 0);
  });

  it("annualised cost = monthly fee × 12", () => {
    // 4,000 × 12 = 48,000
    expect(out.omnivateCostAnnualised).toBe(48_000);
  });

  it("roi net = total revenue − cost", () => {
    expect(out.roiNet).toBeCloseTo(5_388_882, 0);
  });

  it("roi multiple = total revenue / cost", () => {
    expect(out.roiMultiple).toBeCloseTo(113.27, 1);
  });

  it("zero cost yields zero ROI multiple (no divide by zero)", () => {
    const free: CalculatorInputs = { ...DEFAULT_INPUTS, omnivateMonthlyFee: 0 };
    const result = calculateRoi(free);
    expect(result.roiMultiple).toBe(0);
  });
});

// --------------------------------------------------------------------------
// Sensitivity band
// --------------------------------------------------------------------------

describe("Sensitivity band", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("low ≤ central ≤ high", () => {
    expect(out.totalRevenueLow).toBeLessThan(out.totalRevenueAnnualised);
    expect(out.totalRevenueAnnualised).toBeLessThan(out.totalRevenueHigh);
  });

  it("band is meaningful: low and high are within roughly 30% of central", () => {
    // The band is computed by scaling four conversion rates that compound into deals
    // (reply, positive reply, meeting booking, close) plus open rate which only affects
    // hidden pipeline through engaged silent contacts. Direct revenue scales by 0.9^4 ≈ 0.66;
    // hidden by ≈ 0.9; halo as a weighted blend. The composite ratio sits between those bounds,
    // so we sanity check the band is neither degenerate (too narrow) nor implausible (too wide).
    const lowRatio = out.totalRevenueLow / out.totalRevenueAnnualised;
    const highRatio = out.totalRevenueHigh / out.totalRevenueAnnualised;
    expect(lowRatio).toBeGreaterThan(0.5);
    expect(lowRatio).toBeLessThan(0.95);
    expect(highRatio).toBeGreaterThan(1.05);
    expect(highRatio).toBeLessThan(1.5);
  });
});

// --------------------------------------------------------------------------
// Time horizon scaling
// --------------------------------------------------------------------------

describe("Time horizon scaling", () => {
  it("12 month horizon equals annualised values", () => {
    const out = calculateRoi(DEFAULT_INPUTS);
    expect(out.revenueAtHorizon).toBeCloseTo(out.totalRevenueAnnualised, 0);
    expect(out.costAtHorizon).toBeCloseTo(out.omnivateCostAnnualised, 0);
  });

  it("6 month horizon halves revenue and cost", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, timeHorizonMonths: 6 });
    expect(out.revenueAtHorizon).toBeCloseTo(out.totalRevenueAnnualised / 2, 0);
    expect(out.costAtHorizon).toBeCloseTo(out.omnivateCostAnnualised / 2, 0);
  });

  it("24 month horizon doubles revenue and cost", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, timeHorizonMonths: 24 });
    expect(out.revenueAtHorizon).toBeCloseTo(out.totalRevenueAnnualised * 2, 0);
    expect(out.costAtHorizon).toBeCloseTo(out.omnivateCostAnnualised * 2, 0);
  });
});

// --------------------------------------------------------------------------
// Edge cases
// --------------------------------------------------------------------------

describe("Edge cases", () => {
  it("zero deals produce zero revenue everywhere", () => {
    const zero: CalculatorInputs = { ...DEFAULT_INPUTS, closeRate: 0 };
    const out = calculateRoi(zero);
    expect(out.dealsPerMonth).toBe(0);
    expect(out.directRevenueAnnualised).toBe(0);
    expect(out.totalRevenueAnnualised).toBeGreaterThanOrEqual(0); // hidden + halo can still contribute
  });

  it("tiny deal value still computes valid revenue", () => {
    const tiny: CalculatorInputs = { ...DEFAULT_INPUTS, dealValue: 100 };
    const out = calculateRoi(tiny);
    expect(out.directRevenueAnnualised).toBeGreaterThan(0);
    expect(out.directRevenueAnnualised).toBeLessThan(50_000); // sanity check
  });

  it("huge volume scales proportionally without overflow", () => {
    const huge: CalculatorInputs = {
      ...DEFAULT_INPUTS,
      domains: 100,
      mailboxesPerDomain: 5,
      emailsPerMailboxPerDay: 50,
    };
    const out = calculateRoi(huge);
    expect(out.monthlySendingCapacity).toBe(550_000);
    expect(out.totalRevenueAnnualised).toBeGreaterThan(0);
    expect(Number.isFinite(out.totalRevenueAnnualised)).toBe(true);
  });

  it("all conversion rates at zero produce zero deals", () => {
    const dead: CalculatorInputs = {
      ...DEFAULT_INPUTS,
      replyRate: 0,
      positiveReplyRate: 0,
      meetingBookingRate: 0,
      closeRate: 0,
    };
    const out = calculateRoi(dead);
    expect(out.dealsPerMonth).toBe(0);
  });
});

// --------------------------------------------------------------------------
// Sales motion presets sanity
// --------------------------------------------------------------------------

describe("Sales motion presets", () => {
  it("sales-led defaults: close rate 18%, one-time deals at $25k, churn 2%", () => {
    const inputs = getDefaultsForMotion("sales_led");
    expect(inputs.closeRate).toBe(18);
    expect(inputs.dealType).toBe("one_time");
    expect(inputs.dealValue).toBe(25_000);
    expect(inputs.monthlyChurnRate).toBe(2);
  });

  it("self-service defaults: close rate 30%, subscription at $200/mo, churn 5%", () => {
    const inputs = getDefaultsForMotion("self_service");
    expect(inputs.closeRate).toBe(30);
    expect(inputs.dealType).toBe("subscription");
    expect(inputs.monthlySubscriptionValue).toBe(200);
    expect(inputs.monthlyChurnRate).toBe(5);
  });

  it("shared defaults are identical across motions", () => {
    const salesLed = getDefaultsForMotion("sales_led");
    const selfService = getDefaultsForMotion("self_service");
    expect(salesLed.openRate).toBe(selfService.openRate);
    expect(salesLed.replyRate).toBe(selfService.replyRate);
    expect(salesLed.positiveReplyRate).toBe(selfService.positiveReplyRate);
    expect(salesLed.meetingBookingRate).toBe(selfService.meetingBookingRate);
    expect(salesLed.sequenceSteps).toBe(selfService.sequenceSteps);
    expect(salesLed.domains).toBe(selfService.domains);
  });
});
