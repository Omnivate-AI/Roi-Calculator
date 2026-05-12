# M4. Verification scenarios (V2)

Author: Sheriff
Last updated: 2026-05-06

---

## Purpose

Four realistic scenarios with hand-verifiable outputs for the V2 simplified calculator. Use these to confirm the math, to demo on the M4 Loom, and as a regression baseline. Numbers in this document are asserted in `tests/calculations.test.ts` so they cannot drift from what the calculator produces.

Each scenario provides plain-language framing, exact inputs, a shareable URL, expected outputs, and a hand-calculator walkthrough.

V2 model recap:
- Capacity is fixed at 24,000 emails per month
- Sequence steps (1, 2, 3) determine natural leads reached (24k, 12k, 8k); the leads slider can override
- Five performance sliders: open, reply (max 5%), positive reply, meeting booked, close
- Deal value drives revenue
- Outputs: deals per month, revenue per month, revenue per year

---

## Scenario A: Default (2-step, healthy benchmarks)

The calculator's first-paint state. A balanced two-step sequence reaching 12,000 leads per month, all conversion rates dialed to the "healthy" end of industry benchmarks.

**Inputs:**

| Field | Value |
|---|---|
| Sequence strategy | 2 steps (Moderate TAM) |
| Leads reached | 12,000 |
| Open rate | 70% |
| Reply rate | 3% |
| Positive reply rate | 30% |
| Meeting booked rate | 50% |
| Close rate | 20% |
| Deal value | $25,000 |

