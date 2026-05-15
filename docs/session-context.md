# Omnivate ROI Calculator — Session Context

This file is the rehydration point. After a `/compact` or in a new
Claude Code session, read this first to recover everything important
about the project's state.

Last updated: 2026-05-15

---

## 1. The 30-second summary

A free, public, interactive web calculator at `roi.omnivate.ai` (currently
on the Vercel default URL pending DNS) that lets a B2B visitor enter
some numbers about their outbound program and see projected revenue.
Sophisticated visual design, light theme, Omnivate brand purple.

Built in mini-projects M1 through M5. **M1 through M4 are shipped.
M5 is the only outstanding work** before the project is done.

---

## 2. Identity, URLs, credentials

- **Live URL**: `https://roi-calculator-taupe-ten.vercel.app`
- **Custom domain target**: `roi.omnivate.ai` (DNS still pending Omar)
- **GitHub repo**: `https://github.com/Omnivate-AI/Roi-Calculator` (PUBLIC)
- **Local path**: `C:\Users\HP\Roi-Calculator\`
- **Vercel project**: `amzat-1257s-projects/roi-calculator` (Hobby plan)
- **Branch**: `main` (auto-deploys to Vercel on push)
- **Owner**: Omar Almubarak
- **Engineer**: Sheriff / Amzat (GitHub: `Amzat19`, email: `amzat@omnivate.ai`)

### Credential files on this machine (never echo these in chat)

| File | What |
|---|---|
| `C:\Users\HP\.supabase-token-clean` | Supabase Personal Access Token (sbp_...) |
| `C:\Users\HP\.supabase-anon-key` | Supabase project anon key |
| `C:\Users\HP\.supabase-service-key` | Supabase service role key |
| `C:\Users\HP\.admin-password` | Admin login password (20 chars) |
| `C:\Users\HP\.admin-session-secret` | HMAC signing key for admin session cookies |

### `.env.local` (gitignored)

At `C:\Users\HP\Roi-Calculator\.env.local`. Contains:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `SMARTLEAD_API_KEY` (placeholder, M5)
- `SMARTLEAD_CAMPAIGN_ID` (placeholder, M5)

### Vercel env vars (production)

Same as `.env.local`. Set via `vercel env add NAME production`.

---

## 3. Tech stack

- Next.js 16 (App Router, Turbopack builds)
- React 19
- TypeScript 5
- Tailwind v4 (CSS-first config in `app/globals.css`)
- shadcn/ui primitives (`components/ui/`)
- `@supabase/supabase-js` + `@supabase/ssr` (used for DB only, NOT for auth)
- `lucide-react` icons
- pnpm
- Vitest for unit tests (34 assertions in `tests/calculations.test.ts`)
- Husky + secretlint pre-commit hook (blocks secrets from being committed)
- Vercel CLI for deploys, GitHub auto-deploy on push to main

---

## 4. Supabase

- **Project**: `n8n Knowledge Base`
- **Ref**: `uivgowblojtyiobhgjlv`
- **Region**: `eu-west-2`
- **Same project that the Omnivate AI Outbound system uses for production data.**
  All ROI Calculator work is isolated under a dedicated **`roi_calc` schema**
  to guarantee zero collision with existing tables.

### Tables (all under `roi_calc`)

| Table | Rows | Purpose |
|---|---|---|
| `roi_calc.config` | 1 | Single editable row, JSONB `payload` column holding the entire calculator config. Calculator page reads this. Admin page writes to it. |
| `roi_calc.config_changes` | grows on every save | Audit log. Columns: `id`, `changed_at`, `changed_by`, `previous_payload`, `new_payload`. |
| `roi_calc.admins` | 1 | Originally seeded with `amzat@omnivate.ai` when we planned magic-link auth. **Unused** now since we switched to shared-password auth. Safe to drop. |

### RLS

- All three tables have RLS enabled.
- Public policy: `"public read config" ON roi_calc.config FOR SELECT USING (true)`.
- Service role bypasses RLS (used by `/admin` saves via `SUPABASE_SERVICE_ROLE_KEY`).

### `roi_calc` schema exposure to PostgREST

Exposed via Supabase dashboard → Project Settings → API → Schemas
(includes `roi_calc`). The anon key can call `roi_calc.config` reads.

### Direct SQL access pattern

```bash
SUPABASE_PAT="$(cat /c/Users/HP/.supabase-token-clean)"
curl -s -X POST \
  "https://api.supabase.com/v1/projects/uivgowblojtyiobhgjlv/database/query" \
  -H "Authorization: Bearer $SUPABASE_PAT" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"SELECT count(*) FROM roi_calc.config;\"}"
