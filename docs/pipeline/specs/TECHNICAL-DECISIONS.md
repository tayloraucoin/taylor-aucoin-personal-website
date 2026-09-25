# PIPE — Technical decisions (append-only)

Mason's record for the engagement-pipeline epic. One entry per real alternative weighed. Inherits M-INT (`docs/intake/specs/TECHNICAL-DECISIONS.md`) and M-CRM (`docs/crm/specs/TECHNICAL-DECISIONS.md`); amendments to those are recorded here and cross-referenced there. Format: fast-lane ADR (context · options · decision · consequences · revisit trigger). IDs `M-PIPE-n` are citable from tickets.

## 2026-09-25 · PIPE-1 · M-PIPE-1 · The playbook is one table of ordered steps in the database; no pipelines parent

**Context:** Taylor wants the Kryshan process as linear steps he can edit in the admin, each holding a markdown prompt and optionally a client email. The process will change with every engagement he runs, and he edits it himself.
**Options weighed:** A) Markdown files in the repo, one per step, read at build time. B) A `pipelines` table with `pipeline_steps` under it, one pipeline per track. C) One `pipeline_steps` table, ordered by `position`, soft-archived by `archived_at`.
**Decision:** C, ratified with the scope 2026-09-25 ("one pipeline"). A makes every wording change a commit and a deploy, which is exactly the friction that makes a playbook go stale. B builds for a second track nobody has run yet; the parent table is one additive migration on the day a durable-track playbook is real, and adding it later costs a backfill of one row.
**Consequences:** Every step is in the one pipeline. Status is not stored: "archived" is read from `archived_at` (M-INT-7's posture). Email subject and body are both present or both absent — a database `check`, so a half-configured email step cannot exist.
**Revisit trigger:** A second track's process diverging from the first by more than a step or two.

## 2026-09-25 · PIPE-1 · M-PIPE-2 · Variables by name; record values fill themselves; the rest are remembered on the engagement; unresolved placeholders refuse the send

**Context:** The review email needs a URL and an access code that exist nowhere in this database. Email 2's preview URL is needed again by email 3. The domain comes from the intake but may be wrong or blank and must be correctable.
**Options weighed:** A) Each step declares its variables in a schema column. B) Free-text templates, Taylor fills blanks by hand in the body. C) `{{name}}` placeholders discovered by parsing the template; a fixed set of record names (`firstName`, `contactName`, `businessName`, `domain`, `registrar`) resolve from the engagement; every other name becomes a field; entered values are saved on the engagement in `engagements.pipeline_values` (jsonb, `Record<string, string>`) and prefill the next template that uses the name. A saved value overrides the record value of the same name.
**Decision:** C. A is a second place to keep in sync with the template — the declaration and the text will disagree the first time Taylor edits one. B is what produces an email with `[URL]` still in it. Under C, typing `{{reviewCode}}` into a template is the whole declaration. Storage is jsonb on `engagements` for the reason `answers` is (the column's own docstring): a new variable must never need a migration. The override rule is what lets email 2 correct the intake's domain once and have email 3 read the correction.
**Consequences:** The service, not the form, refuses a send whose resolved subject or body still contains `{{…}}` — the UI's disabled button is a courtesy on top. Variable names are `[a-zA-Z][a-zA-Z0-9]*`; anything else between braces is literal text. Prompts use the same renderer on the engagement page, where an unresolved name is copied literally and named in the result line (a prompt goes to Claude, not a client). `pipeline_values` is Taylor's own operational data (URLs, a review gate code, a domain); it carries no credential and never appears in a log.
**Revisit trigger:** A template needing conditional text, or a value that is a secret (a registrar password is refused by the intake's build spec §5 and stays refused here).

## 2026-09-25 · PIPE-1 · M-PIPE-3 · Sent client email is recorded as sent in `engagement_emails`, modelled on `lead_emails`; `email_events` is not reused

**Context:** Taylor needs to know what a client was told, word for word, when he later says "that was covered in the final-round email." `email_events` is the intake's send-once ledger: kind enum, no body, a partial unique index built for reminders.
**Options weighed:** A) New `email_event_kind` values on `email_events`. B) A new table storing subject, body, recipient and the Resend id as sent, row written before the send.
**Decision:** B, the M-CRM-3 pattern. A would record that an email went out but not what it said, and every template edit would change what "the step 2 email" meant in hindsight. B answers "what did this person receive" and leaves a failed row (null `resend_id`) as evidence rather than nothing.
**Consequences:** `engagement_emails` carries `step_id` so the engagement page can list sends under their step. No send-once constraint: a resend is legitimate and the surface confirms it (D-CRM-9's posture). Engagement deleted → its emails go with it (cascade), as `lead_emails` does for leads.
**Revisit trigger:** A client email that is not tied to a step.

## 2026-09-25 · PIPE-1 · M-PIPE-4 · A step that has been used cannot be deleted — the database refuses, not the page

**Context:** Taylor asked for full CRUD plus archive. A step deleted after it was sent to a client would orphan the record of that send, or take it with it.
**Options weighed:** A) Deletion cascades to completions and sends. B) The page hides Delete when the step has history. C) `restrict` foreign keys from `engagement_step_completions` and `engagement_emails` to `pipeline_steps`; the service maps the violation to "archive it instead"; the page hides Delete too.
**Decision:** C. A destroys the record M-PIPE-3 exists to keep. B is vigilance; the next surface that deletes forgets. C puts the rule where no caller can skip it, and archive is the tool for a step with history.
**Consequences:** Delete is for a step made in error. Archive removes a step from new work and from engagement checklists, but its history still shows on the engagements that used it.
**Revisit trigger:** None expected.

## 2026-09-25 · PIPE-1 · M-PIPE-5 · Done is the presence of a completion row; undo deletes it

**Context:** Each engagement needs "which steps are done, and when."
**Options weighed:** A) A progress row per engagement × step with nullable `completed_at`. B) A single `current_step` pointer on the engagement. C) `engagement_step_completions`: a row exists iff the step is done, `completed_at` not null, unique on (engagement, step).
**Decision:** C. A has two ways to say "not done" (no row, or a row with null). B cannot express that steps were done out of order, which real engagements do. C is one fact per row and the unique index makes a double press a no-op.
**Consequences:** Undo deletes the row; the moment it was first marked is not kept. A successful send inserts the completion in the same service call (`onConflictDoNothing`).
**Revisit trigger:** Taylor needing an audit of un-done steps.

## 2026-09-25 · PIPE-1 · M-PIPE-6 · `position` is not unique; reorder rewrites every position in one transaction

**Context:** Drag-to-reorder moves one step and shifts the rest.
**Options weighed:** A) Unique `position`, with a deferrable constraint. B) Fractional positions. C) Non-unique integer `position`, read ordered by `(position, created_at)`; reorder takes the full ordered id list and writes 0..n-1 in one transaction.
**Decision:** C. Drizzle does not emit deferrable constraints, so A means hand-edited migration SQL. B drifts toward precision problems and needs rebalancing anyway. With one admin and a list of tens, rewriting every row is trivially cheap and always leaves a clean sequence; the tiebreak makes a transient duplicate harmless.
**Consequences:** The reorder action sends the whole order, and the service refuses a list that is not exactly the current step set (a stale tab cannot drop a step).
**Revisit trigger:** Concurrent editors.
