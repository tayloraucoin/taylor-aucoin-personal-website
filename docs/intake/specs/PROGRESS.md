# INT — Progress

The **only** authoritative answer to "is this Complete."

**Gate policy (Taylor, 2026-08-18):** downstream tickets may start against an upstream that is *code complete*. Verification and the hosted migration are one pass at the end. What still cannot be skipped is verifying anything that would be expensive to discover late — schema shape, the token seam, fulfillment idempotency, the answer merge — and all of that is verified against a scratch Postgres as it is built. What is deferred is pixel-level appearance, live Stripe, real email sends, and applying migrations to Supabase. See `DEVIATIONS.md`.

| Ticket | Title | Depends on | Status | Date |
|---|---|---|---|---|
| INT-1 | Foundation: deps, env, db scaffold, schema migration, storage + RLS setup | — | Complete | 2026-08-18 |
| INT-2 | Engagement service: token seam, state derivation, link-creation CLI | INT-1 | Complete | 2026-08-18 |
| INT-3 | Deposit gate: P0 screen, Checkout session, webhook fulfillment | INT-2 | Code complete — logic verified; live Stripe + rendering unverified | 2026-08-18 |
| INT-4 | Intake shell: Quiet Gilt primitives, routing/state gate, W0, resume screen | INT-2 | Code complete — rendering unverified | 2026-08-18 |
| INT-5 | Steps 1–4 + the autosave engine | INT-4 | Code complete — server side verified; browser behaviours unverified | 2026-08-18 |
| INT-6 | Steps 5–9: uploads, voice-note card, access step | INT-5 | Code complete — storage path unverified | 2026-08-18 |
| INT-7 | Done screen, markdown output, completion + output emails | INT-3, INT-6 | Code complete — email delivery unverified | 2026-08-18 |
| INT-8 | Resume-link email, reminders cron, token expiry screen | INT-7 | Code complete — send path unverified | 2026-08-18 |

## Checklist

- [x] INT-1 · Foundation
- [x] INT-2 · Engagement service
- [ ] INT-3 · Deposit gate — code complete, not Complete (see below)
- [ ] INT-4 · Intake shell — code complete, not Complete (see below)
- [ ] INT-5 · Steps 1–4 + autosave — code complete, not Complete (see below)
- [ ] INT-6 · Steps 5–9 + uploads — code complete, not Complete (see below)
- [ ] INT-7 · Output + Done — code complete, not Complete
- [ ] INT-8 · Emails + reminders — code complete, not Complete

## What has been verified, and how

INT-1 and INT-2 were exercised against a throwaway local Postgres 15 created in the session scratchpad — not Supabase, which does not exist yet. No hosted database was touched.

| Verified | Result |
|---|---|
| Migration applies | Clean. Column order, timezone-aware timestamps, cascade FKs all as specified |
| Partial unique index | `reminder_1` cannot be inserted twice; `resume_link` can repeat. The send-once guarantee is real |
| RLS posture | Enabled on all three tables, zero policies. Setup SQL runs twice under `ON_ERROR_STOP` |
| Token seam | 64-char hex hash stored; unknown, tampered, and expired tokens all throw one identical message; the internal reason still distinguishes expiry; no token echoed in errors |
| Reissue | New link resolves, previous token dies |
| Domain type | 20 keys, none of them the token hash or a Stripe id |
| Status derivation | All eight states correct (`yarn intake:create --self-check`) |
| Build | `yarn build` · `npx tsc --noEmit` · `yarn lint` clean. Portfolio routes all still static; shared JS unchanged at 102 kB |

**Not verified: the bucket half of the setup SQL.** `storage.buckets` only exists on Supabase, so that branch is guarded and skipped locally. It runs the first time Taylor applies the file to the real project.

## INT-3 — what was verified without a Stripe account

The Stripe SDK can sign a payload with an arbitrary secret, which made the money path's riskiest logic testable with no Agora key and no test mode.

| Verified | Result |
|---|---|
| Signature acceptance | A correctly signed payload verifies |
| Signature rejection | Tampered signature, altered body under a valid signature, and a signature from a different secret are all rejected |
| Fulfillment | First delivery sets `paidAt`, status becomes `paid` |
| Replay | Second delivery of the same event returns `already_paid`; `paid_at` and `updated_at` are byte-identical afterwards |
| Unknown id | Reports `unknown` rather than throwing, so Stripe is not made to retry something unretryable |
| Waived path | A `deposit_required = false` engagement is never deposit-gated and derives status `waived` |
| Copy laws | No red, no urgency vocabulary, no countdowns, no exclamation marks in user-facing copy |

