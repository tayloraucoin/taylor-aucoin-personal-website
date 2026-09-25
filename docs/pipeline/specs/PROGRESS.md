# PIPE — Progress

The **only** authoritative answer to "is this Complete."

**Gate policy:** inherits `docs/intake/specs/PROGRESS.md`'s (Taylor, 2026-08-18) — downstream work may start against an upstream that is _code complete_, except where a ticket names an applied migration as its gate (PIPE-2 renders against `0020`).

| Ticket | Title                                                                 | Depends on                                           | Status                                                                                                                                                                                        | Date       |
| ------ | --------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| PIPE-1 | Schema: pipeline steps, completions, sent emails, remembered values   | —                                                    | Complete — build, typecheck, lint clean; migration `0020` and `07-pipeline-rls.sql` authored, not run; not exercised against a database                                                       | 2026-09-25 |
| PIPE-2 | `/admin/pipeline`: list, create, edit, reorder, archive, delete, copy | PIPE-1 (code complete; `0020` gate waived by Taylor) | Complete — build, typecheck, lint clean; not rendered against a database                                                                                                                      | 2026-09-25 |
| PIPE-3 | The engagement checklist, filled-in prompts, done and undo            | PIPE-2 (code complete)                               | Complete — build, typecheck, lint clean; `yarn verify:pipeline` 9/9; not rendered against a database                                                                                          | 2026-09-25 |
| PIPE-4 | Compose and send a step's email | PIPE-3 (code complete) | Complete — build, typecheck, lint clean; renderer and send guard 13/13; jsonb merge run on Postgres 15; staging send pass outstanding | 2026-09-25 |

## Checklist

- [x] PIPE-1 · Schema
- [x] PIPE-2 · The playbook admin
- [x] PIPE-3 · The engagement checklist
- [x] PIPE-4 · Step email send
- [ ] PIPE-5 · Content (Taylor)

## What has been verified, and how

### PIPE-1

No database in the session. What is verified is what can be verified statically:

| Verified        | Result                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Migration shape | `0020_overjoyed_black_bolt.sql` read against the spec: creates `pipeline_steps`, `engagement_step_completions`, `engagement_emails`; adds `engagements.pipeline_values jsonb default '{}'::jsonb not null`; alters nothing else |
| FK semantics    | both `step_id` FKs `on delete restrict`; both `engagement_id` FKs `on delete cascade`                                                                                                                                           |
| Constraints     | unique (`engagement_id`, `step_id`) on completions; `pipeline_steps_email_pair_check`                                                                                                                                           |
| Timestamps      | every one `timestamp with time zone`                                                                                                                                                                                            |
| Column order    | id / created_at / updated_at · non-FK alphabetical · FK columns, on all three tables                                                                                                                                            |
| RLS             | `07-pipeline-rls.sql` mirrors `06`: enable RLS on the three tables, revokes under the role guard, idempotent                                                                                                                    |
| Build           | `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` clean                                                                                                                                                                     |

**Not verified — Taylor runs:** `yarn db:migrate` then `yarn db:setup` on staging, then production. The existing engagement rows should read `pipeline_values = {}` afterwards.

### PIPE-2

Built without rendering: the agent has no admin session (the login is Taylor's), and `0020` is not applied, so the pages would fail on their first query.

| Verified | Result                                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes   | `/admin/pipeline`, `/admin/pipeline/new`, `/admin/pipeline/[id]` compile as dynamic routes                                                    |
| Seam     | every write goes action → `server/services/pipeline.ts`, which parses with `lib/validators/pipeline.ts`; nothing else writes `pipeline_steps` |
| Reorder  | the service refuses any id list that is not exactly the active set, inside the transaction that writes it                                     |
| Delete   | refused by an existence check for the message, and by the `restrict` FKs (code `23503`) for the guarantee                                     |
| Logging  | the one log line is `[pipeline] step action failed`, with no text or ids from the step                                                        |
| Tokens   | every colour class reads a token that exists in both themes in `app/globals.css`; no `-[--`                                                   |
| Build    | `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` clean                                                                                   |

**Not verified — Taylor's pass after `0020`:** criteria 1–8 in the ticket, in Light and Dark; the two `[PROPOSED]` rulings (edit on its own page; copy as the row's primary action) ratified or overruled.

### PIPE-3

| Verified               | Result                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer (criterion 6) | `yarn verify:pipeline`, 9 checks: record names; blank intake answer unresolved; saved over record; blank saved value ignored; unknown names literal and reported once in order; `{{ padded }}` is a name; `{{ not a name }}`, `{{2x}}`, `{{}}`, `{{a-b}}` literal and unreported; names found across templates; the global pattern carries no state between calls |
| One renderer           | `grep` for `{{` parsing finds only `lib/pipeline/template.ts`                                                                                                                                                                                                                                                                                                     |
| Values server-side     | the checklist receives rendered prompts; the action posts ids and a boolean only                                                                                                                                                                                                                                                                                  |
| Page survives          | `loadEngagementPipeline` is wrapped; a failure (including `0020` not applied) prints one line in the section and leaves Money, Reminders and the answers intact                                                                                                                                                                                                   |
| Build                  | `yarn build:agent` · `npx tsc --noEmit` · `yarn lint` clean                                                                                                                                                                                                                                                                                                       |

**Not verified — Taylor's pass after `0020`:** criteria 1–5 on a real engagement, in Light and Dark; the `[PROPOSED]` placement (Pipeline above Money).

### PIPE-4

| Verified          | Result                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Send guard        | `findLeftoverPlaceholders` catches `{{name}}`, `{{ two words }}`, `{{}}`; a fully rendered letter has none (`yarn verify:pipeline`)                               |
| Remembered values | `valuesToRemember`: typed names kept, untouched record names cleared, blanks dropped, a record name set back to the record value cleared (`yarn verify:pipeline`) |
| jsonb merge       | the `rememberPipelineValues` expression run on a throwaway Postgres 15: an old `domain` override removed while new values merge; empty and absent keys harmless   |
| Pair check        | `(subject is null) = (body is null)` rejects a subject without a body on Postgres 15                                                                              |
| Address           | the action posts ids, subject, body and values; `sendStepEmail` reads `contact_email` from the row                                                                |
| Row before send   | insert precedes the Resend call; a failure leaves the row with `resend_id` null and returns the failure; the step is not marked done                              |
| Logging           | `[pipeline]` lines carry ids only                                                                                                                                 |
| Typecheck / lint  | `npx tsc --noEmit` · `yarn lint` clean                                                                                                                            |

**Build:** `yarn build:agent` run 2026-09-25 after Taylor freed disk space — clean.

**Not verified — Taylor's pass after `0020`, on staging, to his own inbox:** criteria 1–9 in the ticket; the `[PROPOSED]` field/letter behaviour.
