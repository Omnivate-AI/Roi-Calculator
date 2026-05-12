"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps {
  label: string;
  helper?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  onValueChange: (value: number) => void;
}

/**
 * Numeric input with optional currency prefix and clamping. Used for deal
 * value and any other free-form number the visitor enters.
 */
export function NumberInput({
  label,
  helper,
  value,
  min,
  max,
  step = 1,
  prefix,
  onValueChange,
}: NumberInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isNaN(next)) return;
            onValueChange(clamp(next, min, max));
          }}
          className={cn("font-mono tabular-nums", prefix && "pl-7")}
        />
      </div>
      {helper && (
        <p className="text-xs leading-relaxed text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

function clamp(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}