```

---

## 5. Project file layout

```
C:\Users\HP\Roi-Calculator\
├── app/
│   ├── page.tsx                          # Server: fetches config, renders Calculator
│   ├── layout.tsx                        # Geist fonts, TooltipProvider
│   ├── globals.css                       # Light theme + Omnivate brand tokens
│   └── admin/
│       ├── page.tsx                      # Server: isAdmin check, renders AdminEditor
│       ├── AdminEditor.tsx               # Main admin form composition
│       ├── actions.ts                    # saveConfig, signOut server actions
│       ├── login/
│       │   ├── page.tsx                  # Password form (client)
│       │   └── actions.ts                # login server action (sets cookie)
│       └── _components/
│           ├── fields.tsx                # TextField, TextAreaField, NumberField, Section
│           ├── GlobalsEditor.tsx         # Capacity, channel mix, defaults
│           ├── StrategyEditor.tsx        # 1/2/3-step strategy columns
│           └── SliderConfigCard.tsx      # Per-slider editor (6 fields)
├── components/
│   ├── ui/                               # shadcn primitives
│   └── calculator/
│       ├── Calculator.tsx                # Client: state owner, URL sync, derived outputs
│       ├── CalculatorConfigContext.tsx   # Context: provides runtime config to children
│       ├── ControlsPanel.tsx             # Vertical stack: deal value → strategy → 5 sliders
│       ├── BenchmarkSlider.tsx           # Slider + tick marks + status badge + help icon
│       ├── StrategyToggle.tsx            # Radix slider with 3 landmarks (24k/12k/8k)
│       ├── ChannelMix.tsx                # Email / LinkedIn / Cold-calling pills
│       ├── FunnelViz.tsx                 # 7-stage funnel (emails sent → ... → deals)
│       ├── MetricsPanel.tsx              # Deals/month + Revenue/month
│       ├── NumberInput.tsx               # $ prefix input
│       ├── PdfCaptureForm.tsx            # Placeholder for M5
│       └── TweenedNumber.tsx             # rAF-based smooth number animation
├── lib/
│   ├── calculations.ts                   # Pure ROI math (no React)
│   ├── types.ts                          # CalculatorInputs, CalculatorOutputs, BenchmarkStatus
│   ├── defaults.ts                       # All hardcoded defaults (fallback when Supabase down)
│   ├── config-loader.ts                  # Fetches config from Supabase, 60s ISR cache
│   ├── config-types.ts                   # CalculatorConfig type + FALLBACK_CONFIG
│   ├── url-state.ts                      # Serialize inputs to URL search params
│   ├── admin-auth.ts                     # Password gate + HMAC session cookie
│   ├── utils.ts                          # cn, formatCurrency, formatInteger, formatPercent
│   └── supabase/
│       ├── admin.ts                      # Service-role client (server-only writes)
│       └── server.ts                     # Anon client for server components (config reads)
├── hooks/
│   └── useTween.ts                       # rAF + ease-out quartic, respects prefers-reduced-motion
├── tests/
│   └── calculations.test.ts              # 34 assertions
├── docs/
│   ├── m1-cold-email-funnel.md           # Phase 1 deliverable
│   ├── m2-setup.md                       # Phase 2 deliverable
│   ├── m3-requirements-stack.md          # Phase 3 deliverable
│   ├── m4-verification-scenarios.md      # M4 scenarios with shareable URLs
│   └── session-context.md                # THIS FILE
├── public/
│   └── omnivate-logo.png                 # 1400×300 brand wordmark
├── CLAUDE.md                             # Imports AGENTS.md + this file
├── AGENTS.md                             # Next.js 16 breaking-changes warning
├── package.json
├── .env.local                            # gitignored
└── .gitignore                            # includes .env*, .vercel, .claude/, .next/
```

---

## 6. Current calculator UX (V6 + admin form, what's live)

### Visitor side (`/`)

- **Header**: Omnivate logo (links home) + "Outbound ROI Calculator" pill
- **Title block**: "Run the numbers" eyebrow + headline + one-line description
- **Two-column layout** below the title:
  - **Left column** (scrollable on desktop, takes its own internal scroll):
    1. Average deal value (number input with `$` prefix)
    2. Sequence strategy (Radix slider 0–30,000 snapping to three landmarks at 8k/12k/24k; each landmark shows email count + TAM + lead count)
    3. Open rate slider (snappy steps of 5%)
    4. Reply rate slider (capped at 5%, step 0.5)
    5. Positive reply rate slider
    6. Meeting booked rate slider (capped at 50%, channel-mix pills below)
    7. Close rate slider (no status badge — close varies too much by industry)
  - **Sticky metrics card** anchored at the bottom of the left column:
    Deals/month + Revenue/month (revenue uses brand gradient)
  - **Right column** (sticky, no scroll):
    Funnel viz with 7 stages: emails sent → leads reached → opens → replies → positive → meetings → deals
- **PDF capture form** (placeholder, M5 wires it)
- **Footer** with privacy link to `omnivate.ai/privacy-policy`

### Each slider card

- Field label + value display (top)
- Help icon (?) popover with title + body explainer
- Slider with tick marks at threshold positions
- Anchor labels at both ends ("Deliverability issue" → "Best in class")
- Status badge: **Low** (red), **Average** (amber), **Good** (green) — three bands only, no purple in status
- Contextual feedback sentence below the badge ("Inboxes are hitting the primary tab. Subject lines and sender reputation are strong.")
- Optional footer slot (used by meeting booked → renders ChannelMix)

### Brand palette

- `brand-primary` `#7C3AED` (HSL 263 70% 50%) — main purple
- `brand-secondary` deeper purple
- `brand-accent` `brand-electric` mid/light purple
- `brand-sunset` `#D97706` (HSL 38 92% 45%) — warm amber accent
- Status colours: destructive red, warning amber, success green
- Light theme: white surfaces, near-black text, subtle gray borders
- Subtle radial gradient mesh in page background

