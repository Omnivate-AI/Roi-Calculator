"use client";

import { STRATEGY_BY_SEQUENCE } from "@/lib/defaults";
import type { SequenceSteps } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StrategyToggleProps {
  value: SequenceSteps;
  onValueChange: (value: SequenceSteps) => void;
}

/**
 * Three-card selector for sequence strategy. More compact V3 styling:
 * tighter padding, smaller text, but the same TAM framing.
 */
export function StrategyToggle({ value, onValueChange }: StrategyToggleProps) {
  const options: SequenceSteps[] = [1, 2, 3];

  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => {
        const strategy = STRATEGY_BY_SEQUENCE[option];
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onValueChange(option)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              isActive
                ? "border-brand-primary bg-brand-primary/5"
                : "border-border bg-card hover:border-brand-primary/40 hover:bg-brand-primary/[0.02]"
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={cn(
                  "text-sm font-semibold",
                  isActive ? "text-brand-primary" : "text-foreground"
                )}
              >
                {strategy.label}
              </span>
              {isActive && (
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
              )}
            </div>
            <p
              className={cn(
                "mt-1 text-[10px] font-medium uppercase tracking-[0.16em]",
                isActive ? "text-brand-primary/80" : "text-muted-foreground"
              )}
            >
              {strategy.tam}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
              {strategy.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
