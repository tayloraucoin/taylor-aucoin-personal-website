# CRM track — technical decisions (append-only)

## 2026-08-21 · scoping · M-CRM-1 · Admin auth is Supabase Auth, server-side only

**Context:** No user accounts exist in this repo; M-INT-8 rules the browser never holds a Supabase key. CC's admin uses Supabase Auth with roles.
**Options:** A) Supabase Auth via server actions only. B) Env-password signed-cookie session. C) Vercel deployment protection.
**Decision:** A. Login posts to a server action; cookies set via `@supabase/ssr`; `ADMIN_EMAILS` allowlist; `requireAdmin()` seam in every admin page and action; middleware matcher `/admin/:path*` only.
**Consequences:** Real sessions on both devices and recovery for free; preserves the no-browser-key posture; costs one-time auth setup. Forecloses nothing — roles can be added later.
**Revisit trigger:** a second admin user, or Supabase Auth friction on the phone.
**Ratified:** Taylor, 2026-08-21.

## 2026-08-21 · scoping · M-CRM-2 · Public intake start forwards ?promo= (D-CRM-10)

**Context:** Promo codes are read only on the tokened engagement page; the intro email needs the public link to carry one.
**Decision:** The start page threads `?promo=` through the form and appends it to the redirect into the minted engagement URL. No schema change; validation stays at the charge seam.
**Consequences:** The intro email promo checkbox works pre-engagement. Reversible in one file.
**Ratified:** Taylor, 2026-08-21.

## 2026-08-21 · scoping · M-CRM-3 · CASL guard on intro email is soft (copy + confirm), not a hard gate

**Context:** Cold email is off-limits (CASL); the email is legitimate only after a prospect asks on a call. A hard gate (send disabled until a logged conversation) blocks legitimate edge cases and is trivially worked around — enforcement theater.
**Decision:** Dialog copy line + confirm step; every send recorded in `lead_emails` with timestamp — the record is the evidence trail.
**Revisit trigger:** counsel review says otherwise.
**Ratified:** Taylor, 2026-08-21.

## 2026-08-21 · scoping · M-CRM-4 · Lead identity is place_id; stage is derived, never stored

**Context:** Upsert-on-sync needs a stable key; the exported CSVs lack one (maps_url cid is parseable but fragile). Stage could be an enum column or a derivation.
**Decision:** `placeId` unique on `leads`, supplied by a new leadgen export (M-CRM-5). Stage derives from facts (`call_attempts`, `lead_emails`, engagement timestamps, `closedState`) via `getLeadStage` — M-INT-7's law applied; an enum that can disagree with its own facts is two homes for one truth.
**Consequences:** Sync is idempotent by construction; the queue query needs only `closedState` + `nextActionAt`. Costs a leadgen release before first sync.

## 2026-08-21 · scoping · M-CRM-5 · Leadgen gains `export --crm`; the two published CSVs stay frozen

**Context:** leadgen's CSV contract is frozen (the Cowork audit rubric consumes it) and lacks place_id.
**Options:** A) Append place_id to the frozen CSVs. B) Parse cid from maps_url. C) New `--crm` export with place_id + thread, both threads unified.
**Decision:** C. The admin sync consumes only this format and rejects files without `place_id`.
**Consequences:** Zero risk to the audit rubric; one extra command in the workflow (`yarn leadgen export --crm`).
**Revisit trigger:** leadgen and the CRM ever share a database directly.

## 2026-08-21 · scoping · M-CRM-6 · Call windows are a pure config module with zero schema change; the model is instrumented to be falsified

**Context (as it was then):** Published cold-call timing data (10–11am / 4–5pm, Tue–Thu) is derived from SDRs dialing desk workers. This list is 180 tradespeople who are under a car or on a roof during exactly those hours. The eight-niche vocabulary is closed and config-driven in leadgen, verified identical across both CSVs on 2026-08-21.