**Not verified:** a live Checkout round-trip, the canceled-and-retry path, and how P0 actually looks. The first two need the Agora restricted key; the third needs a browser.

## INT-5 — what was verified

Against a scratch Postgres, with the real service code:

| Verified | Result |
|---|---|
| Per-step merge | Two steps coexist; re-saving one leaves the others byte-identical |
| Concurrency | Three simultaneous writes to three different steps all landed |
| Validation | Unknown keys dropped, valid ones kept; an empty save is accepted (nothing is required) |
| Round trips | Repeatable service blocks and checkbox arrays survive intact |
| Activity | `lastActivityAt` stamped on save, so the reminder sweep can tell working from abandoned |
| Authorization | An invalid token cannot write |

**Not verified:** the browser half of autosave — the offline state, tab-killed-mid-debounce recovery, the retry ladder, and the indicator's timing. Those need a browser.

## INT-7 / INT-8 — what was verified

The document generator is a pure function, so it was verified completely.

| Verified | Result |
|---|---|
| Every risk flag | Name mismatch, customer-provides-nothing, no reviews, email-at-domain, insurance unconfirmed all fire when true — and no false positive when the domain *is* owned |
| Not-answered honesty | A half-filled intake lists exactly its gaps; a fully-answered one omits the section entirely; no field ever renders as a blank heading |
| Deposit line | Reports NOT PAID / paid with date / waived correctly |
| Partial documents | An unsubmitted intake is labelled as partial rather than presented as final |
| Completion | Monotonic — set once, second call is a no-op, document wording flips to Submitted |
| File links | An unsigned link degrades to a note; the voice note gets its own transcribe-this section; an undelivered upload is never listed |
| Token encryption | Ciphertext written at creation, decrypts to the original, re-written on reissue, returns null (not a throw) when corrupt |
| Migration 0001 | One additive column; journal parity holds |

Three defects were found by this verification and fixed: dates rendered in UTC (a 9pm Vancouver document was stamped tomorrow); a multi-line value left a trailing space after its label; and — the real one — a single malformed field caused the whole step's save to be rejected, which contradicted the no-loss law. The shape guard now drops only the bad field and keeps its neighbours.

**Not verified:** any actual email leaving the building, and the cron sweep's send path. Both need a Resend key and a verified domain.

## INT-6 — what was verified

| Verified | Result |
|---|---|
| Steps 5–9 schemas | Booleans, repeatable team blocks, socials, and the domain/email-at-domain pair all round-trip |
| No-credential law | The access schema's 11 fields contain nothing password-, secret-, or key-shaped |
| Format is never a refusal | `.amr` and `.heic` accepted; only an oversize file is refused |
| Upload records | A reserved file is pending until confirmed; confirmation marks it delivered |
| Cross-engagement scoping | One engagement's token cannot confirm another's file |
| Cascade | Deleting an engagement leaves no orphan file rows |
| Ring rationing | `GradientRing` appears in exactly one file in the whole flow |

**Not verified:** the bytes themselves. Signed-URL creation and the browser's PUT need a real Supabase Storage bucket, so the upload path is the largest unproven surface in the build. Everything around it — who may request a URL, what is recorded, what is refused — is proven.

## INT-4 — why it is not ticked

The code is complete and the build is clean, but every criterion about how it *looks and behaves* is unverified: W0 and the resume screen rendering, the nine-step traversal, keyboard focus order and the focus-to-heading move, the 16px no-zoom rule on iOS, and reduced-motion. The preview tooling in this session is anchored to the Conscious Connections repo and cannot start a server for this one; starting one from the shell is prohibited.

INT-5 depends on these primitives and will copy them into fourteen more screens, so this gate matters more than most.

**To clear it (about a minute, once `.env.local` has the database URLs):**

```bash
yarn intake:create --business "Test Co" --contact "Sam" --email sam@example.com --no-deposit
```

Then `yarn dev`, open the printed link, and check: the welcome screen reads correctly · Continue walks all nine steps and Back returns · a bad step slug 404s · tabbing shows a gold focus ring on every control · focusing a text field on an iPhone does not zoom the page · the resume screen lists the steps with gold dots for the ones visited.
