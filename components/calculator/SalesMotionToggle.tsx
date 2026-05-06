"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { SalesMotion } from "@/lib/types";

interface SalesMotionToggleProps {
  value: SalesMotion;
  onValueChange: (value: SalesMotion) => void;
}

/**
 * Two state toggle for sales motion. Pick determines default conversion rates,
 * deal type, and churn assumptions.
 */
export function SalesMotionToggle({ value, onValueChange }: SalesMotionToggleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Sales motion
        </label>
      </div>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => {
          // ToggleGroup can return empty string when user clicks the active item;
          // we ignore that to keep a value selected at all times.
          if (next === "sales_led" || next === "self_service") {
            onValueChange(next);
          }
        }}
        className="w-full grid grid-cols-2 gap-2"
      >
        <ToggleGroupItem
          value="sales_led"
          className="data-[state=on]:bg-brand-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-[0_0_24px_hsl(var(--brand-primary)/0.35)] h-12 border border-border bg-card text-foreground/70 transition-all hover:bg-secondary"
        >
          Sales led
        </ToggleGroupItem>
        <ToggleGroupItem
          value="self_service"
          className="data-[state=on]:bg-brand-primary data-[state=on]:text-primary-foreground data-[state=on]:shadow-[0_0_24px_hsl(var(--brand-primary)/0.35)] h-12 border border-border bg-card text-foreground/70 transition-all hover:bg-secondary"
        >
          Self service SaaS
        </ToggleGroupItem>
      </ToggleGroup>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Pick the closest match to how you sell. Toggling resets motion specific defaults.
      </p>
    </div>
  );
}
