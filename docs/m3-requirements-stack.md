# M3. Requirements stack

Author: Sheriff
Last updated: 2026-05-06
Status: Phase 3 deliverable, decisions confirmed by Omar, awaiting Loom + sign off before M4 build

---

## Purpose

This document is the engineering specification for the calculator. Every input, every formula, every default, every wireframe, every edge case is locked in here so that M4 (the build) becomes mechanical execution. A different engineer should be able to read this document end to end and build the calculator without asking a single question.

The math behind the calculator was specified in M1. This document is about the visual, interactive, and structural translation of that math into a working product. Anywhere the math is referenced, the source of truth is `docs/m1-cold-email-funnel.md`. If a number on the screen does not match a formula in M1, that is a bug.

References used while writing this:

* `docs/m1-cold-email-funnel.md` — funnel math and variable list
* `https://omnivate.ai` — brand identity scrape (color palette, gradient system, voice)
* `https://cold-email-roi-calculator.com` — structural patterns to inspire and patterns to deliberately avoid

---

## Visual identity

This section is the source of truth for color, type, and motion across both the on screen calculator and the exported PDF.

### Color palette

Pulled directly from the omnivate.ai stylesheet. All values shown in HSL because that is what Tailwind v4 prefers; hex is included for design reference.

| Token | HSL | Hex (approx) | Role |
|---|---|---|---|
| `brand-primary` | `263 70% 50%` | `#7C3AED` | Hero numbers, primary CTA, active funnel stages, headline glow |
| `brand-secondary` | `271 65% 45%` | `#7E22CE` | Gradient anchor, deeper purple for hover and pressed states |
| `brand-accent` | `280 75% 55%` | `#A855F7` | Mid gradient stop, highlight pills, secondary CTA |
| `brand-electric` | `285 80% 60%` | `#C026D3` | Sparingly used: emphasis on the headline ROI number, sensitivity band ceiling |
| `brand-sunset` | `45 100% 70%` | `#FBBF24` | Reserved for the "with Omnivate" delta in side by side comparison and the final headline ROI multiple. Single warm pop against the cool purple field. |
| `surface-base` | `0 0% 4%` | `#0A0A0A` | Page background |
| `surface-raised` | `222 84% 5%` | `#0B0F19` | Card surface |
| `surface-overlay` | `220 14% 12%` | `#1F2937` | Tooltip and popover background |
| `text-primary` | `0 0% 98%` | `#FAFAFA` | Body text |
| `text-secondary` | `220 9% 65%` | `#A1A5AC` | Helper copy, axis labels |
| `text-muted` | `220 9% 45%` | `#6B7180` | Disabled, footer |
| `border` | `220 14% 18%` | `#262E3D` | Card edges, dividers |
| `success` | `142 71% 45%` | `#22C55E` | Reserved for confirmation states ("Your PDF is on its way") |
| `warning` | `38 92% 50%` | `#F59E0B` | Reserved for edge case warnings (e.g., "100% churn produces zero LTV") |
| `error` | `0 84% 60%` | `#EF4444` | Form validation errors only |

### Gradient system

| Gradient | Definition | Usage |
|---|---|---|
| `primary` | `linear-gradient(135deg, hsl(263 70% 50%), hsl(271 65% 45%))` | Hero ROI number background, primary button fill |
| `accent` | `linear-gradient(135deg, hsl(280 75% 55%), hsl(285 80% 60%))` | Funnel stage highlights, animated transitions |
| `radial-glow` | `radial-gradient(ellipse 80% 60% at 50% -20%, hsl(263 70% 50% / 0.18), transparent 60%)` | Page top ambient glow (already used on the M2 placeholder page) |

### Shadow system (signature look)

| Shadow | Definition | Usage |
|---|---|---|
| `glow-soft` | `0 0 40px hsl(263 70% 50% / 0.4)` | Hover states on primary CTA |
| `glow-strong` | `0 0 60px hsl(263 70% 50% / 0.6)` | Hero ROI number container |
| `card` | `0 4px 6px -1px hsl(220 43% 11% / 0.1), 0 2px 4px -1px hsl(220 43% 11% / 0.06)` | Default card elevation |
| `card-hover` | `0 20px 25px -5px hsl(220 43% 11% / 0.1), 0 10px 10px -5px hsl(220 43% 11% / 0.04)` | Card hover lift |

### Typography

