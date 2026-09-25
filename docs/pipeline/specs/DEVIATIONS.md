# PIPE — Deviations (append-only)

One line per intentional divergence from a spec. Never rewrite history. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-25 · PIPE-1 · Completion table named `engagement_step_completions` with row-presence semantics, not the `engagement_step_progress` with nullable `completed_at` named in the scoping conversation · one fact per row (M-PIPE-5); the scoping message was not a spec, logged so the rename is traceable.
2026-09-25 · PIPE-1 · Relation names on `engagements` are `pipelineCompletions` and `pipelineEmails`, not the table names · `emailEvents` already names the intake ledger on the same relations object; a bare `emails` would read as that one.
2026-09-25 · PIPE-1 · Runtime not exercised — no database in the session · `0020` and `07-pipeline-rls.sql` authored and stopped, per the non-negotiable.
2026-09-25 · PIPE-2 · Built before `0020` was applied, against the ticket's gate · Taylor, 2026-09-25: "don't worry about migration. I'll do it myself at the very end." Every PIPE slice is therefore verified statically; the rendered pass is one walk at the end.
2026-09-25 · PIPE-2 · `CopyButton` placed in `app/admin/_components/`, not in the pipeline folder · two consumers (the playbook and PIPE-3's engagement checklist); placement by consumer.
2026-09-25 · PIPE-2 · The new-step button reads "Add step", the list's action "New step" · the button names the act, the header link the destination.
2026-09-25 · PIPE-2 · The step page's description says "Used on an engagement, so it can be archived but not deleted" when Delete is absent · an absent button with no reason reads as a bug.
2026-09-25 · PIPE-2 · Engagement pages are revalidated on every step write, ahead of PIPE-3 · PIPE-3's checklist reads the same rows; the call is cheap and saves a second edit to the action file.
2026-09-25 · PIPE-3 · Names may be padded inside the braces — `{{ reviewCode }}` is `reviewCode` — beyond M-PIPE-2's bare grammar · the padded form is what a person types naturally, and treating it as literal would let it reach a client unfilled. `{{ two words }}` stays literal.
2026-09-25 · PIPE-3 · The engagement page's pipeline load is wrapped and fails to one line, beyond the ticket · the page's own law (the answers document) is that nothing may take Money and Reminders with it; with `0020` deferred to the end, an unwrapped load would break every engagement page on a database without the tables.
2026-09-25 · PIPE-3 · The renderer check is `scripts/verify-pipeline-template.ts` (`yarn verify:pipeline`), as the ticket's advisory note suggested · the repo has no unit runner; `verify:tracks` is the precedent.
2026-09-25 · PIPE-3 · `pipelineEngagementId` validator added to `lib/validators/pipeline.ts` · the engagement id needed its own named schema rather than borrowing the step id's.
2026-09-25 · PIPE-3 · The editor's help text reads its list from `RECORD_NAMES` · one home for which names fill themselves; a hand-typed list would drift.
