# M4. Build the interactive calculator

Author: Sheriff
Last updated: 2026-05-06
Status: Phase 4 deliverable, complete and ready for sign off

---

## Purpose

This document captures the M4 build: every file written, every decision made, and every detail a future engineer needs to extend or modify the calculator without re-reading the entire codebase. M3 is the spec. M4 is the implementation. M5 picks up from here.

Live URL: **https://roi-calculator-taupe-ten.vercel.app**

---

## What got built

Five stages, each landing as its own commit so the history reads as incremental progress:

| Stage | Commit | What |
|---|---|---|
| 4.1 | `ca68cc1` | Math layer: pure `calculateRoi` function, types, defaults, 44 unit tests |
| 4.2 | `13f6500` | shadcn/ui setup, Omnivate brand tokens, 11 calculator components, working page with state |
| 4.3 | `10d3a89` | URL state persistence (shareable URLs), number tweening on outputs |
| 4.4 | `df053df` | Edge case warnings, monthly capacity headline, LTV badge, funnel cascade animation |
| 4.5 | this commit | Lint clean, secretlint scan, this doc |

Plus a mid-phase fix:

| Commit | What |
|---|---|
| `3ced020` | Switched from dark theme to light theme after Sheriff caught the early misinterpretation |
| `84acc8c` | Wired the Omnivate logo into the page header |

---

## File map

The calculator lives in three buckets: math (no React), components (React), and the page (composition).

```
roi-calculator/
├── app/
│   ├── globals.css              ← Tailwind v4 + Omnivate brand tokens, light theme
│   ├── layout.tsx               ← Geist fonts, TooltipProvider wrap, metadata
│   └── page.tsx                 ← The calculator. State, URL hydration, composition.
│
├── lib/
│   ├── types.ts                 ← CalculatorInputs and CalculatorOutputs types
│   ├── defaults.ts              ← SHARED_DEFAULTS, motion presets, constants
│   ├── calculations.ts          ← Pure calculateRoi function. The math.
│   ├── url-state.ts             ← Serialize/parse inputs to and from URL
│   └── utils.ts                 ← cn, formatCurrency, formatInteger, formatPercent, formatMultiple
│
├── hooks/
│   └── useTween.ts              ← rAF based number animation hook
│
├── components/
│   ├── ui/                      ← shadcn primitives (button, card, input, label, slider, toggle, toggle-group, tooltip)
│   └── calculator/
│       ├── InputGroup.tsx       ← Label + value display + helper wrapper
│       ├── SliderInput.tsx      ← Slider with inline value
│       ├── NumberInput.tsx      ← Number input with optional $ prefix
│       ├── SalesMotionToggle.tsx← Sales-led / Self-service SaaS pill toggle
│       ├── TimeHorizonToggle.tsx← 6 / 12 / 24 month toggle
│       ├── HeroNumber.tsx       ← Massive ROI multiple with sensitivity band
│       ├── FunnelViz.tsx        ← Vertical bar funnel with cascade animation
│       ├── RoiSummary.tsx       ← Three column breakdown plus total card
│       ├── ComparisonView.tsx   ← Without / with Omnivate side by side
│       ├── ControlsPanel.tsx    ← All inputs grouped (motion, volume, rates, deal, halo, cost)
│       ├── PdfCaptureForm.tsx   ← Email + name + company, success state ready for M5
│       ├── TweenedNumber.tsx    ← Wrapper that smoothly animates a numeric value
│       └── Warning.tsx          ← Soft amber inline warning for edge cases
│
├── tests/
│   └── calculations.test.ts     ← 44 unit tests covering every formula and edge case
│
├── public/
│   └── omnivate-logo.png        ← 1400 by 300 brand mark
│
└── docs/
    ├── m1-cold-email-funnel.md  ← Funnel literacy
    ├── m2-setup.md              ← Tooling setup
    ├── m3-requirements-stack.md ← Specification
    └── m4-build.md              ← This doc
```

---

## How the calculator works at runtime

### 1. Page loads

`app/page.tsx` is a client component (`"use client"`). On first render, state is `DEFAULT_INPUTS` from `lib/defaults.ts` (sales-led B2B SaaS, 10 domains × 3 mailboxes × 30 emails/day × 22 days, conversion rates at industry good ranges).

### 2. URL hydration

A `useEffect` on mount reads `window.location.search` via `readInputsFromUrl()` from `lib/url-state.ts`. If any params are present, they are validated and clamped to allowed ranges, then `setInputs` is called with the hydrated values.

### 3. Output computation

`useMemo` recomputes `CalculatorOutputs` on every input change by calling `calculateRoi(inputs)` from `lib/calculations.ts`. This is pure synchronous math, sub-millisecond on a modern laptop.

### 4. Render

Outputs flow into:

- `HeroNumber` (ROI multiple, sensitivity band)
- `FunnelViz` (six funnel stages, monthly capacity)
- `RoiSummary` (direct, hidden, halo, total)
- `ComparisonView` (without/with Omnivate)
- `PdfCaptureForm` (email capture, M5 wires actual delivery)

Headline numbers wrap in `TweenedNumber` so they smoothly animate from previous to new value over 300ms (ease-out quartic).

### 5. URL write-back

