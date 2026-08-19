# Client intake — Technology scope (architecture pass)

Author: Mason. Status: **Ratified 2026-08-18** (Taylor answered the four forks; answers recorded in `specs/TECHNICAL-DECISIONS.md` M-INT-1…M-INT-4).

**Document authority.** Product behavior → [`INTAKE-UX-SPEC.md`](INTAKE-UX-SPEC.md) (its §13 decision log is binding) with [`intake-form-build-spec.md`](intake-form-build-spec.md) and [`client-intake-requirements.md`](client-intake-requirements.md) beneath it per its own header. Architecture and conventions → this file, which translates the Conscious Connections contracts (`docs/architecture/codebase-conventions.md`, `drizzle-orm-conventions.md`, `db-and-rls-authoring.md` in the CC repo) into this single-app repo. Site law → the repo's `CLAUDE.md` + `docs/DESIGN-SYSTEM.md`, unchanged by this work. Decisions with real alternatives live in [`specs/TECHNICAL-DECISIONS.md`](specs/TECHNICAL-DECISIONS.md) — cite them as `M-INT-n`; this file states the resulting shape.

---

## 1. Problem frame

- **Who imports this?** One Next.js app, forever. No mobile, no second consumer. CC's own Rule 1 (placement follows the consumer) therefore rules _against_ copying CC's monorepo topology: capability co-locates in this app (M-INT-1).
- **Which rail?** Every client-initiated write is a web-only mutation with no shared logic — CC §3.5's own exception table assigns that to **server actions**. Third-party-inbound (Stripe webhook) and cron are **route handlers**, per the same table. No tRPC (M-INT-2).
- **Blast radius / one-way doors:** the schema, the token model, the Stripe wiring, and the RLS posture. Those get the scrutiny; everything else is reversible.
- **Data sensitivity:** business-confidential (pricing, revenue hints, access details) plus voice recordings. Not couples-grade intimate data, but treated as confidential: private storage, deny-all RLS, no analytics on the surface, no answer content in logs.
- **Worst moments:** (1) a paid client whose form breaks or loses answers — deposit taken, trust gone; (2) a webhook failure that leaves a paid engagement looking unpaid. Both get explicit failure contracts in tickets.

## 2. Stack additions

