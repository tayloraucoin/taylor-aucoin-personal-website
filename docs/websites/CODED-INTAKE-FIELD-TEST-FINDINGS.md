# Coded intake — first full field test, findings

**Date:** 2026-09-05 · **Tester:** Taylor · **Subject:** a real client's material (Kryshan Randel) run end to end through `/websites/coded/intake`, portfolio kind, film pack.

This is the first time the whole flow has been walked with real content rather than fixtures. It is a findings record, not a ticket: PORT tickets get authored from it, and `PROGRESS.md` stays the only source of truth for Complete.

Severity follows the review grammar: **Blocking** breaks a law or a trust contract · **Should-fix** hurts the experience · **Consider** is taste.

---

## 1. Fixed in this pass (2026-09-05)

Taylor directed the blocking set be taken first, as one hotfix. Proposed ticket id **PORT-H2**; not yet authored as a spec, not yet in `PROGRESS.md`.

| # | What was wrong | Fix |
|---|---|---|
| 1.1 | **Anyone could open a client's intake by typing their email.** The public start form redirected straight into any unfinished engagement matching the address, with the resume cookie set. | `app/websites/coded/intake/_actions/start.ts` — the instant resume now requires the browser to already hold that engagement's token. Every other browser is sent the link by email and gets a neutral confirmation. New `StartResult` variant `{ sent: true }`; draft copy in `showcase-start-form.tsx`. |
| 1.2 | **The ingest run silently destroyed every sorted entry.** `resultFor` derived the model's output schema by forcing *every* field to `z.string()`, including `experience[].feature` (boolean) and `projects[].videos` (array). The model returned `""`, the entry schema refused the whole array, and both steps were dropped — taking the primer's `awards` / `press` / `kindWords` with them. | `server/services/extract.ts` — `isStringField` excludes non-string fields from the derived output shape. A watch link still lands: `watchUrl` is a string field and `videosOf` reads an entry carrying one as a single video. |
| 1.3 | The same discard was **silent on the server**: `commitIngestion`'s shape guard had no `else`. | `server/services/ingestion-store.ts` — logs the step and the offending field paths. Keys only, never values. |
| 1.4 | **Every email was failing while the logs said "sent".** Resend reports refusals in the response rather than by throwing, and neither `sendOnce` nor `sendRawEmail` checked `.error`. `sendOnce`'s rollback could therefore never fire. | `server/services/emails.ts` — both check `.error`. |
| 1.5 | **"Send me my link" sent showcase clients a 404.** The action hardcoded the durable tree. | `app/websites/intake/[token]/_actions/send-link.ts` — uses `buildEntryUrlFor(engagement.track, token)`. |

`yarn build:agent` · `npx tsc --noEmit` · `yarn lint` all pass. Nothing here was exercised against a live Resend send or a real ingest run — see §2.1.

---

## 1b. Fixed in the second pass (2026-09-05)

Taylor: "fix the durable track too. fix the rest of what I listed on this run as well." Proposed ticket id **PORT-H3**.

| Area | What changed |
|---|---|
| **Durable takeover (§2.2)** | `app/websites/intake/_actions/start.ts` now carries the same cookie-match rule as the coded track, and emails through `buildEntryUrlFor` so a showcase engagement found from the durable form gets its own tree's link. Same `{ sent: true }` state in `start-form.tsx`. |
| **Ingest success view (§3.1)** | `DoneOverlay` in `ingest-run.tsx` — says how many answers were filled, names any stage that failed, and points at the next step. The success path no longer calls `router.refresh()`, which would now redirect out from under the card. |
| **Ingest finality (§3.2)** | The step page redirects forward when an ingestion record exists, and `StepShell` gained `previousLocked` so step 2's Back renders disabled rather than bouncing off that redirect. |
| **Overlay honesty (§3.3)** | New `WorkingIndicator` (`app/websites/intake/_components/working-indicator.tsx`): a travelling hairline on the new `ingest-sweep` keyframe plus cycling copy. The old `ingest-breathe` pulse read as a progress bar on something with no progress to report. Used by the ingest overlay, both fast-way blocks, and the style search. |
| **Ingest logging (§3.4)** | Run start and finish with stage counts and durations in `ingestion.ts`; per-mode counts and latency in `extract.ts`; discarded-proposal count in `primer.ts`. Counts only, never content. |
| **`homeBrainDump` (§3.6)** | Inventory description rewritten to demand an explicit home-page plan and to say leave-it-empty otherwise. |
| **Honest fill count** | `ingestion-store.ts` now filters `fields` to what survived the shape guard, so the success view cannot report answers that were discarded on the way to disk. |
| **Style search (§4)** | `SEARCH_BUDGET_MS` (240s) enforced across every turn via per-request timeouts; logging at start, per turn (`stop_reason`, web-search count), at select, and at filter; `keepUsable` now **counts** gallery matches instead of silently dropping them, and the empty state says which kind of empty it is. |
| **Style search waiting (§4)** | Inline `WorkingIndicator` with a first line that sets the couple-of-minutes expectation. Model is `claude-sonnet-5`, now logged. |
| **Surface (§5)** | Disabled Back on step 1 and a `min-w` Continue · app-wide `ScrollToTop` in both intake layouts · `mb-7` on `TitlePreview` · slider ticks and fill positioned by the browser's own thumb arithmetic · loading state on both fast-way blocks · `rights` defaults to public for typed and extracted projects · `never` underlined via a new `labelNode` prop that leaves the document's plain string alone · welcome button reads "Start →". |
| **Motion hand-off (§6)** | `flush()` now returns its save so it can be awaited, the Offer branch awaits it before opening Checkout, and the autosave hook flushes on `pagehide` for hard navigations generally. |

