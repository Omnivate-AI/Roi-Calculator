"use client";

import { STRATEGY_BY_SEQUENCE, LEADS_BY_SEQUENCE } from "@/lib/defaults";
import type { SequenceSteps } from "@/lib/types";
import { cn, formatInteger } from "@/lib/utils";

interface StrategyToggleProps {
  value: SequenceSteps;
  onValueChange: (value: SequenceSteps) => void;
}

/**
 * Three-card selector for sequence strategy. Each card shows the step
 * count, the TAM framing, the natural lead count for that strategy, and
 * a horizontal reach indicator. Active card uses a gradient background
 * and stronger purple accent. Hover lifts the card subtly.
 */
export function StrategyToggle({ value, onValueChange }: StrategyToggleProps) {
  const options: SequenceSteps[] = [1, 2, 3];
  const maxLeads = LEADS_BY_SEQUENCE[1];

  return (
    <div className="grid grid-cols-3 gap-2.5">
      {options.map((option) => {
        const strategy = STRATEGY_BY_SEQUENCE[option];
        const leads = LEADS_BY_SEQUENCE[option];
        const reachWidth = (leads / maxLeads) * 100;
        const isActive = option === value;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onValueChange(option)}
            className={cn(
              "group relative overflow-hidden rounded-xl border p-3.5 text-left transition-all",
              isActive
                ? "border-brand-primary shadow-[0_8px_20px_-8px_hsl(var(--brand-primary)/0.35)]"
                : "border-border bg-card hover:border-brand-primary/40 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_-4px_hsl(220_43%_11%_/_0.08)]"
            )}
            style={
              isActive
                ? {
                    background:
                      "linear-gradient(135deg, hsl(var(--brand-primary) / 0.08) 0%, hsl(var(--brand-secondary) / 0.04) 100%)",
                  }
                : undefined
            }
          >
            <div className="flex items-baseline justify-between gap-2">
              <span
                className={cn(
                  "text-lg font-bold tracking-tight",
                  isActive ? "text-brand-primary" : "text-foreground"
                )}
              >
                {strategy.label}
              </span>
              {isActive && (
                <span
                  aria-hidden
                  className="inline-flex h-2 w-2 rounded-full bg-brand-primary shadow-[0_0_8px_hsl(var(--brand-primary)/0.6)]"
                />
              )}
            </div>

            <p
              className={cn(
                "mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]",
                isActive ? "text-brand-primary/80" : "text-muted-foreground"
              )}
            >
              {strategy.tam}
            </p>

            <p className="mt-2 font-mono text-xs font-semibold tabular-nums text-foreground">
              {formatInteger(leads)}{" "}
              <span className="font-sans font-normal text-muted-foreground">leads</span>
            </p>

            <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${reachWidth}%`,
                  background: isActive
                    ? "linear-gradient(90deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)"
                    : "hsl(var(--muted-foreground) / 0.3)",
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
