"use client";

import { useState } from "react";
import { HelpCircle, Mail } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import type { SequenceSteps } from "@/lib/types";
import { cn, formatInteger } from "@/lib/utils";
import { useCalculatorConfig } from "./CalculatorConfigContext";

interface StrategyToggleProps {
  value: SequenceSteps;
  onValueChange: (value: SequenceSteps) => void;
}

/**
 * Sequence strategy as a horizontal slider with three landmarks. The
 * slider tracks 0 to 30,000 (leads reached) with step=1 for smooth
 * thumb movement, but snaps to one of the three natural positions
 * (24k → 1 email, 12k → 2 emails, 8k → 3 emails) on every value
 * change. Visually labelled tick marks under the track make the three
 * choices unambiguous.
 */
export function StrategyToggle({ value, onValueChange }: StrategyToggleProps) {
  const config = useCalculatorConfig();
  const options: SequenceSteps[] = [3, 2, 1]; // left to right on the track: small to large TAM

  const landmarks = options.map((steps) => ({
    steps,
    leads: config.leadsBySequence[steps],
    strategy: config.strategyBySequence[steps],
  }));

  const currentLeads = config.leadsBySequence[value];
  const sliderMin = 0;
  const sliderMax = 30_000;

  /**
   * Snap to nearest landmark on every value change so the leads count
   * always corresponds to a real sequence step count.
   */
  function handleSliderChange(values: number[]) {
    const next = values[0];
    let best = landmarks[0];
    for (const landmark of landmarks) {
      if (Math.abs(landmark.leads - next) < Math.abs(best.leads - next)) {
        best = landmark;
      }
    }
    if (best.steps !== value) onValueChange(best.steps);
  }

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

      <div className="relative mt-3 pb-2">
        <Slider
          value={[currentLeads]}
          min={sliderMin}
          max={sliderMax}
          step={1}
          onValueChange={handleSliderChange}
          className="cursor-pointer"
        />
        {/* Tick markers at the three landmark positions */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-2 h-1"
        >
          {landmarks.map((lm) => {
            const percent = ((lm.leads - sliderMin) / (sliderMax - sliderMin)) * 100;
            const active = lm.steps === value;
            return (
              <span
                key={lm.steps}
                className={cn(
                  "absolute h-2 w-px -translate-x-1/2 rounded-full transition-colors",
                  active ? "bg-brand-primary" : "bg-foreground/30"
                )}
                style={{ left: `${percent}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Landmark labels under the track */}
      <div className="relative h-12">
        {landmarks.map((lm) => {
          const percent = ((lm.leads - sliderMin) / (sliderMax - sliderMin)) * 100;
          const active = lm.steps === value;
          return (
            <button
              key={lm.steps}
              type="button"
              onClick={() => onValueChange(lm.steps)}
              className={cn(
                "absolute top-0 -translate-x-1/2 cursor-pointer text-center transition-colors",
                active ? "text-brand-primary" : "text-muted-foreground hover:text-foreground"
              )}
              style={{ left: `${percent}%` }}
            >
              <span
                className={cn(
                  "block font-mono text-[10px] font-semibold tabular-nums",
                  active && "text-brand-primary"
                )}
              >
                {formatInteger(lm.leads)}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.08em]",
                  active && "text-brand-primary"
                )}
              >
                {lm.steps} email{lm.steps > 1 ? "s" : ""}
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-[8px] uppercase tracking-[0.1em]",
                  active ? "text-brand-primary/80" : "text-muted-foreground/70"
                )}
              >
                {lm.strategy.tam}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex items-center gap-1.5 rounded-md bg-brand-primary/[0.04] px-2 py-1.5">
        <Mail className="h-3 w-3 text-brand-primary" strokeWidth={2.5} />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Each contact receives{" "}
          <span className="font-semibold text-foreground">{value}</span> email
          {value > 1 ? "s" : ""}. Reaches{" "}
          <span className="font-semibold text-foreground">
            {formatInteger(currentLeads)}
          </span>{" "}
          unique leads per month at full capacity.
        </p>
      </div>
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
