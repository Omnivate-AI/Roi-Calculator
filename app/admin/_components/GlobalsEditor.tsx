"use client";

import type { CalculatorConfig } from "@/lib/config-types";
import { NumberField, Section } from "./fields";

interface GlobalsEditorProps {
  config: CalculatorConfig;
  setConfig: (updater: (draft: CalculatorConfig) => CalculatorConfig) => void;
}

/**
 * Global settings: monthly email sending capacity, channel mix
 * thresholds, and the default sequenceSteps choice. These rarely
 * change but are still editable.
 */
export function GlobalsEditor({ config, setConfig }: GlobalsEditorProps) {
  function patch(updater: (c: CalculatorConfig) => void) {
    setConfig((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
  }

  return (
    <Section title="Global settings" subtitle="Capacity, channel mix, default sequence" defaultOpen>
      <div className="space-y-4">
        <div className="rounded-lg border border-border/60 p-3">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Sending capacity
          </p>
          <NumberField
            label="Monthly email capacity"
            hint="Total cold emails the system can send per month. Drives the leads-reached math for each strategy."
            value={config.monthlyEmailCapacity}
            onChange={(v) =>
              patch((c) => {
                c.monthlyEmailCapacity = v;
              })
            }
            step={1000}
            min={0}
          />
        </div>

        <div className="rounded-lg border border-border/60 p-3">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Channel mix thresholds
          </p>
          <p className="mb-3 text-[11px] text-muted-foreground/80">
            Meeting booked rate at or above each threshold lights up that channel
            in the channel-mix badge.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <NumberField
              label="LinkedIn lights up at"
              value={config.channelMixThresholds.linkedin}
              onChange={(v) =>
                patch((c) => {
                  c.channelMixThresholds.linkedin = v;
                })
              }
              step={5}
              min={0}
              max={100}
              suffix="%"
              span="full"
            />
            <NumberField
              label="Cold calling lights up at"
              value={config.channelMixThresholds.phone}
              onChange={(v) =>
                patch((c) => {
                  c.channelMixThresholds.phone = v;
                })
              }
              step={5}
              min={0}
              max={100}
              suffix="%"
              span="full"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border/60 p-3">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            First-paint defaults
          </p>
          <NumberField
            label="Default sequence steps"
            hint="Which strategy the calculator opens with (1, 2, or 3)."
            value={config.defaultInputs.sequenceSteps}
            onChange={(v) =>
              patch((c) => {
                c.defaultInputs.sequenceSteps = v === 1 || v === 3 ? v : 2;
              })
            }
            step={1}
            min={1}
            max={3}
          />
        </div>
      </div>
    </Section>
  );
}
