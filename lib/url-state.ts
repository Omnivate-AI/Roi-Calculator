// Serialize and deserialize CalculatorInputs to and from URL search params.
// V2 simplified set: sequenceSteps, leadsReached, openRate, replyRate,
// positiveReplyRate, meetingBookedRate, closeRate, dealValue.

import { DEFAULT_INPUTS, SLIDER_LIMITS } from "./defaults";
import type { CalculatorInputs, SequenceSteps } from "./types";

/**
 * Convert a full inputs object into a URLSearchParams string suitable for
 * appending to the calculator URL. Skips fields that match the default to
 * keep shared URLs concise.
 */
export function inputsToSearchParams(inputs: CalculatorInputs): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(inputs)) {
    const defaultValue = DEFAULT_INPUTS[key as keyof CalculatorInputs];
    if (value === defaultValue) continue;
    params.set(key, String(value));
  }
  return params;
}

/**
 * Parse URL search params into a CalculatorInputs object. Unknown keys are
 * ignored. Out of range or invalid values fall back to the default.
 */
export function searchParamsToInputs(
  params: URLSearchParams
): CalculatorInputs {
  return {
    sequenceSteps: parseSequenceSteps(params.get("sequenceSteps")),
    leadsReached: parseNumber(
      params.get("leadsReached"),
      DEFAULT_INPUTS.leadsReached,
      SLIDER_LIMITS.leadsReached.min,
      SLIDER_LIMITS.leadsReached.max
    ),
    openRate: parseNumber(
      params.get("openRate"),
      DEFAULT_INPUTS.openRate,
      SLIDER_LIMITS.openRate.min,
      SLIDER_LIMITS.openRate.max
    ),
    replyRate: parseNumber(
      params.get("replyRate"),
      DEFAULT_INPUTS.replyRate,
      SLIDER_LIMITS.replyRate.min,
      SLIDER_LIMITS.replyRate.max
    ),
    positiveReplyRate: parseNumber(
      params.get("positiveReplyRate"),
      DEFAULT_INPUTS.positiveReplyRate,
      SLIDER_LIMITS.positiveReplyRate.min,
      SLIDER_LIMITS.positiveReplyRate.max
    ),
    meetingBookedRate: parseNumber(
      params.get("meetingBookedRate"),
      DEFAULT_INPUTS.meetingBookedRate,
      SLIDER_LIMITS.meetingBookedRate.min,
      SLIDER_LIMITS.meetingBookedRate.max
    ),
    closeRate: parseNumber(
      params.get("closeRate"),
      DEFAULT_INPUTS.closeRate,
      SLIDER_LIMITS.closeRate.min,
      SLIDER_LIMITS.closeRate.max
    ),
    dealValue: parseNumber(
      params.get("dealValue"),
      DEFAULT_INPUTS.dealValue,
      SLIDER_LIMITS.dealValue.min,
      SLIDER_LIMITS.dealValue.max
    ),
  };
}

/**
 * Convenience: read inputs from window.location.search. Safe to call only on
 * the client. Returns DEFAULT_INPUTS if there is no window or no params.
 */
export function readInputsFromUrl(): CalculatorInputs {
  if (typeof window === "undefined") return DEFAULT_INPUTS;
  const params = new URLSearchParams(window.location.search);
  if ([...params.keys()].length === 0) return DEFAULT_INPUTS;
  return searchParamsToInputs(params);
}

/**
 * Replace the current URL with one encoding the given inputs. Does not push
 * a new history entry; uses replaceState so the back button is not cluttered.
 */
export function writeInputsToUrl(inputs: CalculatorInputs): void {
  if (typeof window === "undefined") return;
  const params = inputsToSearchParams(inputs);
  const search = params.toString();
  const url =
    search.length > 0
      ? `${window.location.pathname}?${search}`
      : window.location.pathname;
  window.history.replaceState(null, "", url);
}

// ---------- helpers ----------

function parseNumber(
  raw: string | null,
  fallback: number,
  min: number,
  max: number
): number {
  if (raw === null) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function parseSequenceSteps(raw: string | null): SequenceSteps {
  if (raw === "1") return 1;
  if (raw === "3") return 3;
  return 2;
}
