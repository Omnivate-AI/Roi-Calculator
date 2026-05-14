"use client";

import { useState } from "react";
import { HelpCircle, Mail } from "lucide-react";
import { LEADS_BY_SEQUENCE, STRATEGY_BY_SEQUENCE } from "@/lib/defaults";
import type { SequenceSteps } from "@/lib/types";
import { cn, formatInteger } from "@/lib/utils";

interface StrategyToggleProps {
  value: SequenceSteps;
  onValueChange: (value: SequenceSteps) => void;
}

/**
 * Single input box containing a three-segment selector for the sequence
 * strategy. Each segment labels itself "N emails per contact" so a first
 * time visitor immediately understands what the control affects. Beneath
 * each segment label sit the TAM framing and the resulting lead count so
 * the visitor sees the consequence of their choice without having to look
 * at the funnel.
 */
export function StrategyToggle({ value, onValueChange }: StrategyToggleProps) {
  const options: SequenceSteps[] = [1, 2, 3];

  return (
    <div className="group rounded-xl border border-border bg-card p-3.5 transition-all hover:border-brand-primary/30 hover:shadow-[0_8px_24px_-8px_hsl(var(--brand-primary)/0.15)]">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <label className="text-sm font-semibold text-foreground">
            Sequence strategy
          </label>
          <HelpIcon
            title="Sequence strategy"
            body="Pick how many emails each contact receives. More emails per contact narrows reach (fewer unique leads from the same monthly sending capacity) but compounds reply probability. One step is the broadest play; three steps is the deepest."
          />
        </div>
        <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
          {value} {value === 1 ? "email" : "emails"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-muted/30 p-1">
        {options.map((option) => {
          const strategy = STRATEGY_BY_SEQUENCE[option];
          const leads = LEADS_BY_SEQUENCE[option];
          const active = option === value;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onValueChange(option)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-md px-2 py-2 text-center transition-all",
                active
                  ? "shadow-[0_2px_6px_-2px_hsl(var(--brand-primary)/0.4)]"
                  : "hover:bg-background/60"
              )}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
                    }
                  : undefined
              }
            >
              <Mail
                className={cn(
                  "h-3 w-3",
                  active ? "text-primary-foreground" : "text-muted-foreground"
                )}
                strokeWidth={2.5}
              />
              <span
                className={cn(
                  "text-[11px] font-semibold",
                  active ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {option} email{option > 1 ? "s" : ""}
              </span>
              <span
                className={cn(
                  "text-[9px] uppercase tracking-[0.1em]",
                  active
                    ? "text-primary-foreground/85"
                    : "text-muted-foreground"
                )}
              >
                {strategy.tam}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] tabular-nums",
                  active
                    ? "text-primary-foreground/95"
                    : "text-muted-foreground"
                )}
              >
                {formatInteger(leads)} leads
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
        Each contact receives {value} email{value > 1 ? "s" : ""}. Reaches{" "}
        <span className="font-semibold text-foreground">
          {formatInteger(LEADS_BY_SEQUENCE[value])}
        </span>{" "}
        unique leads per month at full capacity.
      </p>
    </div>
  );
}

interface HelpIconProps {
  title: string;
  body: string;
}

function HelpIcon({ title, body }: HelpIconProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-brand-primary focus:outline-none focus:text-brand-primary"
        aria-label={`Explain ${title}`}
        aria-expanded={open}
      >
        <HelpCircle className="h-3.5 w-3.5" strokeWidth={2} />
      </button>
      {open && (
        <span
          role="dialog"
          aria-label={title}
          className="absolute left-0 top-6 z-30 w-72 rounded-lg border border-border bg-popover p-3 text-left shadow-[0_12px_32px_-8px_hsl(220_43%_11%_/_0.2)]"
        >
          <span className="block text-xs font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">
            {body}
          </span>
        </span>
      )}
    </span>
  );
}
