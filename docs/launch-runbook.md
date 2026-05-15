# Launch runbook — ROI Calculator

How to operate the live calculator after M5 is shipped. Covers
monitoring, lead retrieval, common failures, and the Smartlead wiring
that is still on the to do list.

Last updated: 2026-05-15

---

## What ships in M5

- `roi_calc.leads` table in Supabase. One row per PDF download.
- `POST /api/send-pdf` route. Validates input, saves the lead, renders
  a branded PDF with `@react-pdf/renderer`, streams the binary back.
- `components/calculator/PdfCaptureForm.tsx` triggers an inline browser
  download. No email is sent.
- In memory rate limit at 10 downloads per IP per hour. Lives in the
  lambda instance. Resets when the function cold starts.
- Disposable email domains are rejected (`mailinator.com`,
  `guerrillamail.com`, etc.). List lives in
  `app/api/send-pdf/route.ts`.

---

## Daily checks

### Did anyone download a PDF today?

```sql
SELECT
  date_trunc('day', created_at) AS day,
  count(*) AS downloads,
  count(DISTINCT email) AS unique_emails
FROM roi_calc.leads
WHERE created_at >= now() - interval '14 days'
GROUP BY day
ORDER BY day DESC;
```

### Who downloaded today?

```sql
SELECT email, name, company_name, created_at
FROM roi_calc.leads
WHERE created_at >= current_date
ORDER BY created_at DESC;
```

### What inputs are people picking?

```sql
SELECT
  inputs->>'sequenceSteps' AS steps,
  count(*),
  avg((inputs->>'dealValue')::numeric) AS avg_deal_value,
  avg((inputs->>'closeRate')::numeric) AS avg_close_rate
FROM roi_calc.leads
WHERE created_at >= now() - interval '30 days'
GROUP BY steps;
```

### Is anyone hitting the rate limit?

The rate limit lives in memory so there is no log table. The fingerprint
of a hit is multiple submissions in a short window from the same
`ip_hash`:

```sql
SELECT ip_hash, count(*), min(created_at), max(created_at)
FROM roi_calc.leads
WHERE created_at >= now() - interval '1 day'
GROUP BY ip_hash
HAVING count(*) >= 3
ORDER BY count(*) DESC;
```

The hash is salted with `ADMIN_SESSION_SECRET` so it never reverses to a
raw IP. If you rotate that secret the hashes no longer match prior days
— don't rotate it casually.

---

## Common failures

### Visitor reports "Could not save your submission"

Almost always a Supabase issue. Check in this order:

1. Vercel runtime logs for the `/api/send-pdf` route — there should be a
   `[send-pdf] Failed to persist lead` line with the underlying error.
2. If the error is `permission denied for table leads`, the
   `service_role` grants were dropped. Re run:
   ```sql
   GRANT ALL ON roi_calc.leads TO service_role;
   GRANT USAGE ON SCHEMA roi_calc TO service_role;
   ```
3. If the error mentions `relation "roi_calc.leads" does not exist`, the
   table was dropped. Rerun the migration from this runbook (see
   "Recreate the leads table").
4. If the error is a Supabase outage, the Supabase status page will
   confirm. Nothing to do but wait.

### Visitor reports "Could not generate the PDF"

`@react-pdf/renderer` failed. Check Vercel logs for the
`[send-pdf] Failed to render PDF` line. Most common cause: a malformed
input value (e.g. `Infinity` or `NaN`) somehow bypassing the validator.
Add a regression test, redeploy.

### Visitor reports "You have hit the hourly download cap"

That's the rate limit firing. Confirm with the SQL above. If it's a
legitimate visitor (not an attacker), suggest they wait an hour or use
a different network. If you need to raise the cap, edit
`MAX_PER_WINDOW` in `lib/rate-limit.ts` and redeploy.

---

## Recreate the leads table (disaster recovery)

```sql
CREATE TABLE IF NOT EXISTS roi_calc.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  company_name text,
  inputs jsonb NOT NULL,
  outputs jsonb NOT NULL,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_roi_leads_created ON roi_calc.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roi_leads_email ON roi_calc.leads(email);

ALTER TABLE roi_calc.leads ENABLE ROW LEVEL SECURITY;
GRANT ALL ON roi_calc.leads TO service_role;
GRANT USAGE ON SCHEMA roi_calc TO service_role;
```

