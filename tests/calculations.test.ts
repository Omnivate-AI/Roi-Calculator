// Unit tests for lib/calculations.ts (V2 simplified).
// Asserts the math behaves correctly for every layer of the funnel and for
// the edge cases enumerated in M3.

import { describe, expect, it } from "vitest";
import { calculateRoi } from "@/lib/calculations";
import {
  DEFAULT_INPUTS,
  LEADS_BY_SEQUENCE,
  MONTHLY_EMAIL_CAPACITY,
  statusFor,
} from "@/lib/defaults";
import type { CalculatorInputs } from "@/lib/types";

// --------------------------------------------------------------------------
// Volume
// --------------------------------------------------------------------------

describe("Volume", () => {
  it("contacts reached equals the leadsReached input", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, leadsReached: 8_000 });
    expect(out.contactsReached).toBe(8_000);
  });

  it("emails sent equals leads × sequence steps", () => {
    const out = calculateRoi({
      ...DEFAULT_INPUTS,
      sequenceSteps: 3,
      leadsReached: 5_000,
    });
    expect(out.emailsSentPerMonth).toBe(15_000);
  });

  it("emails sent is capped at monthly capacity", () => {
    const out = calculateRoi({
      ...DEFAULT_INPUTS,
      sequenceSteps: 3,
      leadsReached: 30_000,
    });
    expect(out.emailsSentPerMonth).toBe(MONTHLY_EMAIL_CAPACITY);
  });

  it("zero leads produces zero everywhere", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, leadsReached: 0 });
    expect(out.contactsReached).toBe(0);
    expect(out.emailsSentPerMonth).toBe(0);
    expect(out.deals).toBe(0);
    expect(out.revenuePerYear).toBe(0);
  });
});

// --------------------------------------------------------------------------
// Funnel
// --------------------------------------------------------------------------

describe("Funnel with default inputs", () => {
  const out = calculateRoi(DEFAULT_INPUTS);

  it("contacts reached 12,000", () => {
    expect(out.contactsReached).toBe(12_000);
  });

  it("emails sent 24,000 (capacity)", () => {
    expect(out.emailsSentPerMonth).toBe(24_000);
  });

  it("opens = contacts × open rate (12,000 × 0.70)", () => {
    expect(out.opens).toBeCloseTo(8_400, 5);
  });

  it("replies = contacts × reply rate (12,000 × 0.03)", () => {
    expect(out.replies).toBeCloseTo(360, 5);
  });

  it("positive replies = replies × positive rate (360 × 0.30)", () => {
    expect(out.positiveReplies).toBeCloseTo(108, 5);
  });

  it("meetings = positive × meeting booked (108 × 0.50)", () => {
    expect(out.meetings).toBeCloseTo(54, 5);
  });

  it("deals = meetings × close rate (54 × 0.20)", () => {
    expect(out.deals).toBeCloseTo(10.8, 5);
  });

  it("revenue per month = deals × deal value (10.8 × 25,000)", () => {
    expect(out.revenuePerMonth).toBeCloseTo(270_000, 0);
  });

  it("revenue per year = revenue per month × 12", () => {
    expect(out.revenuePerYear).toBeCloseTo(3_240_000, 0);
  });
});

// --------------------------------------------------------------------------
// Sequence steps map to leads correctly
// --------------------------------------------------------------------------

describe("Sequence step natural lead counts", () => {
  it("1 step natural leads is 24,000", () => {
    expect(LEADS_BY_SEQUENCE[1]).toBe(24_000);
  });

  it("2 steps natural leads is 12,000", () => {
    expect(LEADS_BY_SEQUENCE[2]).toBe(12_000);
  });

  it("3 steps natural leads is 8,000", () => {
    expect(LEADS_BY_SEQUENCE[3]).toBe(8_000);
  });
});

// --------------------------------------------------------------------------
// Edge cases
// --------------------------------------------------------------------------

describe("Edge cases", () => {
  it("zero close rate produces zero deals and zero revenue", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, closeRate: 0 });
    expect(out.deals).toBe(0);
    expect(out.revenuePerYear).toBe(0);
  });

  it("zero reply rate produces zero deals", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, replyRate: 0 });
    expect(out.deals).toBe(0);
  });

  it("maximum reply rate of 5% produces a sensible volume", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, replyRate: 5 });
    expect(out.replies).toBeCloseTo(600, 5);
  });

  it("tiny deal value still computes valid revenue", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, dealValue: 500 });
    expect(out.revenuePerYear).toBeGreaterThan(0);
    expect(out.revenuePerYear).toBeLessThan(100_000);
  });

  it("all conversion rates at zero produce zero deals", () => {
    const dead: CalculatorInputs = {
      ...DEFAULT_INPUTS,
      replyRate: 0,
      positiveReplyRate: 0,
      meetingBookedRate: 0,
      closeRate: 0,
    };
    const out = calculateRoi(dead);
    expect(out.deals).toBe(0);
  });

  it("huge leads number is capped at 30,000 by slider but math still handles it", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, leadsReached: 30_000 });
    expect(out.contactsReached).toBe(30_000);
    expect(out.emailsSentPerMonth).toBe(MONTHLY_EMAIL_CAPACITY);
  });
});

// --------------------------------------------------------------------------
// Status thresholds
// --------------------------------------------------------------------------

describe("Benchmark status thresholds", () => {
  it("open rate 20 is poor", () => {
    expect(statusFor("openRate", 20)).toBe("poor");
  });
  it("open rate 50 is healthy", () => {
    expect(statusFor("openRate", 50)).toBe("healthy");
  });
  it("open rate 75 is benchmark", () => {
    expect(statusFor("openRate", 75)).toBe("benchmark");
  });
  it("reply rate 1 is poor", () => {
    expect(statusFor("replyRate", 1)).toBe("poor");
  });
  it("reply rate 3 is healthy", () => {
    expect(statusFor("replyRate", 3)).toBe("healthy");
  });
  it("reply rate 4.5 is benchmark", () => {
    expect(statusFor("replyRate", 4.5)).toBe("benchmark");
  });
  it("meeting booked rate 30 is average (email only follow up)", () => {
    expect(statusFor("meetingBookedRate", 30)).toBe("average");
  });
  it("meeting booked rate 60 is healthy (email + LinkedIn)", () => {
    expect(statusFor("meetingBookedRate", 60)).toBe("healthy");
  });
  it("meeting booked rate 80 is benchmark (email + LinkedIn + calling)", () => {
    expect(statusFor("meetingBookedRate", 80)).toBe("benchmark");
  });
});
