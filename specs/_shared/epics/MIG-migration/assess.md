# Migration assessment: taylor-aucoin

- Target: `/Users/taylor/lighthouse/taylor-aucoin` at `44a749a114b78b0b10eb337f8fc61a1e9e2a5276`
- Toolkit: `80699b2ac53680f0766ccbf7f00c52a601bb04e9`
- Total: **23** of 34 measured (17 of 17 signals)
- Gate: **failed** (S1 = 2: no workspaces and no turbo.json)
- Path: **far** (the gate: S1 = 2: no workspaces and no turbo.json)

## Shape

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| S1 | Workspaces and turbo.json | 3 | 2 | no workspaces in the root package.json; no turbo.json at the root |
| S2 | Toolchain majors against tech-stack | 3 | 1 | off: next ^15.1.0 in package.json (practice: Next.js 16); not declared: Node |

## Checks

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| C1 | One verify command | 2 | 2 | no verify script, and no CI file chains two kinds of check |
| C2 | CI config | 2 | 2 | no CI file is tracked |
| C3 | Tests | 2 | 2 | no test runner; no test files |
| C4 | Type check and lint scripts | 2 | 0 | type check: typecheck; lint: lint |
| C5 | Read-only format check | 2 | 1 | write-only: format: prettier --write "**/*.{ts,tsx,md}" |

## Conventions

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| V1 | Boundaries lint | 3 | 2 | no packages/config/eslint/boundaries.js |
| V2 | Token preset | 3 | 2 | no packages/config/tailwind/preset.css |
| V3 | process.env outside env.ts | 3 | 1 | 16 files read process.env outside an env.ts: app/banner-export/save/route.ts, app/websites/coded/intake/_actions/start.ts, app/websites/intake/_actions/start.ts and 13 more |
| V4 | "use client" outside a components folder | 3 | 0 | 5 of 157 "use client" files sit outside a _components/ or components/ folder (3%) |
| V5 | SDK importers no reviewer glob matches | 3 | 2 | 18 of 29 SDK-importing files match no reviewer glob |

## Process

| # | Signal | Layer | Score | Evidence |
| --- | --- | --- | --- | --- |
| P1 | Instruction lines that conflict | 1 | 0 | no line in 2 instruction file(s) contradicts a toolkit policy |
| P2 | Docs with frontmatter | 1 | 2 | 0 of 164 markdown files under docs/ open with frontmatter (0%) |
| P3 | Record kinds in a foreign format | 1 | 2 | 7 deviation logs, 7 decision logs |
| P4 | Living truth | 1 | 1 | 3 UX spec files outside specs/<app>/ux/: docs/admin/ADMIN-UX-SPEC.md, docs/crm/CRM-UX-SPEC.md, docs/intake/INTAKE-UX-SPEC.md |
| P5 | Doc paths with spaces or non-ASCII | 1 | 1 | 10 tracked markdown paths hold a space or a non-ASCII character: Forge—staff-engineer-role-prompt.md, Loom—ai-systems-architect-role-prompt.md and 8 more |

## Conflicts

Instruction lines against a toolkit policy; the interview rules each team or operator.

none

## SDK importers

Money, auth, email and AI SDKs, with the toolkit reviewer glob that reaches the file, or none.

