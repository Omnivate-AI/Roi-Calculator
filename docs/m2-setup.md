# M2. Tooling setup

Author: Sheriff
Last updated: 2026-05-06
Status: Phase 2 deliverable, complete and ready for sign off

---

## Purpose

Capture every decision, install, and quirk encountered during the project's tooling setup so anyone who joins later can reproduce or extend the environment without guessing.

---

## What got installed

### Claude Code MCPs and skills

| Tool                    | Type                                             | Source                          | Notes                                                                                                                                         |
| ----------------------- | ------------------------------------------------ | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| GitHub MCP              | Connector                                        | Pre-installed                   | Already configured at the user level. Used for repo operations during M2.                                                                     |
| Vercel MCP              | Connector (HTTP)                                 | `https://mcp.vercel.com`        | Added via `claude mcp add --transport http vercel https://mcp.vercel.com`. OAuth happens on first invocation.                                 |
| `example-skills` plugin | Plugin from `anthropic-agent-skills` marketplace | `anthropics/skills` GitHub repo | Bundles `frontend-design`, `theme-factory`, `brand-guidelines`, `web-artifacts-builder` and others. Used for M3 visual proposal and M4 build. |

A leftover `vercel-dev` MCP entry from a prior machine config is still in settings and not connecting. Not blocking. Can be removed with `claude mcp remove vercel-dev` whenever convenient.

### Local dependencies

- Node 22.12.0
- pnpm (path: `C:/Users/HP/AppData/Roaming/npm/pnpm`)
- GitHub CLI 2.x

---

## Repo and project

