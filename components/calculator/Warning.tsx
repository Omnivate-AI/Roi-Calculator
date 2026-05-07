import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface WarningProps {
  children: ReactNode;
}

/**
 * Soft amber warning callout for edge cases (zero deals at this close rate,
 * 100 percent churn making LTV one month, deal value too small to justify
 * outbound, etc.). Inline within input groups to give the warning context.
 */
export function Warning({ children }: WarningProps) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-xs leading-relaxed text-foreground/80">
      <AlertTriangle
        className="mt-0.5 h-3.5 w-3.5 shrink-0"
        style={{ color: "hsl(var(--warning))" }}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  );
}
