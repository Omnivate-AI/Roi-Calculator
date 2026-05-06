"use client";

import { Slider } from "@/components/ui/slider";
import { InputGroup } from "./InputGroup";

interface SliderInputProps {
  label: string;
  helper?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onValueChange: (value: number) => void;
}

/**
 * Slider with label, helper text, and inline value display.
 * Used for the bulk of calculator inputs (volume, conversion rates, halo rates).
 */
export function SliderInput({
  label,
  helper,
  value,
  min,
  max,
  step = 1,
  unit,
  onValueChange,
}: SliderInputProps) {
  const formatted = unit ? `${formatValue(value, step)}${unit}` : formatValue(value, step);

  return (
    <InputGroup label={label} helper={helper} value={formatted}>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(values) => onValueChange(values[0])}
        className="cursor-pointer"
      />
    </InputGroup>
  );
}

function formatValue(value: number, step: number): string {
  // If step is fractional (e.g., 0.1), preserve one decimal. Otherwise integer.
  if (step < 1) {
    return value.toFixed(1);
  }
  return Math.round(value).toLocaleString("en-US");
}