---

## 7. Admin UI (`/admin`)

### Auth: shared password (NOT Supabase Auth)

We tried Supabase magic-link first but the Site URL configuration was
finicky. Switched to a simpler shared-password gate.

- Visitor hits `/admin/login`, sees a password field
- Server action verifies the password against `ADMIN_PASSWORD` env var (constant-time compare)
- On match, server signs `{admin: true, exp: now+7d}` with HMAC-SHA256 using `ADMIN_SESSION_SECRET` and sets it as an `httpOnly`, `secure`, `sameSite=strict` cookie
- `/admin` server-side verifies the cookie on every request via `isAdmin()` in `lib/admin-auth.ts`
- Sign out clears the cookie

### Form (structured, not raw JSON)

Sections, all collapsible:

1. **Global settings** (open by default) — monthly capacity, channel mix thresholds, default sequence
2. **Sequence strategy** — 3 columns (1/2/3 emails per contact), each with label, TAM, description, leads reached
3. **Open rate** — collapsible card with: 3 status copy textareas, help popover, anchor labels, average/good thresholds + tick labels, min/max/step + default
4. **Reply rate** — same shape
5. **Positive reply rate** — same shape
6. **Meeting booked rate** — same shape
7. **Close rate** — same shape (status hidden on calculator but config still editable)
8. **Average deal value** — same shape
9. **Advanced: raw JSON** — escape hatch, can apply-to-form or sync-from-form

**Sticky save bar** at bottom of viewport with Reset + Save. Detects dirty state. Shows "All changes saved" / "Unsaved changes" / "✓ Saved" / error.

### Save flow

