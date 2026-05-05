# Omnivate ROI Calculator

A free, interactive web tool that lets a visitor enter a small set of numbers about their business and see a projected revenue lift from running outbound through Omnivate. The calculator teaches the cold email funnel, quantifies the upside, and captures a qualified email through a branded PDF export.

Hosted at `roi.omnivate.ai`.

## Project status

| Phase | Mini project | Status |
|---|---|---|
| 1 | M1 Funnel literacy | Complete (`docs/m1-cold-email-funnel.md`) |
| 2 | M2 Tooling setup | In progress |
| 3 | M3 Requirements stack | Pending |
| 4 | M4 Build calculator | Pending |
| 5 | M5 PDF export and Smartlead delivery | Pending |

## Tech stack

* Next.js 16 (App Router)
* TypeScript
* Tailwind CSS v4
* Vercel (free tier)
* Smartlead (PDF delivery, Phase 5)
* Supabase (lead persistence, Phase 5)

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser.

```bash
pnpm build    # production build
pnpm lint     # ESLint
```

## Project structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx            # Calculator (placeholder until M4)
│   └── globals.css
├── docs/                   # Phase deliverables and reference docs
│   ├── m1-cold-email-funnel.md
│   └── m2-setup.md
├── public/
└── package.json
```

## Documentation

* [M1 funnel literacy](./docs/m1-cold-email-funnel.md)
* [M2 setup notes](./docs/m2-setup.md)

## License

Proprietary. Built by Omnivate AI.
