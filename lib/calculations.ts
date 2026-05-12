// Pure ROI math (V2 simplified). No React, no UI, no side effects.
// Inputs in, numbers out. Tests in tests/calculations.test.ts assert the
// documented outputs in docs/m4-verification-scenarios.md.

import { MONTHLY_EMAIL_CAPACITY } from "./defaults";
import type { CalculatorInputs, CalculatorOutputs } from "./types";

/**
 * Compute every output the calculator displays from a complete input set.
 *
 * V2 model:
 *   contacts = leadsReached
 *   emailsSent = leadsReached × sequenceSteps (capped at MONTHLY_EMAIL_CAPACITY)
 *   opens = contacts × openRate/100
 *   replies = contacts × replyRate/100
 *   positiveReplies = replies × positiveReplyRate/100
 *   meetings = positiveReplies × meetingBookedRate/100
 *   deals = meetings × closeRate/100
 *   revenuePerMonth = deals × dealValue
 *   revenuePerYear = revenuePerMonth × 12
 */
export function calculateRoi(inputs: CalculatorInputs): CalculatorOutputs {
  const contactsReached = Math.max(0, inputs.leadsReached);

  const rawEmailsSent = contactsReached * inputs.sequenceSteps;
  const emailsSentPerMonth = Math.min(rawEmailsSent, MONTHLY_EMAIL_CAPACITY);

  const opens = contactsReached * (inputs.openRate / 100);
  const replies = contactsReached * (inputs.replyRate / 100);
  const positiveReplies = replies * (inputs.positiveReplyRate / 100);
  const meetings = positiveReplies * (inputs.meetingBookedRate / 100);
  const deals = meetings * (inputs.closeRate / 100);

  const revenuePerMonth = deals * inputs.dealValue;
  const revenuePerYear = revenuePerMonth * 12;

  return {
    emailsSentPerMonth,
    contactsReached,
    opens,
    replies,
    positiveReplies,
    meetings,
    deals,
    revenuePerMonth,
    revenuePerYear,
  };
}
