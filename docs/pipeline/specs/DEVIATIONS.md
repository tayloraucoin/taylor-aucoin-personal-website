# PIPE — Deviations (append-only)

One line per intentional divergence from a spec. Never rewrite history. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-25 · PIPE-1 · Completion table named `engagement_step_completions` with row-presence semantics, not the `engagement_step_progress` with nullable `completed_at` named in the scoping conversation · one fact per row (M-PIPE-5); the scoping message was not a spec, logged so the rename is traceable.
2026-09-25 · PIPE-1 · Relation names on `engagements` are `pipelineCompletions` and `pipelineEmails`, not the table names · `emailEvents` already names the intake ledger on the same relations object; a bare `emails` would read as that one.
2026-09-25 · PIPE-1 · Runtime not exercised — no database in the session · `0020` and `07-pipeline-rls.sql` authored and stopped, per the non-negotiable.
