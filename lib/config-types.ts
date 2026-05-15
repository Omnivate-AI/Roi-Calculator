// Shared calculator config types. Safe to import from both server and
// client code (no server-only imports).

import {
  BENCHMARK_THRESHOLDS,
  DEFAULT_INPUTS,
  LEADS_BY_SEQUENCE,
  MONTHLY_EMAIL_CAPACITY,
  SLIDER_ANCHORS,
  SLIDER_EXPLAINERS,
  SLIDER_LIMITS,
  STATUS_CONTEXT,
  STRATEGY_BY_SEQUENCE,
} from "./defaults";
import type { BenchmarkStatus, CalculatorInputs } from "./types";

/** Slider field keys. */
export type SliderFieldKey =
  | "openRate"
  | "replyRate"
  | "positiveReplyRate"
  | "meetingBookedRate"
  | "closeRate"
  | "dealValue";

/** Sequence step keys, stringified for JSONB-compatible object keys. */
export type SequenceStepKey = "1" | "2" | "3";

export interface SliderLimits {
  min: number;
  max: number;
  step: number;
}

export interface BenchmarkThreshold {
  status: BenchmarkStatus;
  threshold: number;
  tick?: string;
}

export interface SliderAnchors {
  left: string;
  right: string;
}

export interface StatusContext {
  poor: string;
  average: string;
  good: string;
}

export interface SliderExplainer {
  title: string;
  body: string;
}

export interface StrategyDefinition {
  label: string;
  tam: string;
  description: string;
}

/**
 * Full configuration payload that lives in the Supabase config row.
 * Mirrors lib/defaults.ts. Admin page edits this; calculator reads it.
 * All nested fields are mutable so the admin form can write to them.
 */
export interface CalculatorConfig {
  monthlyEmailCapacity: number;
  leadsBySequence: Record<SequenceStepKey, number>;
  strategyBySequence: Record<SequenceStepKey, StrategyDefinition>;
  sliderLimits: Record<SliderFieldKey, SliderLimits>;
  benchmarkThresholds: Record<SliderFieldKey, BenchmarkThreshold[]>;
  sliderAnchors: Record<SliderFieldKey, SliderAnchors>;
  statusContext: Record<SliderFieldKey, StatusContext>;
  sliderExplainers: Record<SliderFieldKey, SliderExplainer>;
  channelMixThresholds: { linkedin: number; phone: number };
  defaultInputs: CalculatorInputs;
}

/**
 * Hardcoded fallback config built from the constants in lib/defaults.ts.
 * Used when Supabase is unreachable or the row is missing.
 */
export const FALLBACK_CONFIG: CalculatorConfig = {
  monthlyEmailCapacity: MONTHLY_EMAIL_CAPACITY,
  leadsBySequence: LEADS_BY_SEQUENCE as Record<SequenceStepKey, number>,
  strategyBySequence: STRATEGY_BY_SEQUENCE as Record<SequenceStepKey, StrategyDefinition>,
  sliderLimits: SLIDER_LIMITS as unknown as Record<SliderFieldKey, SliderLimits>,
  benchmarkThresholds: BENCHMARK_THRESHOLDS as Record<SliderFieldKey, BenchmarkThreshold[]>,
  sliderAnchors: SLIDER_ANCHORS as Record<SliderFieldKey, SliderAnchors>,
  statusContext: STATUS_CONTEXT as Record<SliderFieldKey, StatusContext>,
  sliderExplainers: SLIDER_EXPLAINERS as Record<SliderFieldKey, SliderExplainer>,
  channelMixThresholds: { linkedin: 25, phone: 40 },
  defaultInputs: DEFAULT_INPUTS,
};
