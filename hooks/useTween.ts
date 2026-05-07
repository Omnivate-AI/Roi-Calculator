"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Smoothly animate a number from its previous value to a new target whenever
 * the target changes. Uses requestAnimationFrame and an ease-out quartic
 * curve, matching the M3 motion language: numbers tween, layouts do not.
 *
 * Default duration 300ms (within the 250 to 400 millisecond range specified
 * in M3). Pass a different duration for shorter or longer eases.
 *
 * Cancels in flight tweens when the target changes mid animation. Respects
 * prefers-reduced-motion by skipping the easing curve and snapping to the
 * target value on the next frame.
 */
export function useTween(target: number, duration = 300): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    const from = valueRef.current;
    const distance = target - from;
    if (distance === 0) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion) {
      // Snap on next frame rather than synchronously to keep React's
      // effect/commit semantics happy; the visitor sees an instant update.
      rafRef.current = requestAnimationFrame(() => {
        valueRef.current = target;
        setValue(target);
        rafRef.current = null;
      });
      return () => {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      };
    }

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 4); // ease-out quartic
      const next = from + distance * eased;
      valueRef.current = next;
      setValue(next);

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        valueRef.current = target;
        setValue(target);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [target, duration]);

  return value;
}
