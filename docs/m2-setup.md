# M2. Tooling setup

Author: Sheriff
Last updated: 2026-05-05
Status: Phase 2 deliverable, scaffold complete and pending Vercel project link

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

**Status: pending team invite from Omar.**

The Omnivate Vercel team is the deployment target. The user signing up for Vercel needs to be invited to the existing team rather than creating a new one. Action: Omar invites via vercel.com → Omnivate team → Settings → Members → Invite.

Once joined and signed in via `vercel login`, the M2 finishing steps:

1. Run `vercel link` from the local repo to create the project under the Omnivate team
2. Confirm the linked project appears in the Vercel dashboard
3. Push to `main` and watch auto deploy succeed
4. Add four empty environment variable slots (see below)
5. Custom subdomain `roi.omnivate.ai` is deferred until Omar approves DNS access

### Environment variables (placeholder slots, to be added in Vercel)

| Variable | Phase that uses it | Notes |
|---|---|---|
| `SMARTLEAD_API_KEY` | Phase 5 | API key for the Omnivate Smartlead account |
| `SMARTLEAD_CAMPAIGN_ID` | Phase 5 | Campaign ID for the transactional PDF delivery campaign (created in Phase 5) |
| `SUPABASE_URL` | Phase 5 | Supabase project URL for lead persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | Phase 5 | Service role key for server side writes from the API route |

All four are added as empty placeholders so Phase 5 wiring does not require redeploys for env var changes.

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

* [ ] Omar invites Sheriff to the Omnivate Vercel team
* [ ] Sheriff runs `vercel login` and `vercel link` from the local repo
* [ ] First successful Vercel deploy confirms the placeholder homepage at the Vercel default URL
* [ ] Four empty env var slots added in the Vercel project
* [ ] M2 Loom recorded showing the live URL, repo on GitHub, Vercel project, and the Frontend Design plugin responding in Claude Code

Phase 3 (M3 requirements stack) starts after Omar signs off on M2.