**Options weighed:** A) A `call_windows` table with admin editing. B) A pure config module, derivation at query time. C) Per-lead stored "best time" columns, learned from outcomes.

**Decision:** B. `lib/crm/call-windows.ts` holds the niche→profile map and the profile table; `getCallWindow(niche, now)` is pure and runs at query time over ~1,600 rows. No column is added anywhere. Reach-rate instrumentation reads `call_attempts.createdAt`, which already exists.

**Consequences:** The feature costs one file and no migration, and the values are reviewed as code rather than edited in a UI nobody needs. A per-lead override is unnecessary — a prospect who names a time is a scheduled callback (`nextActionAt`), which already outranks the model. C is foreclosed until there is data to learn from, which is the correct order.

**The honesty clause:** the model is reasoned, not measured — `[NEEDS VALIDATION]`. CRM-11's scoreboard reports actual reach rate by tier/profile/weekday at honest n and is explicitly allowed to falsify it. Out-of-window leads are never hidden (D-CRM-19) and seasonality never filters (D-CRM-20), so being wrong costs sort order, not buried pipeline.

**Revisit trigger:** ~100 logged attempts, or leadgen expanding past one timezone (the `America/Vancouver` assumption moves onto the lead row), or a ninth niche appearing (it resolves to `unknown` and surfaces on the sync screen until mapped).

## 2026-08-21 · CRM-2 · Admin session refresh lives in the existing site-wide middleware, behind an `isAdminPath` branch

**Context (as it was then):** TECH-SCOPE §3 specified `matcher: ['/admin/:path*']` so the static site would gain no middleware weight. On disk, `middleware.ts` already ran site-wide, resolving the consent regime from edge geo — so the weight was already being paid, and narrowing the matcher would have silently disabled consent across the whole site.

**Options weighed:** A) Narrow the matcher and move consent elsewhere. B) A second middleware file (Next allows only one). C) Keep the matcher, branch on `isAdminPath` and return early.

**Decision:** C. The admin branch runs session refresh and returns before any consent work, so the admin surface gets no consent cookie — which is right, because nothing there is measured and consent has nothing to gate.

**Consequences:** The stated goal (no new weight on the static site) is met, since the invocation already happened. `/admin` costs one extra edge call it was already paying for. Nothing about the security posture changes: middleware refreshes, `requireAdmin` decides.

**Revisit trigger:** consent middleware being removed, at which point the admin branch should become the whole file with the narrow matcher.

## 2026-08-21 · CRM-2 · Missing admin credentials fail closed and loud, from middleware

**Context:** With `SUPABASE_ANON_KEY` unset, `requireEnv` throws inside middleware and `/admin` returns 500 naming the missing variable. The alternative was catching it and letting the request fall through to `requireAdmin`.

**Decision:** Leave it throwing. Falling through produces the same 500 from a different stack, because the page needs the key too — so tolerance would buy nothing but a less direct error message.

**Consequences:** A rotated or missing key takes `/admin` down entirely rather than degrading, which is the correct outcome for an authorization surface: it fails closed, and the message names the exact variable. Verified: the branch returns early, so the public site is unaffected by the same condition.

## 2026-08-21 · CRM-3 · The CRM export includes every lead regardless of leadgen status

**Context (as it was then):** `exportCsvs` deliberately excludes leads at status `called` and beyond — leadgen's stated rule is "never resurfaces called leads", because those two files *are* the call list. The CRM export had to choose whether to inherit that filter.

**Options weighed:** A) Inherit the exclusion, so the CRM only ever sees un-worked leads. B) Export everything and rely on the upsert's column ownership.

**Decision:** B. The CRM is the system of record for pipeline state once it exists, and its upsert writes only sync-owned columns (D-CRM-11) — so re-importing a lead Taylor has already called refreshes Google's facts about the business and leaves his notes, dispositions, schedule, and terminal rulings untouched.