Omnivate's website uses the system sans serif stack with no custom font. We can do better without losing brand consistency. Recommendation: pair **Geist Sans** (already loaded in M2 scaffold via `next/font/google`) for body and headlines with **Geist Mono** for numeric output.

| Use | Font | Weight | Size scale (mobile → desktop) |
|---|---|---|---|
| Hero ROI number | Geist Sans | 700 | 4rem → 6rem |
| Section heading | Geist Sans | 600 | 1.875rem → 2.25rem |
| Subsection heading | Geist Sans | 600 | 1.25rem → 1.5rem |
| Input label | Geist Sans | 500 | 0.875rem |
| Helper copy | Geist Sans | 400 | 0.75rem |
| Body | Geist Sans | 400 | 1rem → 1.125rem |
| Numeric output (funnel stages, summary numbers) | Geist Mono | 500 | varies; tabular figures |
| Eyebrow / category label | Geist Sans | 500 | 0.75rem, `letter-spacing: 0.2em`, `text-transform: uppercase` |

### Motion language

Animations should feel like data settling, not decoration. Three rules:

1. **Numbers tween, layouts do not.** When inputs change, numbers count up or down with a 250 to 400 millisecond easing. Layouts, cards, and section positions stay still.
2. **Funnel stages cascade.** When the page first loads, funnel stages reveal in sequence with a 60 millisecond stagger. Subsequent updates do not re cascade; they tween in place.
3. **No bounce, no spring.** Motion uses `ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`), not springy curves. Sophisticated, not playful.

### Density and spacing

Calculator is for serious decision makers, not casual visitors. Density is moderate, not airy.

* Base spacing unit: `0.25rem` (4 pixels)
* Default vertical rhythm between sections: `4rem` (64 pixels)
* Default horizontal padding on cards: `1.5rem` (24 pixels)
* Default content max width: `1280px` for the calculator section, `48rem` for hero and PDF CTA sections

### Theme

**Light theme only.** Dark surface (`surface-base #0A0A0A`) is the default and only theme. No dark mode toggle. The page reads as a single sophisticated dark surface with purple gradients providing contrast and energy.

---

## Page layout

