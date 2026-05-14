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
import type { CalculatorInputs } from "./types";

/**
 * Full configuration payload that lives in the Supabase config row.
 * Mirrors lib/defaults.ts. Admin page edits this; calculator reads it.
 */
export interface CalculatorConfig {
  monthlyEmailCapacity: number;
  leadsBySequence: typeof LEADS_BY_SEQUENCE;
  strategyBySequence: typeof STRATEGY_BY_SEQUENCE;
  sliderLimits: typeof SLIDER_LIMITS;
  benchmarkThresholds: typeof BENCHMARK_THRESHOLDS;
  sliderAnchors: typeof SLIDER_ANCHORS;
  statusContext: typeof STATUS_CONTEXT;
  sliderExplainers: typeof SLIDER_EXPLAINERS;
  channelMixThresholds: { linkedin: number; phone: number };
  defaultInputs: CalculatorInputs;
}

/**
 * Hardcoded fallback config built from the constants in lib/defaults.ts.
 * Used when Supabase is unreachable or the row is missing.
 */
export const FALLBACK_CONFIG: CalculatorConfig = {
  monthlyEmailCapacity: MONTHLY_EMAIL_CAPACITY,
  leadsBySequence: LEADS_BY_SEQUENCE,
  strategyBySequence: STRATEGY_BY_SEQUENCE,
  sliderLimits: SLIDER_LIMITS,
  benchmarkThresholds: BENCHMARK_THRESHOLDS,
  sliderAnchors: SLIDER_ANCHORS,
  statusContext: STATUS_CONTEXT,
  sliderExplainers: SLIDER_EXPLAINERS,
  channelMixThresholds: { linkedin: 25, phone: 40 },
  defaultInputs: DEFAULT_INPUTS,
};
