// Calculator type definitions (V5 simplified).

export type SequenceSteps = 1 | 2 | 3;

/**
 * Three-band status used to grade slider values. Red, amber, green only.
 * Brand purple is reserved for interactive surfaces, never for status.
 */
export type BenchmarkStatus = "poor" | "average" | "good";

export interface CalculatorInputs {
  sequenceSteps: SequenceSteps;
  leadsReached: number; // derived from sequence steps; no direct slider
  openRate: number;
  replyRate: number;
  positiveReplyRate: number;
  meetingBookedRate: number; // 0 to 50, not 0 to 100
  closeRate: number;
  dealValue: number;
}

export interface CalculatorOutputs {
  emailsSentPerMonth: number;
  contactsReached: number;
  opens: number;
  replies: number;
  positiveReplies: number;
  meetings: number;
  deals: number;
  revenuePerMonth: number;
  revenuePerYear: number;
}