The page is a single scroll, no tabs. Every section flows from top to bottom in this order. ASCII wireframe at desktop width:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER                                                                  │
│  • Omnivate wordmark left                                                │
│  • "ROI Calculator" pill right                                           │
│  • No nav, no auth                                                       │
├──────────────────────────────────────────────────────────────────────────┤
│  HERO                                                                    │
│  • Eyebrow: PROJECTED IMPACT                                             │
│  • Headline: "See the revenue an Omnivate outbound program can           │
│    generate for [Your Company]." (company name fills in once entered)   │
│  • One paragraph subhead explaining the inputs determine the outputs     │
│  • Massive headline number: ROI multiple in brand-electric                │
│    e.g., 47×                                                             │
│  • Sensitivity band beneath: "Between $1.2M and $1.8M over 12 months"   │
│  • Time horizon toggle: 6mo · 12mo · 24mo                                │
├──────────────────────────────────────────────────────────────────────────┤
│  CONTROLS + FUNNEL VIZ (two columns at desktop, stacked at mobile)      │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐       │
│  │ CONTROLS                    │  │ FUNNEL VIZ                  │       │
│  │                             │  │                             │       │
│  │ Sales motion                │  │ Live updating bar funnel    │       │
│  │ [Sales-led] [Self-serve]   │  │                             │       │
│  │                             │  │ Contacts reached: 4,950    │       │
│  │ Volume                      │  │ ▼ 55% open rate            │       │
│  │ • Domains              [10] │  │ Opens: 2,723                │       │
│  │ • Mailboxes/domain      [3] │  │ ▼ 5% reply rate             │       │
│  │ • Emails/mailbox/day   [30] │  │ Replies: 247                │       │
│  │ • Working days/month   [22] │  │ ▼ 30% positive              │       │
│  │ • Sequence steps        [4] │  │ Positive replies: 74        │       │
│  │                             │  │ ▼ 70% book                  │       │
│  │ Conversion rates            │  │ Meetings: 52                │       │
│  │ • Open rate           [55%] │  │ ▼ 18% close                 │       │
│  │ • Reply rate           [5%] │  │ Deals: 9 per month          │       │
│  │ • Positive reply      [30%] │  │                             │       │
│  │ • Meeting booking     [70%] │  └─────────────────────────────┘       │
│  │ • Close rate          [18%] │                                        │
│  │                             │                                        │
│  │ Deal economics              │                                        │
│  │ • Deal type [one-time/sub]  │                                        │
│  │ • Deal value      [$25,000] │                                        │
│  │ • Monthly churn        [2%] │                                        │
│  │                             │                                        │
│  │ Halo effects                │                                        │
│  │ • Hidden pipeline   [0.3%] │                                        │
│  │ • Halo uplift          [8%] │                                        │
│  │                             │                                        │
│  │ Cost                        │                                        │
│  │ • Omnivate fee/mo  [$4,000]│                                        │
│  └─────────────────────────────┘                                        │
├──────────────────────────────────────────────────────────────────────────┤
│  ROI SUMMARY (three columns at desktop, stacked at mobile)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │
│  │ Direct       │  │ Hidden       │  │ Halo bonus   │                  │
│  │ outbound     │  │ pipeline     │  │              │                  │
│  │              │  │              │  │              │                  │
│  │ $2,700,000   │  │ $2,220,000   │  │ $393,600     │                  │
│  │ /year        │  │ /year        │  │ /year        │                  │
│  │              │  │              │  │              │                  │
│  │ 9 deals/mo   │  │ 7 deals/mo   │  │ Halo uplift  │                  │
│  │ × $25k       │  │ engaged      │  │ 8% on direct │                  │
│  │              │  │ silent × .3% │  │ + hidden     │                  │
│  └──────────────┘  └──────────────┘  └──────────────┘                  │
│                                                                          │
│  Total projected revenue: $5,313,600 / year                             │
│  Sensitivity band: $4,250,000 to $6,400,000                             │
│                                                                          │
│  Side by side comparison                                                 │
│  ┌────────────────────────┐  ┌────────────────────────┐                │
│  │ Without Omnivate       │  │ With Omnivate          │                │
│  │                        │  │                        │                │
│  │ $0 / year              │  │ $5,313,600 / year      │                │
│  │ from cold email        │  │ from cold email        │                │
│  │                        │  │                        │                │
│  │                        │  │ Cost: $48,000          │                │
│  │                        │  │ Net: $5,265,600        │                │
│  │                        │  │ ROI: 110×              │                │
│  └────────────────────────┘  └────────────────────────┘                │
├──────────────────────────────────────────────────────────────────────────┤
│  PDF EXPORT CTA                                                          │
│  • Headline: "Want this projection in a polished PDF?"                  │
│  • Subhead: "Drop your email and we will send the PDF to your inbox."   │
│  • Inputs: Email · Name · Company name (optional)                       │
│  • Primary button: "Send me the PDF" with brand-primary gradient        │
│  • After submit: "Your PDF is on its way" with success color            │
├──────────────────────────────────────────────────────────────────────────┤
│  FOOTER                                                                  │
│  • Omnivate wordmark · roi.omnivate.ai · Privacy · Built by Omnivate AI│
└──────────────────────────────────────────────────────────────────────────┘
```

### Sticky behavior

* On mobile (below 768 pixels wide): the hero ROI multiple becomes a sticky bar at the top of the viewport once the user scrolls past it. So as they tweak inputs, the headline number stays visible.
* On desktop: nothing is sticky. The funnel viz and summary stay in view because of the two column layout.

### Mobile breakdown

At widths below 768 pixels:

1. Hero takes full width
2. Controls stack above funnel viz
3. Three column ROI summary collapses into single column
4. Side by side comparison stacks vertically
5. Sticky hero ROI bar activates

---

## Visitor inputs

Every input the visitor controls. Defaults reflect the worked example in M1 (sales led B2B SaaS).

### Sales motion (toggle)

| Spec | Value |
|---|---|
| Type | Two state toggle |
| Default | `sales_led` |
| Options | `sales_led`, `self_service` |
| Helper text on label | "Pick the closest match to how you sell." |
| On change | Resets `close_rate`, `monthly_churn_rate`, `deal_type`, `deal_value`, `monthly_subscription_value` to motion specific defaults (see `## Sales motion presets` below). The visitor can still override individual rates after switching. |

### Volume inputs