**URL:** [https://roi-calculator-taupe-ten.vercel.app](https://roi-calculator-taupe-ten.vercel.app)

**Expected outputs:**

| Funnel stage | Value |
|---|---|
| Emails sent | 24,000 |
| Leads reached | 12,000 |
| Opens | 8,400 |
| Replies | 360 |
| Positive replies | 108 |
| Meetings | 54 |
| Deals | 11 (10.8 exact) |

| Revenue | Value |
|---|---|
| Per month | $270,000 |
| **Per year** | **$3,240,000** |

**Math walkthrough:**
- Emails sent: 12,000 × 2 = 24,000
- Opens: 12,000 × 0.70 = 8,400
- Replies: 12,000 × 0.03 = 360
- Positive: 360 × 0.30 = 108
- Meetings: 108 × 0.50 = 54
- Deals: 54 × 0.20 = 10.8
- Revenue/month: 10.8 × 25,000 = $270,000
- Revenue/year: $270,000 × 12 = $3,240,000

---

## Scenario B: Conservative outbound

A modest program with email-only follow-up, average rates across the funnel, and smaller deal sizes. Useful when modelling a brand new outbound team or a CFO-friendly "realistic floor" projection.

**Inputs (deltas from defaults in bold):**

| Field | Value |
|---|---|
| Sequence strategy | 2 steps |
| Leads reached | 12,000 |
| **Open rate** | **50%** |
| **Reply rate** | **2%** |
| **Positive reply rate** | **25%** |
| **Meeting booked rate** | **30%** |
| **Close rate** | **15%** |
| **Deal value** | **$15,000** |

**URL:** [https://roi-calculator-taupe-ten.vercel.app/?openRate=50&replyRate=2&positiveReplyRate=25&meetingBookedRate=30&closeRate=15&dealValue=15000](https://roi-calculator-taupe-ten.vercel.app/?openRate=50&replyRate=2&positiveReplyRate=25&meetingBookedRate=30&closeRate=15&dealValue=15000)

**Expected outputs:**

| Funnel stage | Value |
|---|---|
| Leads reached | 12,000 |
| Opens | 6,000 |
| Replies | 240 |
| Positive replies | 60 |
| Meetings | 18 |
| Deals | 3 (2.7 exact) |

| Revenue | Value |
|---|---|
| Per month | $40,500 |
| **Per year** | **$486,000** |

**Math walkthrough:**
- Opens: 12,000 × 0.50 = 6,000
- Replies: 12,000 × 0.02 = 240
- Positive: 240 × 0.25 = 60
- Meetings: 60 × 0.30 = 18
- Deals: 18 × 0.15 = 2.7
- Revenue/year: 2.7 × 15,000 × 12 = $486,000

---

## Scenario C: Aggressive multi-channel

Best-in-class execution: cold email plus LinkedIn plus phone calls. Premium conversion rates across the funnel and enterprise deal sizes.

**Inputs (deltas from defaults in bold):**

| Field | Value |
|---|---|
| Sequence strategy | 2 steps |
| Leads reached | 12,000 |
| **Open rate** | **80%** |
| **Reply rate** | **4%** |
| **Positive reply rate** | **35%** |
| **Meeting booked rate** | **75%** |
| **Close rate** | **25%** |
| **Deal value** | **$50,000** |

**URL:** [https://roi-calculator-taupe-ten.vercel.app/?openRate=80&replyRate=4&positiveReplyRate=35&meetingBookedRate=75&closeRate=25&dealValue=50000](https://roi-calculator-taupe-ten.vercel.app/?openRate=80&replyRate=4&positiveReplyRate=35&meetingBookedRate=75&closeRate=25&dealValue=50000)

**Expected outputs:**

| Funnel stage | Value |
|---|---|
| Leads reached | 12,000 |
| Opens | 9,600 |
| Replies | 480 |
| Positive replies | 168 |
| Meetings | 126 |
| Deals | 32 (31.5 exact) |

| Revenue | Value |
|---|---|
| Per month | $1,575,000 |
| **Per year** | **$18,900,000** |

**Math walkthrough:**
- Opens: 12,000 × 0.80 = 9,600
- Replies: 12,000 × 0.04 = 480
- Positive: 480 × 0.35 = 168
- Meetings: 168 × 0.75 = 126
- Deals: 126 × 0.25 = 31.5
- Revenue/year: 31.5 × 50,000 × 12 = $18,900,000

---

## Scenario D: Small TAM, deep cultivation (3-step)

A focused program with a narrow target list. Three touches per lead reaches fewer prospects (8,000) but each one is hit harder, justifying premium conversion rates.

**Inputs (deltas from defaults in bold):**

| Field | Value |
|---|---|
| **Sequence strategy** | **3 steps (Small TAM)** |
| **Leads reached** | **8,000** |
| **Open rate** | **75%** |
| **Reply rate** | **3.5%** |
| **Positive reply rate** | **35%** |
| **Meeting booked rate** | **60%** |
| **Close rate** | **22%** |
| **Deal value** | **$40,000** |

**URL:** [https://roi-calculator-taupe-ten.vercel.app/?sequenceSteps=3&leadsReached=8000&openRate=75&replyRate=3.5&positiveReplyRate=35&meetingBookedRate=60&closeRate=22&dealValue=40000](https://roi-calculator-taupe-ten.vercel.app/?sequenceSteps=3&leadsReached=8000&openRate=75&replyRate=3.5&positiveReplyRate=35&meetingBookedRate=60&closeRate=22&dealValue=40000)

**Expected outputs:**

| Funnel stage | Value |
|---|---|
| Emails sent | 24,000 (capacity) |
| Leads reached | 8,000 |
| Opens | 6,000 |
| Replies | 280 |
| Positive replies | 98 |
| Meetings | 59 (58.8 exact) |
| Deals | 13 (12.936 exact) |

| Revenue | Value |
|---|---|
| Per month | $517,440 |
| **Per year** | **$6,209,280** |

**Math walkthrough:**
- Emails: 8,000 × 3 = 24,000
- Opens: 8,000 × 0.75 = 6,000
- Replies: 8,000 × 0.035 = 280
- Positive: 280 × 0.35 = 98
- Meetings: 98 × 0.60 = 58.8
- Deals: 58.8 × 0.22 = 12.936
- Revenue/year: 12.936 × 40,000 × 12 = $6,209,280

---

## Suggested 5-minute Loom flow

**0:00 - 0:45.** Open Scenario A (just the base URL). Walk through the headline: $3.24M projected annual revenue from 11 deals per month. Show how the layout reads: hero number first, supporting metrics, controls and funnel beside each other.

**0:45 - 1:45.** Scrub the sliders. Drag the open rate down to 20% and show the badge turn red ("Deliverability issue" tick label). Drag it back up to 75% and show the badge go green ("Benchmark"). Same with reply rate, meeting booked rate. The dynamic labels are the V2 calmer-than-V1 way to teach a visitor what good looks like.

**1:45 - 2:45.** Tap each sequence strategy card (1, 2, 3). Notice the leads slider snaps each time (24k, 12k, 8k). Explain the TAM trade off: broad strategy, balanced strategy, deep strategy.

**2:45 - 3:30.** Open Scenario C in a new tab. The same calculator with aggressive multi-channel inputs produces a much larger number. The point is the calculator scales realistically.

**3:30 - 4:30.** Copy the URL, paste into a new tab, show the same state loads. Demo the shareable URL pattern. Resize to mobile width.

**4:30 - 5:00.** Submit the PDF form (it does not actually send a PDF yet — that is M5). Mention M5 wires Smartlead delivery and Supabase persistence. Close with "M4 V2 is ready for sign off."

---

## Verification testing

`pnpm test` runs all 31 V2 assertions. Failures point at the exact field that drifted from this document.
