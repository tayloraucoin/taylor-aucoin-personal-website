# Admin CRM — Technology scope (architecture pass)

Author: Mason. Status: **Ratified 2026-08-21** · **v1.1 (call windows) 2026-08-21 — M-CRM-6** (Taylor answered the three forks: admin auth · promo pass-through · CASL guard; recorded in `specs/TECHNICAL-DECISIONS.md` M-CRM-1…M-CRM-3).

**Document authority.** Product behavior → [`CRM-UX-SPEC.md`](CRM-UX-SPEC.md) (§6 decision log binding). Architecture and conventions → this file, which extends the intake track's ratified [`../intake/TECH-SCOPE.md`](../intake/TECH-SCOPE.md) — every law there (placement, env, migrations, RLS posture, verification) carries over unless amended here. Site law → `CLAUDE.md`, untouched (D-CRM-16 exempts `/admin` from the visual law). Decisions with real alternatives → `specs/TECHNICAL-DECISIONS.md`, cited as `M-CRM-n`.

---

## 1. Problem frame

- **Who imports this?** The same single Next.js app, one admin user. Everything co-locates (M-INT-1 precedent). One cross-repo seam: leadgen (the harvester) gains a CRM export command; the CSV file is the contract between the repos.
- **Rails:** admin-initiated writes are server actions, thin — validate, call service, return (M-INT-2 precedent). No new route handlers except none needed: the cron and webhook rails already exist.
- **One-way doors:** the four new tables, the lead identity key, the leads↔engagements FK, and the admin auth topology. Those got the scrutiny; screens are reversible.
- **Data sensitivity:** business contact data (public-sourced from Google Maps) plus Taylor's private call notes and money data. Confidential posture, same as intake: deny-all RLS, no analytics on `/admin`, no notes content in logs.
- **Worst moments, with contracts:** (1) a logged call outcome lost — dispositions save optimistically, fail loudly, never silently drop (CRM-5 acceptance criteria name the failure states); (2) a double-sent or mis-sent intro email — every send recorded first, re-send requires confirm (D-CRM-9); (3) a sync that clobbers pipeline state — sync-owned columns are enumerated, everything else is untouchable by construction (D-CRM-11).

## 2. Stack additions

`@supabase/ssr` (pinned exact at CRM-2) for cookie-session plumbing — used server-side only. No other new dependencies: drizzle, zod, stripe, resend, csv handling (`csv-parse` if needed, pinned at CRM-4) are present or trivial.

## 3. Authorization topology (M-CRM-1, ratified)

**Supabase Auth, server-side only.** One user (Taylor), created manually in the Supabase dashboard. Login page posts email+password to a server action → `signInWithPassword` server-side → session cookies set via `@supabase/ssr`. **No Supabase client in any browser bundle** — M-INT-8's posture ("the browser never holds any Supabase key") is preserved verbatim.

- **The seam:** `requireAdmin()` in `server/services/admin-auth.ts` — verifies the session *and* reads a `role` from the user's Supabase `app_metadata`, narrowed against the closed `ADMIN_ROLES` union. Every admin page (via the `(protected)` layout) and **every admin server action** calls it first. Deny by default; actions never trust the layout alone. Anything unrecognised in that field is not an admin.
- **Why `app_metadata` and not `user_metadata`:** only the service-role key can write `app_metadata`, so a signed-in user cannot promote themselves. `user_metadata` is user-writable and would be a privilege-escalation hole (M-CRM-7).
- **Granting:** `yarn admin:grant <email> [--role super_admin] [--revoke]`. This is also the lockout recovery — there is no env allowlist to fall back on, deliberately, so that permission has exactly one home.
- **Middleware:** session refresh scoped to `matcher: ['/admin/:path*']` — the static site gains zero middleware weight (site-integrity law, intake TECH-SCOPE §9).
- **RLS:** unchanged — new tables ship RLS-enabled, zero policies, deny-all. All data access is server-side Drizzle.
- `/admin` is `robots: noindex` at the segment layout (CC pattern).

## 4. Data model

Four new tables + one column on `engagements`. CC Drizzle law verbatim (column order: id/createdAt/updatedAt · non-FK alphabetical · FK columns; timestamptz; one file per table; colocated relations; jsonb shape comments → `lib/types/crm.ts`).

**`leads`** — one row per prospect. Google-sourced facts + admin-owned pipeline facts.