| Variable | Type | Default | Range | Units | Helper text |
|---|---|---|---|---|---|
| `domains` | Slider with numeric input | 10 | 1 to 100 | count | "How many sending domains you run." |
| `mailboxes_per_domain` | Slider with numeric input | 3 | 1 to 5 | count | "Mailboxes on each domain. Two to three is standard." |
| `emails_per_mailbox_per_day` | Slider with numeric input | 30 | 10 to 50 | count | "Cold emails per mailbox per day after warmup. Industry safe limit is around thirty." |
| `working_days_per_month` | Slider with numeric input | 22 | 15 to 25 | days | "Business days per month." |
| `sequence_steps` | Slider with numeric input | 4 | 1 to 8 | count | "Total emails one prospect receives." |

All sliders show the current value to the right of the label and accept direct numeric typing as well as drag.

### Conversion rates

| Variable | Type | Default | Range | Units | Helper text |
|---|---|---|---|---|---|
| `open_rate` | Slider with numeric input | 55 | 0 to 100 | percent | "Percent of contacts who open at least one email." |
| `reply_rate` | Slider with numeric input | 5 | 0 to 100 | percent | "Percent of contacts who reply at all." |
| `positive_reply_rate` | Slider with numeric input | 30 | 0 to 100 | percent | "Percent of replies that are interested rather than dismissive." |
| `meeting_booking_rate` | Slider with numeric input | 70 | 0 to 100 | percent | "Percent of positive replies that turn into a calendar meeting." |
| `close_rate` | Slider with numeric input | 18 (sales led) or 30 (self service) | 0 to 100 | percent | "Percent of meetings that close to deals." |

### Deal economics

| Variable | Type | Default | Range | Units | Helper text | When shown |
|---|---|---|---|---|---|---|
| `deal_type` | Two state toggle | `one_time` (sales led) or `subscription` (self service) | `one_time`, `subscription` | none | "One time deal or recurring subscription." | Always |
| `deal_value` | Numeric input | 25000 | 100 to 1000000 | USD | "Average deal value for one time deals or annualised contract value for subscriptions sold annually." | When `deal_type = one_time` |
| `monthly_subscription_value` | Numeric input | 200 | 10 to 10000 | USD per month | "Monthly subscription price." | When `deal_type = subscription` |
| `monthly_churn_rate` | Slider with numeric input | 2 (sales led) or 5 (self service) | 0 to 100 | percent | "Percent of customers who cancel each month." | When `deal_type = subscription` |

### Halo effects

| Variable | Type | Default | Range | Units | Helper text |
|---|---|---|---|---|---|
| `hidden_conversion_rate` | Slider with numeric input | 0.3 | 0 to 1 | percent | "Percent of engaged silent contacts who convert later." |
| `halo_uplift_rate` | Slider with numeric input | 8 | 0 to 20 | percent | "Additional pipeline generated by halo effects beyond the direct funnel." |

### Cost

| Variable | Type | Default | Range | Units | Helper text |
|---|---|---|---|---|---|
| `omnivate_monthly_fee` | Numeric input | 4000 | 1000 to 20000 | USD per month | "Monthly cost of running outbound through Omnivate. Adjust to test ROI at different price points." |

### Display preferences

| Variable | Type | Default | Range | Units | Helper text |
|---|---|---|---|---|---|
| `time_horizon_months` | Three state toggle | 12 | 6, 12, 24 | months | None visible on the toggle. Tooltip on hover: "How far out to project revenue." |

### PDF capture (form, not in main controls)

| Variable | Type | Default | Required | Validation |
|---|---|---|---|---|
| `email` | Email input | empty | yes | Must match an email regex. Reject obviously disposable domains (`mailinator`, `tempmail`, `10minutemail`, plus a small allow list per Phase 5 anti abuse) |
| `name` | Text input | empty | yes | 2 to 80 characters |
| `company_name` | Text input | empty | no | 0 to 100 characters. When present, used to personalise the PDF and the hero headline ("…can generate for {Company}") |

---

## Sales motion presets

When the visitor toggles between sales motions, the following defaults reset. The visitor can override any individual value after the reset.

### Sales-led

| Variable | Default |
|---|---|
| `close_rate` | 18 percent |
| `deal_type` | `one_time` |
| `deal_value` | 25000 USD |
| `monthly_churn_rate` | 2 percent (only used if visitor switches `deal_type` to subscription) |

Rationale: high touch B2B sales, larger deals, longer sales cycles. Lower close rates because more decision makers, but bigger deal size compensates.

### Self-service SaaS

| Variable | Default |
|---|---|
| `close_rate` | 30 percent |
| `deal_type` | `subscription` |
| `monthly_subscription_value` | 200 USD per month |
| `monthly_churn_rate` | 5 percent |