1. Admin edits form → local state updates
2. Click "Save changes" → calls `saveConfig(payload)` server action
3. Server: `isAdmin()` check → SELECT existing payload → UPSERT new payload to `roi_calc.config` → INSERT audit row to `roi_calc.config_changes` → `revalidateTag("calculator-config")`
4. Within 60 seconds, public calculator picks up new config

---

## 8. The math

Pure functions in `lib/calculations.ts`. No React, no side effects.
Defaults in `lib/defaults.ts`. Tests in `tests/calculations.test.ts`.

```
emailsSentPerMonth   = min(leadsReached × sequenceSteps, 24000)
contactsReached      = leadsReached
opens                = contacts × openRate/100
replies              = contacts × replyRate/100
positiveReplies      = replies × positiveReplyRate/100
meetings             = positiveReplies × meetingBookedRate/100
deals                = meetings × closeRate/100
revenuePerMonth      = deals × dealValue
revenuePerYear       = revenuePerMonth × 12
```

Default inputs land on `~$162,000` revenue per month (6 deals × $25k × default rates).

Capped values:
- `MONTHLY_EMAIL_CAPACITY = 24_000` (a constant)
- Meeting booked rate max = 50%
- Reply rate max = 5%
- Strategy slider: only 3 valid lead counts (24k / 12k / 8k)

Status bands (3 only, simplified from earlier 4-band poor/avg/healthy/benchmark):

| Slider | Poor (red) | Average (amber) | Good (green) |
|---|---|---|---|
| openRate | 0-29 | 30-49 | 50+ |
| replyRate | 0-1.4 | 1.5-2.4 | 2.5+ |
| positiveReplyRate | 0-14 | 15-24 | 25+ |
| meetingBookedRate | 0-9 | 10-24 | 25+ |
| closeRate | 0-9 | 10-17 | 18+ |
| dealValue | 0-999 | 1000-9999 | 10000+ |

### Channel mix thresholds (meeting booked rate)

- Email: always lit (>= 0)
- LinkedIn: lights up at 25%
- Cold calling: lights up at 40%

---

## 9. Phase history (what's shipped)

| Phase | Mini-project | Status | Doc |
|---|---|---|---|
| 1 | M1 Funnel literacy | ✓ Shipped | `docs/m1-cold-email-funnel.md` |
| 2 | M2 Tooling setup | ✓ Shipped | `docs/m2-setup.md` |
| 3 | M3 Requirements stack | ✓ Shipped (signed off by Omar) | `docs/m3-requirements-stack.md` |
| 4 | M4 Build calculator | ✓ Shipped (V1 → V6 iterations) | `docs/m4-verification-scenarios.md` |
| 5 | M5 PDF + Smartlead + persistence | **NOT STARTED** | — |

---

## 10. Key Omar/Sheriff decisions across V1-V6

| Decision | Outcome |
|---|---|
| V1 hero: massive ROI multiple | REMOVED — felt unrealistic |
| V1 hero: annual revenue as headline | REMOVED — same reason |
| Infrastructure inputs (domains, mailboxes, send limits, working days) | REMOVED |
| Sales motion toggle (sales-led / self-service SaaS) | REMOVED |
| Subscription/LTV/churn handling | REMOVED |
| Hidden pipeline conversion line | REMOVED |
| Halo uplift line | REMOVED |
| Time horizon toggle (6/12/24 months) | REMOVED |
| Comparison view (without/with Omnivate) | REMOVED |
| Omnivate fee + ROI multiple/net | REMOVED |
| Sensitivity band (±10% range) | REMOVED |
| Status bands: 4 (poor/avg/healthy/benchmark) | COLLAPSED to 3 (poor/avg/good) |
| Status colours: included brand purple | NOW only red/amber/green (purple = brand only) |
| Meeting booked rate max: 100% | CAPPED at 50% |
| Slider steps: continuous | SNAPPY (5% / 0.5%) |
| Theme: dark (V2) | LIGHT (V3+) |
| Strategy: 3 cards | → 3-segment toggle → SINGLE Radix slider with 3 landmarks |
| Admin auth: Supabase magic link | SHARED PASSWORD GATE (Site URL config was finicky) |
| Admin UI: raw JSON textarea | STRUCTURED FORM with collapsible sections |
| Layout: vertical (everything stacked) | TWO COLUMNS (inputs left scrollable, funnel right sticky) |
| Headline at top: revenue | REMOVED — replaced by small metrics card at bottom of input column |

