// Calculator type definitions (V2 simplified).
// Source of truth for the shape of every input the visitor controls and every
// output the calculator computes. The V2 spec is captured in the
// "V2 simplification" section of docs/m3-requirements-stack.md.

/**
 * Sequence steps double as a GTM strategy choice. Each value implies a TAM
 * orientation (broad TAM with one shot, narrow TAM with three touches).
 */
export type SequenceSteps = 1 | 2 | 3;

/**
 * Status buckets used to label slider values inline as the visitor drags.
 * Order matters: status is computed by finding the highest threshold the
 * value crosses.
 */
export type BenchmarkStatus = "poor" | "average" | "healthy" | "benchmark";

/**
 * Every value the visitor can change in the calculator UI.
 * Percentages are stored as 0 to 100 (not 0 to 1) to match the slider
 * semantics.
 */
export interface CalculatorInputs {
  // Strategy
  sequenceSteps: SequenceSteps;

  // Volume
  leadsReached: number; // 0 to 30,000

  // Conversion rates (percentages 0 to 100, except reply which caps at 5)
  openRate: number;
  replyRate: number;
  positiveReplyRate: number;
  meetingBookedRate: number;
  closeRate: number;

  // Deal economics
  dealValue: number; // USD per closed deal
}

/**
 * Every number the calculator displays.
 */
export interface CalculatorOutputs {
  // Volume
  emailsSentPerMonth: number;
  contactsReached: number;

  // Funnel stages (per month)
  opens: number;
  replies: number;
  positiveReplies: number;
  meetings: number;
  deals: number;

  // Revenue
  revenuePerMonth: number;
  revenuePerYear: number;
}
