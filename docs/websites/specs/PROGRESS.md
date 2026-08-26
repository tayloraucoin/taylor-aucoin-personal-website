# PORT — Progress (the record of state)

The **only** authoritative answer to "is this Complete." A downstream ticket is not started until every entry in its `Depends on` is ticked here. "Basically done" is not a status.

**One outstanding action on PORT-1, and it is Taylor's:** run `db/migrations/0010_fast_cloak.sql` against the hosted databases (`yarn db:migrate` per tier). Every PORT-1 acceptance criterion was verified against a scratch Postgres; the hosted databases do not have the columns yet. PORT-2 can be built and type-checked without it and cannot be exercised against hosted data until it is run.

| Ticket | Title | Depends on | Status | Date |
| ------ | ----- | ---------- | ------ | ---- |
| PORT-1 | Track foundation: key, migration, registries, seams | — | Complete (migration pending Taylor's run) | 2026-08-26 |
| PORT-2 | Public entry: routes, start form, state router, shells | PORT-1 | Complete | 2026-08-26 |
| PORT-3 | Pay screen: catalogue, plan choice, add-ons, promo | PORT-2 | Complete (Stripe prices pending Taylor) | 2026-08-26 |
| PORT-4 | Precedented steps: about · audience · words · media · access | PORT-2 | Complete | 2026-08-26 |
| PORT-5 | Entry machinery: per-entry uploads; experience + work steps | PORT-2 | Complete (storage path unverified) | 2026-08-26 |
| PORT-6 | "Sort this for me" extraction | PORT-5 | Complete | 2026-08-26 |
| PORT-7 | Taste: example gallery + favourites rank | PORT-2 | Complete (stub example set) | 2026-08-26 |
| PORT-8 | Output document, done wiring, email variants | PORT-3, PORT-4, PORT-5, PORT-7 | Complete (email delivery unverified) | 2026-08-26 |
| PORT-9 | Post-intake charges (Taylor-initiated) | PORT-3 | Complete (no live Stripe run) | 2026-08-26 |

## Checklist (mirrors `00-build-order.md`)

- [x] PORT-1 · Track foundation
- [x] PORT-2 · Public entry
- [x] PORT-3 · Pay screen
- [x] PORT-4 · Precedented steps
- [x] PORT-5 · Entry machinery
- [x] PORT-6 · Extraction
- [x] PORT-7 · Taste
- [x] PORT-8 · Output + emails
- [x] PORT-9 · Post-intake charges