- GitHub repo: [`Omnivate-AI/Roi-Calculator`](https://github.com/Omnivate-AI/Roi-Calculator)
- Local clone: `C:\Users\HP\Roi-Calculator\`
- Default branch: `main`

The repo name uses mixed casing (`Roi-Calculator`) which trips npm's package naming rules. Workaround: scaffolded into a temporary directory called `roi-calculator-scaffold`, moved files into the actual repo, then edited `package.json` to set `"name": "roi-calculator"` (lowercase). The directory name does not need to match the package name.

---

## Next.js scaffold

- Next.js 16.2.4 (App Router)
- React 19.2.4
- TypeScript 5
- Tailwind CSS v4 (using new `@theme inline` syntax in `app/globals.css`)
- ESLint 9 with `eslint-config-next`
- No `src/` directory
- Import alias: `@/*`

Scaffold command used:

```
pnpm dlx create-next-app@latest roi-calculator-scaffold \
  --typescript --tailwind --app --no-src-dir \
  --import-alias "@/*" --eslint --use-pnpm --yes
```

A note on Next.js 16: this version has breaking changes from prior majors. The scaffold dropped an `AGENTS.md` file at the repo root reminding agents to consult `node_modules/next/dist/docs/` before writing Next.js code. Worth following.

### Files customised after scaffold

- `package.json` — name set to `roi-calculator`
- `app/layout.tsx` — metadata title and description set to Omnivate ROI Calculator copy
- `app/page.tsx` — replaced default Next.js boilerplate with a sophisticated dark placeholder reading "ROI Calculator. In development. Phase 2 of 5."
- `README.md` — rewritten for the actual project

### Local commands

```bash
pnpm install      # install dependencies
pnpm dev          # local dev server at http://localhost:3000
pnpm build        # production build
pnpm lint         # eslint
```

---

## Vercel

### Account and project

- Vercel username: `amzat-1257`
- Active scope: `amzat-1257's projects` (personal scope, no Omnivate team membership yet)
- Project: `roi-calculator` under `amzat-1257s-projects/roi-calculator`
- Local link: `.vercel/` directory in repo root, gitignored

### Live URL

The first production deploy is live at:

- Stable alias: **`https://roi-calculator-taupe-ten.vercel.app`**
- Specific deployment: `https://roi-calculator-artf79u15-amzat-1257s-projects.vercel.app`
- Vercel inspector: `https://vercel.com/amzat-1257s-projects/roi-calculator/dpl_5eUEpcjd7zahQMS5sr2JHirVq76a`

Build completed in 21 seconds, status `READY`, target `production`. The placeholder homepage renders correctly.

### Auto deploy on push to main: working

Initial setup hit a Hobby plan limitation: Vercel free tier does not allow auto deploy from a private repo owned by a GitHub organization. Decision after standup with Omar: **make the repo public.** The codebase is a marketing facing ROI calculator with no secrets in code (all sensitive values are Vercel environment variables) and no proprietary algorithms (the funnel math is industry standard, documented at the public reference site cold-email-roi-calculator.com).

After flipping the repo to public:

```
vercel git connect https://github.com/Omnivate-AI/Roi-Calculator
```

Connection succeeded. Every push to `main` now triggers a Vercel build and production deploy automatically. No manual `vercel deploy` calls needed for ongoing work.

### Pre commit secret scanning

To eliminate the risk of accidentally committing a secret to the now public repo, a pre commit hook runs [secretlint](https://github.com/secretlint/secretlint) with the recommended preset on every commit. If any staged file contains a string matching known API key, token, or credential patterns, the commit is rejected before it reaches the repo.

Setup details:

- `husky` 9 manages git hooks via `.husky/pre-commit`
- `secretlint` 13 with `@secretlint/secretlint-rule-preset-recommend` does the scanning
- Config lives at `.secretlintrc.json` at the repo root
- Manual scan: `pnpm exec secretlint --secretlintignore .gitignore "**/*"`

### Environment variables

Four placeholder slots are configured in production:

| Variable                    | Phase that uses it | Current value                | Notes                                                                      |
| --------------------------- | ------------------ | ---------------------------- | -------------------------------------------------------------------------- |
| `SMARTLEAD_API_KEY`         | Phase 5            | `placeholder_set_in_phase_5` | Replace with the Omnivate Smartlead API key when wiring PDF delivery       |
| `SMARTLEAD_CAMPAIGN_ID`     | Phase 5            | `placeholder_set_in_phase_5` | Replace with the transactional PDF delivery campaign ID created in Phase 5 |
| `SUPABASE_URL`              | Phase 5            | `placeholder_set_in_phase_5` | Supabase project URL for lead persistence                                  |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 5            | `placeholder_set_in_phase_5` | Service role key for server side writes from the API route                 |

Vercel does not allow truly empty env values, so a placeholder string is used. Replace with real values via the dashboard or `vercel env` CLI in Phase 5. No code references these variables yet, so the placeholders cause no runtime errors.

---

## Custom subdomain

`roi.omnivate.ai` is the intended production URL. Status: deferred. The first Vercel deploy will use the auto generated Vercel URL (pattern `roi-calculator-omnivate-ai.vercel.app` or similar). Once Omar confirms DNS access, the custom domain takes about five minutes to attach in the Vercel project settings plus one CNAME record on the DNS provider side.

---

## Quirks worth noting for future agents

1. **npm package name restrictions.** `Roi-Calculator` (mixed case) cannot be used as a Node package name. Scaffold into a temp directory with a valid lowercase name, then move files. Update `package.json` to set the canonical lowercase name.
2. **Pnpm node_modules on Windows.** Recursive deletion of pnpm node_modules trees on Windows fails frequently due to symlinks and locked files. PowerShell `Remove-Item -Force` does not always succeed. If a clean rebuild is needed, close all editors and shells touching the directory first, or use the Node specific tool `rimraf`.
3. **Inherited MCP config.** The user environment had a stale `vercel-dev` MCP entry pointing at a Mac path that does not exist on Windows. Harmless, but visible as a failed connection in `claude mcp list`. Remove with `claude mcp remove vercel-dev` if desired.
4. **Tailwind v4.** This project uses Tailwind v4 with the new CSS first config inside `app/globals.css` rather than the legacy `tailwind.config.js`. If any component examples from older Tailwind tutorials reference the JS config, translate them into the `@theme` syntax.

---

## Outstanding for M2 sign off

- [x] Frontend Design, GitHub MCP, and Vercel MCP installed and verified
- [x] Next.js 16 scaffold committed to GitHub `main`
- [x] `pnpm build` produces clean production build
- [x] First successful Vercel deploy live at `https://roi-calculator-taupe-ten.vercel.app`
- [x] Four env var slots configured (placeholder values, real values land in Phase 5)
- [x] GitHub repo flipped to public with Omar approval
- [x] Vercel auto deploy on push to `main` connected and working
- [x] Pre commit hook with secretlint installed to prevent accidental secret commits