---

## 11. M5 — outstanding work

The only thing left before the project is fully signed off.

### Scope

1. **Build `app/api/send-pdf/route.ts`** API route that receives the PDF form submission
2. **PDF generation** — recommendation: `@react-pdf/renderer` (clean Vercel-friendly, no Puppeteer needed). Generate a one-page branded PDF summarizing the visitor's inputs and projected outputs.
3. **Supabase lead persistence** — create new table `roi_calc.leads` (columns: id, email, name, company_name, inputs JSONB, outputs JSONB, created_at). Insert a row before pushing to Smartlead.
4. **Smartlead delivery** — push lead into a transactional campaign that sends the PDF (or hosted PDF link) to the visitor's inbox.
5. **Anti-abuse** — rate limit by IP, basic email format validation, reject obvious junk.
6. **Update `components/calculator/PdfCaptureForm.tsx`** to actually call the API.
7. **Write `docs/launch-runbook.md`** capturing: how to monitor submissions, how to access Smartlead campaign, how to rerun failed submissions.

### Blockers before starting

- Real `SMARTLEAD_API_KEY` from Omar (currently placeholder)
- Real `SMARTLEAD_CAMPAIGN_ID` (Sheriff needs to create the transactional campaign in Smartlead, get the ID, set in Vercel env)
- DNS for `roi.omnivate.ai` (deferred, not blocking)

### Pre-M5 cleanup options

- Drop `roi_calc.admins` table (unused since we switched to password auth)
- Confirm Supabase Pro vs Hobby is fine for our usage levels

---

## 12. How to verify the system locally

```bash
cd C:\Users\HP\Roi-Calculator
pnpm install          # if first time
pnpm test             # 34 tests should pass
pnpm build            # production build
pnpm dev              # http://localhost:3000
```

Visit `/` for the calculator and `/admin/login` to gate-test admin.

---

## 13. Recent commits worth knowing

```
980d9ab Structured admin form UI
577268f Switch admin auth from magic link to password gate
76d7289 Strategy slider with 3 landmarks + scrollable input column
...     V6 layout / V5 simplification / V4 polish / V3 light theme / V2 simplification / V1 build
```

---

## 14. Conventions Claude should follow when iterating

- **No dashes in visible copy** (use "to", "and", or commas)
- **No ALL CAPS for emphasis** in copy (uppercase tracking via Tailwind utility classes for eyebrows is fine)
- **Light theme only** (no dark mode toggle, no second theme)
- **Brand purple is for interactive surfaces** (active controls, slider tracks, links). Status colours are red/amber/green only.
- **Tone**: sophisticated, data-driven, professional. Never salesy. Confident, concrete.
- **Math layer is the source of truth** — UI never invents numbers; it only displays what `lib/calculations.ts` returns
- **Math layer formulas come from `docs/m1-cold-email-funnel.md`** — if a number on screen doesn't match a formula in M1, that's a bug
- **All new editable copy should go through Supabase config**, not be hardcoded
- **Pre-commit hook (secretlint) blocks accidental secrets** — if a commit hits the hook, fix the leak don't bypass

---

## 15. If a future session needs to do anything destructive

- **Never drop existing tables outside the `roi_calc` schema** — the n8n Knowledge Base Supabase project has production data from the Omnivate outbound campaigns system. Anything outside `roi_calc.*` is off-limits.
- **Never push --force to main** — the repo is public, Vercel deploys main, and history matters.
- **Always run `pnpm test` and `pnpm build` before pushing** — both should pass.
- **secretlint runs on every commit** — if it blocks, fix the actual leak.

---

## End of context

If you (Claude) are reading this after a `/compact` or a fresh session,
this is the project's complete state as of 2026-05-15. The next thing
to ship is M5 (PDF + Smartlead + persistence). Sheriff is waiting on
the Smartlead API key + campaign ID from Omar before M5 can fully
deliver, but the code can be built and merged in the meantime.