Rationale: lower touch, shorter cycle, smaller recurring deals. Higher close rate because product trial closes the deal more efficiently than meetings alone.

### Defaults that do not change with motion

`open_rate`, `reply_rate`, `positive_reply_rate`, `meeting_booking_rate`, `sequence_steps`, `domains`, `mailboxes_per_domain`, `emails_per_mailbox_per_day`, `working_days_per_month`, `hidden_conversion_rate`, `halo_uplift_rate`, `omnivate_monthly_fee`, `time_horizon_months`. These are infrastructure or industry baselines, not motion specific.

---

## Pricing input

Per Omar's standup decision: the pricing input is a configurable visible input. The default is 4,000 USD per month. Visitors can adjust it to model ROI at different price points. When Omar locks in a final price for the calculator, we hardcode the value and remove the input control without other code changes (the variable stays in `lib/calculations.ts`).

### Behaviour

* Visitor sees a numeric input labelled "Omnivate fee per month" with default 4000 and a USD prefix
* Helper text: "Monthly cost of running outbound through Omnivate. Adjust to test ROI at different price points."
* Validation: 1000 to 20000 USD per month
* Used in: `omnivate_cost_annualised = omnivate_monthly_fee × 12` and downstream `roi_multiple` and `roi_net`

### Future state

When Omar settles on a single price, M4 will:

1. Hide the input control (do not delete it from the form data model — keep it as a constant)
2. Hardcode `omnivate_monthly_fee = X` in `lib/defaults.ts`
3. Continue showing the cost line in the ROI summary using the hardcoded value

This keeps the math, the PDF, and the comparison view all working without any other refactor.

---

## Computed outputs

Every number the calculator displays. Formulas reference variables defined above and compute exactly as specified in M1.

### Capacity and reach

| Output | Formula (plain English) | Formula (code) | Display location |
|---|---|---|---|
| `monthly_sending_capacity` | Domains times mailboxes per domain times emails per mailbox per day times working days per month | `domains * mailboxes_per_domain * emails_per_mailbox_per_day * working_days_per_month` | Tooltip on the volume controls section |
| `contacts_reached_per_month` | Monthly capacity divided by sequence steps | `monthly_sending_capacity / sequence_steps` | Funnel stage 0 |

### Funnel stages

| Output | Formula | Display location |
|---|---|---|
| `opens_per_month` | `contacts_reached_per_month * open_rate / 100` | Funnel stage 1 |
| `replies_per_month` | `contacts_reached_per_month * reply_rate / 100` | Funnel stage 2 |
| `positive_replies_per_month` | `replies_per_month * positive_reply_rate / 100` | Funnel stage 3 |
| `meetings_per_month` | `positive_replies_per_month * meeting_booking_rate / 100` | Funnel stage 4 |
| `deals_per_month` | `meetings_per_month * close_rate / 100` | Funnel stage 5 |

### Direct revenue

For `deal_type = one_time`:

```
direct_revenue_annualised = deals_per_month * deal_value * 12
```

For `deal_type = subscription`:

```
average_lifetime_months = MIN(60, 1 / (monthly_churn_rate / 100))
customer_ltv             = monthly_subscription_value * average_lifetime_months
mrr_added_annualised     = deals_per_month * monthly_subscription_value * 12
direct_revenue_annualised = deals_per_month * customer_ltv * 12
```

For subscriptions we display two figures: `mrr_added_annualised` (more conservative, "annual MRR added if you ran outbound for one year") and `direct_revenue_annualised` (the lifetime value cohort sum). Tooltip explains the difference.

### Hidden pipeline

```
engaged_silent_per_month  = opens_per_month - replies_per_month
hidden_deals_per_month    = engaged_silent_per_month * hidden_conversion_rate / 100
hidden_revenue_annualised = hidden_deals_per_month * deal_value * 12   (one_time)
                          = hidden_deals_per_month * customer_ltv * 12 (subscription)
```

### Halo bonus

```
halo_revenue_annualised = (direct_revenue_annualised + hidden_revenue_annualised) * halo_uplift_rate / 100
```

### Total revenue and ROI

```
total_revenue_annualised = direct_revenue_annualised + hidden_revenue_annualised + halo_revenue_annualised

omnivate_cost_annualised = omnivate_monthly_fee * 12

roi_net      = total_revenue_annualised - omnivate_cost_annualised
roi_multiple = total_revenue_annualised / omnivate_cost_annualised
```

