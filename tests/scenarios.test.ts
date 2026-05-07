// Verification scenarios for docs/m4-verification-scenarios.md.
// These tests assert the documented expected outputs match what
// calculateRoi actually produces, so the verification doc and the live
// calculator stay synchronized. If anyone tweaks the math in
// lib/calculations.ts and breaks one of these, the doc is now wrong and
// they should update it.

import { describe, expect, it } from "vitest";
import { calculateRoi } from "@/lib/calculations";
import { DEFAULT_INPUTS, getDefaultsForMotion } from "@/lib/defaults";

describe("Verification scenario A: M1 default (sales-led mid market B2B SaaS)", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("monthly capacity is 19,800", () => {
    expect(out.monthlySendingCapacity).toBe(19_800);
  });
  it("contacts reached 4,950", () => {
    expect(out.contactsReachedPerMonth).toBe(4_950);
  });
  it("deals per month 9.3555", () => {
    expect(out.dealsPerMonth).toBeCloseTo(9.3555, 4);
  });
  it("direct revenue ~$2.81M", () => {
    expect(out.directRevenueAnnualised).toBeCloseTo(2_806_650, 0);
  });
  it("hidden revenue ~$2.23M", () => {
    expect(out.hiddenRevenueAnnualised).toBeCloseTo(2_227_500, 0);
  });
  it("halo revenue ~$403k", () => {
    expect(out.haloRevenueAnnualised).toBeCloseTo(402_732, 0);
  });
  it("total revenue ~$5.44M", () => {
    expect(out.totalRevenueAnnualised).toBeCloseTo(5_436_882, 0);
  });
  it("ROI multiple ~113×", () => {
    expect(out.roiMultiple).toBeCloseTo(113.27, 1);
  });
});

describe("Verification scenario B: Conservative sales-led B2B SaaS", () => {
  const inputs = {
    ...getDefaultsForMotion("sales_led"),
    domains: 8,
    replyRate: 3,
    dealValue: 20_000,
  };
  const out = calculateRoi(inputs);

  it("monthly capacity is 15,840", () => {
    expect(out.monthlySendingCapacity).toBe(15_840);
  });
  it("contacts reached 3,960", () => {
    expect(out.contactsReachedPerMonth).toBe(3_960);
  });
  it("deals per month ~4.49", () => {
    expect(out.dealsPerMonth).toBeCloseTo(4.49064, 4);
  });
  it("direct revenue ~$1.08M", () => {
    expect(out.directRevenueAnnualised).toBeCloseTo(1_077_754, 0);
  });
  it("hidden revenue ~$1.48M", () => {
    expect(out.hiddenRevenueAnnualised).toBeCloseTo(1_482_624, 0);
  });
  it("total revenue ~$2.77M", () => {
    expect(out.totalRevenueAnnualised).toBeCloseTo(2_765_208, 0);
  });
  it("ROI multiple ~57.6×", () => {
    expect(out.roiMultiple).toBeCloseTo(57.6, 1);
  });
});

describe("Verification scenario C: Aggressive enterprise sales-led", () => {
  const inputs = {
    ...getDefaultsForMotion("sales_led"),
    domains: 20,
    openRate: 60,
    replyRate: 6,
    positiveReplyRate: 35,
    meetingBookingRate: 75,
    closeRate: 22,
    dealValue: 50_000,
  };
  const out = calculateRoi(inputs);

  it("monthly capacity is 39,600", () => {
    expect(out.monthlySendingCapacity).toBe(39_600);
  });
  it("contacts reached 9,900", () => {
    expect(out.contactsReachedPerMonth).toBe(9_900);
  });
  it("deals per month ~34.30", () => {
    expect(out.dealsPerMonth).toBeCloseTo(34.3035, 4);
  });
  it("direct revenue ~$20.58M", () => {
    expect(out.directRevenueAnnualised).toBeCloseTo(20_582_100, 0);
  });
  it("hidden revenue ~$9.62M", () => {
    expect(out.hiddenRevenueAnnualised).toBeCloseTo(9_622_800, 0);
  });
  it("total revenue ~$32.6M", () => {
    expect(out.totalRevenueAnnualised).toBeCloseTo(32_621_292, 0);
  });
  it("ROI multiple ~679×", () => {
    expect(out.roiMultiple).toBeCloseTo(679.6, 1);
  });
});

describe("Verification scenario D: Self-service SaaS PLG", () => {
  const inputs = {
    ...getDefaultsForMotion("self_service"),
    domains: 5,
    mailboxesPerDomain: 2,
    sequenceSteps: 3,
    openRate: 50,
    replyRate: 4,
    positiveReplyRate: 25,
    meetingBookingRate: 60,
    monthlySubscriptionValue: 300,
    monthlyChurnRate: 6,
  };
  const out = calculateRoi(inputs);

  it("monthly capacity is 6,600", () => {
    expect(out.monthlySendingCapacity).toBe(6_600);
  });
  it("contacts reached ~2,200", () => {
    expect(out.contactsReachedPerMonth).toBe(2_200);
  });
  it("deals per month 3.96", () => {
    expect(out.dealsPerMonth).toBeCloseTo(3.96, 2);
  });
  it("average lifetime ~16.67 months", () => {
    expect(out.averageLifetimeMonths).toBeCloseTo(16.667, 2);
  });
  it("LTV ~$5,000", () => {
    expect(out.customerLtv).toBeCloseTo(5_000, 0);
  });
  it("MRR added annualised ~$14.3k", () => {
    expect(out.mrrAddedAnnualised).toBeCloseTo(14_256, 0);
  });
  it("direct revenue (cohort LTV) ~$237.6k", () => {
    expect(out.directRevenueAnnualised).toBeCloseTo(237_600, 0);
  });
  it("hidden revenue ~$182.2k", () => {
    expect(out.hiddenRevenueAnnualised).toBeCloseTo(182_160, 0);
  });
  it("total revenue ~$453k", () => {
    expect(out.totalRevenueAnnualised).toBeCloseTo(453_341, 0);
  });
  it("ROI multiple ~9.4×", () => {
    expect(out.roiMultiple).toBeCloseTo(9.44, 1);
  });
});
