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
