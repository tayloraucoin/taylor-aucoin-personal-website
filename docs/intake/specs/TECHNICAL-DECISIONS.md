# INT — Technical decisions (append-only)

One section per architectural choice with real alternatives. Never edit or delete prior entries. Format: fast-lane ADR (context · options · decision · consequences · revisit trigger). IDs `M-INT-n` are citable from tickets.

## 2026-08-18 · M-INT-1 · Single-app repo; CC conventions translated, not the monorepo topology

**Context:** Taylor directed "copy Conscious Connections conventions exactly." CC is a Yarn 4 + Turborepo monorepo; this repo is a single static Next.js 15 app.
**Options weighed:** A) Convert to a monorepo with packages. B) Keep the single app; translate CC's laws (schema, seams, naming, env) into app-local folders.
**Decision:** B — ratified by Taylor. CC's own Rule 1 (placement follows the consumer; one consumer → co-locate) decides against A.
**Consequences:** No Turborepo/boundary-lint tooling; the placement map in `../TECH-SCOPE.md` §3 is enforced by review instead. Cheap to revisit — folders extract to packages cleanly if a second app ever exists.
**Revisit trigger:** A second app or a native client consuming the same capability.

## 2026-08-18 · M-INT-2 · Server actions + route handlers; no tRPC

**Context:** CC's default rail is tRPC, justified there by a second (mobile) consumer of the typed contract.
**Options weighed:** A) tRPC exactly as CC. B) Server actions for client-initiated writes; route handlers for webhook/cron/upload issuance.
**Decision:** B — ratified by Taylor. CC §3.5's own exception table assigns web-only mutations with no shared logic to server actions; every write here is that.
**Consequences:** Less ceremony; no cross-client type contract (none needed). Actions must stay thin — validate (Zod), call service, return — or this decision rots.
**Revisit trigger:** Any second client of this data.

## 2026-08-18 · M-INT-3 · New Supabase project under tayloraucoin.com; Stripe stays Agora's

**Context:** Data is business-confidential client intake; Agora is the charging entity and already has Stripe.
**Options weighed:** A) Reuse a CC Supabase project. B) New project.
**Decision:** B — ratified by Taylor, who named it: Supabase project belongs to tayloraucoin.com; **only the Stripe account is Agora's.**
**Consequences:** Own keys, bucket, blast radius. One more project to administer.
**Revisit trigger:** Agora acquiring its own infrastructure umbrella.

## 2026-08-18 · M-INT-4 · v1 output is markdown emailed to Taylor; no admin surface

**Context:** Admin UI deferred (Taylor, during Vesper's pass); the markdown document is the build's entire point (build spec §6).
**Options weighed:** A) Minimal admin page now. B) Generate on completion and email via Resend, plus an on-demand CLI re-send. C) Raw DB only.
**Decision:** B — ratified by Taylor.
**Consequences:** Product usable on client one with zero admin scope. Signed file links in email must outlive the inbox lag (≥7-day expiry).
**Revisit trigger:** The admin build (see `../ADMIN-HANDOFF.md`).

## 2026-08-18 · M-INT-5 · Link creation is a local CLI script `[PROVISIONAL — Taylor]`

**Context:** No admin surface exists to create engagements; Taylor creates a handful of links per month after sales calls.
**Options weighed:** A) Token-protected admin route. B) `scripts/create-engagement.ts` run locally with env credentials, printing the URL.
**Decision:** B, provisionally — no auth surface to build or defend; the founder already runs migrations locally so the tooling path exists. Cost of being wrong: minutes of friction, replaced by the admin build later.
**Revisit trigger:** Admin build, or link creation needed away from the dev machine.

## 2026-08-18 · M-INT-6 · URL token stored as sha-256 hash; plaintext never persisted

**Context:** The token is the sole credential for confidential data; the DB may leak (backup, log, screenshare) without the tokens leaking.
**Options weighed:** A) Store plaintext for convenience. B) Store hash; look up by hash.
**Decision:** B. 256-bit random → base64url → shown once at creation; sha-256 in `engagements.token_hash` (unique).
**Consequences:** A lost link cannot be recovered, only re-issued (script rotates the hash; old link dies). Acceptable and arguably a feature.
**Revisit trigger:** None foreseen.