`roi_multiple` is the headline number in the hero. Rounded to one decimal place if below 10, to whole numbers above 10. Always shown with `×` suffix.

### Time horizon scaling

The base annualised numbers above represent 12 months. For other horizons:

```
time_factor = time_horizon_months / 12
revenue_at_horizon = total_revenue_annualised * time_factor
cost_at_horizon    = omnivate_cost_annualised * time_factor
```

### Sensitivity band

Computed by recomputing every funnel stage with each conversion rate scaled, while keeping volume, deal economics, and halo effects constant.

```
total_revenue_low  = total_revenue_annualised computed with each rate * 0.9
total_revenue_high = total_revenue_annualised computed with each rate * 1.1
```

Rates that scale: `open_rate`, `reply_rate`, `positive_reply_rate`, `meeting_booking_rate`, `close_rate`.

The band displays as "Between $low and $high over {time_horizon_months} months" beneath the hero ROI multiple.

---

## Hidden pipeline

### What it represents

Contacts who engaged with the outbound program (opened at least one email) but did not reply during the active sequence. A small fraction of these convert later (six to eighteen months out) due to brand awareness, follow up campaigns, or eventual readiness on the buyer side.

### Formula

Already specified in `## Computed outputs`. Default `hidden_conversion_rate` is 0.3 percent. Range 0 to 1 percent.

### Visualisation

Lives in the ROI Summary section as the middle column of three. Card displays:

* Number of hidden deals per month
* Annualised revenue from hidden pipeline
* Tooltip explaining the calculation

### Assumptions documented for the visitor

A small "?" tooltip on the hidden pipeline card explains:

> "Some contacts open your emails, register the brand, and convert later. We count engaged silent contacts (opened, did not reply) and apply a conservative 0.3% conversion rate over the long tail. You can adjust this rate in the inputs if your re engagement program is stronger or weaker."

---

## Halo bonus

### What it represents

The pipeline lift created by running outbound at scale: people who saw the email and engaged on LinkedIn instead of replying, brand awareness that surfaces in later searches, referrals, internal forwarding within target accounts.

### Formula

Already specified in `## Computed outputs`. Default `halo_uplift_rate` is 8 percent. Range 0 to 20 percent.

### Visualisation

Right column of the three column summary. Card displays:

* Halo uplift percentage applied
* Annualised revenue from halo
* Tooltip explaining the calculation

### Tooltip copy

> "Cold outbound at scale creates secondary pipeline beyond direct replies. People follow on LinkedIn, share with colleagues, or come back later. We add a conservative 8% uplift to the direct outbound and hidden pipeline numbers. Visitors with strong content programs can push this higher."

---

## Sensitivity band

### Why it exists

Calculator outputs that present a single confident number invite skepticism from sophisticated buyers. A range communicates that we know there is uncertainty in the inputs, and we are honest about it.

### Display

Beneath the hero ROI multiple:

```
$1,200,000 to $1,800,000 over 12 months
```

The two numbers are subtle, in `text-secondary` color, smaller than the headline ROI. They tween together with the main numbers when inputs change.

### Tooltip

> "We compute the central projection from your inputs, then recompute with each conversion rate ten percent lower and ten percent higher. The band reflects realistic variance in any cold email program."

---

## Funnel visualization

### Visual style

A vertical bar funnel. Each stage is a horizontal bar on a card. Bar width is proportional to stage volume relative to the input contacts (so the top stage is full width, each subsequent stage is narrower).

```
┌─────────────────────────────────────────────────────────────┐
│ Contacts reached            ████████████████████████ 4,950  │
│                             ▼  55% open rate                │
│ Opens                       █████████████             2,723 │
│                             ▼  5% reply rate                │
│ Replies                     █                          247  │
│                             ▼  30% positive                 │
│ Positive replies            ▏                           74  │
│                             ▼  70% book                     │
│ Meetings                    ▏                           52  │
│                             ▼  18% close                    │
│ Deals                       ▏                            9  │
└─────────────────────────────────────────────────────────────┘
```

### Bar styling

* Bar fill: `primary` gradient (purple to deeper purple)
* Bar background: `border` color at 30% opacity
* Conversion percentage between stages: shown in `text-secondary` with `▼` arrow
* Numbers: `Geist Mono`, tabular figures, right aligned

### Animation

