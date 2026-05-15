# Omnivate ROI Calculator

A free, interactive web calculator at [roi-calculator-taupe-ten.vercel.app](https://roi-calculator-taupe-ten.vercel.app) that lets a B2B visitor enter assumptions about their outbound program and see projected monthly revenue. The calculator teaches the cold email funnel, quantifies the upside, and captures a lead via a branded one-page PDF.

Custom domain target: `roi.omnivate.ai` (DNS pending).

## Highlights

- **Single-page two-column layout** — input controls on the left, a live funnel visualisation and metrics on the right
- **Pure-function math layer** — every visible number traces back to a typed function in `lib/calculations.ts` covered by 34 unit tests
- **Admin-editable config** — slider limits, thresholds, status copy, sequence strategy all live in Supabase and refresh within 60 seconds of a save via tagged ISR
- **Server-rendered PDF** — `@react-pdf/renderer` produces a branded one pager the visitor downloads inline
- **Lead persistence** — every PDF generation writes to `roi_calc.leads` with the visitor's inputs, computed outputs, and a salted IP hash for rate limiting

## Project status

| Phase | Mini project | Status |
|---|---|---|
| 1 | M1 Funnel literacy | Shipped — `docs/m1-cold-email-funnel.md` |
| 2 | M2 Tooling setup | Shipped — `docs/m2-setup.md` |
| 3 | M3 Requirements stack | Shipped — `docs/m3-requirements-stack.md` |
| 4 | M4 Build calculator | Shipped — `docs/m4-verification-scenarios.md` |
| 5 | M5 PDF + lead persistence | Shipped — `docs/launch-runbook.md` |

Smartlead email delivery is documented as a future enhancement in [docs/launch-runbook.md](./docs/launch-runbook.md) — gated on a Smartlead plan upgrade that includes API access. Inline browser download is the active delivery path.

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript 5
- Tailwind CSS v4 (CSS-first config)
- shadcn/ui primitives + Radix sliders
- Supabase (config storage, lead persistence) — isolated `roi_calc` schema in a shared project
- `@react-pdf/renderer` for server-side PDF generation
- Vercel (Hobby plan, GitHub auto-deploy on push to `main`)
- Vitest for unit tests, Husky + secretlint for pre-commit hooks

## Local development

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Required environment variables (see `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

Other scripts:

```bash
pnpm test         # Vitest (39 tests)
pnpm build        # production build
pnpm lint         # ESLint
```

## Project structure

```
.
├── app/
│   ├── page.tsx                 # Calculator (server: fetches config, renders client)
│   ├── admin/                   # Password-gated admin form for editing the runtime config
│   └── api/send-pdf/            # POST: validate, save lead, render PDF, stream binary
├── components/
│   ├── calculator/              # Calculator, ControlsPanel, FunnelViz, MetricsPanel, sliders
│   └── ui/                      # shadcn primitives
├── lib/
│   ├── calculations.ts          # Pure ROI math (tested)
│   ├── pdf.tsx                  # @react-pdf/renderer template
│   ├── rate-limit.ts            # In-memory IP cap (10 per hour, salted hash)
│   ├── config-loader.ts         # Reads Supabase config with 60s ISR cache
│   ├── admin-auth.ts            # HMAC-signed cookie session
│   └── ...
├── tests/                       # Vitest unit tests
├── docs/                        # Phase deliverables, runbook, session context
└── public/                      # Brand assets
```

## Documentation

- [M1 — cold email funnel literacy](./docs/m1-cold-email-funnel.md)
- [M2 — tooling setup notes](./docs/m2-setup.md)
- [M3 — requirements stack](./docs/m3-requirements-stack.md)
- [M4 — build verification scenarios](./docs/m4-verification-scenarios.md)
- [Launch runbook (ops + Smartlead future work)](./docs/launch-runbook.md)
- [Session context (for handoff and AI rehydration)](./docs/session-context.md)

## License

Proprietary. Built by Omnivate AI.
