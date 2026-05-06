"use client";

import { Input } from "@/components/ui/input";
import { InputGroup } from "./InputGroup";
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
 * Numeric input with optional prefix (e.g., "$") and validation.
 * Used for deal value, monthly subscription value, Omnivate fee.
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
    <InputGroup label={label} helper={helper}>
      <div className="relative">
        {prefix && (
          <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground pointer-events-none">
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
          onChange={(e) => {
            const next = Number(e.target.value);
            if (Number.isNaN(next)) return;
            const clamped = clamp(next, min, max);
            onValueChange(clamped);
          }}
          className={cn(
            "font-mono tabular-nums",
            prefix && "pl-7"
          )}
        />
      </div>
    </InputGroup>
  );
}

function clamp(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}