`yarn build:agent` · `npx tsc --noEmit` · `yarn lint` pass. **No live path was exercised** — see §2.1 for why.

### Corrected finding: juliarossetti.com (was §4.1)

**Not a code bug.** I checked the seed entry: `scripts/seed/film-example-sites.ts:302` sets no `embed` flag, so that site is never framed — it renders from its local capture and the URL is an ordinary outbound link. The broken behaviour Taylor saw is her site's own TLS, and the decision is curation rather than code: leave it, or drop it from the film set.

The iframe hand-over weakness described below is real but did not cause this, and no framed site in the set is currently known to trip it. Left open.

---

## 1c. Fixed in the third pass (2026-09-05)

Taylor: "continue to complete all still-open items." Proposed ticket id **PORT-H4**.

| Area | What changed |
|---|---|
| **Buckets (§2.1)** | `db/supabase/setup/01-rls-and-bucket.sql` now creates `PRIVATE` and `public` alongside `intake`, idempotently and with the right public flags — settling the casing question in a file that can be diffed. New `yarn db:setup` (`scripts/db-setup.ts`) runs every file in that folder in order, so this stops being a manual copy-paste that gets skipped. **Taylor still runs it**, per the migrations law. |
| **Links no longer all-or-nothing (§2.1)** | `readLinks` wraps each page's storage write, so one failure costs that page rather than every remaining one. This is what turned a missing bucket into "every link fetched, paid for, and discarded". |
| **Rate limiting (§2.4)** | `sendResumeLink` is capped at 6 per engagement per hour, counted off the `email_events` ledger that already records every send — no migration, durable across instances. Over the limit it returns success and logs, so the caller's neutral "we've sent the link" never becomes an oracle for whether an address exists. |
| **`accounts[]` (§3.5)** | New `lib/intake/accounts-from-links.ts` turns the step-1 links box into step-10 accounts by recognising known profile hosts. Deterministic rather than a model stage: the client typed these URLs, and recognising `vimeo.com` needs no judgement. Appended as an entry batch in the ingest action, so it merges like any other and cannot overwrite what a client has typed. `EntryBatch` widened to carry it; `eval-primer` skips it, since no prompt produces it. |
| **Edit portal (§7)** | New `/websites/coded/intake/[token]/review` — every step with an answered/total count and a link into it, reached from a new block on the done screen. **The steps are the editor**: no second form, no second copy of any question. Auth is the existing token, exactly as every other page in the tree. The ingestion step is listed but not linked, since it is spent. |
| **Stale document (§8 Q5)** | Answered without new schema: `engagement-state.tsx` now says "Edited since — the emailed document is older than these answers" whenever `lastActivityAt` is later than `completedAt`. Taylor is told when to re-render rather than the system guessing. |

`yarn build:agent` · `npx tsc --noEmit` · `yarn lint` pass.

### Deliberately not done

- **§3.7 — links crawled by the Experience and Work fast-way blocks.** Deferred, and it wants its own ticket. It needs a new answer field per block, new client-facing copy that the v2 doc does not contain, and it is a third-party data path, which this folder's rules say gets a Forge review and an eval before a prompt. The gap it was raised to close has also shrunk: step 1 now reads links into the run *and* seeds `accounts[]` from them.
- **§4.1 — the iframe hand-over.** A cross-origin frame that loads an error document fires `onLoad` indistinguishably from one that loads a page; the component's own docblock already says so, and `embed` is the curation gate that exists because of it. Any detection I could add would be a heuristic that lies in the other direction. Left as documented behaviour.
- **§2.3 — existence disclosure.** Still a product decision. See §8.