## 2026-08-18 · M-INT-7 · Engagement status is derived from fact columns, not stored as an enum

**Context:** The display vocabulary (created → sent → paid → started → in progress → abandoned → complete) mixes facts (paid) with time-derived states (abandoned).
**Options weighed:** A) Status enum column mutated by transitions. B) Timestamp fact columns (`sentAt`, `paidAt`, `startedAt`, `lastActivityAt`, `completedAt`) + one pure `getEngagementStatus(row)`.
**Decision:** B. An enum that can disagree with its own timestamps is two homes for one fact; "abandoned" is a function of now(), which a stored value can't be.
**Consequences:** Status logic has exactly one home in `server/services/engagement.ts`; queries filtering by status compute on read (trivial at this row count).
**Revisit trigger:** Row counts making derived-status queries measurably slow (not plausible at side-gig scale).

## 2026-08-18 · M-INT-8 · Deny-all RLS; all access server-side over the direct Postgres connection

**Context:** No end-user accounts; browser never holds a Supabase key. CC's RLS machinery presumes authenticated users, which don't exist here.
**Options weighed:** A) CC-style policy-per-table with a token→JWT bridge. B) RLS enabled everywhere with zero policies (deny-all to anon/authenticated); server-side Drizzle as the only path; `requireEngagement(token)` as the single scoped-access seam.
**Decision:** B. A is machinery for a caller class that doesn't exist; B puts the guarantee at the strongest layer that matches reality (no PostgREST surface at all) while deny-all guards against future accidental exposure.
**Consequences:** The seam is application code — so it is the one place token checks live, and nothing else may query `engagements`. Storage access mirrors this: private bucket, server-issued signed URLs only.
**Revisit trigger:** Any feature giving browsers a Supabase key (e.g. Realtime) — that day, policies get authored per CC's dual-context guide.

## 2026-08-18 · M-INT-9 · Two-var DB env (`DATABASE_URL` + `DIRECT_DATABASE_URL`) instead of CC's `DATABASE_ENVIRONMENT` tiering

**Context:** CC juggles local/staging/live tiers; this project has one hosted environment and local dev.
**Decision:** Two vars, read only by `lib/env.ts`. Runtime = pooler :6543 `prepare:false`; tooling = :5432. CC's connection law, minus the tier switch nobody needs.
**Revisit trigger:** A staging environment.

## 2026-08-18 · M-INT-10 · No analytics, no consent banner, no measurement on `/intake`

**Context:** The surface carries business-confidential answers; the site elsewhere runs consent-gated analytics.
**Decision:** The intake segment loads no analytics and is excluded from consent tooling. Nothing to measure means nothing to gate; and answer content must never be reachable by a third-party script. Aligns with CC's "no content in analytics" law and the UX spec's trust posture.
**Revisit trigger:** A privacy-clean funnel metric Taylor actually needs (completion rate can come from the DB, not a tracker).

## 2026-08-18 · M-INT-11 · The `Engagement` domain type is an allowlist (`Pick`), not an exclusion list (`Omit`)

**Context (as it was then):** INT-2 specified that `requireEngagement` return a narrowed type with `tokenHash` and the Stripe identifiers dropped. The obvious spelling is `Omit<EngagementRow, ...>`.
**Options weighed:** A) `Omit` the three sensitive columns — short, and the mapping is one rest-destructure. B) `Pick` the nineteen safe columns — longer, and the mapper lists every field.
**Decision:** B. Under `Omit`, a sensitive column added to `engagements` later flows into every page and log automatically unless someone remembers to extend the exclusion list. Under `Pick`, a new column is invisible to surfaces until someone names it — the failure mode is a missing field caught by the type checker rather than a leaked one caught by nobody.
**Consequences:** Costs ~19 lines in one mapper and a line whenever a benign column is added. Buys deny-by-default at the single boundary between the database and everything that renders or logs. (It also removed three `no-unused-vars` warnings the rest-destructure produced — a symptom, not the reason.)
**Revisit trigger:** None foreseen. If the column count grows past readability, the answer is a narrower table, not a wider type.

