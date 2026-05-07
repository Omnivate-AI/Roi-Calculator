# M4. Verification scenarios

Author: Sheriff
Last updated: 2026-05-06

---

## Purpose

Four realistic scenarios with hand-verifiable outputs. Use these to confirm the calculator's math is correct, to demo the calculator on the M4 Loom, and as a regression baseline. The numbers in this document are asserted in `tests/scenarios.test.ts` so they cannot drift from what the calculator actually produces.

Each scenario provides:

- A plain-language description of the company being modeled
- The exact input values to plug in
- A shareable URL that loads the scenario into the calculator with one click
- The expected outputs across the funnel and ROI breakdown
- The math walk through so you can reproduce on a hand calculator

---

## Scenario A: Mid-market B2B SaaS, sales-led (the M1 default)

A typical Omnivate client. 30 mailboxes spread across 10 domains, sending around 19,800 cold emails per month. Selling enterprise SaaS at a $25k deal value with industry-good conversion rates.

**Inputs (this is the calculator's first-paint state, just open the live URL):**

| Field                      | Value     |
| -------------------------- | --------- |
| Sales motion               | Sales-led |
| Domains                    | 10        |
| Mailboxes per domain       | 3         |
| Emails per mailbox per day | 30        |
| Working days per month     | 22        |
| Sequence steps             | 4         |
| Open rate                  | 55%       |
| Reply rate                 | 5%        |
| Positive reply rate        | 30%       |
| Meeting booking rate       | 70%       |
| Close rate                 | 18%       |
| Deal value                 | $25,000   |
| Hidden conversion rate     | 0.3%      |
| Halo uplift                | 8%        |
| Omnivate fee               | $4,000/mo |

**URL:** [https://roi-calculator-taupe-ten.vercel.app](https://roi-calculator-taupe-ten.vercel.app)

**Expected outputs:**

| Funnel stage     | Value         |
| ---------------- | ------------- |
| Monthly capacity | 19,800 emails |
| Contacts reached | 4,950         |
| Opens            | 2,723         |
| Replies          | 248           |
| Positive replies | 74            |
| Meetings         | 52            |
| Deals            | 9             |

| Revenue line      | Annual value   |
| ----------------- | -------------- |
| Direct outbound   | $2,806,650     |
| Hidden pipeline   | $2,227,500     |
| Halo bonus        | $402,732       |
| **Total revenue** | **$5,436,882** |
| Omnivate cost     | $48,000        |
| **ROI multiple**  | **113×**       |

**Math walk through:**

- Capacity: 10 × 3 × 30 × 22 = 19,800
- Contacts: 19,800 ÷ 4 = 4,950
- Opens: 4,950 × 0.55 = 2,722.5
- Replies: 4,950 × 0.05 = 247.5
- Positive: 247.5 × 0.30 = 74.25
- Meetings: 74.25 × 0.70 = 51.975
- Deals: 51.975 × 0.18 = 9.3555
- Direct annual: 9.3555 × 25,000 × 12 = $2,806,650
- Engaged silent: 2,722.5 − 247.5 = 2,475
- Hidden deals: 2,475 × 0.003 = 7.425
- Hidden annual: 7.425 × 25,000 × 12 = $2,227,500
- Halo: (2,806,650 + 2,227,500) × 0.08 = $402,732
- Total: $5,436,882
- Cost: 4,000 × 12 = $48,000
- ROI multiple: 5,436,882 ÷ 48,000 = 113.27

---

## Scenario B: Conservative sales-led B2B SaaS

A more cautious projection. Smaller infrastructure (8 domains), modest reply rate (3% rather than the industry-good 5%), smaller deal size ($20k). This is what a CFO would call "the realistic scenario you should plan against."

**Inputs (deltas from defaults in bold):**

| Field                      | Value       |
| -------------------------- | ----------- |
| Sales motion               | Sales-led   |
| **Domains**                | **8**       |
| Mailboxes per domain       | 3           |
| Emails per mailbox per day | 30          |
| Working days per month     | 22          |
| Sequence steps             | 4           |
| Open rate                  | 55%         |
| **Reply rate**             | **3%**      |
| Positive reply rate        | 30%         |
| Meeting booking rate       | 70%         |
| Close rate                 | 18%         |
| **Deal value**             | **$20,000** |

**URL:** [https://roi-calculator-taupe-ten.vercel.app/?domains=8&replyRate=3&dealValue=20000](https://roi-calculator-taupe-ten.vercel.app/?domains=8&replyRate=3&dealValue=20000)

**Expected outputs:**

| Funnel stage     | Value         |
| ---------------- | ------------- |
| Monthly capacity | 15,840 emails |
| Contacts reached | 3,960         |
| Opens            | 2,178         |
| Replies          | 119           |
| Positive replies | 36            |
| Meetings         | 25            |
| Deals            | 4             |

| Revenue line      | Annual value   |
| ----------------- | -------------- |
| Direct outbound   | $1,077,754     |
| Hidden pipeline   | $1,482,624     |
| Halo bonus        | $204,830       |
| **Total revenue** | **$2,765,208** |
| Omnivate cost     | $48,000        |
| **ROI multiple**  | **58×**        |

**Math walk through:**

- Capacity: 8 × 3 × 30 × 22 = 15,840
- Contacts: 15,840 ÷ 4 = 3,960
- Opens: 3,960 × 0.55 = 2,178
- Replies: 3,960 × 0.03 = 118.8
- Positive: 118.8 × 0.30 = 35.64
- Meetings: 35.64 × 0.70 = 24.948
- Deals: 24.948 × 0.18 = 4.49
- Direct: 4.49 × 20,000 × 12 = $1,077,754
- Engaged silent: 2,178 − 118.8 = 2,059.2
- Hidden deals: 2,059.2 × 0.003 = 6.18
- Hidden: 6.18 × 20,000 × 12 = $1,482,624
- Halo: (1,077,754 + 1,482,624) × 0.08 = $204,830
- Total: $2,765,208
- ROI: 2,765,208 ÷ 48,000 = 57.6

---

## Scenario C: Aggressive enterprise sales-led

A well-resourced enterprise outbound program with strong execution. 60 mailboxes across 20 domains, premium conversion rates (60% open, 6% reply, 35% positive, 22% close), and large deals at $50k.

**Inputs (deltas from defaults in bold):**

| Field                      | Value       |
| -------------------------- | ----------- |
| Sales motion               | Sales-led   |
| **Domains**                | **20**      |
| Mailboxes per domain       | 3           |
| Emails per mailbox per day | 30          |
| Working days per month     | 22          |
| Sequence steps             | 4           |
| **Open rate**              | **60%**     |
| **Reply rate**             | **6%**      |
| **Positive reply rate**    | **35%**     |
| **Meeting booking rate**   | **75%**     |
| **Close rate**             | **22%**     |
| **Deal value**             | **$50,000** |

**URL:** [https://roi-calculator-taupe-ten.vercel.app/?domains=20&openRate=60&replyRate=6&positiveReplyRate=35&meetingBookingRate=75&closeRate=22&dealValue=50000](https://roi-calculator-taupe-ten.vercel.app/?domains=20&openRate=60&replyRate=6&positiveReplyRate=35&meetingBookingRate=75&closeRate=22&dealValue=50000)

**Expected outputs:**

| Funnel stage     | Value         |
| ---------------- | ------------- |
| Monthly capacity | 39,600 emails |
| Contacts reached | 9,900         |
| Opens            | 5,940         |
| Replies          | 594           |
| Positive replies | 208           |
| Meetings         | 156           |
| Deals            | 34            |

| Revenue line      | Annual value    |
| ----------------- | --------------- |
| Direct outbound   | $20,582,100     |
| Hidden pipeline   | $9,622,800      |
| Halo bonus        | $2,416,392      |
| **Total revenue** | **$32,621,292** |
| Omnivate cost     | $48,000         |
| **ROI multiple**  | **680×**        |

**Math walk through:**

- Capacity: 20 × 3 × 30 × 22 = 39,600
- Contacts: 39,600 ÷ 4 = 9,900
- Opens: 9,900 × 0.60 = 5,940
- Replies: 9,900 × 0.06 = 594
- Positive: 594 × 0.35 = 207.9
- Meetings: 207.9 × 0.75 = 155.925
- Deals: 155.925 × 0.22 = 34.3
- Direct: 34.3 × 50,000 × 12 = $20,582,100
- Engaged silent: 5,940 − 594 = 5,346
- Hidden deals: 5,346 × 0.003 = 16.04
- Hidden: 16.04 × 50,000 × 12 = $9,622,800
- Halo: (20,582,100 + 9,622,800) × 0.08 = $2,416,392
- Total: $32,621,292
- ROI: 679.6

---

## Scenario D: Self-service SaaS PLG

A product-led growth SaaS. Smaller infrastructure (10 mailboxes across 5 domains), shorter 3-step sequence, modest reply rates, $300/mo subscription product with 6% monthly churn.

This scenario also exercises the subscription branch of the math: average lifetime, customer LTV, MRR added annually, and lifetime value cohort.

**Inputs (deltas from defaults in bold):**

| Field                          | Value                      |
| ------------------------------ | -------------------------- |
| **Sales motion**               | **Self-service SaaS**      |
| **Domains**                    | **5**                      |
| **Mailboxes per domain**       | **2**                      |
| Emails per mailbox per day     | 30                         |
| Working days per month         | 22                         |
| **Sequence steps**             | **3**                      |
| **Open rate**                  | **50%**                    |
| **Reply rate**                 | **4%**                     |
| **Positive reply rate**        | **25%**                    |
| **Meeting booking rate**       | **60%**                    |
| Close rate                     | 30% (self-service default) |
| **Monthly subscription value** | **$300**                   |
| **Monthly churn rate**         | **6%**                     |

**URL:** [https://roi-calculator-taupe-ten.vercel.app/?salesMotion=self_service&domains=5&mailboxesPerDomain=2&sequenceSteps=3&openRate=50&replyRate=4&positiveReplyRate=25&meetingBookingRate=60&closeRate=30&dealType=subscription&monthlySubscriptionValue=300&monthlyChurnRate=6](https://roi-calculator-taupe-ten.vercel.app/?salesMotion=self_service&domains=5&mailboxesPerDomain=2&sequenceSteps=3&openRate=50&replyRate=4&positiveReplyRate=25&meetingBookingRate=60&closeRate=30&dealType=subscription&monthlySubscriptionValue=300&monthlyChurnRate=6)

**Expected outputs:**

| Funnel stage     | Value        |
| ---------------- | ------------ |
| Monthly capacity | 6,600 emails |
| Contacts reached | 2,200        |
| Opens            | 1,100        |
| Replies          | 88           |
| Positive replies | 22           |
| Meetings         | 13           |
| Deals            | 4            |

| Subscription detail       | Value       |
| ------------------------- | ----------- |
| Average customer lifetime | 16.7 months |
| Customer LTV              | $5,000      |
| MRR added (annualised)    | $14,256     |

| Revenue line                 | Annual value |
| ---------------------------- | ------------ |
| Direct outbound (cohort LTV) | $237,600     |
| Hidden pipeline              | $182,160     |
| Halo bonus                   | $33,581      |
| **Total revenue**            | **$453,341** |
| Omnivate cost                | $48,000      |
| **ROI multiple**             | **9.4×**     |

**Math walk through:**

- Capacity: 5 × 2 × 30 × 22 = 6,600
- Contacts: 6,600 ÷ 3 = 2,200
- Opens: 2,200 × 0.50 = 1,100
- Replies: 2,200 × 0.04 = 88
- Positive: 88 × 0.25 = 22
- Meetings: 22 × 0.60 = 13.2
- Deals: 13.2 × 0.30 = 3.96
- Lifetime: 100 ÷ 6 = 16.67 months
- LTV: 300 × 16.67 = $5,000
- MRR added: 3.96 × 300 × 12 = $14,256
- Direct (cohort LTV): 3.96 × 5,000 × 12 = $237,600
- Engaged silent: 1,100 − 88 = 1,012
- Hidden deals: 1,012 × 0.003 = 3.04
- Hidden (LTV based): 3.04 × 5,000 × 12 = $182,160
- Halo: (237,600 + 182,160) × 0.08 = $33,581
- Total: $453,341
- ROI: 453,341 ÷ 48,000 = 9.44

A quick word on what "Direct outbound" means for subscription: this is the **lifetime value of all customers acquired in 12 months**. It is not the cash collected in year 1 (that would be much smaller, closer to MRR added). The calculator deliberately leads with cohort LTV because that is the real economic outcome of the program; what year 1 cash looks like depends entirely on payment timing.

---

## Verification testing

If you ever change `lib/calculations.ts` and any of the numbers in this document drift, `tests/scenarios.test.ts` will fail and tell you exactly which scenario broke. Run with:

```bash
pnpm test
```

All 76 tests should pass. Four describe blocks cover scenarios A through D; the rest are the unit tests from M1 (Layer 1, Layer 2, Layer 3, sales motion presets, churn cap, hidden pipeline, halo bonus, totals + ROI, sensitivity band, time horizon, edge cases).
