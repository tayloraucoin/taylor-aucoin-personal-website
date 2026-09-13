# FIN — Finances (how to work this folder)

**Epic:** FIN — the money record for tayloraucoin.com: one ledger of every Stripe payment connected to the engagement it paid for, the admin surface that reads it and acts on it (resend an invoice, import a payment, link an invoice), and the two client-facing pieces that let a paid client come back and buy more (a magic-link sign-in and an add-ons page). Triggered by the 2026-09-11 incident: a client's deposit settled in Stripe, the webhook died rendering the invoice, and nothing in the admin could show what had happened or fix it.
**Process model:** the Conscious Connections spec system as adapted in `docs/intake/specs/` — same anatomy, same closure protocol, same template (`../../intake/specs/_templates/slice-spec.md`; one home, not a copy).

## Folder layout

| Path | What |
|---|---|
| `00-build-order.md` | The ordered, checkable queue, with the decision gate |
| `FIN-*.md` | One implementable slice each |
| `PROGRESS.md` / `DEVIATIONS.md` / `TECHNICAL-DECISIONS.md` | The records. `PROGRESS.md` is the only source of truth for Complete |
| `../../admin/ADMIN-UX-SPEC.md` | The admin shell law this epic's surfaces render inside (D-ADM-7 reserved Finances) |
| `../../websites/RUNBOOK-post-intake-charges.md` | How post-intake money moves today; FIN-6 amends its §4 |
| `../../intake/specs/DEVIATIONS.md` § INVOICES | The invoice pipeline's history, including the 2026-09-11 incident line |

## Source precedence (when documents disagree)

1. Architecture, placement, and data law → `TECHNICAL-DECISIONS.md` here (M-FIN-n), inheriting `docs/websites/specs/TECHNICAL-DECISIONS.md` (M-PORT-4, M-PORT-38) and `docs/intake/TECH-SCOPE.md`.
2. Admin presentation → `docs/admin/ADMIN-UX-SPEC.md` (D-ADM log). Client presentation → `docs/intake/INTAKE-UX-SPEC.md` (D-INT log) and `docs/websites/PORTFOLIO-INTAKE-UX-SCOPE.md` (D-PORT log).
3. Site law → repo `CLAUDE.md` + `docs/DESIGN-SYSTEM.md` + `docs/TASTE-PROFILE.md`.
4. On-disk reality + `DEVIATIONS.md` override any stale string in a spec.

## Locked scope (do not re-litigate)

- **The charge law stands:** no charge the client did not themselves initiate on hosted Checkout at a published price (M-PORT-4 as amended by M-PORT-38). FIN-6 widens *which rows* a paid client may initiate a charge for; it does not create a Taylor-initiated or automatic charge anywhere.
- **Refunds, credits, and disputes stay in the Stripe Dashboard.** The admin reads money; it never moves it.
- **`paid_at` keeps its one meaning** — the build was bought. No FIN slice writes it except through `fulfillDeposit`.
- **The client never gets an account.** Possession of the emailed link is the identity, as it is today (M-FIN-4).
- **Copy is Taylor's.** Every new client-facing string ships as `[COPY — draft]` and is replaced before launch.

## Non-negotiables (every FIN ticket)

All of `docs/intake/specs/README.md`'s non-negotiables inherit. Plus:

- **The ledger has one writer.** `recordOrder` in `server/services/orders.ts` is the only function that inserts or updates `orders`. Webhook, backfill, and admin import all call it. A second writer is a defect.
- **Fulfillment is driven only by Stripe-verified facts** — the signature-verified webhook, or an admin-initiated fetch from Stripe's API by object id (M-FIN-2, provisional until ratified). Never a client claim, never a query string, never a form value.
- **Import and backfill never un-set anything.** They fill nulls and stamp unpaid rows; they never overwrite a value already present.
- **Resend goes to the address on the engagement record**, never to an address typed into the admin and never to the Stripe customer email when the two differ.
- **No amounts, names, or emails in logs beyond ids and cents** — the existing webhook rule, unchanged.
- **Migrations append-only; Taylor reviews and runs them.**
- **This repo is Yarn 4.** `yarn build:agent` · `npx tsc --noEmit` · `yarn lint`. Never npm.

## Kickoff contract

Use `docs/intake/specs/README.md` § Kickoff contract verbatim, substituting this folder's paths. Close in three places: `PROGRESS.md` (status), `DEVIATIONS.md` (every departure, one line), `TECHNICAL-DECISIONS.md` (every real alternative weighed).
