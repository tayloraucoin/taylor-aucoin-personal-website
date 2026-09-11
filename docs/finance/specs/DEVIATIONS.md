# FIN — Deviations (append-only)

One line per intentional divergence from a spec. Never rewrite history. Format:

```
YYYY-MM-DD · <ticket-id> · <what changed> · <why>
```

2026-09-11 · AUTHORING · Seven FIN tickets authored in one session (ceiling is three per authoring thread) · founder request after a production incident; mitigated by a shared data law in `TECHNICAL-DECISIONS.md` M-FIN-1 and a gate in `00-build-order.md` that holds FIN-2 and FIN-6 until their proposals are ratified.
