# tayloraucoin.com — agent contract

The canonical instructions for every agent (Claude Code, Cursor, Codex). `CLAUDE.md` is a shim that imports this file and `docs/index.md`. Shared guidance is written only here.

## Start here

1. **What this is:** Taylor Aucoin's site and studio admin (tayloraucoin.com): one Next.js app at the repo root, under the practice since 2026-10-14 ([record 0001](docs/decisions/records/0001-adopt-the-practice.md)). The docs from before are history in `docs/_legacy/`, law only where this file or a path rule names one.
2. **Current work:** live state is `specs/_status.md`; open host work is drafted under `specs/web/`, layer 3 under `specs/_shared/epics/MIG-migration/`.
3. **Read [`docs/index.md`](docs/index.md) first, every session.** It is the map: the layers, the precedence ladder, what loads always, by path, by trigger and never, and the token budget.
4. **Before any UI work, read [`docs/design/canon.md`](docs/design/canon.md)** and the product's design law: `.claude/rules/house-design.md` and the guides it names, until layer 3 part 9 writes the design layer.
5. **State the exact file paths before implementing.** Placement is decided by one question, who imports this ([`docs/engineering/codebase-conventions.md`](docs/engineering/codebase-conventions.md) §1).
6. **Verify the way CI does:** `yarn verify`.

## Work loop

- **Work starts at the prompt builder** ([`docs/workflows/prompt-builder.md`](docs/workflows/prompt-builder.md), `tk-prompt`): it settles the track, cast, QA level, pace, involvement and branch with the operator, then prints the prompt. Handed work with no prompt and no ticket, run the builder first; tiny work takes its fast lane.
- **The track sets the path** ([`docs/workflows/tracks/`](docs/workflows/tracks/README.md)). A ticket and contract exist when the track or the operator calls for one (`yarn contract:init`); otherwise the prompt is the brief.
- **The QA level sets proof, review and paperwork** ([`docs/workflows/qa-levels.md`](docs/workflows/qa-levels.md)). Q0: nothing extra. Q1: run the criteria; verify at the close. Q2: plus one fresh-context reviewer, findings in the thread. Q3 (money, auth, schema, personal data, agent permissions): proofs checked for staleness before a merge, the specialists the operator confirmed, review files kept. Only tooling writes `results.json`. Flag a critical path below Q3 once; raise a named part on request.
- **Take the work to done yourself** (`tk-batch`), one ticket per thread: build; the operator looks; on "harden", prove, review, verify once; report in six lines at most. You run every command and decide what is reversible; stop only as the chosen involvement says. The operator gets what a person alone can do: a choice that cannot be undone, money, growing scope, a credential, a protected file, the merge. Never hand the operator a command to run.
- **Stay in your own work.** Never re-prove, re-review or commit another ticket's files; a commit to a shared file reopens nothing.
- **Never filed:** prompt files, evidence logs, review files below Q3.
- **`specs/<app>/ux/` is the living truth** of how the app works now. Work that changes behaviour updates it in the same change; an epic proposes in its own `ux/` and shipping promotes it.

## Commands

- Verify (matches CI): `yarn verify` · `yarn verify:fast` (changed files)
- Dev and build, agents only: `yarn dev:agent` (:4300) · `yarn build:agent` · `yarn start:agent` (:4310)
- Code checks: `yarn lint` · `yarn typecheck` · `yarn test`
- Database: `yarn db:generate` · `yarn db:migrate` · `yarn db:setup` · `yarn db:seed`
- Docs checks: `yarn lint:docs` · `yarn budget` · `yarn check-refs`
- Specs: `yarn contract:init` · `yarn status` · `yarn check-specs`
- Generated files: `yarn gen:agents` (`.claude/agents/`)

Node 22, Yarn 4.13.0 (`corepack enable && yarn install`).

## UI vocabulary (the constraint)

- **The repo's own components and tokens** (`components/`, `app/globals.css`) until layer 3 lands the preset and kit.
- **The slop tells are banned by ID**: canon §2, A-01 to A-20. Cite the ID in prompts and reviews.
- Every reachable state of a new surface is designed and reachable by `?state=` (canon C-P08).

## Keeping instructions in sync

- `CLAUDE.md` holds only imports and Claude-only lines. Nested files add only folder-local rules and never restate this one.

## House rules

- **Next.js 15**, App Router, TypeScript strict
- Content is typed TS in `content/`. No CMS.
- Deploy: Vercel. Domain: `tayloraucoin.com`.

**Never run `yarn dev` or `yarn build` — use `dev:agent` / `build:agent`.** Taylor keeps a dev server up in iTerm on port 3000. Every Next process in this repo shares one `.next`, so `next build` clears and rewrites the manifests that running server re-reads per request: it stays alive but serves `ENOENT` on every route until restarted. The `:agent` scripts set `NEXT_DIST_DIR` (`.next-agent`, `.next-build`) and port **4300**, deliberately far from the 3000-3010 block Taylor runs his own dev servers in, so agent work cannot reach any of them. Same reason `.claude/launch.json` launches `dev:agent`. Do not go hunting for a process on 3000 and do not kill it.

Copy in the repo today is placeholder. Taylor is writing the real copy himself. Do not "improve" it unprompted.
