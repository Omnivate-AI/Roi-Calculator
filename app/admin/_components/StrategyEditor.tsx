"use client";

import type { CalculatorConfig } from "@/lib/config-types";
import { NumberField, Section, TextAreaField, TextField } from "./fields";

interface StrategyEditorProps {
  config: CalculatorConfig;
  setConfig: (updater: (draft: CalculatorConfig) => CalculatorConfig) => void;
}

const STEP_KEYS = ["1", "2", "3"] as const;

/**
 * Edit the three sequence strategies (1, 2, 3 emails per contact) and
 * the leads-reached count tied to each. Three columns side by side on
 * desktop, stacked on mobile.
 */
export function StrategyEditor({ config, setConfig }: StrategyEditorProps) {
  function patch(updater: (c: CalculatorConfig) => void) {
    setConfig((prev) => {
      const next = structuredClone(prev);
      updater(next);
      return next;
    });
  }

  return (
    <Section
      title="Sequence strategy"
      subtitle="Three step counts and the leads they reach"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEP_KEYS.map((stepKey) => {
          const strategy = config.strategyBySequence[stepKey];
          const leads = config.leadsBySequence[stepKey];
          return (
            <div
              key={stepKey}
              className="space-y-3 rounded-lg border border-border/60 p-3"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-brand-primary">
                {stepKey} email{stepKey === "1" ? "" : "s"} per contact
              </p>
              <TextField
                label="Label"
                value={strategy.label}
                onChange={(v) =>
                  patch((c) => {
                    c.strategyBySequence[stepKey].label = v;
                  })
                }
              />
              <TextField
                label="TAM"
                value={strategy.tam}
                onChange={(v) =>
                  patch((c) => {
                    c.strategyBySequence[stepKey].tam = v;
                  })
                }
              />
              <TextAreaField
                label="Description"
                value={strategy.description}
                onChange={(v) =>
                  patch((c) => {
                    c.strategyBySequence[stepKey].description = v;
                  })
                }
                rows={3}
              />
              <NumberField
                label="Leads reached"
                value={leads}
                onChange={(v) =>
                  patch((c) => {
                    c.leadsBySequence[stepKey] = v;
                  })
                }
                step={100}
                min={0}
                span="full"
              />
            </div>
          );
        })}
      </div>
    </Section>
  );
}