**Consequences:** The CRM can learn that a business it is already working has changed its phone number or picked up fifty reviews, which option A made structurally impossible. The cost is that the never-resurface guarantee now lives in the CRM's queue query rather than in the export — correct, because that is where the call list actually is. `do_not_call` exclusion is a queue property, not a file property.

**Revisit trigger:** the CLI status ladder being retired outright, at which point `exportCsvs`' own filter is the thing to reconsider.

## 2026-08-21 · CRM-3 · `niches` is semicolon-joined in the CSV, not JSON

**Context:** `leads.niches` is a JSON array in the SQLite store. A CSV cell had to carry it.

**Decision:** Semicolon-joined, matching the `red_flags` idiom already in `website_audit_leads.csv`. Malformed JSON degrades to the primary niche rather than throwing.

**Consequences:** One delimiter convention across all three exports, and a cell that survives a spreadsheet and a human reading it — JSON in a CSV cell survives neither. CRM-4's parser splits on `;`. Verified: 71 of 1588 rows carry multiple niches.

## 2026-08-21 · CRM-4 · The sync's SET clause is built from an explicit column list, never from the parsed row

**Context (as it was then):** The one catastrophic failure available to this feature is an import that wipes Taylor's call history. Spreading a parsed CSV row into the upsert's `set` is the obvious implementation and makes that failure a single forgotten line away.

**Options weighed:** A) Spread the parsed row and omit admin-owned keys. B) An explicit `SYNC_OWNED` list that the `SET` clause is generated from. C) Column-level database grants.

**Decision:** B. `SYNC_OWNED` is the law; `onConflictDoUpdate`'s `set` is `Object.fromEntries(SYNC_OWNED.map(...))`, so a column added to `leads` later is not syncable until someone adds it here.

**Consequences:** The failure mode of forgetting inverts — a field that silently does not update (visible, harmless, fixable) instead of a wiped call history (none of those). Verified against a throwaway Postgres: notes, contact email, phone override, schedule, and terminal ruling all survive a re-import that changes phone, rating, and reviews. C was rejected as real enforcement bought at the cost of a grant migration nobody would remember to update.

**Revisit trigger:** a second writer to `leads` that is not the sync.

## 2026-08-21 · CRM-4 · Preview and commit re-submit the file rather than parking parsed rows

**Context:** The preview-then-commit flow needs the same rows in both steps.

**Options weighed:** A) Server-side session state between steps. B) Round-trip the validated rows through the browser. C) Re-submit the file; parse twice.

**Decision:** C. Parsing 1588 rows twice costs nothing; A can go stale and needs a store, and B pushes half a megabyte through the browser twice.

**Consequences:** The commit recomputes its own counts, so `lead_syncs` records what actually happened rather than what the preview predicted — which also means swapping the file between steps is reported honestly instead of silently applied.

## 2026-08-21 · CRM-5 · Logged leads are hidden client-side, not waited for

**Context (as it was then):** After a disposition is logged the lead leaves the queue. Waiting for `revalidatePath` to round-trip before the next lead can be selected puts a pause between every call.

**Options weighed:** A) Await revalidation, re-render, re-select. B) Hold a client-side `handled` set, hide immediately, let revalidation catch up. C) Optimistic mutation of a client-held list.

**Decision:** B. The server list is still the source of truth; `handled` only subtracts from it, and after revalidation the logged lead is absent from the server's answer anyway, so the two can never disagree in a way that resurrects a handled lead.

**Consequences:** A call block keeps its rhythm — hang up, log, next. C was rejected because a client-owned list would have to reimplement the banding and the window sort, which is a second home for the queue's ordering rules.

**Revisit trigger:** a second device working the same queue concurrently.

## 2026-08-21 · CRM-5 · A failed save keeps the disposition on screen with its exact payload

**Context:** The surface's stated failure contract is that a logged call outcome is never lost. Server actions can fail on a flaky connection mid-call-block.

