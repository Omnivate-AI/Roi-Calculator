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
  conversion?: { rate: number; from: string };
}

/**
 * Vertical bar funnel. Bar width scales with volume relative to the top
 * stage; conversion percentages between stages appear in muted mono. All
 * counts tween smoothly on input changes.
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
    {
      label: "Opens",
      value: opens,
      conversion: { rate: rates.open, from: "open" },
    },
    {
      label: "Replies",
      value: replies,
      conversion: { rate: rates.reply, from: "reply" },
    },
    {
      label: "Positive replies",
      value: positiveReplies,
      conversion: { rate: rates.positive, from: "positive" },
    },
    {
      label: "Meetings",
      value: meetings,
      conversion: { rate: rates.meeting, from: "book a meeting" },
    },
    {
      label: "Deals closed",
      value: deals,
      conversion: { rate: rates.close, from: "close" },
    },
  ];

  const maxValue = stages[0].value || 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_3px_0_hsl(220_43%_11%_/_0.04)]">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Funnel
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Per month
          </h2>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
          <span className="text-xs text-muted-foreground">Updates live</span>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage, index) => {
          const widthPercent = Math.max(4, (stage.value / maxValue) * 100);
          return (
            <div key={stage.label} className="space-y-1.5">
              {stage.conversion && (
                <div className="pl-1 text-xs text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {formatPercent(stage.conversion.rate)}
                  </span>{" "}
                  {stage.conversion.from}
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div
                    className="h-11 rounded-md transition-[width] duration-500 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      background:
                        "linear-gradient(90deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
                      opacity: 0.92 - index * 0.05,
                    }}
                  />
                </div>
                <div className="w-28 text-right">
                  <div className="font-mono text-base font-semibold tabular-nums text-foreground">
                    <TweenedNumber value={stage.value} format={formatInteger} />
                  </div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
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
