# PIPE — Progress

The **only** authoritative answer to "is this Complete."

**Gate policy:** inherits `docs/intake/specs/PROGRESS.md`'s (Taylor, 2026-08-18) — downstream work may start against an upstream that is *code complete*, except where a ticket names an applied migration as its gate (PIPE-2 renders against `0020`).

| Ticket | Title | Depends on | Status | Date |
|---|---|---|---|---|
| PIPE-1 | Schema: pipeline steps, completions, sent emails, remembered values | — | Complete — build, typecheck, lint clean; migration `0020` and `07-pipeline-rls.sql` authored, not run; not exercised against a database | 2026-09-25 |

## Checklist

- [x] PIPE-1 · Schema
- [ ] PIPE-2 · The playbook admin
- [ ] PIPE-3 · The engagement checklist
- [ ] PIPE-4 · Step email send
- [ ] PIPE-5 · Content (Taylor)

## What has been verified, and how

### PIPE-1

No database in the session. What is verified is what can be verified statically:

| Verified | Result |
|---|---|
| Migration shape | `0020_overjoyed_black_bolt.sql` read against the spec: creates `pipeline_steps`, `engagement_step_completions`, `engagement_emails`; adds `engagements.pipeline_values jsonb default '{}'::jsonb not null`; alters nothing else |
| FK semantics | both `step_id` FKs `on delete restrict`; both `engagement_id` FKs `on delete cascade` |
| Constraints | unique (`engagement_id`, `step_id`) on completions; `pipeline_steps_email_pair_check` |
| Timestamps | every one `timestamp with time zone` |
| Column order | id / created_at / updated_at · non-FK alphabetical · FK columns, on all three tables |
| RLS | `07-pipeline-rls.sql` mirrors `06`: enable RLS on the three tables, revokes under the role guard, idempotent |
| Build | `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` clean |

**Not verified — Taylor runs:** `yarn db:migrate` then `yarn db:setup` on staging, then production. The existing engagement rows should read `pipeline_values = {}` afterwards.
