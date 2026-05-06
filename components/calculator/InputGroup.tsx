import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputGroupProps {
  label: string;
  helper?: string;
  value?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Standard wrapper for any input. Pairs a label with the value display and
 * optional helper text below.
 */
export function InputGroup({
  label,
  helper,
  value,
  children,
  className,
}: InputGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {value !== undefined && (
          <span className="font-mono text-sm tabular-nums text-foreground/80">
            {value}
          </span>
        )}
      </div>
      {children}
      {helper && (
        <p className="text-xs leading-relaxed text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}
