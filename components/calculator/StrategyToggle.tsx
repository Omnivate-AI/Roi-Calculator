"use client";

import { STRATEGY_BY_SEQUENCE } from "@/lib/defaults";
import type { SequenceSteps } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StrategyToggleProps {
  value: SequenceSteps;
  onValueChange: (value: SequenceSteps) => void;
}

/**
 * Three card selector for sequence steps. Each card pairs the step count
 * with the implied TAM strategy: one step means broad reach, three means
 * deep cultivation of a small list.
 */
export function StrategyToggle({ value, onValueChange }: StrategyToggleProps) {
  const options: SequenceSteps[] = [1, 2, 3];

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-foreground">
          Sequence strategy
        </label>
        <span className="text-xs text-muted-foreground">
          Sets unique leads reached
        </span>
      </div>

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
                    "text-base font-semibold",
                    isActive ? "text-brand-primary" : "text-foreground"
                  )}
                >
                  {strategy.label}
                </span>
                {isActive && (
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-brand-primary"
                  />
                )}
              </div>
              <p
                className={cn(
                  "mt-1 text-xs font-medium uppercase tracking-[0.16em]",
                  isActive ? "text-brand-primary/80" : "text-muted-foreground"
                )}
              >
                {strategy.tam}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {strategy.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