* On first paint, bars cascade in from left with 60 millisecond stagger
* On input change, bars tween width and number with 300 millisecond ease
* When a stage drops to zero (e.g., user sets `reply_rate = 0`), the bar shrinks to a 1 pixel sliver to maintain layout consistency

### Hover behaviour

Hovering a stage row reveals a tooltip showing the formula in plain English:

> "247 replies = 4,950 contacts × 5% reply rate"

---

## Interactive behaviour

### Live recalculation

Every input change triggers a recomputation. The recomputation must complete within 100 milliseconds to feel instantaneous. Implementation: pure functions in `lib/calculations.ts`, called synchronously on every input event, with the result stored in React state.

### Number tweening

When an output number changes, it animates from the old value to the new value over 300 milliseconds with `ease-out`. Implementation: a small `useTweenedNumber` hook that interpolates and re-renders at 60 FPS for the duration.

### URL state persistence

Every input value is encoded in the URL query string. Example:

```
roi.omnivate.ai?d=10&m=3&e=30&w=22&s=4&or=55&rr=5&prr=30&mbr=70&cr=18&dt=ot&dv=25000&hcr=0.3&hur=8&fee=4000&th=12
```

This makes calculations shareable. Pasting a URL with state params restores all inputs. Default values are not encoded (URL stays clean for unmodified visitors).

### Input restraint

Inputs do not allow values outside their declared ranges. If a visitor types `200` into a percentage field, the value is clamped to the max. A subtle red ring appears for 500 milliseconds to signal the clamp.

### Mobile interactions

Sliders are touch friendly with a hit area of at least 44 by 44 pixels. Numeric inputs have appropriate `inputmode` attributes (`numeric`, `decimal`) so mobile keyboards behave correctly.

---

## PDF output spec

### Purpose

The PDF is what the visitor walks away with and shows their boss. It is a one to two page summary of their inputs and the projected ROI, branded for Omnivate.

### Format

* Page size: US Letter (8.5 by 11 inches)
* Orientation: portrait
* File name: `Omnivate-ROI-Projection-{CompanyName}-{YYYY-MM-DD}.pdf` (or `Omnivate-ROI-Projection-{YYYY-MM-DD}.pdf` if no company name)

### Sections

**Page 1 (always):**

1. **Header band** with Omnivate wordmark left and "ROI Projection" right
2. **Recipient line:** "Prepared for {Name}" or "Prepared for {Company} ({Name})"
3. **Hero number:** ROI multiple in brand-electric color, large
4. **Sensitivity band** beneath
5. **Three column summary:** Direct, Hidden pipeline, Halo bonus
6. **Total revenue line:** Big total with cost subtracted line
7. **Funnel breakdown table:** All six stages with conversion percentages
8. **"Your inputs" table:** All visitor inputs in two columns

**Page 2 (only if needed for inputs overflow or if visitor includes company name):**

1. **Side by side comparison:** Without Omnivate vs With Omnivate
2. **Methodology note:** Two paragraphs explaining the funnel model and the conservative assumptions used for hidden pipeline and halo
3. **Footer:** "Generated at roi.omnivate.ai · Omnivate AI · {date}"

### Branding

* Page background: white
* Accent color: `brand-primary #7C3AED`
* Headers: Geist Sans bold
* Numbers: Geist Mono
* Tables: thin borders, alternating row backgrounds at `surface-overlay` 5% opacity
* Wordmark: SVG version of the Omnivate logo if available; otherwise "Omnivate" set in Geist Sans bold with `brand-primary` letter spacing

### Generator

Choosing `@react-pdf/renderer` for the PDF generation in M5. Reasons:

* Component based, matches our React stack
* Renders inside Vercel functions cleanly with no headless browser overhead
* Comparable visual fidelity to Puppeteer for our layout needs
* Smaller deploy footprint than Puppeteer
* Open source, no per generation cost like PDFShift

### Hosted vs attached

The PDF is generated server side and stored as a hosted file (Supabase Storage or Vercel Blob). The Smartlead email links to the hosted PDF rather than attaching it. Reasons:

* Smartlead attachment limits and deliverability concerns
* Hosted link allows the visitor to forward the URL without the file size hit
* Allows future revisions if we improve PDF design

---

## Edge cases

### Zero deals

If `deals_per_month` rounds to zero (because input rates produce a tiny number), the calculator displays:

* `deals_per_month` as `0` not `0.something`
* `direct_revenue_annualised` as `$0`
* Hidden pipeline and halo bonus as `$0`
* Hero ROI multiple as `0×`
* Sensitivity band as `Between $0 and $0`
* No error states; this is a valid (if grim) outcome

