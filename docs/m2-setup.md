# M2. Tooling setup

Author: Sheriff
Last updated: 2026-05-05
Status: Phase 2 deliverable, scaffold and first Vercel deploy live, blocked on auto deploy until plan or repo visibility resolved

---

## Purpose

Capture every decision, install, and quirk encountered during the project's tooling setup so anyone who joins later can reproduce or extend the environment without guessing.

---

## What got installed

### Claude Code MCPs and skills

| Tool | Type | Source | Notes |
|---|---|---|---|
| GitHub MCP | Connector | Pre-installed | Already configured at the user level. Used for repo operations during M2. |
| Vercel MCP | Connector (HTTP) | `https://mcp.vercel.com` | Added via `claude mcp add --transport http vercel https://mcp.vercel.com`. OAuth happens on first invocation. |
| `example-skills` plugin | Plugin from `anthropic-agent-skills` marketplace | `anthropics/skills` GitHub repo | Bundles `frontend-design`, `theme-factory`, `brand-guidelines`, `web-artifacts-builder` and others. Used for M3 visual proposal and M4 build. |

A leftover `vercel-dev` MCP entry from a prior machine config is still in settings and not connecting. Not blocking. Can be removed with `claude mcp remove vercel-dev` whenever convenient.

### Local dependencies

* Node 22.12.0
* pnpm (path: `C:/Users/HP/AppData/Roaming/npm/pnpm`)
* GitHub CLI 2.x

---

## Repo and project

* GitHub repo: [`Omnivate-AI/Roi-Calculator`](https://github.com/Omnivate-AI/Roi-Calculator)
* Local clone: `C:\Users\HP\Roi-Calculator\`
* Default branch: `main`

The repo name uses mixed casing (`Roi-Calculator`) which trips npm's package naming rules. Workaround: scaffolded into a temporary directory called `roi-calculator-scaffold`, moved files into the actual repo, then edited `package.json` to set `"name": "roi-calculator"` (lowercase). The directory name does not need to match the package name.

---

## Next.js scaffold

* Next.js 16.2.4 (App Router)
* React 19.2.4
* TypeScript 5
* Tailwind CSS v4 (using new `@theme inline` syntax in `app/globals.css`)
* ESLint 9 with `eslint-config-next`
* No `src/` directory
* Import alias: `@/*`

Scaffold command used:

```
pnpm dlx create-next-app@latest roi-calculator-scaffold \
  --typescript --tailwind --app --no-src-dir \
  --import-alias "@/*" --eslint --use-pnpm --yes
```

A note on Next.js 16: this version has breaking changes from prior majors. The scaffold dropped an `AGENTS.md` file at the repo root reminding agents to consult `node_modules/next/dist/docs/` before writing Next.js code. Worth following.

### Files customised after scaffold

* `package.json` — name set to `roi-calculator`
* `app/layout.tsx` — metadata title and description set to Omnivate ROI Calculator copy
* `app/page.tsx` — replaced default Next.js boilerplate with a sophisticated dark placeholder reading "ROI Calculator. In development. Phase 2 of 5."
* `README.md` — rewritten for the actual project

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

* Vercel username: `amzat-1257`
* Active scope: `amzat-1257's projects` (personal scope, no Omnivate team membership yet)
* Project: `roi-calculator` under `amzat-1257s-projects/roi-calculator`
* Local link: `.vercel/` directory in repo root, gitignored

### Live URL

The first production deploy is live at:

* Stable alias: **`https://roi-calculator-taupe-ten.vercel.app`**
* Specific deployment: `https://roi-calculator-artf79u15-amzat-1257s-projects.vercel.app`
* Vercel inspector: `https://vercel.com/amzat-1257s-projects/roi-calculator/dpl_5eUEpcjd7zahQMS5sr2JHirVq76a`

Build completed in 21 seconds, status `READY`, target `production`. The placeholder homepage renders correctly.

### Auto deploy on push to main: not yet working

Linking the GitHub repo to Vercel for automatic deploys on push failed with:

> The repository "Roi-Calculator" is private and owned by an organization, which is not supported on the Hobby plan. Upgrade to Pro to continue.

This means: with a personal Hobby account, Vercel cannot watch a private GitHub org repo for pushes. Two paths forward:

1. **Make the GitHub repo public.** The cheapest fix. The codebase is a public ROI calculator with no secrets baked in (all sensitive values live in Vercel env vars). Auto deploy works on Hobby once the repo is public.
2. **Move to the Omnivate team on a Pro plan.** Once Sheriff is invited to the Omnivate Vercel team and the team has Pro features, the project is transferred (one click) and auto deploy starts working with the repo staying private.

Decision pending from Omar.

### Manual deploy in the meantime

Until auto deploy is wired, fresh deploys require running this from the local repo:

```
vercel deploy --prod --yes
```

This is fine for low frequency Phase 3 and Phase 4 work but slows the iteration loop. Worth resolving before Phase 4 build kicks off.

### Environment variables

Four placeholder slots are configured in production:

| Variable | Phase that uses it | Current value | Notes |
|---|---|---|---|
| `SMARTLEAD_API_KEY` | Phase 5 | `placeholder_set_in_phase_5` | Replace with the Omnivate Smartlead API key when wiring PDF delivery |
| `SMARTLEAD_CAMPAIGN_ID` | Phase 5 | `placeholder_set_in_phase_5` | Replace with the transactional PDF delivery campaign ID created in Phase 5 |
| `SUPABASE_URL` | Phase 5 | `placeholder_set_in_phase_5` | Supabase project URL for lead persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 5 | `placeholder_set_in_phase_5` | Service role key for server side writes from the API route |

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

* [x] Frontend Design, GitHub MCP, and Vercel MCP installed and verified
* [x] Next.js 16 scaffold committed to GitHub `main`
* [x] `pnpm build` produces clean production build
* [x] First successful Vercel deploy live at `https://roi-calculator-taupe-ten.vercel.app`
* [x] Four env var slots configured (placeholder values, real values land in Phase 5)
* [ ] Omar decision: make GitHub repo public, or invite Sheriff to Omnivate Vercel Pro team
* [ ] Auto deploy on push to `main` working (depends on the decision above)
* [ ] M2 Loom recorded showing the live URL, repo on GitHub, Vercel project, and the Frontend Design plugin responding in Claude Code

Phase 3 (M3 requirements stack) can start in parallel with the Vercel auto deploy resolution since M3 is pure documentation work and does not require redeploys.
