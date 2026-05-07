"use client";

import { useTween } from "@/hooks/useTween";

interface TweenedNumberProps {
  /** Target value to display. The component animates from the previous value. */
  value: number;
  /** Function that turns the in-flight numeric value into a display string. */
  format: (n: number) => string;
  /** Tween duration in milliseconds. Default 300, M3 range 250 to 400. */
  duration?: number;
}

/**
 * Renders a number that smoothly counts up or down whenever the value prop
 * changes. Used for headline ROI multiple, total revenue, and other key
 * outputs that benefit from feeling alive.
 */
export function TweenedNumber({ value, format, duration }: TweenedNumberProps) {
  const tweened = useTween(value, duration);
  return <>{format(tweened)}</>;
}