No public RLS policy is set, so anon/authenticated roles cannot read
the leads. Only service_role (server side via `SUPABASE_SERVICE_ROLE_KEY`)
can read or write.

---

## Future work: hooking up Smartlead

M5 ships with download only because Smartlead's Basic plan doesn't
include API access. To add Smartlead email delivery later:

### Prerequisites

1. Confirm the Omnivate Smartlead account is on the **Pro plan or higher**
   (Pro starts at $94/mo as of 2026). API access is gated by tier.
2. If the account is a Smartlead agency with sub-accounts, the agency
   owner generates a Client Level API Key via the parent dashboard —
   sub-account users will never see API keys in their own settings.
3. Generate (or copy) the API key from
   **Profile menu → Settings → API Key Management**. Save to
   `C:\Users\HP\.smartlead-api-key`.
4. Create a one step transactional campaign in Smartlead. Email body
   uses `{{first_name}}` and `{{pdf_link}}` merge tags. Attach a warmed
   mailbox.
5. Grab the campaign ID from the campaign URL. Format:
   `app.smartlead.ai/app/campaigns/<id>`.

### Env vars

```
SMARTLEAD_API_KEY=<the key>
SMARTLEAD_CAMPAIGN_ID=<the number>
```

Add to `.env.local` and to Vercel production via
`vercel env add NAME production`.

### Code changes

1. Add `lib/smartlead.ts` with one function: `addLeadToCampaign({
   email, firstName, customVars })`. Endpoint:
   `POST https://server.smartlead.ai/api/v1/campaigns/{id}/leads?api_key=...`
2. Add a Supabase Storage bucket `roi_calc_pdfs`, upload the rendered
   PDF, generate a 30 day signed URL.
3. In `app/api/send-pdf/route.ts`, after the lead insert but before
   streaming the PDF back, call `addLeadToCampaign` with the signed URL
   as the `pdf_link` custom variable. Fire and forget — do not block
   the download response on the Smartlead push.
4. Update the success state in `PdfCaptureForm.tsx` to mention that an
   email is also on the way.

The signed URL lets Smartlead's email template embed a link that stays
valid for 30 days. The visitor downloads instantly via the inline path,
and the email follow up gives you a touchpoint that nurtures.

### Monitoring after Smartlead is wired

Add a `smartlead_pushed_at` column to `roi_calc.leads` and write the
timestamp when the push succeeds. Failed pushes are easy to find:

```sql
SELECT email, created_at
FROM roi_calc.leads
WHERE smartlead_pushed_at IS NULL
  AND created_at < now() - interval '5 minutes';
```

Manually retry from the runbook or build a cron task.

---

## Rotating secrets

| Secret | What it gates | How to rotate |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | All server side Supabase writes | Supabase dashboard → Project Settings → API → Rotate. Update `.env.local` + `vercel env` |
| `ADMIN_PASSWORD` | `/admin` access | Edit `.env.local` and `vercel env`. Notify the team in private channel |
| `ADMIN_SESSION_SECRET` | HMAC for admin cookies AND salt for `ip_hash` | Rotating invalidates current admin sessions AND breaks daily-IP grouping in the leads table. Only rotate when you accept those costs |

Never paste any of these into chat. Use the credential files in
`C:\Users\HP\.*` per session-context.md.

---

## What lives where

| Where | What |
|---|---|
| `app/api/send-pdf/route.ts` | The route handler. POST only. nodejs runtime |
| `lib/pdf.tsx` | PDF template using `@react-pdf/renderer` |
| `lib/rate-limit.ts` | Hourly per IP cap. In memory. `_resetBuckets()` for tests |
| `components/calculator/PdfCaptureForm.tsx` | The visitor form |
| `roi_calc.leads` | One row per download. service_role only |
| `docs/session-context.md` | Project state for compact rehydration |
| THIS FILE | Ops runbook |