---

## 2. Blocking — open

### 2.1 The storage buckets do not exist

Both `Bucket not found` lines are the same cause. `intake` (private client uploads and fetched link sources) and `PRIVATE` (invoice PDF archive, overridable via `INVOICE_PDF_BUCKET`) are absent from the local Supabase project. Only `intake` has a creation script — `db/supabase/setup/01-rls-and-bucket.sql` — and it is a manual run outside migrations with no `db:setup` script. `PRIVATE` and `public` are dashboard-owned and created by nothing in this repo (`specs/DEVIATIONS.md:240`, which also warns bucket ids are case-sensitive).

Consequence beyond the log line: **the links were fetched and then thrown away.** `readLinks` retrieves each page through the model's server-side web fetch, then `writeSourceObject` throws on the missing bucket; the write loop is sequential, so the first failure loses every link. The pages were paid for and never reached the run. This is most of why §3.4 looks like a prompt problem.

**Taylor's action:** run the setup SQL against local and hosted, create `PRIVATE` and `public` by hand, confirm the casing.

**Closed on production 2026-09-12.** Kryshan (the first client through) could not upload documents or project images; the deployment log carried Supabase's foreign-key message, `The related resource does not exist`, on every `POST /api/intake/upload`. Production held `PRIVATE` and `PUBLIC` and no `intake`. Taylor created `intake` (private) by hand in both projects; uploads confirmed working by the client the same day. The setup SQL was not run against production, deliberately — it would add a lowercase `public` beside `PUBLIC`. Decision recorded at `intakeBucket()` in `server/services/submission.ts` and in `.env.example`.

### 2.2 The durable track has the identical takeover hole

`app/websites/intake/_actions/start.ts:63-70` is 1.1 unfixed, and slightly worse: there is no track check, so a showcase engagement's token can be handed out from the durable form too. **Not touched** — the durable track is locked scope under this folder's README, and a security change there is Taylor's call, not a build thread's. The fix is the shape already shipped at 1.1.

### 2.3 Residual: the start form still discloses existence

1.1 closes the takeover. It does not close enumeration: a known address returns "you already have one on the go", an unknown one creates an engagement and redirects, so the two are distinguishable. Closing it properly means not minting an engagement until an address is verified, which is a funnel change and a product decision. **Flagged, not decided.**

### 2.4 No rate limiting anywhere

No limiter exists in the repo. `sendMyLink` is deliberately not send-once, and the start form now sends mail on an attacker-chosen address. Both are unbounded. Needed before either is public with real volume.

---

## 3. The ingest step (step 1)

### 3.1 Nothing happens on success — Should-fix

On success the client component only calls `router.refresh()`. No state, no outcome line; the overlay disappears when the server render lands. Taylor's read — "it finished, but nothing happened" — is the design as built.

Wanted: a success view that says what was derived and moves them forward.

### 3.2 The step is not actually final — Should-fix

Finality today means the button is gone and a second commit is refused (`commitIngestion` returns `already_ran` under `FOR UPDATE`). The step stays reachable and its `dump` / `links` boxes still autosave. Taylor wants it genuinely closed once run.

### 3.3 The overlay reads as progress and shows no activity — Should-fix

`RunningOverlay` animates a 1px gradient hairline (`@keyframes ingest-breathe`, 2400ms). It is shaped like a progress bar while being indeterminate, which is the actual defect — a spinner alone does not fix it. Taylor also asked for cycling messages that educate: what is happening now, what the next sections will ask for.

Recommendation (Vesper): keep the hairline as the house motion language, make the indeterminacy honest, and write the messages as phase reporting rather than encouragement. The cheerful register Taylor sketched ("You're bringing your vision to life") is the one the human-hand standard exists to catch; the educational angle in the same note is the stronger idea. Copy is Taylor's.

### 3.4 The run is unobservable — Should-fix

A fully successful run writes **no log line at all**; only failures log. Model is `claude-sonnet-5`, `max_tokens: 16000`, `messages.parse` with `zodOutputFormat`, no temperature, no timeout, no streaming, three calls fanned out via `Promise.allSettled` (one primer + one per entry stage). Log points wanted: run start (source chars, link count), per-stage outcome and counts, model latency and usage, how many primer proposals the quote validator discarded (currently invisible), and the guard failure now added at 1.3.

### 3.5 `accounts[]` can never be filled — Should-fix

Taylor expected the social links from step 1 to reach step 10. They structurally cannot: the primer's field inventory is derived by `textFieldKeysFor`, which is **string fields only**, and `accounts` is `z.array(z.object({platform, link}))`. It appears in no prompt. Filling it needs either a dedicated extraction mode or a widening of the inventory contract.

