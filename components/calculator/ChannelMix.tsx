import { Mail, Briefcase, Phone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelMixProps {
  meetingBookedRate: number;
}

interface Channel {
  key: "email" | "linkedin" | "phone";
  label: string;
  Icon: typeof Mail;
  threshold: number;
}

const CHANNELS: Channel[] = [
  { key: "email", label: "Email", Icon: Mail, threshold: 0 },
  { key: "linkedin", label: "LinkedIn", Icon: Briefcase, threshold: 50 },
  { key: "phone", label: "Cold calling", Icon: Phone, threshold: 75 },
];

/**
 * Visual representation of the follow-up channel mix implied by the
 * current meeting booked rate. Three pills connect into a sequence; each
 * lights up as the rate crosses its threshold. A contextual nudge below
 * tells the visitor what to add next.
 */
export function ChannelMix({ meetingBookedRate }: ChannelMixProps) {
  const next = CHANNELS.find((c) => meetingBookedRate < c.threshold);

  return (
    <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 p-2.5">
      <div className="flex items-center gap-1.5">
        {CHANNELS.map((channel, index) => {
          const active = meetingBookedRate >= channel.threshold;
          return (
            <div key={channel.key} className="flex items-center gap-1.5">
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold transition-all",
                  active
                    ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary shadow-[0_1px_4px_-1px_hsl(var(--brand-primary)/0.3)]"
                    : "border-border bg-background text-muted-foreground/50"
                )}
              >
                <channel.Icon className="h-3 w-3" strokeWidth={2.5} />
                <span>{channel.label}</span>
                {active && (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                )}
              </div>
              {index < CHANNELS.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-2 transition-colors",
                    meetingBookedRate >= CHANNELS[index + 1].threshold
                      ? "bg-brand-primary/40"
                      : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      {next ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Layer in{" "}
          <span className="font-semibold text-foreground">{next.label}</span> to
          push past {next.threshold}%.
        </p>
      ) : (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Multi channel motion fully activated. You are at the top end of what
          cold outbound can produce.
        </p>
      )}
    </div>
  );
}