## 2026-08-18 · M-INT-12 · `email_events` uses a partial unique index with an unqualified predicate

**Context (as it was then):** The send-once guarantee is a database constraint (INT-8's dedupe ruling). Drizzle's `.where(sql\`${table.kind} in (...)\`)`emits a table-qualified column reference inside the`CREATE INDEX ... WHERE`predicate.
**Options weighed:** A) Ship the qualified form Drizzle emits by default. B) Write the predicate with a bare column name.
**Decision:** B, before anything was applied. Postgres accepts both, but the bare name is the documented form and this is a migration — the one place where "probably fine" is not a standard worth holding, since verifying the alternative would have required the database that does not exist yet.
**Consequences:** One`sql`template that names the column literally, so a column rename must touch it. Noted in the schema file.
**Revisit trigger:** Renaming`email_events.kind`.

## 2026-08-18 · M-INT-13 · Site chrome and analytics stand down on `/intake` via a client path gate, not a route group

**Context (as it was then):** `<SiteHeader />` and `<Analytics />` render in the root layout, so they appear on every route including the intake flow. M-INT-10 forbids analytics on that surface, and the design calls for a single focused column with no navigation away from it. A nested layout cannot unrender what its parent rendered.
**Options weighed:** A) Move every marketing page into an `app/(site)/` route group whose layout owns the chrome, leaving the root layout bare. B) Gate both components on `usePathname()` via `isIntakePath()` in `lib/routes.ts`.
**Decision:** B. A is the tidier end state and costs no client JavaScript, but it relocates every route folder — including the parallel `@modal` slots the case-study overlays depend on, which are the most layout-sensitive thing in the repo. That is a large blast radius for suppressing a header, on a site whose own contract says not to redesign what works.
**Consequences:** One small client component (`SiteChrome`) is added to every page; measured cost was ~60 bytes on one route and zero change to the 102 kB shared bundle. The rule lives in one predicate, so there is one place to change it. Analytics genuinely does not load — the component returns null before the tag renders, rather than loading and suppressing.
**Revisit trigger:** The intake surface growing chrome of its own, or a second non-marketing surface needing the same exemption. At two exemptions, do the route group.

## 2026-08-18 · M-INT-14 · Step-progress is written from the client on mount, not during the page's render

**Context (as it was then):** Visiting a step must stamp `startedAt` once and advance `currentStep`. The obvious place is the step page's render, which already resolves the engagement.
**Options weighed:** A) Write during render in the server component. B) Render a tiny client component that calls a server action in `useEffect`.
**Decision:** B. Next prefetches `Link` targets, so A would mark steps reached that the client never saw — the resume screen would send someone to a step they had not opened, and the reminder sweep would read activity that never happened. The extra round trip is invisible; the wrong data would not be.
**Consequences:** One client component per step page and one server action. The write is fire-and-forget and swallows not-found errors: progress bookkeeping must never break a client's form.
**Revisit trigger:** Next changing prefetch semantics for dynamic routes, or progress becoming something the client can see being wrong.

## 2026-08-18 · M-INT-15 · Fulfillment idempotency lives in the UPDATE's predicate, not in a read-then-write

**Context (as it was then):** Stripe retries any non-2xx and replays deliveries routinely, so `checkout.session.completed` arrives more than once as a matter of course. The deposit must be marked paid exactly once.
**Options weighed:** A) Read the engagement, check `paidAt`, then write if null. B) A single `UPDATE … SET paid_at = now() WHERE id = $1 AND paid_at IS NULL RETURNING id`, treating "no row returned" as already-paid.
**Decision:** B. A has a race between the read and the write that two concurrent deliveries can both pass; B cannot, because the database evaluates the guard and the write in one statement. The absence of a returned row *is* the idempotency signal.
**Consequences:** `fulfillDeposit` distinguishes `fulfilled` / `already_paid` / `unknown` with one extra existence query taken only on the non-fulfilling path. Verified locally: a replayed delivery leaves both `paid_at` and `updated_at` byte-identical.
**Revisit trigger:** Any second writer of `paid_at` — of which there should never be one.

## 2026-08-18 · M-INT-16 · The answer merge happens in Postgres, not in application memory

