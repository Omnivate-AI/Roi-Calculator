"use client";

import type { CalculatorConfig } from "@/lib/config-types";
import { NumberField, Section, TextAreaField, TextField } from "./fields";

type FieldKey =
  | "openRate"
  | "replyRate"
  | "positiveReplyRate"
  | "meetingBookedRate"
  | "closeRate"
  | "dealValue";

interface SliderConfigCardProps {
  field: FieldKey;
  displayName: string;
  config: CalculatorConfig;
  setConfig: (updater: (draft: CalculatorConfig) => CalculatorConfig) => void;
}

/**
 * One collapsible card per slider field. Each card edits everything
 * tied to that field: limits, default, anchors, thresholds, status
 * copy, explainer copy.
 */
export function SliderConfigCard({
  field,
  displayName,
  config,
  setConfig,
}: SliderConfigCardProps) {
  const limits = config.sliderLimits[field];
  const anchors = config.sliderAnchors[field];
  const thresholds = config.benchmarkThresholds[field];
  const context = config.statusContext[field];
  const explainer = config.sliderExplainers[field];
  const defaultValue = config.defaultInputs[field as keyof typeof config.defaultInputs];

  // Indexes into thresholds array
  const avgIdx = thresholds.findIndex((t) => t.status === "average");
  const goodIdx = thresholds.findIndex((t) => t.status === "good");

  function patch(updater: (c: CalculatorConfig) => void) {
    setConfig((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
  }

  return (
    <Section title={displayName} subtitle={field}>
      {/* Status copy — most edited, shown first */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <TextAreaField
            label="Status copy — Low"
            value={context.poor}
            onChange={(v) =>
              patch((c) => {
                c.statusContext[field].poor = v;
              })
            }
            rows={2}
          />
          <TextAreaField
            label="Status copy — Average"
            value={context.average}
            onChange={(v) =>
              patch((c) => {
                c.statusContext[field].average = v;
              })
            }
            rows={2}
          />
          <TextAreaField
            label="Status copy — Good"
            value={context.good}
            onChange={(v) =>
              patch((c) => {
                c.statusContext[field].good = v;
              })
            }
            rows={2}
          />
        </div>

        {/* Help icon popover */}
        <div className="rounded-lg border border-border/60 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Help popover
          </p>
          <div className="space-y-3">
            <TextField
              label="Title"
              value={explainer.title}
              onChange={(v) =>
                patch((c) => {
                  c.sliderExplainers[field].title = v;
                })
              }
            />
            <TextAreaField
              label="Body"
              value={explainer.body}
              onChange={(v) =>
                patch((c) => {
                  c.sliderExplainers[field].body = v;
                })
              }
              rows={4}
            />
          </div>
        </div>

        {/* Anchor labels */}
        <div className="rounded-lg border border-border/60 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Anchor labels (under slider track)
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <TextField
              label="Left"
              value={anchors.left}
              onChange={(v) =>
                patch((c) => {
                  c.sliderAnchors[field].left = v;
                })
              }
            />
            <TextField
              label="Right"
              value={anchors.right}
              onChange={(v) =>
                patch((c) => {
                  c.sliderAnchors[field].right = v;
                })
              }
            />
          </div>
        </div>

        {/* Thresholds */}
        <div className="rounded-lg border border-border/60 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Status thresholds
          </p>
          <p className="mb-3 text-[11px] text-muted-foreground/80">
            Values at or above each threshold get that status. Low is always 0
            and below.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {avgIdx >= 0 && (
              <>
                <NumberField
                  label="Average starts at"
                  value={thresholds[avgIdx].threshold}
                  onChange={(v) =>
                    patch((c) => {
                      c.benchmarkThresholds[field][avgIdx].threshold = v;
                    })
                  }
                  step={limits.step}
                  min={limits.min}
                  max={limits.max}
                />
                <TextField
                  label="Tick label (average)"
                  value={thresholds[avgIdx].tick ?? ""}
                  onChange={(v) =>
                    patch((c) => {
                      c.benchmarkThresholds[field][avgIdx].tick = v || undefined;
                    })
                  }
                  placeholder="e.g. Moderate"
                />
              </>
            )}
            {goodIdx >= 0 && (
              <>
                <NumberField
                  label="Good starts at"
                  value={thresholds[goodIdx].threshold}
                  onChange={(v) =>
                    patch((c) => {
                      c.benchmarkThresholds[field][goodIdx].threshold = v;
                    })
                  }
                  step={limits.step}
                  min={limits.min}
                  max={limits.max}
                />
                <TextField
                  label="Tick label (good)"
                  value={thresholds[goodIdx].tick ?? ""}
                  onChange={(v) =>
                    patch((c) => {
                      c.benchmarkThresholds[field][goodIdx].tick = v || undefined;
                    })
                  }
                  placeholder="e.g. Healthy"
                />
              </>
            )}
          </div>
        </div>

        {/* Slider range + default */}
        <div className="rounded-lg border border-border/60 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Slider range and default
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <NumberField
              label="Min"
              value={limits.min}
              onChange={(v) =>
                patch((c) => {
                  c.sliderLimits[field].min = v;
                })
              }
              span="full"
            />
            <NumberField
              label="Max"
              value={limits.max}
              onChange={(v) =>
                patch((c) => {
                  c.sliderLimits[field].max = v;
                })
              }
              span="full"
            />
            <NumberField
              label="Step"
              value={limits.step}
              onChange={(v) =>
                patch((c) => {
                  c.sliderLimits[field].step = v;
                })
              }
              span="full"
              step={0.1}
            />
            <NumberField
              label="Default value"
              value={defaultValue as number}
              onChange={(v) =>
                patch((c) => {
                  (c.defaultInputs as unknown as Record<string, number>)[field] = v;
                })
              }
              span="full"
              step={limits.step}
              min={limits.min}
              max={limits.max}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