**Decision:** Actions return `{ ok }` rather than throwing. On failure the client keeps the exact payload that was attempted and renders a retry that resends it verbatim; the lead is not added to `handled`, so it stays in the queue. Notes behave the same way — the text stays in the box and only the claim of being saved is withdrawn.

**Consequences:** No outcome is ever silently dropped, and a retry cannot send something different from what was clicked. The cost is that every queue action needs a result type rather than relying on exceptions.

## 2026-08-21 · CRM-5 · Keyboard accelerators are ignored while a field has focus

**Context:** Number keys 1–7 fire dispositions and j/k moves the selection. The notes textarea sits directly above the disposition row and is used mid-call.

**Decision:** Both handlers return early when the event target is an input, textarea, or contenteditable.

**Consequences:** Typing "call back at 5" into a note cannot log a disposition. Without this guard the accelerators would be actively dangerous on the one surface where typing and logging happen seconds apart.

## 2026-08-21 · CRM-7 · The intro draft is composed on the server, not in the browser

**Context (as it was then):** The dialog needs a fully drafted, editable email. Composing it client-side would have avoided a round trip.

**Decision:** `draftIntroAction` builds it via `lib/crm/intro-email.ts` and returns it. The links are built from `NEXT_PUBLIC_SITE_URL`.

**Consequences:** One home for the words, so the preview cannot drift from what is sent. More importantly the origin comes from the environment rather than `window.location` — a draft composed while running locally would otherwise email a prospect a `localhost` link, which is the kind of error that is invisible in review and mortifying in the inbox.

## 2026-08-21 · CRM-7 · The `lead_emails` row is written before the send and kept when it fails

**Context:** This is the CASL evidence trail (M-CRM-3), and the guard on cold email is a soft one — the record is the enforcement.

**Options weighed:** A) Send, then record on success. B) Record, send, mark delivered.

**Decision:** B. A failed send leaves a row with `resend_id: null`, rendered on the timeline as "email failed to send".

**Consequences:** A record that exists only when the network cooperated is not a record. The cost is rows for emails nobody received, which is the correct direction to be wrong in — and the timeline says so plainly rather than implying delivery. Verified against a real database with no `RESEND_API_KEY`: the send fails, the row survives, marked undelivered.

## 2026-08-21 · CRM-6 · Empty string is a valid contact input, meaning "clear this"

**Context:** `updateLeadContactInput` originally required a valid email or null. The surface sends `""` when Taylor empties the field.

**Decision:** Accept `z.email()` or `z.literal("")`; the service maps `""` to null.

**Consequences:** Clearing a wrong address works. Before this, it threw validation inside the action, which caught it and reported "Couldn't save that. Try again." — advice that would never have worked, on a surface whose whole contract is that it tells the truth about what was saved. Caught by verification, not review.

## 2026-08-21 · CRM-9 · The lead→engagement link is enforced by a unique index, and the collision is reported

**Context (as it was then):** `leads.engagement_id` is unique (CRM-1). Two leads claiming one engagement would mean two pipeline rows each believing they own one deposit.

**Decision:** `linkEngagement` checks for an existing claim first and returns a message naming the lead that holds it, rather than letting the constraint throw an opaque error at the surface.

**Consequences:** The failure is legible — "That engagement is already linked to Save More Roofing Ltd." — and the rejected lead is left untouched rather than half-updated. The database constraint remains the actual guarantee; this is the readable path to the same answer. Verified against a real database.

## 2026-08-21 · CRM-10 · The reminder kill switch is checked in the sweep loop, not in its query

**Context:** `sweepReminders` selects incomplete engagements and decides per row which reminder is due. The kill switch could have been a `WHERE` clause.

**Decision:** The check sits in the loop, after the candidate is counted.

**Consequences:** `considered` stays honest about what the sweep looked at — a count that silently excluded disabled clients would make the daily log lie about its own coverage — and a switch flipped mid-sweep still takes effect. Verified: a disabled engagement 30 days past its send date produced `{considered: 1, sent: 0}` and wrote no new rows.