### 100 percent monthly churn

If `monthly_churn_rate = 100` (visitor pushes the slider all the way):

* `average_lifetime_months = 1 / 1 = 1` month, which is mathematically valid
* `customer_ltv = monthly_subscription_value * 1`
* No special handling beyond standard math
* Tooltip warning on the churn input: "100% monthly churn means each customer cancels in their first month."

### Zero churn

If `monthly_churn_rate = 0`:

* `average_lifetime_months` would be infinite mathematically
* We cap at 60 months per the M1 spec
* Tooltip on the displayed lifetime value: "Lifetime capped at 60 months for sane projections."

### Tiny deal value

If `deal_value < 1000` or `monthly_subscription_value < 50`:

* No special handling, math just produces small numbers
* Optional copy in the tooltip: "ROI math still works at small deal sizes; volume becomes the dominant factor."

### Huge volumes

If `domains > 50` or `monthly_sending_capacity > 100,000`:

* No technical issue; numbers get large
* Add a sanity warning copy near the volume input: "Programs at this scale typically require dedicated deliverability operations beyond what most setups handle."

### Partial deal counts

`deals_per_month` is a float (e.g., 9.36). For display we round to whole numbers in the funnel viz and ROI summary, but use the unrounded value in revenue calculations to avoid compounding rounding error.

### Subscription with one-time fields visible

If `deal_type = subscription`, hide the `deal_value` input. If `deal_type = one_time`, hide `monthly_subscription_value` and `monthly_churn_rate` inputs. Smooth transition (CSS height animation) when hiding and showing inputs.

### Empty PDF capture form

If the visitor clicks "Send me the PDF" with empty email, show inline validation errors. Do not submit. Standard form behaviour, no special UX.

### PDF generation failure

If the PDF generation API route throws an error in M5:

* Show inline error: "Something went wrong generating your PDF. We have logged it and will email you the projection within an hour."
* Server side: log the error to Vercel logs, and (if Supabase persistence is wired) save the lead anyway so we can manually fix and send

---

## Decisions confirmed by Omar

All ten open decisions resolved. Captured here for the record.

1. **Pricing input visibility:** Visible to the visitor with a default of 4,000 USD per month. Visitors can adjust to test ROI at different price points. Hardcode and hide once a final price is settled.
2. **Sensitivity band variance:** Plus or minus 10% on each conversion rate. Confirmed.
3. **Hidden pipeline default:** 0.3% conservative. Confirmed.
4. **Halo uplift default:** 8% conservative. Confirmed.
5. **Subscription dual display:** Show both annualised MRR added and lifetime value cohort revenue for SaaS deals. Confirmed.
6. **PDF delivery via Smartlead:** Hosted PDF link delivered in a single transactional Smartlead email. No follow up sequence. Confirmed.
7. **Light theme only:** Confirmed. No dark mode toggle.
8. **Branded PDF logo:** Omnivate logo provided. Saved at `public/omnivate-logo.png` (SVG version if available preferred). Logo is the purple brain-circuit mark plus the "Omnivate AI" wordmark on a black square background, matching the brand palette already specified in this document.
9. **Footer privacy link:** Points to `https://omnivate.ai/privacy`. (Pending visual verification that the page renders actual privacy content; the SPA returns HTTP 200 for every path so we cannot confirm via HTTP alone.)
10. **Loom recording cadence:** One five minute Loom per phase, recorded by Sheriff and shared with Omar via Slack at the end of each mini project. Confirmed.

---

## Outstanding for M3 sign off

* [x] Visual identity defined with palette, gradients, shadows, type, motion, density
* [x] Page layout wireframed top to bottom
* [x] Every visitor input documented with type, default, range, units, helper text
* [x] Every output number defined with formula
* [x] Sales motion presets specified
* [x] Pricing input behaviour specified
* [x] Hidden pipeline and halo bonus formulas locked
* [x] Funnel visualisation styled and animated
* [x] PDF output spec including sections, branding, and generator choice
* [x] Edge cases enumerated with handling
* [x] All ten open decisions confirmed by Omar
* [ ] Omnivate logo file committed at `public/omnivate-logo.png` (or `.svg`)
* [ ] M3 Loom recorded walking through the doc

Phase 4 (M4 build the calculator) starts after Omar signs off on M3.