**Context (as it was then):** Each step saves only its own answers into one shared JSONB document. The obvious implementation reads `answers`, spreads the new step over it, and writes the result back.
**Options weighed:** A) Read-modify-write in TypeScript. B) `SET answers = answers || $patch::jsonb`, letting Postgres merge at the top level.
**Decision:** B. A has a window between the read and the write in which another save can land, and the second writer silently discards the first — on a form whose single promise is that nothing is lost. B is one statement, so there is no window. Granularity is the step key: different steps interleave safely, and within one step it is last-write-wins, which a solo filler can only cause deliberately.
**Consequences:** The service cannot inspect the merged result without a follow-up read, which nothing currently needs. Verified locally: three concurrent writes to three different steps all landed, and re-saving one step left the others byte-identical.
**Revisit trigger:** Any requirement for field-level merge within a single step, which would mean a different document shape rather than a different write.

## 2026-08-18 · M-INT-17 · Local storage is written before the network, not after

**Context (as it was then):** Autosave has to survive a tab killed mid-typing, a tunnel, and a dead battery — the client is a tradesperson on a phone with a paid deposit and no patience for retyping.
**Options weighed:** A) Attempt the save, write locally only if it fails. B) Write to localStorage synchronously on every change, attempt the network after, clear local only once the server confirms.
**Decision:** B. Under A, everything between the last keystroke and a crash is gone, because the failure that matters never produced a failure callback. Under B the answers are on the device before any network call exists to fail.
**Consequences:** One synchronous `localStorage.setItem` per keystroke-batch, wrapped so a quota or private-mode error can never interrupt typing. The local copy is cleared only when the server has confirmed *those* values; if the client kept typing during the round trip, the form stays dirty and the next save carries the newer ones.
**Revisit trigger:** Payloads large enough for localStorage quota to be a real constraint — uploads, which deliberately never touch this path.

## 2026-08-18 · M-INT-18 · Bytes go browser → storage directly; the app only issues and confirms

**Context (as it was then):** Clients send phone photos, logos, and voice memos up to tens of megabytes, from rural LTE, to a serverless runtime with request limits and execution timeouts.
**Options weighed:** A) Upload through a route handler that streams to storage. B) The server issues a signed upload URL, the browser PUTs to it directly, the server records the result.
**Decision:** B. A puts a five-minute voice memo through a function with a timeout, and it puts the client's file into our request logs and traces on the way past. B keeps the bytes out of the application entirely — the server handles a filename and a size, never content.
**Consequences:** Three round trips per file (issue, PUT, confirm) instead of one, which also buys real progress reporting and a per-file retry. A row without `uploadedAt` is a started-and-abandoned upload, so the intake document can list what actually arrived. The browser still holds no Supabase key: a signed URL is its own single-path credential.
**Revisit trigger:** Needing server-side processing of a file at upload time — which would be a job queue, not a change to this path.

## 2026-08-18 · M-INT-19 · The URL token is stored encrypted as well as hashed, so reminders can exist

**Context (as it was then):** M-INT-6 stores only a sha-256 hash, which is strictly safer and makes the plaintext unrecoverable. But the reminder sweep has to compose a client's link with no request to take it from, and reminder 1 targets exactly the clients who have never opened theirs — so there is no later moment when the plaintext is in hand.
**Options weighed:** A) Drop reminders. B) A second, separate reminder token. C) Store an AES-256-GCM ciphertext of the same token, written at creation.
**Decision:** C. B doubles the credentials that grant access to the same data for no gain. C keeps one credential and confines the added exposure to a single environment variable.
**Consequences:** Weaker than hash-only, and knowingly: whoever holds both a database dump and `INTAKE_LINK_KEY` holds every live link. The key lives only in the environment, never in the repository. A rotated key makes reminders stop rather than break — `decryptToken` returns null and the sweep skips with a counter. Verified: ciphertext is written at creation, decrypts to the original, is re-written on reissue, and a corrupt value returns null rather than throwing.
**Revisit trigger:** Reminders ceasing to be worth the exposure, or a secrets manager that can hold the key outside the application environment. `[PROVISIONAL — Taylor may reverse this and drop reminders instead.]`