`awards` / `press` / `kindWords` **are** in scope and were lost to 1.2 — they should populate now, unverified until a live run.

### 3.6 The home-page answer was bad — Should-fix

For `homeBrainDump` the model wrote about the client's hobbies not belonging on the site. The prompt is a *highlighting* frame: "find the sentences that answer a question, and report them", with a hard verbatim-quote rule. A bio contains no sentence about a home page but does contain sentences about hobbies, and the field's one-line inventory description ends "and what must not be there" — so the nearest quotable sentence looks compliant. This class of field wants either an explicit leave-it-blank instruction or removal from the primer's inventory.

### 3.7 Links should be crawled by the later AI blocks too — Consider

Taylor's ask: the "fast way" blocks on Experience and The Work should accept links and read them, the way step 1 does. Feasible — `document-reading.ts` already owns a working `web_fetch` path.

---

## 4. Style search (step 6)

Audited in full at Taylor's request. **Verdict: miscalibrated and blind, in that order.**

- **Shape:** `claude-sonnet-5`, server-side `web_search_20260209`, `MAX_SEARCHES = 14`, up to 4 turns (`MAX_RESUMES = 3`), two calls (search, then a structured select). Realistic wall clock 90s–4min.
- **No timeout exists anywhere on the path** — no `AbortSignal`, no SDK timeout, no client abort. The only ceiling is the page segment's `maxDuration = 300`.
- **Why nothing came back:** five distinct outcomes render as one sentence, and only two write a log. Genuine empty · unparseable structured output silently becoming `[]` · results dropped by `keepUsable` · a swallowed abort · resume exhaustion. Most likely here: `keepUsable` **skips any result whose host already appears in the gallery**, and for a film brief that is plausibly most good hits.
- **Prompt bias:** told twice to return nothing rather than something imperfect ("say so plainly instead of offering something close", "Return an empty list rather than padding it").
- **No liveness check** on returned URLs, by design — the found-state copy says so.

Recommended order: instrument it, give it a hard timeout, stop silently dropping gallery matches (surface them as "already in your picks"), split the empty states, and set a time expectation in the UI. **Do not add the research-mode dialog yet** — asking a client to choose a search depth exposes an implementation detail they cannot judge. Revisit after a re-test.

Loading treatment: today the button label swaps to "Looking…" and the textarea goes read-only. There is no visible progress affordance at all.

## 4.1 juliarossetti.com renders broken — Should-fix

Not a fetch failure. `site-stage.tsx` renders the live reference site in an `<iframe>`; when the frame loads an *error* document (TLS, `frame-ancestors`, mixed content) the browser still fires `onLoad`, so `setLoaded(true)` runs and the good local capture underneath fades out after `HANDOVER_MS`. The docblock's claim that a frame which never arrives leaves the capture in place holds only for a frame that never loads. `embed` is a hand-set boolean with no automated header or TLS probe, and `checkedOn` is a manual date.

---

## 5. Surface defects

| # | Item | Where | Severity |
|---|---|---|---|
| 5.1 | **CTA bar looks lopsided on step 1.** `previous ? <GhostButton/> : <span />` — an empty span against `justify-between`. Taylor: render Back disabled instead, widen Continue. Needs the non-`href` branch of `GhostButton`; `GHOST_CLASS` already carries the disabled styling. Vesper: give Continue a `min-w`, not full width — a stretched primary reads as a form submit, and this is navigation. | `app/websites/intake/_components/step-shell.tsx:110-121` | Should-fix |
| 5.2 | **No scroll to top between steps.** Navigation is route-based (`Link` per step), so an app-wide fix is safe. Next normally scrolls on navigation, so diagnose what is defeating it — a nested scroll container or `scroll={false}` — before adding a global effect. | intake layout / `step-shell.tsx` | Should-fix |
| 5.3 | **"Which role leads?" has no gap above it.** `TitlePreview` sits outside any spacing wrapper and has no bottom margin; the preceding `Field`'s `mb-7` ends above the card. | `steps/step-about.tsx:296-300` | Should-fix |
| 5.4 | **Slider increments feel wrong.** Native range `min=0 max=7 step=1` (0 = unscored) with a 7-numeral tick row spread across 8 stops, so labels do not sit on their stops. Conscious Connections uses a Radix slider on 0–100 mapped to 1–7 with no ticks and augmented keyboard (Shift ±10, PageUp/Down). | `_components/taste/pick-scale.tsx`, `globals.css:348-417` | Should-fix |
| 5.5 | **"The fast way" has no loading overlay** on either Experience or The Work — only a label swap and a read-only textarea. Same for style search. There is no spinner or progress primitive anywhere in `components/ui/`; `RunningOverlay` is the only precedent. | `extraction-block.tsx`, `taste/style-search.tsx` | Should-fix |
| 5.6 | **`rights` should default to "Yes — it's public".** New entries mint `{ entryKey }` only, so nothing is selected. | `steps/step-work.tsx:144` | Should-fix |
| 5.7 | **Underline "never"** in "And one thing it must never feel like". The string is inline, and both `TextAnswer` and `Field` type `label` as `string` — an underline needs those widened to `ReactNode`, plus a check on `FieldDocument`. | `steps/step-taste.tsx:376`, `answer-inputs.tsx:38`, `field.tsx:42` | Consider |
| 5.8 | **Post-payment "Start" button copy** should drop the section name. | `showcase-welcome.tsx` | Consider |