New dependencies (exact versions pinned at INT-1 and recorded in the ticket's closure):

| Dep                                        | Why                                                 | Constraint                                                                                                                                                                            |
| ------------------------------------------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `drizzle-orm` + `drizzle-kit` + `postgres` | Schema, migrations, client — CC's data law verbatim | **Pin exact versions**; record them in `db/README` header comment. CC pins `drizzle-orm@0.45.2` / `drizzle-kit@0.31.10`; adopt current stable at INT-1 and treat as pinned thereafter |
| `zod`                                      | Validation at every action boundary                 |                                                                                                                                                                                       |
| `stripe`                                   | Checkout session + webhook verification             | Agora's Stripe account; **restricted key**                                                                                                                                            |
| `resend`                                   | Resume/reminder/completion/output emails            |                                                                                                                                                                                       |
| `@supabase/supabase-js` (server-side)      | Storage signed upload/download URLs                 | Never initialized in client components with service credentials                                                                                                                       |

Infrastructure: **new Supabase project** under the tayloraucoin.com name (M-INT-3) — database + private storage bucket. **Stripe is Agora's existing account** — the one Agora-owned piece. Vercel (existing project) hosts the dynamic routes, webhook, and cron.

## 3. Placement map (the law for every INT ticket)

CC's layer order translated into app folders. `app/` stays composition-only.

```
db/                          # capability: data (CC packages/db, single-app form)
  schema/
    engagements.ts           # table + enums (narrowest scope) + relations
    intake-files.ts
    email-events.ts
    index.ts                 # barrel + $inferSelect/$inferInsert exports
  client.ts                  # singleton, transaction pooler :6543, prepare:false
  migrate-client.ts          # DIRECT :5432 — never imported at runtime
  migrations/                # drizzle-kit output + meta/ journal. Committed. Append-only.
  supabase/setup/            # RLS enablement, storage bucket SQL — run after migrations
server/                      # capability: business logic (CC packages/api/services)
  services/
    engagement.ts            # create · requireByToken · transitions · touch activity
    deposit.ts               # checkout session create · webhook fulfillment (idempotent)
    submission.ts            # autosave merge · file registration
    output.ts                # markdown document + risk flags (build spec §6 binding)
    emails.ts                # all Resend sends; template bodies live here
lib/
  validators/intake.ts       # Zod: per-step schemas (all fields optional), action inputs
  types/intake.ts            # IntakeAnswers + JSONB shape interfaces (schema comments point here)
  routes.ts                  # typed route builders — intake paths come from here, never inline strings
  env.ts                     # EXTENDED, stays the only process.env reader (existing law)
app/
  intake/[token]/page.tsx            # state-routed entry (P0 / W0 / resume / done)
  intake/[token]/[step]/page.tsx     # steps 1–9
  intake/[token]/done/page.tsx
  intake/_components/                # client leaves, 'use client' line 1 (CC law)
  intake/[token]/_actions/           # server actions: thin — validate, call service, return
  api/stripe/route.ts                # webhook (route handler — CC §3.5)
  api/intake/upload/route.ts         # signed-upload issuance (route handler; raw HTTP concerns)
  api/cron/reminders/route.ts        # Vercel cron target, CRON_SECRET-guarded
scripts/
  create-engagement.ts               # CLI link creation (M-INT-5, provisional)
  render-intake.ts                   # on-demand markdown re-send
```

Rules carried verbatim from CC: kebab-case filenames · no catch-all `helpers.ts`/`utils.ts` · function-name verbs per CC §5.4 (`requireX` throws, `loadX` cached server read, `formatX` pure) · helpers start segment-local and are promoted on second use, never before · Server Components default, client leaves in `_components/` · one fact one home (route paths from `lib/routes.ts`; limits and durations as named constants in `lib/intake/constants.ts` if >1 consumer, else local).

## 4. Data model

Three tables. Column order per CC Drizzle law (id/createdAt/updatedAt · non-FK alphabetical · FK columns), timezone-aware timestamps, array-form index argument, one file per table with colocated relations, jsonb columns carry a shape comment pointing at `lib/types/intake.ts`.

**`engagements`** — one row per client engagement; the answers live here as JSONB (binding: build spec §8 — adding a form field must never require a migration).

- `id` uuid pk defaultRandom · `createdAt` · `updatedAt`
- `answers` jsonb — `// JSON shape: IntakeAnswers — lib/types/intake.ts` — default `{}`
- `businessName` text notNull · `contactEmail` text notNull · `contactName` text notNull · `contactPhone` text
- `completedAt` timestamptz · `currency` text notNull default `'cad'` · `currentStep` integer notNull default 0 · `depositAmountCents` integer · `depositRequired` boolean notNull default true · `lastActivityAt` timestamptz · `paidAt` timestamptz · `projectSummary` text · `sentAt` timestamptz · `startedAt` timestamptz
- `stripeCheckoutSessionId` text · `stripePaymentIntentId` text
- `tokenHash` text notNull unique — sha-256 of the URL token; plaintext is never stored (M-INT-6)
- `tokenExpiresAt` timestamptz notNull
- Indexes: unique on `tokenHash`; index on `stripeCheckoutSessionId`.

**Status is derived, not stored** (M-INT-7): the row stores facts (`sentAt`, `paidAt`, `startedAt`, `lastActivityAt`, `completedAt`, `depositRequired`); a pure `getEngagementStatus(row)` in `server/services/engagement.ts` derives the display vocabulary (`created → sent → paid/waived → started → in progress → abandoned → complete`). One home for the state machine; no enum column that can disagree with its own timestamps.

**`intake_files`** — one row per upload: `id/createdAt` · `fieldKey` text notNull (e.g. `voice_note`, `photos`, `logo`) · `mimeType` text · `originalName` text · `sizeBytes` integer · `step` integer · `storagePath` text notNull · `engagementId` uuid fk → engagements, onDelete cascade. Index on `engagementId`.

**`email_events`** — idempotency ledger for system sends: `id/createdAt` · `kind` pgEnum (`resume_link · reminder_1 · reminder_2 · reminder_3 · completion · output`) · `engagementId` fk cascade. **Partial unique index on (`engagementId`,`kind`) WHERE kind IN (`reminder_1`,`reminder_2`,`reminder_3`,`completion`)** — the send-once kinds can't double-send by construction; `resume_link` and `output` legitimately repeat (device switches, document re-sends).

Migrations: drizzle-kit generated, committed, journal-complete, append-only — CC's migration law verbatim, including the hand-authored checklist when generate can't emit. **Taylor reviews and runs every migration** (standing rule carried over from CC).

## 5. Authorization topology

There are no end-user accounts. The URL token is the credential; design accordingly:

- **Token:** 256-bit random, base64url, generated at link creation, shown once. Stored as sha-256 hash; lookup by hash; constant-time compare not required (hash lookup is the compare). Expiry 60 days, refreshed on completion for the "add photos later" path `[PROVISIONAL — cheap to change]`.
- **The seam:** every action and page calls `requireEngagement(token)` from `server/services/engagement.ts` — the single scoped-access seam. Nothing reads `engagements` except through it. It throws (notFound) on miss or expiry without distinguishing the two (no existence leak).
- **RLS posture (M-INT-8):** every table RLS-enabled with **zero policies** — deny-all to `anon` and `authenticated`. The browser never holds any Supabase key; all data access is server-side Drizzle over the direct Postgres connection (which is not subject to RLS). Deny-all is the belt against future PostgREST/anon exposure, not the working path. `supabase/setup/` SQL enables RLS and creates the private bucket.
- **Storage:** one private bucket (`intake`). Uploads: server issues a signed upload URL scoped to `intake/{engagementId}/…` after `requireEngagement`; client PUTs directly to storage (large voice notes never transit our functions). Downloads: signed URLs minted server-side for the output email only. Bucket is never public; no client-side listing.
- **Admin (deferred):** nothing in v1 grants admin access; the CLI scripts run locally with env credentials. The deferred admin surface will add its own auth; nothing here forecloses it.

## 6. Stripe (Agora)

- **Hosted Checkout Session** (D-INT-1): `mode: payment`, `price_data` with `currency: cad` and the per-engagement amount, `customer_email` prefilled, `metadata.engagement_id`, success → `/intake/[token]?paid=1`, cancel → `/intake/[token]?canceled=1`.
- **Fulfillment is webhook-only** (`checkout.session.completed` → set `paidAt`, store the payment-intent id). The success-URL param is UX sugar, never the source of truth — a user can fabricate it. Idempotent: fulfillment guards on `paidAt IS NULL`; replayed webhooks no-op. Signature verified with `STRIPE_WEBHOOK_SECRET`; the handler reads the raw body (Next.js route handler, not a server action).
- **Keys:** a **restricted key** from Agora's account (Checkout write + read only). `[PENDING — Taylor]`: statement descriptor / `statement_descriptor_suffix` confirmation so the P0 "shows as AGORA" line is literally true (D-INT-10 adjacent).
- No amounts hardcoded anywhere; the amount lives on the engagement row, set at link creation.

## 7. Email (Resend)

All system sends go through `server/services/emails.ts`; every send writes an `email_events` row first (unique-constraint idempotency for reminders). Reminder cadence per build spec §7 (48h unstarted / 48h abandoned / day 7; killed on completion) driven by a daily Vercel cron hitting `api/cron/reminders` with `CRON_SECRET`. Sending domain `[PENDING — Taylor]`: needs a verified domain in Resend (recommend `tayloraucoin.com`, from-name "Taylor Aucoin"). The completed-intake **output email** (M-INT-4) sends the generated markdown to `INTAKE_NOTIFY_EMAIL` with signed file links (expiry ≥7 days).

## 8. Env surface

**Every server-side secret goes through `lib/env.ts`.** Stated precisely, because the original phrasing here ("the only `process.env` reader") was not true on disk: `lib/config.ts` reads `NEXT_PUBLIC_GA_ID` as a literal (Next only inlines literals into the client bundle), and `middleware.ts` plus one route read `NODE_ENV`. Neither is a secret. The rule that binds INT work is the one that matters — no credential is read anywhere but `lib/env.ts`, and nothing in that module may reach a client bundle (it throws if it does). Additions: `DATABASE_URL` (pooler :6543) · `DIRECT_DATABASE_URL` (:5432, tooling only) · `SUPABASE_URL` · `SUPABASE_SERVICE_ROLE_KEY` (server-only) · `STRIPE_SECRET_KEY` · `STRIPE_WEBHOOK_SECRET` · `RESEND_API_KEY` · `INTAKE_NOTIFY_EMAIL` · `CRON_SECRET` · `NEXT_PUBLIC_SITE_URL` (absolute links in emails) · `INTAKE_LINK_KEY` (arrives with INT-8; AES key for the reminder-link ciphertext). Two-var DB scheme rather than CC's `DATABASE_ENVIRONMENT` tiering — one hosted environment exists (M-INT-9). `.env.example` updated in INT-1.

## 9. Site-integrity constraints (this repo's laws, applied)

- **The static site stays static.** The `/intake` segment is dynamic; nothing in it may add providers, imports, or middleware weight to the existing routes. PERF-01 (Lighthouse ≥95 mobile) is measured on the portfolio routes and must not regress.
- **No analytics or consent tooling on `/intake`** (M-INT-10): the surface carries business-confidential answers; we measure nothing there, so the consent banner has nothing to gate. Exclude the segment from the analytics component and leave middleware behavior harmless.
- **Design law:** Quiet Gilt per UX spec §4 — no new hexes, tokens by name, Tailwind v4 `-(--token)` syntax (the `-[--` trap is a known shipped bug in this repo — see `CLAUDE.md`), no `RootField` import anywhere under `app/intake/`.
- **Verification** for every INT ticket: `npm run build` · `npx tsc --noEmit` · `npm run lint` — plus the happy path exercised against the local/hosted Supabase when the slice touches data.

## 10. Open items (routed)

| Item                                    | Owner  | Blocks                                                     |
| --------------------------------------- | ------ | ---------------------------------------------------------- |
| Deposit refund sentence (D-INT-10)      | Taylor | First real charge; not the build                           |
| Statement descriptor confirmation       | Taylor | P0 copy accuracy                                           |
| Resend sending domain + DNS             | Taylor | INT-7/INT-8 going live (build proceeds with sandbox sends) |
| Supabase project creation + credentials | Taylor | INT-1 migration run (authoring proceeds)                   |
| Restricted Stripe key from Agora        | Taylor | INT-3 runtime verification                                 |

Everything else is decided, provisional-with-label, or the builder's call as marked in tickets.
