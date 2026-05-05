# M1. Cold Email Funnel Deep Dive

Author: Sheriff
Last updated: 2026-05-04
Status: Phase 1 deliverable, awaiting Omar review

---

## Purpose

This document is the foundation for the Omnivate ROI Calculator. Before any UI exists, the math must be rigorous, defensible, and reproducible. A reader with a hand calculator should be able to follow every formula in this doc and arrive at the same numbers we put on the calculator screen.

The document covers every layer of a cold email program, in the order the funnel actually works. Each layer is explained in plain language, given a precise formula, and walked through with worked examples. At the end, a complete variable list defines every input the visitor controls, every number the calculator computes, and every default we ship with.

This doc is also written so that it can double as the explainer text shown to a visitor on the calculator page. Tone is sophisticated and data driven, never salesy. No jargon goes unexplained.

Reference material studied while writing this:

- [cold-email-roi-calculator.com](https://cold-email-roi-calculator.com) — the structural blueprint we are taking inspiration from
- Public industry benchmarks for cold email open, reply, and conversion rates
- Operating experience from Omnivate's existing outbound campaigns

---

## How a cold email program actually generates revenue

A cold email program is a stack of three layers sitting on top of each other. Each layer constrains the next. If any layer is weak, the layers above it cannot perform.

```
Layer 3:  Funnel        (open → reply → meeting → deal → revenue)
                ▲
Layer 2:  Sequence      (how many emails one prospect receives)
                ▲
Layer 1:  Infrastructure (how many emails we can send per month)
```

Layer 1 caps how much email we can send. Layer 2 divides that capacity into how many new prospects we can reach. Layer 3 turns those reached prospects into customers and revenue. To project ROI, we walk the funnel from bottom to top and compound the conversions.

Every formula in the rest of this document plugs into this stack.

---

## Layer 1: Sending infrastructure

### What this layer is

Cold email at scale is not "send from one inbox." Mailbox providers (Google Workspace, Microsoft 365) penalise senders who push too many cold messages from a single mailbox. The accepted limit is roughly thirty cold emails per mailbox per day after the mailbox is warmed up. Above that, deliverability collapses, opens drop, and the program stops working.

To send meaningful volume safely, an outbound team registers many domains, runs several mailboxes on each domain, and spreads the daily send across all of them.

The vocabulary:

- **Domain** — the part of an email address after the at sign. Examples: `outreach-omnivate.com`, `hello-omnivate.com`. We register multiple sending domains so we can spread volume across them and protect our primary brand domain from any deliverability hits.
- **Mailbox** — a specific email address living on a domain. Examples: `omar@outreach-omnivate.com`, `sheriff@outreach-omnivate.com`. Two to three mailboxes per domain is standard.
- **Daily send limit per mailbox** — roughly thirty cold emails per day after warmup. This is the empirical sweet spot used by serious outbound operators across thousands of accounts.
- **Working days per month** — cold email is sent on business days only. Twenty two working days per month is the standard assumption.

### The formula

Total monthly sending capacity equals the number of domains, multiplied by the number of mailboxes on each domain, multiplied by the number of cold emails each mailbox can safely send per day, multiplied by the number of working days in a month.

In code style:

```
monthly_sending_capacity = domains × mailboxes_per_domain × emails_per_mailbox_per_day × working_days_per_month
```

### Worked example

A typical Omnivate setup for a mid market client:

- domains = 10
- mailboxes_per_domain = 3
- emails_per_mailbox_per_day = 30
- working_days_per_month = 22

Calculation: 10 × 3 × 30 × 22 = **19,800 emails per month**

That is the ceiling on outbound volume for this configuration. Every downstream number flows from this one.

### Why these defaults

- **Thirty emails per mailbox per day** is the industry consensus safe limit. Push higher and Gmail and Outlook start scoring the mailbox negatively, which collapses inbox placement.
- **Three mailboxes per domain** balances volume against the risk of a domain being flagged. Going to five or more mailboxes per domain concentrates risk on one domain reputation.
- **Twenty two working days** matches a standard business calendar in the United States and Europe with public holidays factored out.

A visitor can override any of these in the calculator.

---

## Layer 2: Sequence and reachable contacts

### What this layer is

A prospect rarely replies to a single cold email. Reply rates climb meaningfully across the second, third, and fourth touches in a sequence. So every prospect receives a sequence of emails rather than a single message.

The vocabulary:

- **Sequence** — the ordered set of emails a single prospect receives, beginning with an initial cold email and continuing with follow ups. Typical sequence lengths are three to five steps.
- **Sequence length** — the number of emails one prospect receives across the whole sequence. We use this to translate sending capacity into reachable contacts.

Why follow ups exist: industry data consistently shows that roughly sixty percent of replies come from follow up emails rather than the initial message. Skipping follow ups throws away most of the program's potential.

### The formula

The number of new prospects we can reach per month equals total monthly sending capacity divided by the number of emails each prospect receives.

In code style:

```
reachable_contacts_per_month = monthly_sending_capacity / sequence_steps
```

### Worked example

Continuing from Layer 1:

- monthly_sending_capacity = 19,800
- sequence_steps = 4

Calculation: 19,800 / 4 = **4,950 new contacts per month**

Every additional follow up step in the sequence reduces the number of new contacts you can reach. A four step sequence reaches 4,950 contacts. A six step sequence with the same infrastructure reaches 19,800 / 6 = 3,300 contacts. The trade off is real and the calculator should make it visible.

### Why these defaults

A four step sequence is the standard recommendation. It captures the bulk of the reply lift from follow ups without burning capacity on diminishing returns past the fourth touch.

---

## Layer 3: The funnel

This is where reached prospects become revenue. The funnel is six stages deep. Each stage applies a conversion percentage to the previous stage. Every percentage compounds, which is why small improvements at the top of the funnel matter so much at the bottom.

### The six stages

1. **Contacts reached** — the input from Layer 2.
2. **Opens** — the count of contacts who open at least one email in the sequence. Industry good range: 50 to 60 percent of contacts.
3. **Replies** — the count of contacts who reply at all to any email in the sequence. Industry good range: 3 to 6 percent of contacts.
4. **Positive replies** — replies that express genuine interest, rather than "wrong person", "remove me", or "send me materials and we will see". Industry good range: 25 to 40 percent of all replies.
5. **Meetings booked** — positive replies that turn into a confirmed meeting on the calendar. Industry good range: 60 to 80 percent of positive replies.
6. **Deals closed** — meetings that convert into signed contracts or paying customers. Range varies sharply by sales motion (covered in the next section).

### A note on how opens and replies relate

In modern cold email reporting, "open rate" is measured separately from "reply rate". Replies are the more reliable signal because Apple Mail Privacy Protection and similar tools inflate open counts. Most outbound platforms (Smartlead, Lemlist, Apollo) report:

- Open rate as `opens / contacts`
- Reply rate as `replies / contacts`

These are independent measurements against the same denominator. We use this convention. Open rate is informative for the visitor (it tells them how engaging their subject lines and senders are) but downstream stages are computed from replies, not from opens.

### The formulas

In code style:

```
opens                = contacts_reached × open_rate
replies              = contacts_reached × reply_rate
positive_replies     = replies × positive_reply_rate
meetings_booked      = positive_replies × meeting_booking_rate
deals_closed         = meetings_booked × close_rate
```

`close_rate` is the only stage where the default flips significantly between sales motions. The next section handles that.

### Worked example

Continuing from Layer 2 with industry good defaults:

- contacts_reached = 4,950
- open_rate = 55 percent
- reply_rate = 5 percent
- positive_reply_rate = 30 percent
- meeting_booking_rate = 70 percent
- close_rate = 18 percent (sales led default, see next section)

Walking the funnel:

| Stage                    | Calculation  | Result |
| ------------------------ | ------------ | ------ |
| Contacts reached         | from Layer 2 | 4,950  |
| Opens                    | 4,950 × 0.55 | 2,723  |
| Replies                  | 4,950 × 0.05 | 247    |
| Positive replies         | 247 × 0.30   | 74     |
| Meetings booked          | 74 × 0.70    | 52     |
| Deals closed (sales led) | 52 × 0.18    | 9      |

So a steady state outbound program with the configuration above closes roughly nine deals per month from cold email alone, before we factor in hidden pipeline, halo effects, or churn.

### Why compounding matters

Every stage is multiplicative. Improving any one rate by ten percent improves the final deal count by ten percent. This is why the funnel visualisation in the calculator must show conversion percentages between stages explicitly. The visitor needs to feel each stage's leverage.

---

## Sales motion

The same outbound program produces dramatically different ROI depending on what you sell, who you sell it to, and how you sell it. The calculator gives the visitor a single toggle that swaps the default conversion rates and deal economics:

- **Sales led** (or service led)
- **Self service SaaS**

### Sales led

Higher touch, longer cycle, larger deals. The buyer expects a discovery call, a demo, a proposal, and often a procurement process before signing. Conversion past the meeting stage is lower because the cycle is longer and more decision makers get involved, but the deal size compensates.

Defaults:

| Variable      | Default                                             |
| ------------- | --------------------------------------------------- |
| close_rate    | 18 percent                                          |
| deal_value    | 25,000 USD (one time, or annualised contract value) |
| monthly_churn | 2 percent (if subscription)                         |

Close rate range: 15 to 25 percent of meetings.
Deal value range: 5,000 to 100,000 USD plus.

### Self service SaaS

Lower touch, shorter cycle, smaller recurring deals. Many self service buyers convert without a meeting, but for prospects who do book a meeting the conversion rate past that stage tends to be higher because the product can be tried before the buyer commits.

Defaults:

| Variable      | Default                          |
| ------------- | -------------------------------- |
| close_rate    | 30 percent                       |
| deal_value    | 200 USD per month (subscription) |
| monthly_churn | 5 percent                        |

Close rate range: 25 to 40 percent of meetings.
Subscription value range: 50 to 1,000 USD per month.

Note: for self service SaaS we model deal value as a monthly subscription rather than a one time number. The next section explains why this matters and how we adjust for churn.

### Why the toggle is presented as one decision

In M3 we decide whether to also expose `deal_type` (one time vs subscription) as a separate input. In M1 we treat sales motion as the single switch that controls both close rate behaviour and deal economics, with the understanding that an advanced visitor can override individual rates afterwards.

---

## Churn adjustment and lifetime value

For a one time sale, revenue is straightforward: deals closed, multiplied by the price of the deal. For a subscription, the visible monthly revenue is just the start. The real value of a closed customer is the total revenue you collect from them across their entire tenure as a customer. That value depends on how quickly they cancel, which is what monthly churn rate measures.

### The vocabulary

- **Monthly churn rate** — the percentage of paying customers who cancel each month.
- **Average customer lifetime** — the expected number of months a customer stays subscribed, derived from churn.
- **Customer lifetime value (LTV)** — total revenue a single customer is expected to generate across their lifetime as a customer.

### The formulas

If monthly churn is 5 percent, the average customer stays for 1 / 0.05 = 20 months. So a 200 USD per month subscription with 5 percent monthly churn is worth 200 × 20 = 4,000 USD in lifetime value.

In code style:

```
average_lifetime_months = 1 / monthly_churn_rate
customer_ltv            = monthly_subscription_value × average_lifetime_months
```

Equivalently:

```
customer_ltv = monthly_subscription_value / monthly_churn_rate
```

### Worked example

Continuing the worked example with self service SaaS economics:

- deals_closed_per_month = 9 (using sales led defaults from earlier; for self service the close rate is 30 percent so deals_closed would be 52 × 0.30 = 16 per month)
- For consistency we will rerun this with self service rates

Self service worked example:

| Stage                                                | Result                    |
| ---------------------------------------------------- | ------------------------- |
| Deals closed per month                               | 52 × 0.30 = 16            |
| Subscription value per deal                          | 200 USD per month         |
| Monthly recurring revenue added per month            | 16 × 200 = 3,200 USD      |
| Average customer lifetime (5 percent churn)          | 1 / 0.05 = 20 months      |
| Customer LTV                                         | 200 × 20 = 4,000 USD      |
| Lifetime value of one month's deals                  | 16 × 4,000 = 64,000 USD   |
| Annualised lifetime value (12 months of acquisition) | 64,000 × 12 = 768,000 USD |

For sales led with a one time 25,000 USD deal:

| Stage                           | Result                       |
| ------------------------------- | ---------------------------- |
| Deals closed per month          | 9                            |
| Deal value                      | 25,000 USD                   |
| Monthly revenue from cold email | 9 × 25,000 = 225,000 USD     |
| Annualised revenue              | 225,000 × 12 = 2,700,000 USD |

The calculator displays both the monthly figure and the annual figure prominently, plus the LTV adjustment for subscription motions.

### Why this matters

Without the churn adjustment, the calculator would either dramatically underestimate the value of a SaaS deal (by only counting the first month) or dramatically overestimate it (by treating monthly revenue as if it lasted forever). Modelling lifetime explicitly is the honest way to project subscription ROI.

### Edge case

When monthly churn is set to zero, average lifetime becomes infinite, which is mathematically undefined. The calculator caps the maximum lifetime at sixty months (five years) to keep numbers sane and to reflect the reality that no SaaS contract truly lasts forever. The cap is configurable but defaults to sixty.

---

## Hidden pipeline

Not every prospect who could become a customer replies during the active sequence. Some open the email, register the brand, see a follow up later, sit on the inbox for six months, and then convert because they got a budget approval, switched roles, or finally felt the pain. This is hidden pipeline.

Hidden pipeline is real but conservative to model. We attach it to engaged but silent contacts (those who opened at least one email but did not reply) and apply a small long tail conversion rate.

### The vocabulary

- **Engaged silent contact** — a contact who opened at least one email in the sequence but did not reply during the active sequence window.
- **Hidden conversion rate** — the percentage of engaged silent contacts who eventually convert into paying customers in a long tail window of six to eighteen months.

### The formula

In code style:

```
engaged_silent_contacts = (contacts_reached × open_rate) − replies
hidden_pipeline_deals   = engaged_silent_contacts × hidden_conversion_rate
hidden_pipeline_revenue = hidden_pipeline_deals × deal_value
```

The default hidden conversion rate is 0.3 percent. The visitor can override it within a range of 0 to 1 percent.

### Worked example

Continuing the worked example:

- contacts_reached per month = 4,950
- opens per month = 2,723
- replies per month = 247
- engaged_silent_contacts per month = 2,723 − 247 = 2,476
- hidden_conversion_rate = 0.3 percent
- hidden_pipeline_deals per month = 2,476 × 0.003 = 7
- deal_value (sales led) = 25,000 USD
- hidden_pipeline_revenue per month = 7 × 25,000 = 185,000 USD
- hidden_pipeline_revenue annualised = 185,000 × 12 = 2,220,000 USD

Note: this is a long tail estimate. In practice the conversions arrive over six to eighteen months rather than every month, but the annualised figure is the right way to present it once the program has been running for a year or more.

### Why we are conservative

Some calculators in the market apply 1 to 2 percent hidden conversion rates and produce headline numbers that look enormous. We deliberately default to 0.3 percent for two reasons:

1. Honesty earns trust. A visitor who realises the calculator's defaults are aggressive will discount everything else it tells them.
2. The output is still meaningful at 0.3 percent, and the visitor can adjust upward if they have evidence their re engagement program is stronger.

---

## Online and social presence bonus

Cold outbound at scale creates a halo effect that goes beyond direct replies. People mentioned in emails sometimes look up the sender on LinkedIn. Recipients forward emails internally and create awareness. Some prospects do not reply but follow the company on social and engage with content months later. Some send referrals.

This is the hardest layer to model rigorously, but ignoring it understates outbound ROI. We model it as a small percentage uplift on the directly attributed revenue.

### The vocabulary

- **Halo uplift rate** — the percentage of additional pipeline generated as a side effect of running outbound at scale, on top of the direct funnel.

### The formula

```
halo_pipeline_revenue = (direct_outbound_revenue + hidden_pipeline_revenue) × halo_uplift_rate
```

The default halo uplift rate is 8 percent. The visitor can override it within a range of 0 to 20 percent.

### Worked example

Continuing the worked example, sales led:

- direct_outbound_revenue annualised = 2,700,000 USD
- hidden_pipeline_revenue annualised = 2,220,000 USD
- halo_uplift_rate = 8 percent
- halo_pipeline_revenue = (2,700,000 + 2,220,000) × 0.08 = 393,600 USD

### Why we are conservative here too

The halo effect is real but very hard to attribute. An 8 percent default communicates that we believe it exists and is meaningful, without overpromising. Visitors with strong content programs and large LinkedIn followings can plausibly bump this to 15 percent. Visitors with no social presence can drop it to zero.

---

## Putting it all together: the full ROI picture

The calculator pulls every layer together into a single revenue projection, then subtracts the cost of running outbound to produce ROI.

### The full formula

In code style:

```
monthly_sending_capacity     = domains × mailboxes_per_domain × emails_per_mailbox_per_day × working_days_per_month
contacts_reached_per_month   = monthly_sending_capacity / sequence_steps

opens_per_month              = contacts_reached_per_month × open_rate
replies_per_month            = contacts_reached_per_month × reply_rate
positive_replies_per_month   = replies_per_month × positive_reply_rate
meetings_per_month           = positive_replies_per_month × meeting_booking_rate
deals_per_month              = meetings_per_month × close_rate

# direct outbound revenue
if deal_type is "one_time":
  direct_revenue_annualised  = deals_per_month × deal_value × 12
else if deal_type is "subscription":
  customer_ltv               = monthly_subscription_value / monthly_churn_rate     # capped at 60 × monthly_subscription_value
  direct_revenue_annualised  = deals_per_month × customer_ltv × 12 / average_lifetime_months
                             # which simplifies to deals_per_month × monthly_subscription_value × 12 (annual MRR added)
                             # plus cumulative lifetime value across the cohort

# hidden pipeline
engaged_silent_per_month     = opens_per_month − replies_per_month
hidden_deals_per_month       = engaged_silent_per_month × hidden_conversion_rate
hidden_revenue_annualised    = hidden_deals_per_month × deal_value × 12

# halo bonus
halo_revenue_annualised      = (direct_revenue_annualised + hidden_revenue_annualised) × halo_uplift_rate

# total projected revenue
total_revenue_annualised     = direct_revenue_annualised + hidden_revenue_annualised + halo_revenue_annualised

# cost
omnivate_cost_annualised     = omnivate_monthly_fee × 12

# return on investment
roi_multiple                 = total_revenue_annualised / omnivate_cost_annualised
roi_net                      = total_revenue_annualised − omnivate_cost_annualised
```

### End to end worked example

Sales led B2B SaaS company, full funnel, with all layers stacked:

| Variable                   | Value       |
| -------------------------- | ----------- |
| domains                    | 10          |
| mailboxes_per_domain       | 3           |
| emails_per_mailbox_per_day | 30          |
| working_days_per_month     | 22          |
| sequence_steps             | 4           |
| open_rate                  | 55 percent  |
| reply_rate                 | 5 percent   |
| positive_reply_rate        | 30 percent  |
| meeting_booking_rate       | 70 percent  |
| close_rate                 | 18 percent  |
| deal_type                  | one_time    |
| deal_value                 | 25,000 USD  |
| hidden_conversion_rate     | 0.3 percent |
| halo_uplift_rate           | 8 percent   |
| omnivate_monthly_fee       | 4,000 USD   |

Calculations:

| Step                       | Calculation                    | Result        |
| -------------------------- | ------------------------------ | ------------- |
| Monthly sending capacity   | 10 × 3 × 30 × 22               | 19,800 emails |
| Contacts reached per month | 19,800 / 4                     | 4,950         |
| Opens per month            | 4,950 × 0.55                   | 2,723         |
| Replies per month          | 4,950 × 0.05                   | 247           |
| Positive replies per month | 247 × 0.30                     | 74            |
| Meetings per month         | 74 × 0.70                      | 52            |
| Deals per month            | 52 × 0.18                      | 9             |
| Direct annualised revenue  | 9 × 25,000 × 12                | 2,700,000 USD |
| Engaged silent per month   | 2,723 − 247                    | 2,476         |
| Hidden deals per month     | 2,476 × 0.003                  | 7             |
| Hidden revenue annualised  | 7 × 25,000 × 12                | 2,220,000 USD |
| Halo revenue annualised    | (2,700,000 + 2,220,000) × 0.08 | 393,600 USD   |
| Total revenue annualised   | sum                            | 5,313,600 USD |
| Omnivate cost annualised   | 4,000 × 12                     | 48,000 USD    |
| Net ROI                    | 5,313,600 − 48,000             | 5,265,600 USD |
| ROI multiple               | 5,313,600 / 48,000             | 110.7 times   |

Same configuration, self service SaaS economics:

| Step                                         | Calculation                | Result        |
| -------------------------------------------- | -------------------------- | ------------- |
| Deals per month                              | 52 × 0.30                  | 16            |
| Monthly subscription value                   | 200 USD                    |               |
| Monthly churn                                | 5 percent                  |               |
| Average lifetime                             | 1 / 0.05                   | 20 months     |
| Customer LTV                                 | 200 × 20                   | 4,000 USD     |
| Direct annualised revenue (annual MRR added) | 16 × 200 × 12              | 38,400 USD    |
| Direct lifetime value cohort                 | 16 × 4,000 × 12            | 768,000 USD   |
| Hidden deals per month                       | 2,476 × 0.003              | 7             |
| Hidden revenue at LTV                        | 7 × 4,000 × 12             | 336,000 USD   |
| Halo revenue                                 | (768,000 + 336,000) × 0.08 | 88,320 USD    |
| Total LTV revenue annualised                 | sum                        | 1,192,320 USD |
| Omnivate cost annualised                     | 4,000 × 12                 | 48,000 USD    |
| ROI multiple                                 | 1,192,320 / 48,000         | 24.8 times    |

Both numbers are large, which is the honest result of the cold email math when defaults sit in the industry good range. Visitors whose actual numbers are weaker will see smaller projections, and the calculator should make that visible by exposing every input.

### Sensitivity band

To avoid presenting a single confident number that hides assumption risk, the calculator displays a sensitivity band. We compute the central projection above, then recompute with a ten percent reduction applied to each conversion rate (open, reply, positive reply, meeting booking, close), and a ten percent increase. The displayed band is the floor and ceiling of total revenue across these scenarios.

```
total_revenue_low  = total_revenue_annualised computed with each conversion rate × 0.9
total_revenue_high = total_revenue_annualised computed with each conversion rate × 1.1
```

This gives the visitor an honest range rather than a single false precision number.

---

## Variables reference

This section is the contract between M1 and M3. Every variable listed here must appear in the calculator, either as a visitor input, a computed output, or a default the visitor can override.

### Inputs the visitor controls

| Variable                   | Type    | Default                                             | Range                   | Units         | Helper text                                                                         |
| -------------------------- | ------- | --------------------------------------------------- | ----------------------- | ------------- | ----------------------------------------------------------------------------------- |
| sales_motion               | toggle  | sales_led                                           | sales_led, self_service | none          | Pick the closest match to how you sell.                                             |
| domains                    | number  | 10                                                  | 1 to 100                | count         | How many sending domains you run.                                                   |
| mailboxes_per_domain       | number  | 3                                                   | 1 to 5                  | count         | Mailboxes on each domain. Two to three is standard.                                 |
| emails_per_mailbox_per_day | number  | 30                                                  | 10 to 50                | count         | Cold emails per mailbox per day after warmup. Industry safe limit is around thirty. |
| working_days_per_month     | number  | 22                                                  | 15 to 25                | days          | Business days per month.                                                            |
| sequence_steps             | number  | 4                                                   | 1 to 8                  | count         | Total emails one prospect receives.                                                 |
| open_rate                  | percent | 55                                                  | 0 to 100                | percent       | Percent of contacts who open at least one email.                                    |
| reply_rate                 | percent | 5                                                   | 0 to 100                | percent       | Percent of contacts who reply at all.                                               |
| positive_reply_rate        | percent | 30                                                  | 0 to 100                | percent       | Percent of replies that are interested rather than dismissive.                      |
| meeting_booking_rate       | percent | 70                                                  | 0 to 100                | percent       | Percent of positive replies that turn into a calendar meeting.                      |
| close_rate                 | percent | 18 (sales led) or 30 (self service)                 | 0 to 100                | percent       | Percent of meetings that close to deals.                                            |
| deal_type                  | toggle  | one_time (sales led) or subscription (self service) | one_time, subscription  | none          | One time deal or recurring subscription.                                            |
| deal_value                 | number  | 25,000 (sales led)                                  | 100 to 1,000,000        | USD           | Average deal value (one time) or annualised contract value.                         |
| monthly_subscription_value | number  | 200 (self service)                                  | 10 to 10,000            | USD per month | Monthly subscription price (subscription only).                                     |
| monthly_churn_rate         | percent | 5 (self service) or 2 (sales led)                   | 0 to 100                | percent       | Percent of customers who cancel each month.                                         |
| hidden_conversion_rate     | percent | 0.3                                                 | 0 to 1                  | percent       | Percent of engaged silent contacts who convert later.                               |
| halo_uplift_rate           | percent | 8                                                   | 0 to 20                 | percent       | Additional pipeline generated by halo effects beyond the direct funnel.             |
| omnivate_monthly_fee       | number  | 4,000                                               | 1,000 to 20,000         | USD per month | Monthly cost of running outbound through Omnivate.                                  |
| company_name               | text    | empty                                               | any                     | text          | Used on the personalised PDF only. Optional.                                        |
| time_horizon_months        | toggle  | 12                                                  | 6, 12, 24               | months        | How far out to project revenue.                                                     |

### Outputs the calculator computes

| Output                             | Formula reference   | Display                         |
| ---------------------------------- | ------------------- | ------------------------------- |
| monthly_sending_capacity           | Layer 1             | Headline metric and tooltip     |
| contacts_reached_per_month         | Layer 2             | Funnel stage 0                  |
| opens_per_month                    | Layer 3             | Funnel stage 1                  |
| replies_per_month                  | Layer 3             | Funnel stage 2                  |
| positive_replies_per_month         | Layer 3             | Funnel stage 3                  |
| meetings_per_month                 | Layer 3             | Funnel stage 4                  |
| deals_per_month                    | Layer 3             | Funnel stage 5                  |
| direct_revenue_annualised          | Putting it together | Side by side comparison         |
| engaged_silent_per_month           | Hidden pipeline     | Tooltip on hidden pipeline line |
| hidden_pipeline_revenue_annualised | Hidden pipeline     | Hidden pipeline line            |
| halo_revenue_annualised            | Halo bonus          | Halo bonus line                 |
| total_revenue_annualised           | Putting it together | Top line ROI                    |
| total_revenue_low                  | Sensitivity band    | Sensitivity range floor         |
| total_revenue_high                 | Sensitivity band    | Sensitivity range ceiling       |
| omnivate_cost_annualised           | Putting it together | Cost line                       |
| roi_multiple                       | Putting it together | Headline metric                 |
| roi_net                            | Putting it together | Headline metric                 |
| customer_ltv                       | Churn adjustment    | Subscription only               |
| average_lifetime_months            | Churn adjustment    | Subscription only, tooltip      |

### Defaults that ship in the calculator

These are the numbers the calculator loads with on first paint. Every one is overridable.

| Default                    | Sales led   | Self service SaaS |
| -------------------------- | ----------- | ----------------- |
| open_rate                  | 55 percent  | 55 percent        |
| reply_rate                 | 5 percent   | 5 percent         |
| positive_reply_rate        | 30 percent  | 30 percent        |
| meeting_booking_rate       | 70 percent  | 70 percent        |
| close_rate                 | 18 percent  | 30 percent        |
| deal_type                  | one_time    | subscription      |
| deal_value                 | 25,000 USD  | not used          |
| monthly_subscription_value | not used    | 200 USD           |
| monthly_churn_rate         | 2 percent   | 5 percent         |
| sequence_steps             | 4           | 4                 |
| hidden_conversion_rate     | 0.3 percent | 0.3 percent       |
| halo_uplift_rate           | 8 percent   | 8 percent         |
| omnivate_monthly_fee       | 4,000 USD   | 4,000 USD         |
| working_days_per_month     | 22          | 22                |
| emails_per_mailbox_per_day | 30          | 30                |
| domains                    | 10          | 10                |
| mailboxes_per_domain       | 3           | 3                 |
| time_horizon_months        | 12          | 12                |

---

## End of M1

This document is the source of truth for the math behind the calculator. Every formula here will appear unchanged in `lib/calculations.ts` during M4. If any number on the screen does not match a formula in this doc, that is a bug.