| File | Module | Matched by |
| --- | --- | --- |
| app/api/webhooks/stripe/_handlers/checkout-session-async-failed.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/checkout-session-async-succeeded.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/checkout-session-completed.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/deposit-settlement.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/index.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/invoice-finalized.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/invoice-marked-uncollectible.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/invoice-paid.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/invoice-payment-failed.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/_handlers/types.ts | stripe | **/webhooks/stripe/** |
| app/api/webhooks/stripe/route.ts | stripe | **/webhooks/stripe/** |
| middleware.ts | @supabase/ssr | none |
| scripts/grant-admin.ts | @supabase/supabase-js | none |
| scripts/seed-example-sites.ts | @supabase/supabase-js | none |
| scripts/setup-stripe-catalogue.ts | stripe | none |
| scripts/verify-storage.ts | @supabase/supabase-js | none |
| server/services/admin-auth.ts | @supabase/ssr | none |
| server/services/agora-invoicing.ts | stripe | none |
| server/services/come-across.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/deposit.ts | stripe | none |
| server/services/emails.ts | resend | none |
| server/services/example-captures.ts | @supabase/supabase-js | none |
| server/services/extract.ts | @anthropic-ai/sdk | none |
| server/services/extract.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/invoices.ts | @supabase/supabase-js | none |
| server/services/invoices.ts | stripe | none |
| server/services/orders.ts | stripe | none |
| server/services/primer.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/style-search.ts | @anthropic-ai/sdk | none |
| server/services/style-search.ts | @anthropic-ai/sdk/helpers/zod | none |
| server/services/submission.ts | @supabase/supabase-js | none |
| server/services/voice-transcription.ts | openai | none |

## Records by kind

| Kind | Path | Lines |
| --- | --- | --- |
| ux spec | docs/admin/ADMIN-UX-SPEC.md | 369 |
| deviation log | docs/admin/specs/DEVIATIONS.md | 132 |
| progress log | docs/admin/specs/PROGRESS.md | 18 |
| decision log | docs/admin/specs/TECHNICAL-DECISIONS.md | 17 |
| ux spec | docs/crm/CRM-UX-SPEC.md | 177 |
| deviation log | docs/crm/specs/DEVIATIONS.md | 90 |
| progress log | docs/crm/specs/PROGRESS.md | 25 |
| decision log | docs/crm/specs/TECHNICAL-DECISIONS.md | 287 |
| deviation log | docs/finance/specs/DEVIATIONS.md | 25 |
| progress log | docs/finance/specs/PROGRESS.md | 12 |
| decision log | docs/finance/specs/TECHNICAL-DECISIONS.md | 62 |
| ux spec | docs/intake/INTAKE-UX-SPEC.md | 309 |
| deviation log | docs/intake/specs/DEVIATIONS.md | 122 |
| progress log | docs/intake/specs/PROGRESS.md | 122 |
| decision log | docs/intake/specs/TECHNICAL-DECISIONS.md | 190 |
| deviation log | docs/pipeline/specs/DEVIATIONS.md | 31 |
| progress log | docs/pipeline/specs/PROGRESS.md | 106 |
| decision log | docs/pipeline/specs/TECHNICAL-DECISIONS.md | 59 |
| deviation log | docs/review/specs/DEVIATIONS.md | 29 |
| progress log | docs/review/specs/PROGRESS.md | 55 |
| decision log | docs/review/specs/TECHNICAL-DECISIONS.md | 59 |
| host role prompt | docs/roles/engineering/Forge—staff-engineer-role-prompt.md | 146 |
| host role prompt | docs/roles/engineering/Loom—ai-systems-architect-role-prompt.md | 142 |
| host role prompt | docs/roles/engineering/Mason—cto-principle-dev-role-prompt.md | 144 |
| host role prompt | docs/roles/engineering/Reeve—project-manager-role-prompt.md | 142 |
| host role prompt | docs/roles/engineering/Vigil—qa-role-prompt.md | 148 |
| host role prompt | docs/roles/engineering/Warden—security-privacy-engineer-role-prompt.md | 143 |
| host role prompt | docs/roles/marketing-growth/Drummer—sales-funnel-lead-role-prompt.md | 145 |
| host role prompt | docs/roles/product-design/Vesper—ux-ui-designer-role-prompt.md | 146 |
| host role prompt | docs/roles/trust-legal-compliance/Chancery—regulatory-counsel-role-prompt.md | 145 |
| host role prompt | docs/roles/trust-legal-compliance/Porter—member-support-trust-safety-role-prompt.md | 144 |
| deviation log | docs/websites/specs/DEVIATIONS.md | 249 |
| progress log | docs/websites/specs/PROGRESS.md | 93 |
| decision log | docs/websites/specs/TECHNICAL-DECISIONS.md | 470 |
| closed spec folder | docs/admin/specs/ | 9 |
| closed spec folder | docs/crm/specs/ | 11 |
| closed spec folder | docs/finance/specs/ | 13 |
| closed spec folder | docs/intake/specs/ | 14 |
| closed spec folder | docs/pipeline/specs/ | 9 |
| closed spec folder | docs/review/specs/ | 8 |
| closed spec folder | docs/websites/specs/ | 37 |

## Collisions

Practice paths the target already holds; each stops for a ruling.

- `AGENTS.md`
- `CLAUDE.md`
- `docs/roles/`

## Hygiene

Reported, never scored.

- Branch: `feature/pem-migration`; no `refs/remotes/origin/feature/pem-migration`
- Working tree: clean
- Worktrees: none
- Tracked files over 10 MB: public/work/agora/home/agora-home-demo.mov (71 MB)