## 2026-08-21 · CRM-9 · Money is read from `engagement_products.amount_cents`, never the catalogue

**Context:** The money panel could join `products.price_cents` for display.

**Decision:** It reads the amount recorded on the purchase.

**Consequences:** Prices change; purchases do not. The accounting question is always what was charged on the day, and a panel that re-priced old work against today's catalogue would quietly misstate revenue. Verified with a purchase deliberately recorded below its catalogue price — the panel reports the charged figure.

## 2026-08-21 · CRM-11 · The window tier of a past dial is recomputed, never stored

**Context (as it was then):** The timing check groups historical attempts by the call-window tier they were made in. A `tier` column on `call_attempts` would have made the query trivial.

**Options weighed:** A) Stamp the tier on each attempt at write time. B) Recompute from `(niche, created_at)` at read time.

**Decision:** B. `call_attempts` carries a timestamp and joins to the lead's niche; `getCallWindow` is pure, so the tier is derivable for any past instant.

**Consequences:** This is what makes the model falsifiable rather than self-confirming. When the windows are edited — which D-CRM-21 openly expects — the whole history re-scores under the new definition, so the scoreboard answers "is the model I have now right?" instead of "was the model I had then internally consistent?" A stored column would have frozen every past dial under a hypothesis it was never tested against. Verified: with 5/25 reached in the best window and 20/25 in avoid, the scoreboard reports 20% against 80% and does not flatter the model.

## 2026-08-21 · CRM-11 · A rate below the threshold is null, and null never renders as a number

**Context:** `MIN_N_FOR_RATE` is 20. Buckets below it need some representation.

**Decision:** `Rate.value` and `TimingRow.reachRate` are `number | null`, and the surface renders null as "not enough yet" — never 0%, never a dash that could read as zero.

**Consequences:** Too little evidence and a bad result are different facts, and only one of them is a reason to change what you do. Verified: a bucket with 3 conversations from 3 dials reports its counts and withholds the 100%, which is precisely the number that would otherwise get planned around.

## 2026-08-21 · Forge · Timezone correctness is kept, its cost is not

**Context (as it was then):** `lib/crm/call-windows.ts` routes every hour, weekday, month and day-boundary derivation through `Intl.DateTimeFormat` with an explicit `America/Vancouver` zone — the deliberate choice that keeps the model correct on a UTC server and across DST (M-CRM-6). Each of those calls constructed a formatter inline.

**Measured:** constructing a formatter, 49.4 µs; `formatToParts` on an existing one, 6.4 µs. `getCallWindow`, 54.9 µs per call, of which 48.7 µs was `seasonalNoteFor` building its own. `loadQueue` with no thread filter, 496 ms median over 1588 leads. The sort comparator alone, calling `getCallWindow` per comparison, 1141 ms for 1406 leads.

**Decision:** Hoist the four formatters to module scope and memoize the window per niche inside `loadQueue`. No change to the zone discipline, which is the part that was right.

**After:** `loadQueue` no-filter 496 ms → 15 ms; default thread 48 ms → 5 ms; `loadScoreboard` 112 ms → 17 ms. Behaviour proven preserved by a characterization harness covering tier boundaries, PDT and PST, day bounds, business-day arithmetic, queue ordering and memo-versus-direct equivalence.

**Consequences:** The correct-by-construction timezone approach no longer carries a cost that scaled with list length, so nobody will later be tempted to trade the correctness away for speed. **Revisit trigger:** if `now` ever varies within a single `loadQueue` call, the per-niche memo key becomes wrong and must include the instant.

## 2026-08-21 · M-CRM-7 · Admin permission is a role in Supabase `app_metadata`, replacing the env allowlist

**Context (as it was then):** `ADMIN_EMAILS` was ratified as M-CRM-1 before anyone had tried to create the user. Supabase has no admin flag in its dashboard, and `auth.users` belongs to GoTrue — our columns cannot go in it. Taylor asked for something that could grow into wider capabilities later.