## 2026-08-19 · M-INT-20 · The deposit price lives in Stripe's catalogue, not on the engagement row

**Context (as it was then):** The deposit was built to take a per-engagement amount, on an assumption I introduced and never had confirmed. Taylor's actual model is a standard package at a standard price, with extras billed separately.
**Options weighed:** A) Keep the per-deal amount and retype the same number for every client. B) A saved Product and Price in Stripe, referenced by id. C) B, plus a per-engagement override for exceptions.
**Decision:** B. Under A the price has no home, so a mistyped digit is a mispriced deal with nothing to check it against, and Stripe accumulates a throwaway product per payment instead of a catalogue. C was rejected as machinery for a case that does not exist — the model is one standard price.
**Consequences:** Changing what you charge means a new Price and an env swap; Stripe Prices are immutable, so past payments stay attached to the price that was actually charged. Reporting groups by product in the Dashboard, and the tax code lives on the Product rather than being repeated in code. `deposit_amount_cents` inverts from input to record.
**Revisit trigger:** Genuinely bespoke build pricing, which would want option C rather than a return to A.

## 2026-08-19 · M-INT-21 · Credentials are tiered staging/live behind canonical names, defaulting to staging

**Context (as it was then):** Stripe and Supabase both gained separate staging and live credentials. M-INT-9 had assumed one hosted environment and read `DATABASE_URL` directly, which no longer describes reality.
**Options weighed:** A) Let each service read its own `*_LIVE_*` / `*_STAGING_*` variable. B) Conscious Connections' pattern — one switch variable, a resolver, tier-specific names behind canonical ones (`packages/db/src/connection-env.ts`).
**Decision:** B. Under A every service that touches a key learns about tiers, and adding a third environment means editing all of them. Under B `lib/env.ts` is the only file that knows a tier exists; call sites still ask for `STRIPE_SECRET_KEY` and were not touched. Stripe Price ids are tiered the same way — a `price_…` from test mode does not exist in live, and pointing live Checkout at a staging price fails only at the moment a client tries to pay.
**Consequences:** Two departures from CC's version, both deliberate. The tier falls back to `VERCEL_ENV`, so production deploys pick live and previews pick staging with no configuration. And it **defaults to staging where CC defaults to production** — this process charges cards, and staging keys in production fail loudly while charging nobody, whereas live keys somewhere unintended move real money. A missing value for the active tier never falls back to the other tier; it throws naming the variable and the tier.
**Revisit trigger:** A third environment (a real `local`), which is one entry per variable in the `TIERED` map.

## 2026-08-19 · M-INT-22 · The tier collapse happens once in `next.config.ts`, not at call sites (supersedes M-INT-21)

**Context (as it was then):** M-INT-21 resolved staging vs live inside `lib/env.ts`, at every `requireEnv` call. Taylor's correction: the app should not know a tier exists at all — one place decides, and the decision trickles down.
**Options weighed:** A) Resolve per call inside the env module (what M-INT-21 shipped). B) Collapse tier vars into canonical names once in `next.config.ts`'s `env` block, exactly as CC does with `buildSupabaseEnvForNextConfig` and `buildDatabaseEnvForNextConfig`.
**Decision:** B. Under A every read is a branch that could in principle go the wrong way, and the tier is re-derived hundreds of times to produce the same answer. Under B there is one decision, in one file, and the application reads `STRIPE_SECRET_KEY` with no idea it was ever a choice.
**Consequences:** `lib/env.ts` reads static `process.env.FOO` literals via a switch rather than dynamic `process.env[name]` — this is load-bearing, since Next's `env` block works by build-time replacement of literals and a dynamic lookup is invisible to it. Values are baked into the build, so **rotating a secret requires a redeploy**; that is the price of having no runtime branch. Scripts and `drizzle.config.ts` run outside Next and apply the same collapse themselves (`scripts/_env.ts`). A third tier, `local`, borrows staging credentials for everything except `STRIPE_LOCAL_WEBHOOK_SECRET`, which `stripe listen` mints per session and no deployed endpoint can share.
**Revisit trigger:** Needing to rotate a secret without deploying, which would mean moving back to runtime reads and accepting the branch.
