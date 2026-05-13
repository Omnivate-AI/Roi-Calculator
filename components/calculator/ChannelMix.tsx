import { Mail, Briefcase, Phone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChannelMixProps {
  /** Current meeting booked rate (0-100). */
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
 * Visual representation of the follow-up channel mix implied by the current
 * meeting booked rate. Three pills: Email is always lit, LinkedIn lights up
 * at 50%, cold calling lights up at 75%. Replaces the tiny text tick label
 * with something visitors immediately understand.
 */
export function ChannelMix({ meetingBookedRate }: ChannelMixProps) {
  const next = CHANNELS.find((c) => meetingBookedRate < c.threshold);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        {CHANNELS.map((channel) => {
          const active = meetingBookedRate >= channel.threshold;
          return (
            <div
              key={channel.key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors",
                active
                  ? "border-brand-primary/30 bg-brand-primary/10 text-brand-primary"
                  : "border-border bg-card text-muted-foreground/60"
              )}
            >
              <channel.Icon className="h-3 w-3" strokeWidth={2.5} />
              <span>{channel.label}</span>
              {active && (
                <Check className="h-2.5 w-2.5" strokeWidth={3} />
              )}
            </div>
          );
        })}
      </div>
      {next ? (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Add <span className="font-medium text-foreground">{next.label}</span> to push past{" "}
          {next.threshold}%.
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