**Options weighed:** A) Keep the `ADMIN_EMAILS` allowlist. B) A `public.users` shadow table keyed to `auth.users(id)`, populated by a trigger — the Conscious Connections pattern. C) A `role` in the user's `app_metadata`, which Supabase does provide and only the service-role key may write.

**Decision:** C, ruled by Taylor. Mechanically the check is identical to B — read a role, narrow it against a closed union, deny anything else — so B remains available later at no extra cost, and the intermediate work B would have required (migration, auth-schema mirror, trigger, backfill) buys nothing until a role needs something attached to it.

**Consequences:** No migration, no trigger, no backfill. Permission has exactly one home, which is the property the allowlist would have broken had both survived. `user_metadata` was never a candidate: it is user-writable, so a signed-in account could promote itself. The cost is that a claim cannot be joined to — no `created_by`, no invitation records, no audit trail — and lockout recovery is now a script rather than an env var, run from a machine holding the service-role key.

**Revisit trigger:** the first role that needs a row behind it. The shape and migration path are written down in `../TECH-SCOPE.md` §13 so the next session does not have to re-derive them.

## 2026-08-22 · scoping (Phase 5) · M-CRM-8 · Conversation-captured contact facts are lead columns, and a texted link is a fact on the attempt

**Context (as it was then):** D-CRM-25 rules the conversation form captures contact name and channel preference; the call sheet's one ask ("text or email?") makes the preference a real datum. `leads` had homes for `contactEmail` and `phoneOverride` but not for a name or a channel. Separately, the script's primary motion — texting the sales-page link from the phone — left no record anywhere, so `info_sent` (a derived stage, D-CRM-2) would under-count the funnel's most common asset-send.

**Options weighed:** A) Structured notes (prefix conventions in `leads.notes`). B) Columns: `leads.contactName`, `leads.preferredChannel` (pgEnum), plus `call_attempts.linkTexted` boolean. C) A new `lead_contacts` table anticipating multiple contacts per business.

**Decision:** B. Notes are prose, not data — a fact the intake prefill and the stage derivation must read cannot live in a convention (one fact, one home). C is premature: one operator, one contact per lead in practice; the table can be extracted the day a second contact exists. `linkTexted` sits on the attempt because the send belongs to the touch, and recomputing stage from it keeps D-CRM-2's law (derived, never stored). The columns are admin-owned and structurally unsyncable: `SYNC_OWNED` is the generated SET clause's source, and they are not in it.

**Consequences:** One small migration (CRM-14, reviewed); intake prefill stops asking for a name Taylor already has; the scoreboard's info-sent seam stays honest under the text-first script. The stage rule "a texted link counts as info sent" is `[PROVISIONAL — Taylor ratifies]` in CRM-14. Cost: a second channel value someday (`phone`?) needs a migration, accepted — closed vocabularies are the house idiom.

**Revisit trigger:** a second contact person on one lead, or a channel the enum lacks.

## 2026-08-22 · scoping (Phase 5) · M-CRM-9 · The call sheet renders from `docs/crm/CALL-SHEET.md`, read at render — content, not code

**Context (as it was then):** D-CRM-28 rules the sales script is a markdown document Taylor edits, rendered in call mode's left column. The SOP precedent (`lib/crm/sop.ts`) is a string exported from code — fine for a document that changes with the software, wrong for one that changes after every call batch ("update it after the first batch" is the sheet's own closing instruction).

**Options weighed:** A) Copy the content into a `lib/crm/call-sheet.ts` string (sop.ts pattern). B) Build-time raw import of the .md (bundler config). C) `fs.readFile` of `docs/crm/CALL-SHEET.md` in the queue's server component, parsed by the shared `Markup` renderer.

**Decision:** C. The document already has one home; A creates a second that will drift the first time Taylor edits the doc and not the string, and B buys build-time coupling and next-config surface for no gain at one file. The read is server-side only, cached per render, ~4KB.

