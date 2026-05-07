import { formatInteger, formatPercent } from "@/lib/utils";

interface FunnelStage {
  label: string;
  value: number;
  conversionFromPrevious?: {
    rate: number;
    fromLabel: string;
  };
}

interface FunnelVizProps {
  contactsReached: number;
  opens: number;
  replies: number;
  positiveReplies: number;
  meetings: number;
  deals: number;
  monthlySendingCapacity: number;
  rates: {
    open: number;
    reply: number;
    positive: number;
    meeting: number;
    close: number;
  };
}

/**
 * Vertical bar funnel showing every stage with bar width proportional to volume
 * relative to the top stage. Conversion percentages between stages, in mono.
 *
 * On first paint, stages cascade in with a 60ms stagger via CSS animation
 * (no React state, so the animation only plays on mount; subsequent input
 * changes tween the bar width via the existing CSS transition).
 */
export function FunnelViz(props: FunnelVizProps) {
  const stages: FunnelStage[] = [
    { label: "Contacts reached", value: props.contactsReached },
    {
      label: "Opens",
      value: props.opens,
      conversionFromPrevious: { rate: props.rates.open, fromLabel: "open" },
    },
    {
      label: "Replies",
      value: props.replies,
      conversionFromPrevious: { rate: props.rates.reply, fromLabel: "reply" },
    },
    {
      label: "Positive replies",
      value: props.positiveReplies,
      conversionFromPrevious: { rate: props.rates.positive, fromLabel: "positive" },
    },
    {
      label: "Meetings booked",
      value: props.meetings,
      conversionFromPrevious: { rate: props.rates.meeting, fromLabel: "book a meeting" },
    },
    {
      label: "Deals closed",
      value: props.deals,
      conversionFromPrevious: { rate: props.rates.close, fromLabel: "close" },
    },
  ];

  const maxValue = stages[0].value || 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_3px_0_hsl(220_43%_11%_/_0.06),_0_4px_16px_-4px_hsl(var(--brand-primary)/0.08)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Funnel
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Per month, live
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Capacity
          </p>
          <p className="mt-1 font-mono text-sm tabular-nums text-foreground">
            {formatInteger(props.monthlySendingCapacity)}
            <span className="ml-1 text-muted-foreground">emails/mo</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage, index) => {
          const widthPercent = Math.max(2, (stage.value / maxValue) * 100);
          return (
            <div
              key={stage.label}
              className="funnel-stage space-y-1.5"
              style={
                {
                  "--cascade-delay": `${index * 60}ms`,
                } as React.CSSProperties
              }
            >
              {stage.conversionFromPrevious && (
                <div className="flex items-center gap-2 pl-1 text-xs text-muted-foreground">
                  <span className="font-mono tabular-nums">
                    {formatPercent(stage.conversionFromPrevious.rate)}
                  </span>
                  <span>{stage.conversionFromPrevious.fromLabel}</span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div
                    className="h-12 rounded-md transition-[width,opacity] duration-500 ease-out"
                    style={{
                      width: `${widthPercent}%`,
                      background:
                        "linear-gradient(90deg, hsl(var(--brand-primary)) 0%, hsl(var(--brand-secondary)) 100%)",
                      opacity: 0.92 - index * 0.05,
                    }}
                  />
                </div>
                <div className="w-32 text-right">
                  <div className="font-mono text-base font-medium tabular-nums text-foreground">
                    {formatInteger(stage.value)}
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

      {/* One-shot cascade animation on mount; runs once because CSS animations
          only fire on initial paint when the element is added to the DOM. */}
      <style>{`
        .funnel-stage {
          opacity: 0;
          animation: funnel-cascade 400ms cubic-bezier(0.16, 1, 0.3, 1) var(--cascade-delay) forwards;
        }
        @keyframes funnel-cascade {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .funnel-stage {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