A second `useEffect` watches `inputs` and calls `writeInputsToUrl(inputs)`, which uses `history.replaceState` to mirror state into the URL without adding history entries or scrolling. Defaults are skipped from the URL to keep shared links concise.

### 6. PDF capture

`PdfCaptureForm` posts to a no-op handler today; in M5 it will hit `app/api/send-pdf/route.ts`, which generates a branded PDF, persists the lead to Supabase, and adds them to a Smartlead campaign for transactional delivery.

---

## Key decisions

### Math behind the funnel

Open rate is informational. Replies are computed from contacts independently (`replies = contacts × replyRate`), not from opens (`replies = opens × replyGivenOpenRate`). This matches how Smartlead, Lemlist, and Apollo report and is documented at length in `docs/m1-cold-email-funnel.md`. All other stages compound multiplicatively.

### Sensitivity band

We compute the central total, then re-run `computeCore` twice with each conversion rate scaled by ±10 percent. The displayed band is the floor and ceiling. This is honest under-promising: at default inputs the band reads as roughly $4M to $7M rather than a fake-precise "$5,436,882."

### Lifetime cap

Subscription LTV would diverge to infinity at zero churn. We cap average lifetime at 60 months. The UI shows "(capped at five years)" when the cap is hit so the visitor sees the assumption.

### Sales motion presets

Toggling sales motion resets motion-specific defaults (`closeRate`, `dealType`, `dealValue`, `monthlySubscriptionValue`, `monthlyChurnRate`) but preserves volume, conversion rates, halo settings, and cost. Visitors who tweaked their volume do not lose work when they toggle motion.

### Light theme, no toggle

Single light theme matching the omnivate.ai aesthetic. Brand purple as primary, deep amber (sunset) reserved for the "with Omnivate" headline result. Heavy purple glows from a previous iteration replaced with subtle elevation shadows tuned for white surfaces.

### URL state, not Supabase

For M4, calculator state lives entirely in the URL. No server roundtrip on every change. M5 introduces Supabase for lead persistence after the visitor submits the PDF form.

### Number tweening, no funnel tween

Per M3 motion language: numbers tween (300ms ease-out quartic), funnel viz updates live (sub 100ms). The funnel bars use CSS transition on width for smooth resizing. The funnel numbers update instantly because they should keep up with rapid slider changes. Headline numbers tween because they reward attention.

---

## How to extend

### Add a new input

1. Add the field to `CalculatorInputs` in `lib/types.ts`
2. Add a default to `SHARED_DEFAULTS` (or motion-specific block) in `lib/defaults.ts`
3. Use the value in `calculateRoi` in `lib/calculations.ts`
4. Add a parser to `searchParamsToInputs` in `lib/url-state.ts`
5. Render an input control inside the right `Section` of `ControlsPanel.tsx`
6. If it influences the math output, add a test in `tests/calculations.test.ts`

### Add a new output

1. Add the field to `CalculatorOutputs` in `lib/types.ts`
2. Compute it in `computeCore` (or `calculateRoi` for sensitivity-derived values) in `lib/calculations.ts`
3. Display it via the appropriate component (HeroNumber, FunnelViz, RoiSummary, ComparisonView)
4. If it should tween, wrap it in `<TweenedNumber />`
5. Add a test in `tests/calculations.test.ts`

### Change a default value

Edit `SHARED_DEFAULTS`, `SALES_LED_DEFAULTS`, or `SELF_SERVICE_DEFAULTS` in `lib/defaults.ts`. The UI picks up the change automatically.

### Tune motion timing

`hooks/useTween.ts` accepts a `duration` parameter (default 300ms). Pass a different value to `<TweenedNumber duration={500} ... />` for individual numbers. Funnel cascade timing lives in the inline `<style>` block in `FunnelViz.tsx` (60ms stagger, 400ms per stage).

---

## Local development

```bash
pnpm install        # install everything
pnpm dev            # local dev server at http://localhost:3000
pnpm build          # production build
pnpm lint           # ESLint
pnpm test           # vitest one-shot
pnpm test:watch     # vitest watch mode
```

Pre-commit hook runs `secretlint` automatically. Manual scan:

```bash
pnpm exec secretlint --secretlintignore .gitignore "**/*"
```

---

## Acceptance criteria, scored

| Criterion (from M3) | Status |
|---|---|
| Live URL renders the full calculator with no console errors | ✅ |
| Every input changes the funnel visualization in real time | ✅ |
| Math matches the M3 specification exactly. Unit tests pass. | ✅ 44/44 |
| The page looks distinctive and high quality | ✅ subject to Omar's review |
| Mobile and desktop both work cleanly | ✅ pending visitor verification on hardware |
| The "email me the PDF" CTA captures email and name | ✅ Form ready, delivery in M5 |

---

## Outstanding for M4 sign off

- [x] Stage 4.1 to 4.5 all landed on `main` and auto-deployed
- [x] Tests, lint, build, secret scan all clean
- [x] Live URL up at https://roi-calculator-taupe-ten.vercel.app
- [ ] **M4 Loom recorded** (Sheriff to record): walkthrough of live URL on desktop and mobile, sales motion toggle, time horizon toggle, pricing toggle, design decisions called out
- [ ] Omar review and sign off

Phase 5 (M5: PDF export and Smartlead delivery) starts after Omar signs off on M4.
