import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes intelligently. Used by every UI component.
 * Resolves conflicting utilities (e.g., `px-2 px-4` becomes `px-4`).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a USD currency string.
 *  - Above 1,000,000: "$1.2M"
 *  - Above 1,000: "$45,000"
 *  - Below: "$200"
 */
export function formatCurrency(value: number, opts?: { compact?: boolean }): string {
  if (!Number.isFinite(value)) return "$0";

  if (opts?.compact && Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (opts?.compact && Math.abs(value) >= 10_000) {
    return `$${Math.round(value / 1_000)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a number as a thousands separated integer.
 */
export function formatInteger(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

/**
 * Format a number as a percent (input is 0 to 100, output "55%").
 */
export function formatPercent(value: number, opts?: { decimals?: number }): string {
  if (!Number.isFinite(value)) return "0%";
  const decimals = opts?.decimals ?? 0;
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format an ROI multiple. Above 10×, no decimals. Below, one decimal.
 */
export function formatMultiple(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0×";
  if (value >= 10) return `${Math.round(value)}×`;
  return `${value.toFixed(1)}×`;
}

/**
 * Format a deal count with precision that scales with size. Big deal
 * values mean low deal counts are still meaningful (a $200k deal once
 * every four months is a real number, not a rounding error), so we keep
 * two decimals under one deal, one decimal up to ten, and integers above.
 *   value < 1   → "0.25", "0.50", "0.08"
 *   1 ≤ value < 10 → "1.5", "6.0"
 *   value ≥ 10  → "14", "145"
 */
export function formatDeals(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  if (value >= 10) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(
      Math.round(value)
    );
  }
  if (value >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

/**
 * For sub-one deal counts, return a human-readable frequency caption
 * ("≈ 1 deal every 4 months"). Returns null when the primary value is
 * one or more, so callers can render the caption conditionally.
 */
export function dealFrequencyLabel(value: number): string | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  if (value >= 1) return null;
  const months = Math.round(1 / value);
  if (months <= 1) return null;
  return `≈ 1 deal every ${months} months`;
}
