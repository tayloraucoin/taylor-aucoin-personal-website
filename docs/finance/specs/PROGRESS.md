# FIN — Progress

The only source of truth for Complete. One line per slice; update on closure.

- [x] FIN-1 · The `orders` ledger, `recordOrder`, the webhook writes, the backfill — **Code complete 2026-09-11; migration `0015` authored, not run.** Verified against a scratch Postgres 15 (all 15 migrations + setup files applied clean; 23/23 exercise checks on the writer: create, replay, fill-nulls, link-by-price-id, reconcile, email match, unlinked, ghost metadata, unpaid). Not verified: the live webhook paths with `stripe listen` and the backfill against a real Stripe tier — Taylor runs those after the migration.
- [ ] FIN-2 · `/admin/finances/orders` — list, detail, Import from Stripe, Link to engagement
- [ ] FIN-3 · Resend invoice, stuck-claim detection, PDF download
- [ ] FIN-4 · Engagement page — Orders section, sibling engagements, Send their link, Rotate link
- [ ] FIN-5 · `/websites/client` — the magic-link sign-in
- [ ] FIN-6 · Superseded by FIN-8 (M-FIN-7): its money path is built there; the `/extras` entry point is not
- [ ] FIN-7 · Superseded by FIN-8's static link; the `/done` links remain unbuilt
- [x] FIN-8 · The add-ons page — **Code complete 2026-09-26; migration `0022` authored, not run.** `tsc`, `yarn lint`, `yarn build:agent` pass. Not exercised against a database or `stripe listen` (Taylor runs migrations at the end); the staging walk in FIN-8 is outstanding.
