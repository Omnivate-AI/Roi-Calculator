"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TimeHorizon } from "@/lib/types";

interface TimeHorizonToggleProps {
  value: TimeHorizon;
  onValueChange: (value: TimeHorizon) => void;
}

/**
 * 6 / 12 / 24 month time horizon toggle. Affects only display of total revenue
 * and cost; underlying math is always annualised.
 */
export function TimeHorizonToggle({ value, onValueChange }: TimeHorizonToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={String(value)}
      onValueChange={(next) => {
        const parsed = Number(next);
        if (parsed === 6 || parsed === 12 || parsed === 24) {
          onValueChange(parsed);
        }
      }}
      className="inline-flex gap-1 rounded-full border border-border bg-card p-1"
    >
      {[6, 12, 24].map((months) => (
        <ToggleGroupItem
          key={months}
          value={String(months)}
          className="data-[state=on]:bg-brand-primary data-[state=on]:text-primary-foreground rounded-full px-4 py-1.5 text-xs font-medium text-foreground/70 transition-colors hover:text-foreground"
        >
          {months}mo
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
