// Unit tests for lib/calculations.ts (V5 simplified).
// Asserts the math behaves correctly for every layer of the funnel and for
// the new V5 thresholds (three statuses, meeting booked capped at 50).

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
// Funnel with V5 defaults
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

  it("meetings = positive × meeting booked (108 × 0.30)", () => {
    // V5 default meeting booked = 30 (down from 50 in V2-V4)
    expect(out.meetings).toBeCloseTo(32.4, 5);
  });

  it("deals = meetings × close rate (32.4 × 0.20)", () => {
    expect(out.deals).toBeCloseTo(6.48, 5);
  });

  it("revenue per month = deals × deal value (6.48 × 25,000)", () => {
    expect(out.revenuePerMonth).toBeCloseTo(162_000, 0);
  });

  it("revenue per year = revenue per month × 12", () => {
    expect(out.revenuePerYear).toBeCloseTo(1_944_000, 0);
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

  it("max reply rate of 5% produces a sensible volume", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, replyRate: 5 });
    expect(out.replies).toBeCloseTo(600, 5);
  });

  it("meeting booked at the new 50% cap works", () => {
    const out = calculateRoi({ ...DEFAULT_INPUTS, meetingBookedRate: 50 });
    expect(out.meetings).toBeCloseTo(54, 5); // 108 × 0.50
  });

  it("all conversion rates at zero produce zero deals", () => {
    const dead: CalculatorInputs = {
      ...DEFAULT_INPUTS,
      replyRate: 0,
      positiveReplyRate: 0,
      meetingBookedRate: 0,
      closeRate: 0,
    };
    expect(calculateRoi(dead).deals).toBe(0);
  });
});

// --------------------------------------------------------------------------
// V5 status thresholds (poor / average / good)
// --------------------------------------------------------------------------

describe("V5 status thresholds", () => {
  // Open rate: 0 poor, 30 average, 50 good
  it("open rate 20 is poor", () => {
    expect(statusFor("openRate", 20)).toBe("poor");
  });
  it("open rate 40 is average", () => {
    expect(statusFor("openRate", 40)).toBe("average");
  });
  it("open rate 70 is good", () => {
    expect(statusFor("openRate", 70)).toBe("good");
  });

  // Reply rate: 0 poor, 1.5 average, 2.5 good
  it("reply rate 1 is poor", () => {
    expect(statusFor("replyRate", 1)).toBe("poor");
  });
  it("reply rate 2 is average", () => {
    expect(statusFor("replyRate", 2)).toBe("average");
  });
  it("reply rate 3 is good", () => {
    expect(statusFor("replyRate", 3)).toBe("good");
  });

  // Meeting booked: 0 poor, 10 average, 25 good (max 50)
  it("meeting booked 5 is poor", () => {
    expect(statusFor("meetingBookedRate", 5)).toBe("poor");
  });
  it("meeting booked 15 is average (email only follow up)", () => {
    expect(statusFor("meetingBookedRate", 15)).toBe("average");
  });
  it("meeting booked 30 is good (multi channel)", () => {
    expect(statusFor("meetingBookedRate", 30)).toBe("good");
  });
  it("meeting booked 50 is good (max value still good)", () => {
    expect(statusFor("meetingBookedRate", 50)).toBe("good");
  });

  // Close rate: 0 poor, 10 average, 18 good
  it("close rate 5 is poor", () => {
    expect(statusFor("closeRate", 5)).toBe("poor");
  });
  it("close rate 15 is average", () => {
    expect(statusFor("closeRate", 15)).toBe("average");
  });
  it("close rate 25 is good", () => {
    expect(statusFor("closeRate", 25)).toBe("good");
  });
});