---

## 6. Motion add-on

The Stripe checkout button **already exists and is wired** (`taste/motion-notice.tsx:164-192` → `_actions/add-on.ts` → `createAddonCheckout`, allow-listed to `showcase_animations`, settling through `settleAncillaryPurchase`). It falls back to "mention it to Taylor" only when `priceCents === null`, which is the same root cause as the three `no Stripe price` log lines: `showcase_animations`, `showcase_supabase_setup` and `showcase_seo_blog` carry empty `sandbox` product/price ids in `scripts/seed-products.ts`, so `toSellable` returns null.

**Taylor's action:** `yarn stripe:catalogue --apply` against the sandbox key, paste the minted ids into the three `sandbox` blocks, `yarn db:seed`. (Also flagged in that file: `showcase_seo_blog` has a duplicate live Product worth archiving.)

**Then one real defect remains:** the offer branch never calls `form.flush()` before handing off to Stripe, and the intake has no `beforeunload` / `pagehide` handler, so a hard navigation drops up to `DEBOUNCE_MS = 900` of unsaved typing. `form.flush` is the existing helper.

---

## 7. The client edit portal — scoping

Taylor's ask: a page where a client can review and edit everything they submitted, with ongoing access.

**Most of it already exists.** Answers are one JSONB document per engagement (`engagements.answers`), written by `saveStepAnswers` with no completion gate — a finished client can already reopen a step URL and overwrite an answer. RLS is enabled deny-all with zero policies and the browser never holds a Supabase key; all access is Drizzle over the direct connection. So this is a review surface plus auth hardening, not new data plumbing.

**Recommendation: no passwords, no client Supabase users.** The existing 60-day bearer token is the credential. Invert `findResumableByEmail` so the link is only ever emailed, never returned in-band — which closes §2.3's neighbour, and hands you the magic-link flow for free. Then it needs:

- rate limiting on the send path (§2.4)
- sliding expiry or a self-service "send me a new link"; the 60-day TTL is absolute and not refreshed on activity, and recovery today is `reissueEngagementToken`, admin-side only
- a stale-artifact story: the intake markdown emailed at completion is a point-in-time snapshot carrying 14-day signed file URLs. An edit after submission silently diverges from what Taylor was sent. The admin detail page re-renders live and does not go stale.
- a decision on whether editing after `completed_at` should notify ops

**Does not exist today:** any client-facing auth, any read-only rendering of answers for the client, any lock or versioning on answers, any audit trail beyond `updated_at`.

---

## 8. Open questions for Taylor

1. ~~Fix the durable track's takeover hole (§2.2)~~ — done, second pass.
2. **Existence disclosure (§2.3)** — still open, and the only one that needs a product call. A known address now returns "you already have one on the go"; an unknown one creates an engagement and redirects. The two are distinguishable, so the form still confirms whether an address is a client. Closing it means not minting an engagement until an address is verified, which puts an email round trip in front of every new client. Rate limiting (§2.4) bounds the abuse; it does not remove the signal.
3. **Copy** — every string added across the three passes is marked `[COPY — draft, pending Taylor]`: both overlays' cycling lines, the two start forms' "already on the go" line, the ingest success card, the review page, the done screen's review block, and the style search's "already in your picks" empty state. `grep -rn "COPY — draft" app` finds them.
4. **Style search** — re-test now that it is instrumented and no longer discards gallery matches, then decide whether a depth dialog is still wanted. My recommendation is that it is not.
5. ~~Should an edit after completion regenerate the document?~~ — answered without new schema: admin now flags when answers are newer than the emailed document, and Taylor re-renders when he chooses.
6. **New:** should the durable track get a review page too? It was built for the coded track only, on Taylor's ask. The machinery is track-agnostic apart from the route.