- `id` uuid pk defaultRandom · `createdAt` · `updatedAt`
- Sync-owned (upsert may write): `address` text nn default `''` · `businessName` text nn · `city` text nn · `leadScore` integer nn default 0 · `mapsUrl` text nn default `''` · `niche` text nn · `niches` jsonb `// string[]` · `phone` text nn default `''` · `rating` real · `reviews` integer · `thread` pgEnum `lead_thread` (`no_website` · `audit`) nn · `website` text nn default `''` · `websiteBucket` text nn · `lastSyncAt` timestamptz
- Admin-owned (sync must never write): `closedAt` timestamptz · `closedReason` text · `closedState` pgEnum `lead_closed_state` (`not_now` · `not_interested` · `do_not_call` · `bad_lead`), nullable · `contactEmail` text · `nextActionAt` timestamptz · `nextActionNote` text · `notes` text nn default `''` · `phoneOverride` text `[PROVISIONAL — display coalesce(phoneOverride, phone); keeps Google's fact and Taylor's correction in separate homes]`
- `placeId` text nn, **unique** — the upsert identity (M-CRM-4)
- `engagementId` uuid fk → `engagements` on delete set null, **unique** — one engagement per lead
- Indexes: unique `placeId` · unique `engagementId` · index (`closedState`, `nextActionAt`) — the queue's query · index `thread`.

