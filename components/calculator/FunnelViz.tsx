"use client";

import { formatInteger, formatPercent } from "@/lib/utils";
import { TweenedNumber } from "./TweenedNumber";

interface FunnelVizProps {
  contactsReached: number;
  opens: number;
  replies: number;
  positiveReplies: number;
  meetings: number;
  deals: number;
  rates: {
    open: number;
    reply: number;
    positive: number;
    meeting: number;
    close: number;
  };
}

interface Stage {
  label: string;
  value: number;
  conversion?: { rate: number };
}

/**
 * Compact vertical bar funnel. Bar width scales with volume relative to
 * the top stage. Conversion percentages float between stages in muted mono.
 * All counts tween smoothly on input changes.
 */
export function FunnelViz({
  contactsReached,
  opens,
  replies,
  positiveReplies,
  meetings,
  deals,
  rates,
}: FunnelVizProps) {
  const stages: Stage[] = [
    { label: "Leads reached", value: contactsReached },
    { label: "Opens", value: opens, conversion: { rate: rates.open } },
    { label: "Replies", value: replies, conversion: { rate: rates.reply } },
    { label: "Positive replies", value: positiveReplies, conversion: { rate: rates.positive } },
    { label: "Meetings", value: meetings, conversion: { rate: rates.meeting } },
    { label: "Deals closed", value: deals, conversion: { rate: rates.close } },
  ];

  const maxValue = stages[0].value || 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Funnel
          </p>
          <h2 className="mt-0.5 text-base font-semibold text-foreground">
            Per month
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
          <span className="text-[11px] text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        {stages.map((stage, index) => {
          const widthPercent = Math.max(5, (stage.value / maxValue) * 100);
          return (
            <div key={stage.label}>
              {stage.conversion && (
                <div className="-mt-0.5 mb-0.5 pl-1 text-[10px] text-muted-foreground/80">
                  <span className="font-mono tabular-nums">
                    {formatPercent(stage.conversion.rate)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div
                    className="h-7 rounded-md transition-[width] duration-500 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      background:
                        "linear-gradient(90deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
                      opacity: 0.92 - index * 0.05,
                    }}
                  />
                </div>
                <div className="w-28 text-right">
                  <div className="font-mono text-sm font-semibold tabular-nums text-foreground">
                    <TweenedNumber value={stage.value} format={formatInteger} />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {stage.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