**Consequences:** Editing the script is editing a markdown file, no code review needed; deploys pick it up. Cost: Vercel output tracing must include the file — flagged `[NEEDS VALUE AT BUILD]` in CRM-15 (criterion 11): the builder verifies the production build serves it and adds `outputFileTracingIncludes` if not. Failure degrades safely by construction: CRM-15 requires call mode to log even with the sheet unreadable.

**Revisit trigger:** the sheet growing per-trade variants (a directory of sheets keyed by niche) — the read seam already accommodates it.

## 2026-08-24 · CRM-18 · M-CRM-10 · The board's card set is the derived complement of `to_call`; `to_call` is counted by subtraction

**Context:** `/admin/leads` needed stage on every row and, for CRM-19, per-column counts across the whole table. Stage is derived, never stored (M-CRM-4, D-CRM-2), and `getLeadStage` needs per-lead aggregates over `call_attempts`, `lead_emails`, and the linked engagement. The obvious readings were all bad: a stage column reintroduces the second home M-CRM-4 exists to prevent; a materialized view buys an invalidation problem; deriving stage for every row on every paint scales with leads imported.

**Decision:** `getLeadStage` returns `to_call` only when every fact is absent, and `hadConversation`/`hadTextedLink` are themselves derived from attempt rows — so the ladder's base case collapses to four terms. Their negation is exactly the set of leads that are *not* `to_call`:

```sql
closed_state IS NOT NULL OR engagement_id IS NOT NULL
OR EXISTS (call_attempts) OR EXISTS (lead_emails)
```

`WORKED` in `server/services/lead-workspace.ts` is that predicate. Leads needing aggregates are the ones Taylor has worked, so cost grows with dials made rather than leads imported. `to_call` is counted by subtraction and never queried on its own, so it cannot disagree with the function that defines it. The predicate decides only "worked or not" — never which stage — so it is a restatement of the base case, not a second implementation of the ladder.

**Consequence:** no schema change, no read model, no cache. Stage filtering resolves qualifying ids over the worked set first, then runs the real query against `id in (…)`; unworked leads rejoin as a plain `not (WORKED)` term when `to_call` is selected. When no stage filter is active, stage is display-only: page in SQL, derive for the page.

**Cost of being wrong:** if `getLeadStage`'s ladder ever gains a stage reachable with no attempt, no email, no engagement, and no closed state, this predicate silently misclassifies it as `to_call`. That is the one change to that function that must come back here. Noted at both sites.

## 2026-08-24 · CRM-18 · M-CRM-11 · Correlated subqueries in Drizzle must write the outer reference literally

**Context (as it was then):** `lastTouchAt` — the "touched 11 days ago" fact, and the axis the nurture presets sort on — is a correlated scalar subquery built with Drizzle's `sql` template, interpolating `${leads.id}` for the outer reference.

**Decision:** write the outer reference as literal `"leads"."id"`, never `${leads.id}`.

**Why:** Drizzle renders a column reference **qualified** (`"leads"."id"`) inside a WHERE clause but **bare** (`"id"`) in a SELECT projection. `call_attempts` has its own `id` column, so in the projection the subquery bound to `ca.id`, compared it against `ca.lead_id`, and returned null for every row. The filter kept working — it is built in WHERE — while the rendered "touched N days ago" would have read "never called" on every line. A silent disagreement between what a surface filters on and what it displays.

Nothing in the type system, the lint, or the build can see this: it type-checks, builds, and produces valid SQL that runs without error. It was caught by compiling the query with Drizzle's `QueryBuilder` and reading the generated statement. **Inspect generated SQL for any hand-written correlated subquery** — the same discipline as reviewing a migration as SQL before applying it.

**Consequence:** every raw correlation in `lead-workspace.ts` is written literally, including the ones only ever used in WHERE, so the pattern stays safe when copied.
