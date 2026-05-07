// Serialize and deserialize CalculatorInputs to and from URL search params.
// Used to give visitors shareable URLs that round trip the full calculation.

import { DEFAULT_INPUTS } from "./defaults";
import type { CalculatorInputs, DealType, SalesMotion, TimeHorizon } from "./types";

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
 * ignored. Out of range or invalid values fall back to the default for that
 * field.
 */
export function searchParamsToInputs(
  params: URLSearchParams
): CalculatorInputs {
  return {
    salesMotion: parseSalesMotion(params.get("salesMotion")),
    domains: parseNumber(params.get("domains"), DEFAULT_INPUTS.domains, 1, 100),
    mailboxesPerDomain: parseNumber(
      params.get("mailboxesPerDomain"),
      DEFAULT_INPUTS.mailboxesPerDomain,
      1,
      5
    ),
    emailsPerMailboxPerDay: parseNumber(
      params.get("emailsPerMailboxPerDay"),
      DEFAULT_INPUTS.emailsPerMailboxPerDay,
      10,
      50
    ),
    workingDaysPerMonth: parseNumber(
      params.get("workingDaysPerMonth"),
      DEFAULT_INPUTS.workingDaysPerMonth,
      15,
      25
    ),
    sequenceSteps: parseNumber(
      params.get("sequenceSteps"),
      DEFAULT_INPUTS.sequenceSteps,
      1,
      8
    ),
    openRate: parseNumber(params.get("openRate"), DEFAULT_INPUTS.openRate, 0, 100),
    replyRate: parseNumber(params.get("replyRate"), DEFAULT_INPUTS.replyRate, 0, 100),
    positiveReplyRate: parseNumber(
      params.get("positiveReplyRate"),
      DEFAULT_INPUTS.positiveReplyRate,
      0,
      100
    ),
    meetingBookingRate: parseNumber(
      params.get("meetingBookingRate"),
      DEFAULT_INPUTS.meetingBookingRate,
      0,
      100
    ),
    closeRate: parseNumber(params.get("closeRate"), DEFAULT_INPUTS.closeRate, 0, 100),
    dealType: parseDealType(params.get("dealType")),
    dealValue: parseNumber(
      params.get("dealValue"),
      DEFAULT_INPUTS.dealValue,
      100,
      1_000_000
    ),
    monthlySubscriptionValue: parseNumber(
      params.get("monthlySubscriptionValue"),
      DEFAULT_INPUTS.monthlySubscriptionValue,
      10,
      10_000
    ),
    monthlyChurnRate: parseNumber(
      params.get("monthlyChurnRate"),
      DEFAULT_INPUTS.monthlyChurnRate,
      0,
      100
    ),
    hiddenConversionRate: parseNumber(
      params.get("hiddenConversionRate"),
      DEFAULT_INPUTS.hiddenConversionRate,
      0,
      1
    ),
    haloUpliftRate: parseNumber(
      params.get("haloUpliftRate"),
      DEFAULT_INPUTS.haloUpliftRate,
      0,
      20
    ),
    omnivateMonthlyFee: parseNumber(
      params.get("omnivateMonthlyFee"),
      DEFAULT_INPUTS.omnivateMonthlyFee,
      1_000,
      20_000
    ),
    timeHorizonMonths: parseTimeHorizon(params.get("timeHorizonMonths")),
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
  const url = search.length > 0
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

function parseSalesMotion(raw: string | null): SalesMotion {
  return raw === "self_service" ? "self_service" : "sales_led";
}

function parseDealType(raw: string | null): DealType {
  return raw === "subscription" ? "subscription" : "one_time";
}

function parseTimeHorizon(raw: string | null): TimeHorizon {
  if (raw === "6") return 6;
  if (raw === "24") return 24;
  return 12;
}