**Stage is derived, never stored** (M-INT-7's law applied): `getLeadStage(lead, attemptAgg, engagement)` in `server/services/leads.ts` derives D-CRM-2's vocabulary from facts — call_attempts aggregates, lead_emails existence, engagement timestamps, `closedState`. The queue query needs only `closedState` + `nextActionAt` (live = `closedState IS NULL OR closedState = 'not_now'`, due = `nextActionAt <= now()`), so derivation stays in TS at this volume (~1,600 rows).

**`call_attempts`** — one row per dial: `id` · `createdAt` · `disposition` pgEnum `call_disposition` (`no_answer` · `voicemail` · `busy_callback` · `conversation` · `wrong_number` · `not_interested` · `do_not_call`) nn · `interestTags` jsonb `// InterestTag[] — lib/types/crm.ts` · `note` text · `leadId` fk cascade. Index `leadId`.

**`lead_emails`** — the record of what was actually sent: `id` · `createdAt` · `body` text nn (as sent, after edits) · `kind` text nn default `'intro'` · `promoIncluded` boolean nn default false · `resendId` text · `subject` text nn · `toEmail` text nn · `leadId` fk cascade. Index `leadId`. (Separate from `email_events` deliberately: different lifecycle, different FK, different idempotency needs — engagement system-sends stay where they are.)

**`lead_syncs`** — the sync log: `id` · `createdAt` · `fileName` text nn · `newCount` · `unchangedCount` · `updatedCount` integer nn.

**`engagements.remindersDisabledAt`** timestamptz nullable — the per-engagement kill switch (D-CRM-13). The reminders cron gains one guard clause. Migration flagged for my review alongside CRM-1's.

## 5. The leadgen seam (M-CRM-5)

The two published CSVs stay frozen (the Cowork audit rubric consumes one; leadgen README calls the contract frozen). CRM-3 adds **`yarn leadgen export --crm`** → `crm_leads.csv`: both threads unified, `place_id` first column, a `thread` column, plus the existing lead fields. The admin sync consumes only this format and rejects files without `place_id`. Identity = `place_id` (Google's stable key, already the leadgen PK) — no cid-parsing from maps URLs, no name+phone heuristics.

**Sync semantics (D-CRM-11, enforced in `server/services/leads.ts`):** upsert by `placeId`; writes only the sync-owned columns; preview computes new/updated/unchanged against current rows; commit is one transaction; a `lead_syncs` row is written in the same transaction.

## 6. Placement map

```
db/schema/leads.ts · call-attempts.ts · lead-emails.ts · lead-syncs.ts   # + engagements.ts gains remindersDisabledAt
server/services/admin-auth.ts        # requireAdmin() — the only admin gate
server/services/leads.ts             # sync upsert · queue query · getLeadStage + loadLeadContext
                                     #   (the shared stage derivation) · lead detail · engagement linkage
server/services/lead-workspace.ts    # /admin/leads reads: filter query, preset predicates, facets (CRM-18)
server/services/calls.ts             # logAttempt + cadence (nextActionAt computation)
server/services/emails.ts            # gains sendIntroEmail (all Resend sends stay in one home)
lib/crm/constants.ts                 # cadence numbers (D-CRM-5) · disposition + interest-tag vocab · scoreboard n-threshold
lib/crm/call-windows.ts              # §12 profile table + niche→profile map + pure derivation (no DB, no I/O)
lib/types/crm.ts                     # InterestTag, jsonb shapes
lib/validators/crm.ts                # Zod: action inputs, CSV row schema
lib/routes.ts                        # gains adminRoutes
middleware.ts                        # session refresh, matcher /admin/:path* only
app/admin/layout.tsx                 # noindex
app/admin/login/page.tsx + _actions/
app/admin/(protected)/layout.tsx     # requireAdmin + shell (CC admin-shell pattern)
app/admin/(protected)/{queue,leads,leads/[id],engagements,engagements/[id],sync,scoreboard}/page.tsx
app/admin/(protected)/_actions/      # thin server actions
app/admin/_components/               # client leaves, 'use client' line 1
```

Carried verbatim from the intake law: kebab-case · no catch-all utils · verb taxonomy (`requireX` throws) · Server Components default · one fact one home (routes from `lib/routes.ts`, cadence numbers from `lib/crm/constants.ts`).

## 7. Promo pass-through (M-CRM-2, ratified — D-CRM-10)

`/websites/intake` (public start) reads `?promo=`, threads it through the start form, and appends it to the redirect into the minted engagement's entry URL, where the existing deposit-gate auto-apply takes over. No schema change; the code is validated only at charge time by the existing `resolvePromoCode` seam (display never sets price). Quiet Gilt and the D-INT decision log bind this one ticket (CRM-8) — it is the only client-facing surface in the track.

## 8. Email

`sendIntroEmail` goes through `server/services/emails.ts` like every other send. Write the `lead_emails` row first, then send; on Resend failure the row is marked (null `resendId`) and surfaced — the record never claims more than is true. CASL soft guard is dialog copy + confirm (M-CRM-3, ratified). Sending domain: same `[PENDING — Taylor]` flag as intake TECH-SCOPE §7 — one flag, one home; build proceeds against sandbox sends.

## 9. Env surface

Additions, all through `lib/env.ts`: `SUPABASE_ANON_KEY` (server-side only — `@supabase/ssr` needs it for the auth API; it never reaches a client bundle, and `lib/env.ts` throws if it would). Everything else exists. **There is no `ADMIN_EMAILS`** — admin permission lives in `app_metadata` and nowhere else (M-CRM-7).

## 10. Verification

Every CRM ticket: `npm run build` · `npx tsc --noEmit` · `npm run lint` · happy path against local/hosted Supabase when the slice touches data. CRM-5 and CRM-7 carry induced-failure verification (kill the network mid-disposition; fail the Resend send) — the acceptance criteria name the paths.


## 12. Call windows (D-CRM-17 — this table is the single home for these values)

`lib/crm/call-windows.ts`. **Config, not data** — this is Taylor's sales judgment, versioned in git and reviewed as code. Deliberately not a table: a table implies per-row editing and an admin UI nobody needs, and would become a second home for something a config file already owns.

**Niche → profile.** The vocabulary is a closed set of eight, config-driven in leadgen's `leadgen.config.ts` and verified identical across both exported CSVs (2026-08-21: 8 niches, no strays).

| Niche | Profile | Volume (no-website / audit) |
|---|---|---|
| auto repair shop | `storefront` | 129 / 339 |
| electrician | `field_trade` | 18 / 177 |
| plumber | `field_trade` | 9 / 224 |
| hvac contractor | `field_trade` | 5 / 179 |
| roofing contractor | `field_trade` | 5 / 137 |
| landscaping company | `field_trade` | 3 / 133 |
| pest control | `field_trade` | 3 / 88 |
| house cleaning service | `solo_mobile` | 10 / 129 |

An unmapped niche (a future leadgen addition) resolves to `unknown`: no window claim, never filtered out by the toggle, and it is surfaced on the sync screen as "N leads in an unmapped niche" so the config gets updated rather than silently mis-advising. **Never guess a window for a niche the table does not know.**

**Profiles** — all times `America/Vancouver`.

| Profile | Best | Fair | Avoid | Why |
|---|---|---|---|---|
| `storefront` | 10:00–11:30, 13:30–15:30 | 15:30–16:00 | 07:30–09:00 (drop-off rush), 16:00–17:30 (pickup rush) | Fixed location, phone is the business, answers all day — but two counter rushes. Answers expecting a customer, so the first seven words must defuse that |
| `field_trade` | 07:00–07:45, 16:30–18:00 | 11:45–12:30 (lunch) | 08:00–11:45, 12:30–16:30 (on site) | On a roof or in a crawlspace during the textbook "peak window". The PM window catches them driving home — hands-free, mildly bored, can't easily hang up |
| `solo_mobile` | 07:00–08:30, 16:30–18:00 | — | 09:00–16:00 (in homes) | Phone in a bag in another room 9–4. Heavy screening of unknown numbers; expect 2–3 touches. No walk-in |

`walkInViable: true` on `storefront` only.

**Weekday tiers** (applied to all profiles): Wed `best` · Tue, Thu `good` · Mon `poor` (scheduling triage; `storefront` worst of all — every weekend breakdown lands in the bay at once) · Fri `poor` (worse in the PM for outdoor trades in summer) · Sat `poor` · Sun `avoid`.

**Seasonal notes** — advisory copy only (D-CRM-20), surfaced on the focus card, never applied to filtering or scoring. Peak season means flush and uninterested; shoulder season means hungry. `electrician` peak May–Aug · `roofing contractor` peak now, opening Oct–Nov · `landscaping company` peak now · `plumber` ramps Sep–Dec · `hvac contractor` dual peak (summer cooling, winter heating), shoulder spring/fall · `pest control` peak spring/summer · `auto repair shop` and `house cleaning service` no strong peak.

**The timezone law (non-negotiable, and the bug this exists to prevent).** Vercel runs UTC. A naive `new Date().getHours()` puts every window computation 7–8 hours off, silently, and the feature would ship confidently wrong. Every hour/weekday derivation goes through `Intl.DateTimeFormat` with an explicit `timeZone: 'America/Vancouver'` — never offset arithmetic, so DST is handled by the platform. This gets its own acceptance criterion in CRM-12. `[ASSUMPTION: every lead is Metro Vancouver — true of the current config's cities, reversible by moving the zone onto the lead row if leadgen ever expands past one timezone.]`

**Derivation, not storage.** `getCallWindow(niche, now)` is pure and computed at query time; ~1,600 rows in TS is nothing. **Zero schema change** — the feature adds no column anywhere, and reach-rate instrumentation reads `call_attempts.createdAt`, which already exists. A per-lead override is unnecessary: a prospect who names a time is a scheduled callback (`nextActionAt`), which already outranks the model.

**Staleness.** The queue is server-rendered against a server-computed "now"; crossing a window boundary makes the page stale. The toggle and a manual refresh re-fetch. No client-side clock ticking, no live re-sort under Taylor's cursor while he is reading a row.

## 11. Open items (routed)

| Item | Owner | Blocks |
|---|---|---|
| Supabase Auth user creation + `ADMIN_EMAILS` value | Taylor | CRM-2 runtime verification (authoring proceeds) |
| Resend sending domain + DNS (shared flag with intake §7) | Taylor | Real intro sends; build proceeds with sandbox |
| Cadence numbers ratification after real call data (D-CRM-5) | Taylor | Nothing — provisional defaults in force |
| CASL/CRTC counsel review (standing) | Counsel | Nothing in the build; sequences stay conservative |
| Call-window values validated against real reach data (D-CRM-21) | Taylor + the scoreboard | Nothing — `[NEEDS VALIDATION]`, config is one file to edit |


## 13. `[REVISIT]` A `public.users` table, when roles need to be rows

The role is a JWT claim today (M-CRM-7). That is enough while there is one admin and the only question is "may this person be here."

**The condition that ends it:** the first time a role needs something attached to it. A second admin with a different scope, an invitation flow, an audit trail of who changed what, per-capability grants, or any table wanting `created_by`. A claim is not a row and nothing can be joined to it, so all of those need a real user record.

**The shape when that day comes** — Conscious Connections has this built and it transfers directly:

- `db/schema/auth.ts` — a reference-only mirror of `auth.users` declaring nothing but `id`. `drizzle.config.ts` already pins `schemaFilter: ["public"]`, so drizzle-kit resolves `.references()` against it and emits the FK without ever trying to migrate Supabase's schema. **Never add columns to that mirror beyond the ones we key against.**
- `db/schema/users.ts` — the shadow table. Primary key *is* the FK to `auth.users(id)`, `onDelete: cascade`. Carries `role`, `email`, timestamps, and whatever the capability model needs.
- `db/supabase/setup/03-users.sql` — a `handle_new_user()` trigger, `security definer`, firing after insert on `auth.users` to mirror the row; a second trigger on email change with a `when` clause so ordinary sign-ins (which touch `auth.users` constantly) do not rewrite it; **plus a one-time backfill for auth users that already exist**, which the trigger cannot do retroactively and which otherwise presents as "I signed in and I am a guest."
- `requireAdmin()` reads the row instead of the claim. Its return type already carries `role`, so call sites do not change.

**Migration path:** additive. Grant the role in both places for one deploy, cut over, then stop writing the claim. Nothing about the current shape blocks it — which is why the claim is acceptable now.
