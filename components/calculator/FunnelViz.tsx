"use client";

import { Activity } from "lucide-react";
import { formatInteger, formatPercent } from "@/lib/utils";
import { TweenedNumber } from "./TweenedNumber";

interface FunnelVizProps {
  emailsSent: number;
  sequenceSteps: number;
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
  conversion?: { rate?: number; customLabel?: string };
}

/**
 * True funnel visualization with a tapered shape. Stages: emails sent →
 * leads reached → opens → replies → positive → meetings → deals. Bar
 * widths scale relative to emails sent (the largest stage) and centre
 * align so the overall outline reads as a trapezoid.
 */
export function FunnelViz({
  emailsSent,
  sequenceSteps,
  contactsReached,
  opens,
  replies,
  positiveReplies,
  meetings,
  deals,
  rates,
}: FunnelVizProps) {
  const stages: Stage[] = [
    { label: "Emails sent", value: emailsSent },
    {
      label: "Leads reached",
      value: contactsReached,
      conversion: {
        customLabel: `${sequenceSteps} email${sequenceSteps > 1 ? "s" : ""} per lead`,
      },
    },
    { label: "Opens", value: opens, conversion: { rate: rates.open } },
    { label: "Replies", value: replies, conversion: { rate: rates.reply } },
    {
      label: "Positive replies",
      value: positiveReplies,
      conversion: { rate: rates.positive },
    },
    { label: "Meetings", value: meetings, conversion: { rate: rates.meeting } },
    { label: "Deals closed", value: deals, conversion: { rate: rates.close } },
  ];

  const maxValue = stages[0].value || 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_0_hsl(220_43%_11%_/_0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary">
            <Activity className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Funnel
            </p>
            <h2 className="text-sm font-semibold text-foreground">Per month</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-brand-primary" />
          <span className="text-[11px] text-muted-foreground">Live</span>
        </div>
      </div>

      <div className="space-y-2">
        {stages.map((stage, index) => {
          const widthPercent = Math.max(8, (stage.value / maxValue) * 100);
          const opacity = 1 - index * 0.07;
          return (
            <div key={stage.label}>
              {stage.conversion && (
                <div className="flex justify-center text-[10px] text-muted-foreground/80">
                  <span className="font-mono tabular-nums">
                    {stage.conversion.customLabel ??
                      formatPercent(stage.conversion.rate ?? 0)}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex flex-1 justify-center">
                  <div
                    className="h-7 rounded-md shadow-[0_1px_2px_0_hsl(var(--brand-primary)/0.2)] transition-[width] duration-500 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      background:
                        "linear-gradient(135deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
                      opacity,
                    }}
                  />
                </div>
                <div className="w-28 text-right">
                  <div className="font-mono text-sm font-bold tabular-nums text-foreground">
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
