# PORT — Technical decisions (append-only)

One section per architectural choice with real alternatives. Never edit or delete prior entries. Format: fast-lane ADR. IDs `M-PORT-n` are citable from tickets. M-INT-1…23 (`docs/intake/specs/TECHNICAL-DECISIONS.md`) remain in force as inherited law.

## 2026-08-26 · M-PORT-1 · Internal track key `showcase`; cartridge via a per-track registry resolved through one seam

**Context (as it was then):** The handoff mandates one machine parameterized per website type, with step identity keeping exactly one home, the Durable track byte-for-byte unaffected, and an internal key that does not collide with "portfolio" (which already means tayloraucoin.com itself in this repo's comments and `legalRoutes`).
**Options weighed:** A) Parameterize `INTAKE_STEPS` in place with a track argument on every export. B) A parallel, disconnected second registry file an agent could drift from. C) Keep `lib/intake/steps.ts` exporting the durable registry unchanged; add `lib/intake/tracks.ts` mapping `IntakeTrackKey → registry/schemas/labels/flavour`, and move every consumer to resolve through that seam.
**Decision:** C, with track key `showcase`. A rewrites every Durable call site for no behavioral gain and risks the byte-for-byte guarantee; B is two homes for one kind of fact. C leaves Durable files untouched where possible and gives step identity one resolver.
**Consequences:** One new module every intake consumer imports; the Durable registry's contents never move. Adding a third track is one map entry plus content files.
**Revisit trigger:** A third track whose steps diverge structurally (not just in content) from the nine-step shape.

## 2026-08-26 · M-PORT-2 · Own nested route tree `/websites/portfolio/intake`; thin wrappers over shared components

**Context:** Vesper's D-PORT-1 requires the track's own public start route with the Durable start form untouched; WEBSITES-PAGE-SPEC §7 requires trimmed URLs to land somewhere human; the portfolio marketing page is later scope.
**Options weighed:** A) Share `/websites/intake/[token]` and branch on the engagement's track (no new tree, but portfolio URLs read as the Durable product and trimming lands on the wrong start form). B) A fully duplicated tree (honest URLs, forked pages). C) New nested tree whose page files are thin wrappers over track-parameterized components extracted from the existing tree; `/websites/portfolio` redirects to `/websites` until the explainer exists.
**Decision:** C. URL honesty and the byte-for-byte law both hold; the duplication is one wrapper file per route, not logic.
**Consequences:** Extracting shared components touches Durable files once, in PORT-1/2, under a regression check; after that the trees evolve independently at the page layer only. `isIntakePath` covers both prefixes so chrome/analytics stand down.
**Revisit trigger:** The `/websites` chooser build, which may want a `[track]` segment instead of parallel literals.

## 2026-08-26 · M-PORT-3 · One migration: `engagements.track` + `extraction_runs`, `products.track`, `intake_files.entry_key`

**Context:** The track must be a stored fact on engagements and products (queries filter by it); per-project images need an entry association; extraction needs a durable rate-limit counter. Answers must stay one JSONB document (adding a question never requires a migration).
**Options weighed:** For entry association: A) encode the entry into `fieldKey` (`project_images:{key}` — collides with the 40-char validator bound, makes querying stringly). B) a nullable `entry_key` column beside `fieldKey`. For rate limiting: A) an events table (machinery for one counter); B) an integer column incremented in the service.
**Decision:** `entry_key` column; integer counter; `intake_track` pgEnum (`durable | showcase`) with notNull defaults making every existing row durable by construction.
**Consequences:** One reviewed migration (Taylor runs it); the answers-JSONB law is preserved — favourites, ranks, project entries, and discipline flags are all answer content, zero migrations.
**Revisit trigger:** Per-entry files needing lifecycle of their own (ordering, captions), which would argue for a real child-entity shape instead of a key.

## 2026-08-26 · M-PORT-4 · Payment: build-line selection by plan; fulfillment finds the build line by `kind`, not the literal key `deposit`; care plan and every post-intake charge are Taylor-initiated

**Context:** The pay screen offers half ($1,000 `showcase_deposit`) or full ($1,900 `showcase_full` — its own row per the ratified handoff decision, never a runtime discount). `fulfillDeposit` currently locates the basket's build line with `products.key === "deposit"`, which the new keys break. The care plan is recurring; its billing start is an open Taylor item. Step 8's extra pages promise confirm-before-charge.
**Options weighed:** Fulfillment: A) add the new keys to a list (a growing literal set); B) match `kind === "build"` within the unpaid basket — one build line per basket is already the invariant. Care plan: A) `mode: "subscription"` checkout mixing recurring + one-time lines (couples an open billing question to the deposit moment, adds a customer object now); B) record the selection, charge nothing at checkout, Taylor activates at launch. Extra pages: A) any client-reachable charge surface; B) only Taylor can mint the session (PORT-9).
**Decision:** B in all three. Confirm-before-charge is enforced structurally: no client-reachable code path can create a charge beyond the checkout the client themselves initiates.
**Consequences:** Fulfillment generalization touches a money path once, under Forge review with the Durable case regression-tested. Care-plan revenue starts manual; `[PROVISIONAL — Taylor]` on the activation mechanics. Kryshan's $1,600 needs the promo map's `overridesBuildKey` extension — `[NEEDS DECISION — Taylor]` on the split; the mechanism keeps D-INT-12's law (a code changes *which rows*, never arithmetic).
**Revisit trigger:** Care-plan volume making manual activation a real cost, or a second bespoke price making the override pattern feel like a coupon system in denial.

## 2026-08-26 · M-PORT-5 · Extraction is one service (`server/services/extract.ts`) called by a thin action; structured output from `claude-sonnet-5`; client-side prefill only; per-engagement counter cap

**Context:** Steps 3 and 4 share "Sort this for me." The handoff pins the model (`claude-sonnet-5`) and the law: nothing reaches the answers document until the user has seen and kept it; rate-limit per token; the blob is never lost.
**Options weighed:** Rail: A) route handler (no third-party-inbound or streaming character — nothing forces the exception rail); B) server action → service (M-INT-2's default). Output shape: A) freeform text parsed by regex (unverifiable); B) the API's structured-output support with the schema derived from the same Zod definitions the form validates against — one shape authority. Persistence: A) server writes extracted entries into answers directly (violates the seen-first law); B) return entries to the client; the normal autosave triggers commit them, and the blob field autosaves independently beforehand.
**Decision:** B / B / B. Cap 25 runs per engagement via `engagements.extraction_runs` `[PROVISIONAL]`.
**Consequences:** The Anthropic SDK enters the repo pinned, used in exactly one file; the call carries the blob and nothing else about the engagement. A failed or refused extraction is a typed state, never a lost paste. Prompt content lives beside the service, per mode (experience | projects).
**Revisit trigger:** Blob sizes or run counts making cost or latency real; a second AI touchpoint on the surface, which would want a shared client wrapper.

## 2026-08-26 · M-PORT-6 · Taylor's rulings on the three open payment items (amends M-PORT-4)

**Context (as it was then):** M-PORT-4 shipped three `[PROPOSED]`/`[NEEDS DECISION]` markers to Taylor: how Kryshan's $1,600 is reached, whether the care plan charges at checkout, and whether the admin panel is a live add-on. All three came back the same day.

**Rulings (Taylor, 2026-08-26):**

1. **"1600 is achievable with a promo code."** The `overridesBuildKey` promo extension is **Ruled** — a code substitutes the build line with another catalogue row; arithmetic never changes, rows do, and D-INT-12's law (a code grants rows, never discounts) holds. The two override rows are seeded `showcase_deposit_1600` ($800) and `showcase_full_1600` ($1,520 = 5% off $1,600), mirroring the standard structure. **The amounts are `[PROVISIONAL]`** — Taylor ruled the mechanism, not the split; changing either is a seed edit plus one `yarn stripe:catalogue --apply`.
2. **"Don't charge for the maintenance care plan until it's done."** The care plan is **not offered at checkout in v1**: seeded `isActive: false`, `offeredAtCheckout: false`, no row on the pay screen, no monthly line in any total, no subscription code. This departs from the v2 copy's four-row add-on menu, deliberately and on his instruction — and it matches his standing pattern for this offer (`WEBSITES-PAGE-SPEC.md` §8: the care plan is "a direction and not yet an offer", kept off `/websites` rather than published vague). Reversing it is a seed flag plus the v2 row's copy. Logged in `DEVIATIONS.md`.
3. **"Admin panel is an upsell right now."** The $500 admin panel is **Ruled** as a live checkout add-on: seeded active, `offeredAtCheckout: true`, rendering with the v2 copy verbatim.

**Consequences:** PORT-3 loses the subscription question entirely — v1's pay screen sells a build line plus one-time add-ons and nothing recurring, which is the simplest shape the money path has had. Kryshan is unblocked: his code is seeded and exercisable the day PORT-3 lands. The care-plan copy row is the one place the build knowingly diverges from the approved v2 doc.

**Revisit trigger:** The care plan's scope settling (then: flip two flags, restore the v2 row, decide the billing start), or a second bespoke price making `overridesBuildKey` feel like a coupon system in denial.

## 2026-08-26 · M-PORT-7 · The showcase intake nests under the coded-track sales page, not a `/websites/portfolio` stub (amends M-PORT-2)

**Context (as it was then):** M-PORT-2 was written without knowledge of a parallel scoping thread whose output was sitting uncommitted in the working tree: `docs/websites/PORTFOLIO-MARKETING-EXECUTION-SCOPE.md`, plus a built `/websites` chooser, the old sales page moved to `/websites/platform`, and a coded-track sales page at `/websites/coded`. That document's §3 anticipated the collision and named it as a coordination item — "one thread owns the rename; tell the other" — and its R-1 rules that public naming is by deliverable, which retires "portfolio" as a public slug.

**Options weighed:** A) Keep `/websites/portfolio/intake` and let two public vocabularies for one track coexist. B) Nest the intake under the sales page as `/websites/coded/intake`, so a trimmed URL lands on the page that explains what is being filled in — the trim-back law that put the durable intake under `/websites` in the first place (WEBSITES-PAGE-SPEC §7).

**Decision:** B. The redirect stub M-PORT-2 specified is dropped entirely: it existed only to give a trimmed URL somewhere human to land, and the sales page now does that properly. The internal track key is untouched — `showcase` everywhere in code (M-PORT-1); only the public slug changes.

**Consequences:** PORT-2 builds at `/websites/coded/intake` and gains no redirect. `lib/routes.ts` already carries `websiteRoutes.coded`, so the showcase intake prefix composes from it rather than restating the literal. The slug itself is `[PROPOSED — Taylor ratifies]` in the marketing scope's §3 and is not yet ruled; it is already built into the working tree, so building on it is the reversible default and a rename is one constant in `lib/routes.ts` plus one folder.

**Revisit trigger:** Taylor ratifying a different slug for track B.

## 2026-08-26 · M-PORT-8 · Field enumeration moves behind the track seam (`fieldKeysFor`)

**Context (as it was then):** The document generator built its "Not answered" inventory by casting a step's Zod schema to `{ shape }` and reading its keys. With schemas resolved per track the cast no longer type-checked, because the resolver returns the general `ZodType` rather than a `ZodObject`.

**Options weighed:** A) Type the registry's schema map as `ZodObject` so `.shape` survives the seam — spreads a validator's internal shape into the seam's public type. B) Add `fieldKeysFor(track, stepKey)` to the resolver and keep the cast in exactly one place, behind it.

**Decision:** B. The document generator has no business knowing what a validator is made of, and the schema is still the only complete list of a step's fields — a component renders fields but cannot be enumerated.

**Consequences:** One function, one cast, one home. Every future consumer that needs a step's full field list asks the seam.

**Revisit trigger:** A step whose fields are not enumerable from its schema, which would mean the "Not answered" inventory needs a different source entirely.

## 2026-08-26 · M-PORT-9 · Screens whose copy differs entirely get a sibling component; screens whose copy is shared get parameterized in place

**Context (as it was then):** PORT-2 needed a welcome screen, a resume screen, a done screen, and a step shell for the showcase track. The handoff's law is "parameterize, do not fork" — but the four screens differ from their durable counterparts by wildly different amounts. The resume screen's copy is generic and identical; the welcome and done screens share not one sentence with the durable versions.

**Options weighed:** A) Parameterize all four, passing copy in as props — one component per screen, and a welcome screen taking a headline, a sub-headline, two paragraphs, and a CTA label as props. B) Fork all four. C) Split by what actually varies: parameterize the shared *mechanism* (routes, registry, step count, eyebrow) in place, and give a sibling component only to the screens where the copy **is** the component.

**Decision:** C. `ResumeList`, `StepShell`, and `StepProgress` are parameterized in place and now serve both tracks. `ShowcaseWelcome` and the showcase done page are siblings, because a component whose every string arrives as a prop is not a shared component — it is a template with the copy moved somewhere harder to proofread, and this track's copy has to diff verbatim against an approved document.

**Consequences:** The forked pair duplicates about thirty lines of layout each, and a change to the welcome screen's *shape* touches two files. Bought: each track's approved copy sits in one readable file where a human can check it against the source doc line by line, and the durable screens were not touched. Route building is the seam that keeps the shared three honest — `intakeRoutesFor(track)` in `lib/routes.ts`, so no shared component knows which tree it renders in.

**Revisit trigger:** A third track, which would make two sibling welcome screens into three and tip the balance toward a copy-table.

## 2026-08-26 · M-PORT-10 · `CreateEngagementInput` is `z.input`, not `z.infer`

**Context (as it was then):** Adding a defaulted `track` field to `createEngagementInput` broke every existing caller's type-check, because `z.infer` gives the *output* type — where a defaulted field is required, having been filled in by parsing.

**Options weighed:** A) Add `track: "durable"` to all three existing call sites. B) Export `z.input`, so a defaulted field is optional to supply and guaranteed to exist after parsing.

**Decision:** B. Under A a default is not a default: every future defaulted column would be another sweep through every caller, which is precisely the cost defaults exist to avoid.

**Consequences:** The type now says what the schema means. `createEngagement` still parses, so the service body sees the fully-defaulted shape.

**Revisit trigger:** None foreseen.

## 2026-08-26 · M-PORT-11 · Promo codes are validated against the engagement's track, on both the display path and the charge path

**Context (as it was then):** PORT-3 taught promo codes a second trick — substituting the build line for a negotiated price — on top of the existing one, granting a $0 catalogue item. The override lookup checked that the substituted row belonged to the engagement's track. The *grant* lookup did not, because when it was written there was only one track.

**What that cost:** a scratch-database check caught it. `TAYLOR_FREE_ITERATION_ROUND` — the platform track's free-changes grant — validated on a coded-track engagement and would have put a platform-track row, at a platform-track price, on a coded-track order and invoice. Not a theoretical leak: the code is read out on sales calls, so a client who had bought both would have had it.

**Options weighed:** A) Check the track only where a code is displayed. B) Check it in both places — `describePromo` for the screen and `resolvePromoEffect` for the charge — since D-INT-12's design has them resolve independently on purpose.

**Decision:** B, with the same one-line helper in each. Independent resolution is the feature: it is what stops a tampered screen changing a charge. Independent resolution with the check in only one of them is that feature inverted.

**Consequences:** A code is valid on the track its rows belong to and nowhere else. Adding a track means the check is already there.

**Revisit trigger:** A code deliberately valid on more than one track, which would need a per-code track list rather than the row's own track.

## 2026-08-26 · M-PORT-12 · The build line is a plan the browser names, resolved to a catalogue row on the server

**Context (as it was then):** The coded track's pay screen offers two prices for the same deliverable, and a promo code can replace both. That is five rows (`showcase_deposit`, `showcase_full`, two negotiated substitutions, plus the platform track's `deposit`) that can legitimately be *the* build line.

**Options weighed:** A) Let the client post a product key, validated against a list. B) Let the client post `"half" | "full"`, and resolve the key server-side from the track, the plan, and any code the server itself validated.

**Decision:** B. Under A the browser names the thing being charged, and every new row widens what a fabricated request can ask for; under B the worst a tampered client can do is pick the other legitimate plan on its own track. `getBuildProduct(track, plan, overrideKey?)` is the one place that mapping exists.

**Consequences:** Fulfillment had to stop matching the literal key `deposit` and match `kind === "build"` instead — a growing list of literals is a list that eventually misses one and records the wrong amount paid. Verified on four settlement paths (platform deposit, coded half, coded full, coded negotiated) plus a replay of each.

**Revisit trigger:** A basket that legitimately holds two build lines, which would break the one-build-line invariant this rests on.

## 2026-08-26 · M-PORT-13 · Both tracks share one save action; belonging is checked at the seam, not at the shape

**Context (as it was then):** `useStepAutosave` is hardwired to `saveStep`, whose `saveStepInput` validated `stepKey` against the durable enum. The first showcase step to autosave would therefore have failed shape validation and returned `{ok: false, reason: "server"}` — the save engine retrying forever against a request that could never succeed, on the one surface whose entire promise is that answers are never lost. Caught in a browser, not by the type checker: the action takes `stepKey: string`.

**Options weighed:** A) A second save action with a showcase-only enum, and a hook that takes the action — which means threading a server action through shared infrastructure and editing all nine durable step components to pass their track. B) One action, an `anyStepKeySchema` covering both key spaces, and belonging enforced where `saveStepAnswers` already enforces it: against the engagement's real track, in the seam PORT-1 built and verified.

**Decision:** B. A buys defence in depth the seam already provides, and pays for it by touching nine durable components — against an epic whose hardest law is that the durable track is behaviourally unaffected. The action validates *shape*; the seam validates *belonging*. That is the existing division everywhere else in this codebase (M-INT-8), not a new one invented here.

**Consequences:** A fabricated request can name the other track's step key and gets `UnknownStepError` from the service, which the action turns into the same retryable failure any other error produces. The autosave engine stays one mechanism, which is what stops the no-lost-answers promise from forking.

**Revisit trigger:** A track whose autosave semantics genuinely differ, which would be a different engine rather than a different validator.

## 2026-08-26 · M-PORT-14 · Repeatable entries carry a client-minted key; files point at the key, never at the array position

**Context (as it was then):** A project's stills are only meaningful attached to that project, and a project is a member of a JSONB array with no database identity of its own. The upload needs something to scope the file to.

**Options weighed:** A) Array index — free, and wrong the first time someone deletes the first of three projects, which silently re-points the second project's stills at the third. B) A key minted server-side — requires a round trip before a client can attach a file to an entry they just added. C) A key minted client-side when the entry is added, stored beside it in the answers document, copied onto each `intake_files` row.

**Decision:** C. Twelve characters of `crypto.getRandomValues` in `lib/intake/entry-key.ts`, never regenerated for an entry that already has one — a changed key orphans that entry's files. `entryKey` is the one non-optional field in any showcase entry schema, because it is machinery rather than an answer.

**Consequences:** `FileDrop` takes an optional `entryKey` and the upload route passes it straight through, so the durable track is untouched. The work step reads every project image in one query and groups them client-side, rather than one query per project — forty projects would otherwise be forty round trips to render one screen. Verified: two entries with distinct keys, each card showing only its own files, with a third entry's file and an unrelated portrait both correctly absent.

**Revisit trigger:** Per-entry files needing lifecycle of their own — ordering, captions, deletion history — which would argue for a real child entity rather than a key on a flat table.

## 2026-08-26 · M-PORT-15 · Project entries collapse on presentation state that is never persisted

**Context (as it was then):** Step 4 holds unlimited projects at eleven fields each, on one scrollable screen, because nine steps is a promise and no step sub-paginates (D-INT-5). Forty open cards is not a screen anyone can navigate.

**Options weighed:** A) Sub-paginate — forbidden. B) Persist a collapsed flag per entry, so the state survives a reload — which puts a presentation concern into the answers document the intake report reads. C) Local component state: collapse once an entry has a title, expand on click, start expanded when untitled.

**Decision:** C. The answers document is byte-identical whether every card is open or shut, and autosave neither knows nor cares — verified by reading the stored JSON after collapsing and expanding. A titled entry is one the client can recognise in a summary row; an untitled one stays open because a summary of nothing says nothing.

**Consequences:** Collapse state resets on reload, which is correct: the client returns to a scannable list rather than to whatever they left open. The summary row carries a dim image count so a collapsed card never looks like it lost something.

**Revisit trigger:** A client asking to keep a card open across sessions, which would be a preference to store somewhere that is not the answers document.

## 2026-08-26 · M-PORT-16 · Extraction writes nothing; the autosave engine commits — and it commits sooner than the spec claimed

**Context (as it was then):** D-PORT-3 and the tech scope both described extracted entries as reaching the answers document "through the normal autosave triggers — field blur or step change — which by construction only fire after the entries have been on screen in front of the user." The service and the action were built to write nothing, which they do: verified by reading the stored document immediately after a run.

**What verification found:** `useStepAutosave` also debounce-saves on *change*, so appending entries to the form's state persists them about a second later, without the client blurring or navigating. The stated mechanism was wrong about the engine it was describing.

**Options weighed:** A) Defer the commit until a deliberate interaction, restoring the letter of the spec. B) Keep it, and correct the record.

**Decision:** B, and route the copy question to Taylor. Under A, a client who runs the sorter and immediately closes the tab loses entries they asked for and spends a run to get them back — which trades against this system's strongest law, that an answer is never lost. The client-facing promise ("nothing saves as fact until you've seen it") still holds in the sense it was written: the entries are on screen, editable, and the after-line asks them to fix what is wrong before anything else happens. What is genuinely weaker than specified is that an entry nobody scrolled to can reach the intake document unread.

**Consequences:** The seen-first property is now a property of *rendering*, not of a deliberate act. The service still writes nothing, which is what stops a tampered or stale screen changing the record. If Taylor wants the stronger guarantee, the cheap version is PORT-8 flagging entries that were extracted and never edited — the signal exists (a `fastWay` blob alongside untouched entries) and costs nothing to compute.

**Revisit trigger:** Taylor's ruling, or a hallucinated credit reaching a built site — the failure this whole system exists to prevent.

## 2026-08-26 · M-PORT-17 · `setValue` accepts an updater, because array answers were silently losing writes

**Context (as it was then):** The taste step toggles favourites in and out of an array. Verification found that three rapid toggles produced one favourite: React batches state updates, so all three calls computed their new array from the value the component last rendered with, and each overwrote the previous one.

**Why the existing hook did not catch it:** `setValue` merges functionally — `setValues(current => ({...current, [field]: value}))` — so the *merge* was always safe. What was stale was the `value` the caller computed. For a text field that is harmless, because the second keystroke's value already contains the first. For anything built from its own previous value it is silent data loss, on the surface whose supreme law is that answers are never lost.

**Options weighed:** A) Keep a ref in each component that holds an array answer — a pattern every future step would have to remember. B) Let `setValue` accept `(previous) => next`, resolved inside the same functional update that already runs.

**Decision:** B. The hazard belongs to the hook, so the fix belongs there; a convention every caller has to remember is a convention that erodes at the first tired slice.

**Consequences:** One backward-compatible parameter — every existing durable call site passes a plain value and is untouched, verified by round-tripping a durable step's autosave afterwards. The taste toggle and the extraction appends now use the updater form. A function can never be a legitimate answer value, so the type test is unambiguous.

**Revisit trigger:** None foreseen. If a future answer type were legitimately a function, this would need a sentinel instead — it will not be.

## 2026-08-26 · M-PORT-18 · The coded track's intake document renders projects as sections, and its flags are deliberately few

**Context (as it was then):** The generic value renderer turns an array of objects into `name: x · year: y` lines. For a filmmaker's forty projects — eleven fields each, with images and a rights answer — that is technically complete and unreadable. This document is the artifact the entire system exists to produce; Taylor builds a site from it.

**Options weighed:** A) Let the generic renderer handle projects, as every other array is handled. B) A bespoke section per project: its own heading, its fields as a list, its own images beneath it, and the rights answer spelled out in words rather than as the stored code.

**Decision:** B, and project images are excluded from the general Files section so a forty-project catalogue does not list every still twice.

**On the flags:** five conditions, not fifteen — kind words without permission, projects whose rights are not cleared (named and counted), nothing marked to lead with, email live on the domain, thin taste signal, and a page count past the included five. Each traces to a way this build goes wrong, and each was verified to fire on its trigger *and stay silent otherwise*, including a clean engagement that produces no flags at all. A document that flags something every time is a document whose flags get skimmed, which is the same as having none.

**Consequences:** The work step is the one place the renderer branches by track and key. `IntakeFileLink` gained `entryKey` so grouping is possible at all. The share password renders labelled as a share password — vaguer wording would invite exactly the confusion the no-passwords law exists to prevent.

**Revisit trigger:** A second repeatable entity worth its own sections, which would argue for a general per-entry renderer rather than a second branch.

## 2026-08-26 · M-PORT-19 · Ancillary payments settle their own basket rows and never touch `paid_at`

**Context (as it was then):** PORT-9 adds a second kind of Checkout session against an engagement. `fulfillDeposit` conflated two things that had never needed separating: stamping the basket, and recording that the build had been bought.

**Why that matters:** `paid_at` is the gate the `[token]` state router reads. An extra-page payment setting it would walk a client who had not bought the build straight past the pay screen into the questionnaire — money in, wrong product delivered, and no error anywhere.

**Options weighed:** A) Reuse `fulfillDeposit` and filter what it stamps. B) A separate `settleAncillaryPurchase`, chosen by `charge_kind` in the session metadata, that stamps only the session's product rows.

**Decision:** B. Under A the function that means "the build is paid for" would gain a mode in which it does not mean that, which is how a column ends up with two meanings. Verified on both tracks: an extra-page settlement leaves `paid_at` null and the unpaid build row untouched, the deposit still settles afterwards recording the *build* price rather than the session total, and replays no-op.

**Consequences:** One branch in the settlement handler, keyed on metadata the mint writes. Extra pages get an ops email and no client invoice — the client already has one.

**Revisit trigger:** A third charge kind, which would make the branch a map.

## 2026-08-26 · M-PORT-20 · Extra pages ride `engagement_products.quantity`, and a second purchase is refused rather than recorded

**Context (as it was then):** The first implementation inserted one basket row per page. It failed immediately against `engagement_products_once_idx`, a unique index on (engagement, product) that predates this work — the table already had a `quantity` column for exactly this, and the index exists so that "bought the same add-on twice" is a database impossibility rather than a refund conversation.

**Decision:** One row with `quantity: pages` and the unit price in `amount_cents`. And where a client has *already paid* for extra pages, the script refuses with an explanation instead of finding a way through: a paid row is history that is never rewritten, so recording a second purchase would mean editing what they were charged the first time.

**Consequences:** A client wanting more pages after a first purchase is a case the record deliberately cannot hold; the runbook says to take it through Stripe by hand. Caught by running the code against a real database rather than by reading the schema — the constraint was invisible in the type.

**Revisit trigger:** Repeat purchases of one product becoming normal, which would need a purchase-event table rather than a basket.

## 2026-09-01 · PORT-11 · M-PORT-21 · `kind` lives in the answers document; existing rows derive a kind in the resolver, never by backfill

**Context (as it was then):** The audit (`../CODED-INTAKE-CATEGORY-AUDIT.md` B2) found `siteKinds` stored and read by nothing, and `flavourFor` reading only `disciplines`. Vesper's kinds scope makes one single-select `kind` the input every downstream decision reads. Every step page already resolves flavour from `engagement.answers`.
**Options weighed:** A) A new `engagements.kind` column with a migration and a backfill from `siteKinds`. B) `answers.about.kind` as a key in the existing JSONB document, with a pure derivation from `siteKinds` for rows that lack it. C) Both — column as the source, answers as a cache.
**Decision:** B. The resolver already reads answers; a column is a migration Taylor runs and a backfill is a write to rows nobody asked to touch, for a filter the admin does not have. The derivation is a function that can be deleted the day no row lacks a kind.
**Consequences:** Zero migration for this epic. The admin cannot filter by kind without reading JSONB. `siteKinds` stays in the schema deprecated and read-only (the `unions` precedent) so old answers keep rendering.
**Revisit trigger:** The admin needs to list or filter engagements by kind, or a second consumer outside the intake reads it. Then A, with the derivation as the backfill's source.

## 2026-09-01 · PORT-11 · M-PORT-22 · Copy packs are layered partials over a complete `generic`, in their own module; the flavour type keeps its name and widens

**Context (as it was then):** `SHOWCASE_COPY` held two packs of four slots inside `showcase-steps.ts`. The kinds scope needs six packs of roughly thirty slots, most of which most packs do not override.
**Options weighed:** A) Six complete packs, every slot repeated. B) `generic` complete and typed `Required`; every other pack `Partial`, merged at `copyPackFor`. C) A second track per kind (rejected under M-PORT-1's revisit trigger — the steps do not diverge structurally).
**Decision:** B, in a new `lib/intake/showcase-copy.ts`; `showcase-steps.ts` imports it for step 4's title and intro. The import law extends: nothing imports the copy module except `showcase-steps.ts` and `tracks.ts`. `ShowcaseFlavour` keeps its name and widens to the six packs, because every step component already takes `flavour` and a rename is churn with no behaviour.
**Consequences:** A blank cell in Vesper's table is a fall-through, not an invention; the verify script can assert every slot resolves. The word "flavour" now means "pack" — a naming debt accepted deliberately and recorded here.
**Revisit trigger:** A pack needs to *remove* a generic string rather than override it (no such case today), or a third consumer of the copy module appears.

## 2026-09-01 · PORT-14 · M-PORT-23 · Step 4's kind-shaped entries are four separate array keys on one schema, not one polymorphic array; asks and the claims fields live beside them

**Context (as it was then):** Step 4's entry shape differs by kind (projects · offerings · pieces · services). D-PORT-11 requires that changing kind never changes an answer.
**Options weighed:** A) One `entries[]` with a `shape` discriminator per entry. B) Four keys — `projects`, `offerings`, `pieces`, `services` — each with its own entry schema, plus `asks[]` and `signOff` / `cantSay` / `requiredWording` on the same `work` schema. C) A separate step key per shape (rejected: nine steps hold, D-INT-5).
**Decision:** B. A discriminated array lets a kind change re-read a project as a service, or a validator strip entries whose shape no longer matches. Separate keys mean a shape that stops rendering leaves its value alone, which is what D-PORT-11 promises in words. The output document renders each through one `renderEntries` generalised from `renderProjects`.
**Consequences:** `stepWorkSchema` grows wide; the document may print two arrays for an engagement whose kind changed mid-way, which is the honest record. Extraction modes map one-to-one onto array keys (M-PORT-24).
**Revisit trigger:** A kind whose entries genuinely need a shape no single key can hold, or a fifth shape.

## 2026-09-01 · PORT-17 · M-PORT-24 · Extraction mode names are the array keys; output schemas are derived from the entry schemas; asks are never extracted

**Context (as it was then):** PORT-6 ships two modes with hand-typed output schemas that mirror the entry schemas. PORT-13 and PORT-14 add four arrays. The kinds scope proposed modes `people` and `offer`.
**Options weighed:** A) An `offer` mode that returns a union shape the client sorts by kind. B) One mode per array key (`people`, `offerings`, `pieces`, `services`), each output schema derived from its entry schema minus `entryKey`, enums as `enum | ""`. C) Hand-typed schemas per mode as PORT-6 did.
**Decision:** B. One shape authority (the entry schema) means a field added to an entry is a field the extractor can fill and a removed one cannot linger in a prompt. Asks get no mode: mechanism, destination, and visibility are decisions, not facts a document states, and an extractor proposing them is inventing. One `extraction_runs` counter across all modes.
**Consequences:** The service gains a small derivation helper and four prompt paragraphs; the client passes the array key as the mode. Anything a client wants sorted into asks, they type.
**Revisit trigger:** A document class that genuinely states asks in structured form (a term sheet) becomes common enough to be worth a quote-or-nothing mode with its own eval.

## 2026-09-01 · PORT-11 · M-PORT-25 · The engagement kind is stored at `about.siteKind` (amends M-PORT-21)

**Context (as it was then):** M-PORT-21 was recorded at authoring and named the key `about.kind`. On execution that key turned out to be taken: `projectEntrySchema.kind` ("What kind of thing it is") has existed on step 4 since PORT-5, and `SHOWCASE_ANSWER_LABELS` is a flat map of field key to label across the entire track — not per step. A second `kind` entry is a duplicate key in one object literal.
**Options weighed:** A) Rename the project entry's `kind`. B) Make `labelFor` step-aware so the map can hold two. C) Name the new key `siteKind`.
**Decision:** C. A rewrites a key that live engagements already store, orphaning answers. B changes a seam both tracks read, against a slice whose first non-negotiable is that the durable document stays byte-identical. C costs one word and is entirely contained in this slice.
**Consequences:** `siteKind` (singular) now sits one character from the retired `siteKinds` (plural) in the same schema, which is a real footgun; both carry comments at their definitions saying what the other is. The code vocabulary is unchanged — `ShowcaseKind`, `kindFor`, `groupsFor` — so only the stored key differs from M-PORT-21.
**Revisit trigger:** `labelFor` becoming step-aware for another reason, which would make the collision moot and allow the shorter key.

## 2026-09-01 · PORT-10 · M-PORT-26 · Primer proposals live at the answers document's top-level `primer` key, not in a column and not inside a step

**Context (as it was then):** `primer-proposal.ts` was written at scoping time and its docstring named `engagements.primer_proposals`. On execution two things argued against a column: a migration is Taylor's to review and run, and PORT-1's is still pending against the hosted databases.
**Options weighed:** A) A `primer_proposals` JSONB column, as the type's docstring said. B) A key inside `answers.about`, beside the paste box that produces them. C) A top-level `answers.primer` key.
**Decision:** C. B is wrong on its own terms — the intake markdown renders `answers[step.key]` for every step in the registry, so proposals inside a step would print in the document as though they were answers, and the exclusion would be something a future author has to remember. A top-level key is invisible to the document **by construction**. `saveStepAnswers` writes `answers || '{"<step>": …}'`, a shallow top-level merge, so a step save never touches this key and this never touches a step.
**Consequences:** Zero migration. The answers document now holds one non-step key, and `readStepAnswers` cannot reach it — which is the property that makes it safe. A column becomes worth it if the admin ever needs to query proposals across engagements.
**Revisit trigger:** An admin surface that filters or counts proposals, or a second non-step key, which would argue for a `meta` envelope rather than more siblings.

## 2026-09-01 · PORT-10 · M-PORT-27 · Accepting a proposal is a server-side write, and the value is read from storage rather than from the request

**Context (as it was then):** D-PORT-3 says nothing saves as fact until the client has seen it. A proposal has been seen — that is the whole point of meeting it in place, with its quote — so accepting one is a legitimate write. The question was who supplies the value.
**Options weighed:** A) The component writes the value into the step's form and the client's own autosave commits it, as PORT-6's extracted entries do. B) An action takes a field key, looks the proposal up server-side, and saves it.
**Decision:** B. A would have meant plumbing the proposal set into all eight step components to reach their form state, and it would have let the browser dictate the value that lands in a client's answers. B keeps the browser naming a field and never a value — the same shape as the pay screen naming a plan rather than an amount (M-PORT-12). The action refuses if the field has since been answered, so it cannot overwrite the client's own words.
**Consequences:** One extra round trip and a `router.refresh()` per accept. The per-step surface is self-contained and mounts once in the step page rather than eight times.
**Revisit trigger:** A proposal shape that is not a single text field — a proposed list entry, say — which cannot be written by field key alone.
| M-PORT-28 | `KindEntry` gains `asksRoles`, `asksPortrait`, `asksVideo`, and `work`; `ENTRY_KEY` leaves `step-work.tsx` and `showsReel` derives from the work shape. Read through `kindAsks()` and `workShapeFor()` on the `tracks.ts` seam, as every other kind fact is. Driven by ADM-4, whose "Every kind" overview must compute which kinds are asked a question from the registry rather than from a component. Behaviour-preserving; `verify-track-cartridge.ts` pins the mapping. Mirror of M-ADM-7; ratified by Taylor 2026-09-02. | ADM-4 | Adopted |


## 2026-09-03 · PORT-20 · M-PORT-29 · The transcript is a column on `intake_files`, not a key in the answers document

**Context (as it was then):** The primer left the storage choice to the ticket and noted the argument: a transcript is "a derived artifact of one file, not an answer the client typed." Taylor's 2026-09-03 answer made the transcript client-visible and editable, which is what made the question live — an editable transcript looks like an answer.
**Options weighed:** A) A `voiceNoteTranscript` key on the `words` step, saved by the ordinary autosave engine. B) `transcript` and five companion columns on `intake_files`.
**Decision:** B. Three things settle it. A second recording never overwrites the first (the brief's failure 5), so there are two transcripts and an answer key holds one. A transcript has states an answer cannot have — never attempted, running, failed, machine-written-but-unreviewed — and `transcript_edited_at` is the fact the intake document reads to decide whether to warn Taylor he is reading a machine's guess. And `saveStepAnswers` replaces a step's object wholesale, so a transcript living there would be at the mercy of every later step save, which is the exact class of loss this ticket exists to prevent.
**Consequences:** One migration, six additive nullable-or-defaulted columns, and a second save path for the client's edits — a small server action rather than the autosave engine, so the transcript box has its own indicator. `listUploads` carries six more columns on a query returning a handful of rows.
**Revisit trigger:** A recorder on a second field whose transcript is genuinely one of that step's answers, or an admin surface that needs to query transcripts across engagements.

## 2026-09-03 · PORT-20 · M-PORT-30 · Transcription's budget is per file, not per engagement

**Context (as it was then):** Every other AI touchpoint on this track spends `engagements.extraction_runs` through `claimRun` (M-PORT-5), and reusing it would have been one line.
**Options weighed:** A) Share `extraction_runs`. B) A `transcript_attempts` counter on the file row, capped at 5.
**Decision:** B. Retry here is a per-file action — a client presses "try again" on *one* recording — so a per-engagement counter is the wrong granularity for the thing being bounded. It also produces a bad failure: a client who spent twenty-five extraction runs sorting their filmography would find their voice note could not be written out, for no reason they could see. The cap lives in the UPDATE's predicate rather than a read-then-write, so two tabs cannot both pass a check that was true when they read it (M-INT-15's shape).
**Consequences:** This feature's spend is bounded at files × 5 rather than at one shared 25. The number of `voice_note` files an engagement may hold is not itself capped — that is the upload path's pre-existing exposure, not this ticket's.
**Revisit trigger:** Evidence of a leaked link spending real money on transcription, which would argue for an engagement-level ceiling *on top of* this one rather than instead of it.

## 2026-09-03 · PORT-20 · M-PORT-31 · The vendor request carries display name, disciplines, and project titles — and that allow-list is the whole of it

**Context (as it was then):** `extract.ts` sends an anonymous blob and nothing else; `come-across.ts` sends named answers from an explicit allow-list. A transcription prompt measurably improves proper nouns, and proper nouns — festival names, film titles, collaborators — are most of what a twenty-minute career memo contains.
**Options weighed:** A) No prompt, keeping the extractor's anonymity rule intact. B) A prompt built from a named, enumerated allow-list.
**Decision:** B, by the ticket's instruction and on the merits. `buildPrompt` reads exactly two step keys and takes three fields between them; email, phone, domain, passwords, account handles, every long-form answer, and the engagement's own id are absent by construction rather than by omission, so widening it requires someone to edit that function. Titles are truncated at twenty. Nothing about the request is logged — errors carry the vendor's HTTP status and nothing else.
**Consequences:** OpenAI receives a person's name and trade alongside their audio. That is a real disclosure and it is why the privacy page names the vendor and describes the flow in plain words rather than only listing it.
**Revisit trigger:** A field being added to the prompt for any reason — which is a decision that belongs here, not in a diff.

## 2026-09-03 · PORT-20 · M-PORT-32 · The service is `voice-transcription.ts`; `transcripts.ts` stays the CRM's

**Context (as it was then):** `server/services/transcripts.ts` already exists and holds call transcripts for the admin CRM.
**Decision:** The intake service is named `voice-transcription.ts`. Two server services one letter apart, both about transcripts, is a mistake somebody makes at one in the morning — and the two have no relationship worth implying.
**Consequences:** None beyond the name.
**Revisit trigger:** The two ever needing to share a shape, at which point the shared piece gets its own home and neither name changes.

## 2026-09-03 · PORT-18 · M-PORT-33 · The ingestion run writes answers, and provenance plus a database-held one-shot rule is what pays for it

**Context (as it was then):** D-PORT-3 has governed every AI touchpoint on this track: nothing a machine produced reaches the answers document until the client has met it. PORT-10 kept it at field granularity with `answers.primer`. Taylor's 2026-09-03 instruction for the ingestion step ends "once that finishes all of the rest of the intake should have the field values initialized with the db values saved from the AI prediction" — which removes the seen-first guarantee for every field at once, and was ratified deliberately after the tradeoff was put to him in writing.
**Options weighed:** A) Keep D-PORT-3 and store a large proposal set the client meets step by step (PORT-10's shape, at ten times the volume — and not what was asked). B) Write the values as answers with no record of which were machine-written. C) Write the values as answers, keep a provenance record of every one with the sentence it rests on, mark each on screen until the client touches it, and keep the quote validator and the criticality map exactly as they are.
**Decision:** C. B is the one that cannot be allowed: a form that silently contains a machine's sentences about a client's business, indistinguishable from their own words, is precisely the failure PORT-10 was built around. C gives Taylor the pre-filled form he asked for and keeps three of the primer's four defences — the server-side quote check, quote-or-nothing on every critical field, and refusal as a first-class output — while replacing the fourth with a mark that is cleared by the client's own edit. The trade is stated in the spec in those words: D-PORT-3's absolute guarantee for a form that arrives mostly answered, bought with the mark and the validator.
**Consequences:** `answers.ingestion` holds the run's status, timestamp, source size and digest, and every field written with its quote — at the top level, beside `primer`, so it is invisible to the intake document's step loop by construction (M-PORT-26's reasoning). The one-shot rule lives in the store's transaction, not the UI: a commit for an engagement that already holds a record returns `already_ran` and writes nothing, so a double press or a browser-side timeout after a server-side success cannot write twice. A run that throws writes nothing and leaves the step runnable, which is the deliberate answer to "does a closed tab count". The client's own words are never overwritten — a text field is written only when blank — and arrays are appended to, never replaced.
**Revisit trigger:** Evidence from a real intake that clients edit past the mark without reading it, which would argue for meeting high-risk fields in place after all.

## 2026-09-03 · PORT-18 · M-PORT-34 · The run fans out over the existing primer and extractor rather than adding a fourth prompt

**Context (as it was then):** The step asks for "all values, including the experience/project". Two graded, live-clean touchpoints already cover both halves: PORT-10's primer for free-text fields with its quote validator, and PORT-6/17's extractor for the six entry arrays.
**Options weighed:** A) One new prompt returning fields and every entry array in one structured response. B) Fan out: the primer with a kind-scoped inventory, plus the extractor in `experience` mode and in the mode this kind's step 5 fills, run in parallel and merged.
**Decision:** B. A is a fourth prompt with a fourth failure surface and no eval, and it would put "fill in the questionnaire" — the reading that produces confident invention — in one instruction. B reuses two contracts that are already graded, degrades per stage rather than per run, and makes wall time the slowest stage rather than the sum. The `people` stage is deliberately absent: the roster sits behind the `justYou` choice, which is a headcount and therefore critical, and writing a roster without answering that choice would put entries behind a closed reveal.
**Consequences:** Three or four model calls per press instead of one, all on `claude-sonnet-5`, claimed as **one** run against the shared per-engagement counter — the counter counts presses. A stage that throws is named in the record's `failed` list and the others still write; only an all-stage failure fails the run. Both prompts gained rules from this slice's live runs (see DEVIATIONS), and both golden sets pass after them.
**Revisit trigger:** A stage whose eval justifies a cheaper model, or a kind whose step 5 needs two entry stages at once.

## 2026-09-03 · PORT-22 · M-PORT-35 · Retired taste keys stay in the schema; `favourites` is derived into picks at read and never rewritten; search results are not stored

**Context (as it was then):** Taylor's taste redesign (`../CODED-INTAKE-TASTE-UX-SCOPE.md`) retires five questions (`darkOrLight`, `stillness`, `density`, `linksWorthALook`, `closeTab`) and replaces `favourites` + `notes` with scored `picks` and `references`. The step schema is also the shape guard on every save (`M-PORT-8`'s one module reads its shape), and `collectUnanswered`, the primer inventory, and the ingestion inventory all derive their field lists from it.
**Options weighed:** Retired keys: A) delete from the schema — every stored answer under them is dropped by the guard on the client's next taste save, silently; B) keep them, mark them, exclude them from the three derived lists via one `RETIRED_TASTE_KEYS` set. Legacy favourites: A) a one-time migration writing `picks` — a write the client never made; B) derive at read (`picksOf`), the `videosOf` pattern from PORT-19, nothing written until the client edits. Search results: A) store the last result set so the document shows what was offered; B) store only what the client kept (a reference with `source: "search"`).
**Decision:** B / B / B. Answers are never lost; the answers document holds only what the client did; the machine's declined offers are not answers.
**Consequences:** Five dead keys live in the schema with a dated comment and one exclusion set; `picksOf` is the one reader of `favourites`; `notes` keeps printing under its old label forever. The document cannot show what the search suggested and was declined.
**Revisit trigger:** Taylor asking what the search offered a client (then store the last result set as a record, not an answer); or a second step retiring keys, at which point the exclusion generalises.

## 2026-09-03 · PORT-24 · M-PORT-36 · The gallery overlay is a purpose-built sibling of `MediaLightbox`; the live frame is sandboxed, `no-referrer`, one at a time, wide viewports and `embed: true` only

**Context (as it was then):** The redesign's See more mode shows a third-party site inside the intake page. The intake URL carries the token. Most personal-site hosts send `X-Frame-Options`, and a blocked frame is undetectable from script (`load` fires regardless).
**Options weighed:** Reuse `components/ui/Overlay` (bubble-phase Escape on `document`, owns `body.overflow`, built for the case-study route) · reuse `MediaLightbox` (server-rendered figures, no live content) · a sibling that borrows the reasoning (portal, capture-phase Escape, saved `body.overflow`, explicit fitted pixel size) and owns its own paging and focus contract. Frame posture: detect framing at runtime (impossible) vs a curation-time `embed` flag (D-PORT-17). Referrer: default (leaks the token to every framed site) vs `referrerpolicy="no-referrer"`.
**Decision:** The sibling. `sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"`, `referrerpolicy="no-referrer"`, one `iframe` in the DOM at a time, mounted only at ≥ 1024px for sites flagged `embed: true`, the capture underneath until `load`. `allow-same-origin` on a cross-origin frame grants the framed site its own origin and nothing on ours.
**Consequences:** A third overlay-shaped component in the repo, each with a stated reason. Embeddability is a human fact recorded per site (PORT-27 prints the header verdict as a hint). No site ever receives the token by Referer.
**Revisit trigger:** A shared modal primitive that can carry all three contracts; or Chromium exposing frame-block detection.

## 2026-09-03 · PORT-25 · M-PORT-37 · Style search is one service, two model calls (server-side web search, then structured parse), the brief posted and everything else read server-side, on the shared run counter

**Context (as it was then):** "Find more like it" asks the model to find real sites that feel like a client's description. Two data-path idioms exist on the track: the extractor posts an anonymous blob; come-across posts nothing and reads an allow-list of answers server-side. The Claude API's `web_search_20260209` is a server tool on the pinned `claude-sonnet-5`; a server-tool turn can end `pause_turn`; whether structured output composes with a server tool in one request is unverified.
**Options weighed:** Source: our own catalogue (the client can already see it) vs the web via the server tool (no outbound request from our functions on client text) vs a third-party search API (a new vendor and a new privacy entry). Input: post the whole step (over-shares) vs post the brief and read the words, never line, and picks server-side (the come-across allow-list, plus the extractor's blob-in for the one field being typed). Shape: one call with structured output over server tools (`[NEEDS VALUE AT BUILD]`) vs two calls (search, then parse). Budget: its own counter vs `claimRun`.
**Decision:** The web via the server tool · brief posted (≤ 2,000 chars), rest read server-side · two calls unless one proves to work, logged either way · `claimRun`. A starting `blocked_domains` list of galleries and template stores, `[PROVISIONAL]`, extended from live runs. `pause_turn` resumed up to three times, then failure — never returned as a result.
**Consequences:** No result is ever an answer until the client presses Add to my sites; nothing identifying leaves; a leaked link spends the same bounded budget whichever AI button it presses. No eval in v1 — the grade is Taylor opening the links.
**Revisit trigger:** Result quality complaints (add an eval); the one-call shape verified (collapse and log); a second consumer of web search on the track (extract a shared `serverSearch` helper).

## 2026-09-03 · PORT-26 · M-PORT-38 · Amends M-PORT-4: the charge law is "no charge the client did not themselves initiate on hosted Checkout at a published price"; one client-reachable single-item Checkout, allow-listed to `showcase_animations`, settles through the ancillary path

**Context (as it was then):** M-PORT-4 ruled that no client-reachable code path can create a charge beyond the checkout the client initiates, and the README hardened it to "no mechanism can charge the client without Taylor initiating it" — written against post-intake extra pages, the balance, and the care plan. Taylor's taste brief (2026-09-03) asks for the motion add-on to be purchasable on the taste step "just like the earlier step, but just for this one item."
**Options weighed:** A) Keep the README line literal and route the client to Taylor for a link (a conversation for a $-priced catalogue row the pay screen already sells unassisted — friction with no protective value). B) Restate the law as the thing M-PORT-4 actually protects — no charge the client did not initiate themselves, on hosted Checkout, at a published price — and add one client-initiated path with an allow-list of one key, settling through `settleAncillaryPurchase`, never `fulfillDeposit`. C) A general "buy any add-on mid-intake" surface (a second pay screen inside the questionnaire; widens the money surface for no asked-for reason).
**Decision:** B. `createAddonCheckout` beside `createExtraPageCheckout`; `MID_INTAKE_ADDONS = ["showcase_animations"]`; metadata `charge_kind: "addon"`; the webhook branch stamps the basket and emails ops; the bought state is read from the settled basket, never from the return URL; refused before Stripe is touched if the row is owned, the build unpaid, or the engagement not showcase. Post-intake extra pages, the balance, and the care plan remain Taylor-initiated exactly as ruled.
**Consequences:** The README's non-negotiable is reworded (logged in `DEVIATIONS.md`); the runbook gains one sentence. `paid_at` keeps its one meaning. Widening the allow-list is a Taylor decision by construction.
**Revisit trigger:** A second add-on Taylor wants sold mid-intake (then the allow-list grows by one key and the notice component takes a product prop — still not a pay screen).

## 2026-09-03 · PORT-21 · M-PORT-35 · A fetched page is a source row like a file; links are fetched by the model's server tool, never by us

**Context (as it was then):** The ingestion step needed to read pages a client lists. Fetching a client-supplied URL from our own server is an SSRF surface with a long tail — allow-lists, redirect chains, DNS rebinding, the cloud metadata endpoint — and every one of those defences is ours to write and keep right.
**Options weighed:** A) `fetch` in a route handler behind a validator. B) The Messages API's server-side `web_fetch_20260209` tool, with `allowed_domains` set to exactly the host the client named. C) No links at all.
**Decision:** B. **There is no outbound request from our infrastructure**, so the SSRF surface does not exist rather than being defended; the tool only fetches URLs already in the conversation, and a one-host allow-list means nothing on a fetched page can talk it into fetching a second. `parseLinks` still refuses localhost, IP literals, single-label hosts, and non-http schemes before anything is called — not as our security boundary, but because a client who typed an internal address has made a mistake worth telling them about. Each fetched page is stored in the private `intake` bucket as a text object with its own `intake_files` row under `ingest_links`, so a page and a file are one shape to the run, the intake document, and the card.
**Consequences:** Ten links per run, one call each, in parallel; a page that 404s or sits behind a login is a returned value with an error code rather than a throw, so one dead link costs one line. The vendor sees the URL and returns the page; nothing about the client travels with it. Links are fetched at the press rather than on blur, because a fetch is an action taken on someone's behalf and belongs to the press they confirmed.
**Revisit trigger:** A client needing a page the tool cannot reach often enough to be worth owning a fetcher for — at which point A returns with its full defence list, not as a shortcut.

## 2026-09-03 · PORT-21 · M-PORT-36 · Office files are unzipped and read here; only PDFs and images leave; `fflate` is a new pinned dependency

**Context (as it was then):** The spec named `mammoth` for DOCX and a hand-written PPTX reader over a zip library. Both formats are zip archives of XML and the run needs only their text, not their styling.
**Options weighed:** A) `mammoth` for DOCX plus a zip library for PPTX — two dependencies, two code paths, and one of them large. B) One zip library and one XML-text reader for both. C) Send every document to the model, including the ones we can parse.
**Decision:** B, on `fflate` — 0.8.3, pinned exact, zero dependencies, and already resolved in the tree as a transitive one. C is the one to name explicitly: sending a DOCX to a model when its exact words are sitting in `word/document.xml` would spend money, add latency, and — worse — replace the document's real text with a *reading* of it, which is the weaker guarantee this ticket exists to bound. So the routing table decides by extension and MIME, and `leavesInfrastructure()` is asserted by the eval: only `pdf` and `image` send bytes anywhere.
**Consequences:** One new direct dependency, flagged for ratification. The reader collects text only from `w:t` and `a:t` leaves — a strip-every-tag approach would read Word field codes as prose, which the eval asserts it does not. Slide numbers are carried from the filename rather than from list position, so a deck missing slide 7 still labels slide 10 correctly. Everything else — Keynote, Pages, video, archives — routes to `unsupported`, which is not a failure: the file is stored, linked in the intake document, and read by Taylor, exactly as before this existed.
**Revisit trigger:** A client format common enough to be worth a parser, or `fflate` going unmaintained.

## 2026-09-03 · PORT-21 · M-PORT-37 · A value's provenance names its source, and says whether a machine did the reading

**Context (as it was then):** PORT-18's validator proves a quote appears in the source text. Once a source can be a *model's transcription* of a PDF, that guarantee weakens in a way the validator cannot see: an invented sentence would be checked against the output that invented it.
**Options weighed:** A) Treat every source alike and say nothing. B) Refuse to fill critical fields from transcribed sources. C) Carry the source on every written value and say "as we read it" where a machine did the reading, with the reading visible and editable before the run.
**Decision:** C. A hides a real difference from the only person who can catch it. B sounds safer and is worse in practice — it would leave a client's own deck unable to fill the fields it plainly answers, pushing them back to retyping, which is the problem the step exists to solve. C tells the truth at every value: the client's paste says "filled in from what you sent", a Word file read here names the file, and a PDF read by a model names the file *and* says it is our reading. The client holds the original and can correct the reading on the card before the run touches it.
**Consequences:** `IngestedField` carries an optional `source`; attribution is by searching each source's own text for the quote rather than by parsing headers out of the combined document, so a header the model quoted cannot misattribute a value. The intake document distinguishes a reading nobody checked from one the client corrected. The eval grades transcription for invention against a fixture whose true text is known — the only place in the system that can.
**Revisit trigger:** Evidence from a real intake that clients skim past the mark on transcribed values, which would argue for B on the critical fields after all.

## 2026-09-04 · PORT-23 · M-PORT-39 · The step footer gained a slot, filled through a client component whose fallback is the markup the shell already rendered

**Context (as it was then):** The taste step's picks count belongs in the footer's right-hand slot, where the next-step line lives (D-PORT-16). The count is client state inside the form; `StepShell` is a server component shared by both tracks, and its footer is rendered above the form in the tree.
**Options weighed:** A) Make `StepShell` a client component so the count can live beside the shell — one step's needs turned into a JavaScript cost on all nineteen. B) Thread a `footerNote` prop from each step page through the shell — the page would have to rebuild the next-step line to know when to override it, duplicating a string the shell already owns. C) A second context on `SaveStateProvider`, published by a hook and read by a `FooterEnd` client component that the shell always renders, taking the next-step line it already built as the fallback.
**Decision:** C, matching the save indicator's existing mechanism exactly — the same problem (form state, footer position, server shell) already had this answer in this file.
**Consequences:** The durable track and every other coded step render through `FooterEnd` with no note published, so the fallback path produces the identical markup; this was exercised (the uncurated taste state renders `Next · Media` through that path). One extra client component boundary appears in every step's footer. A step that publishes a note and unmounts clears it, so a count cannot leak onto the next step.
**Revisit trigger:** A third consumer wanting the slot, which would make a named registry better than a single node; or `StepShell` becoming a client component for some other reason, at which point the indirection can collapse.

## 2026-09-04 · PORT-27 · M-PORT-40 · `playwright` enters as a pinned devDependency, for curation tooling only

**Context (as it was then):** Six taste sets need 12–24 sites each, every capture shot at one exact aspect with its intrinsic dimensions recorded in the content file, and each site's framing behaviour established by hand. Done manually that is forty screenshot sessions per pack, which is the reason a gallery stays uncurated for a month.
**Options weighed:** A) Manual capture at a 1512 × 982 window — no dependency, and the aspect and the dimensions are then a human's job to get right every time, on a contract `yarn verify:tracks` can only check after the fact. B) A headless browser as a devDependency, run from a script that prints an entry. C) A hosted screenshot API — a vendor, a key, and a bill for something that runs on a laptop.
**Decision:** B, ratified by Taylor on 2026-09-04. `playwright` 1.62.1, pinned exact, `devDependencies` only; the browser binary is a per-machine `npx playwright install chromium` and is not in the repo.
**Consequences:** ~18 MiB of package and ~95 MiB of browser binary on a developer machine, and nothing at all in the app — the script is not in the import graph and the build was checked for it. Curation becomes one command plus a tagging decision per site. The script never writes to a set file and never emits `embed: true`, so neither the content nor the one judgement that cannot be automated is taken out of a person's hands.
**Revisit trigger:** Curation finishing for every pack, at which point this is dead weight that can be removed with the sets intact; or Playwright's browser download becoming a problem in CI, which it currently never runs in.

## 2026-09-04 · PORT-28…32 · M-PORT-41 · The example-site gallery is loaded once at each entry rail and passed down as data; `ExampleSet` and every consumer stay synchronous

**Context (as it was then):** Phase 10 moves the taste gallery from six empty TypeScript modules to database rows. Every function that reaches the gallery today is synchronous — `output.ts` exports `collectFlags`, `collectUnconfirmed`, `collectUnanswered`, `tasteShortfall`, and `renderIntakeMarkdown`, and `style-search.ts`'s `keepUsable` and brief builder are sync helpers — because `examplesFor` has always been a map lookup. `scripts/verify-track-cartridge.ts` calls `renderIntakeMarkdown` at lines 846 and 1040 and runs with **no database and no network**, holding the durable document's byte-for-byte guarantee. `output.ts` reaches the gallery four times in one document render, plus once per pick.
**Options weighed:** A) Make `examplesFor` async — cascades `await` through a synchronous document renderer, breaks the no-database oracle, and turns one render into a dozen queries. B) A module-level cache behind the sync signature — a hidden global whose staleness is invisible and whose first call still cannot be synchronous. C) Load the set once at each rail that already awaits, and pass `ExampleSet` down as a required parameter; everything below the rail stays a pure function of what it was handed.
**Decision:** C. The async boundary sits where one already exists. `ExampleSet` — `{ curated, sites }` — is unchanged, so the step, the overlay, the document, and the search consume exactly what they consume today. The parameter is **required, with no default**: a default is how a caller silently gets the absent state and nobody notices the gallery never loaded, which is D-PORT-12's failure mode with a new mechanism. Durable callers pass an explicit `EMPTY_EXAMPLE_SET`.
**Consequences:** Four rails load — the coded step page (which already did), the done page, the submission path, and the admin questions page, which lifts the read out of `QuestionStack` so that server component can keep rendering into its client accordion synchronously. The N+1 a cache would have papered over is solved structurally: four reads per document render become one. `verify:tracks` gets **stronger** — it can now render the taste document against a synthetic curated set with no database, which PORT-22's acceptance criterion 5 could only reach by hand-editing a content file. The exact list of changed signatures is produced by `npx tsc --noEmit`, not hand-written.
**Revisit trigger:** A gallery large enough that one query per request is measurable, or a second track wanting its own set at a different rail.

## 2026-09-04 · PORT-28 · M-PORT-42 · Four tables; the database gets an enum for a value it reasons about and `text` for a value it only stores; cardinality is a CHECK constraint

**Context:** `example_sites` carries seven closed vocabularies — `pack`, `status`, `group`, `ground`, `motion`, `density`, `build` — plus a style-tag list capped at three (PORT-22). The taxonomy is code-owned and the design owner expects to edit it during curation (taste scope §4.3: "adding a tag is a content-type edit").
**Options weighed:** A) A `pgEnum` per vocabulary — seven enums, and every taxonomy edit becomes a migration for a list Vesper owns. B) `text` everywhere — no database opinion at all, including on the values the query planner branches on. C) Enum where the database reasons about the value; `text` validated by Zod against the TS unions where it only stores and returns it; the one cardinality rule as a `CHECK`.
**Decision:** C. `pack` and `status` are enums — they appear in `WHERE` clauses, drive the join, and decide visibility. `group` (column `style_group`, since `group` is reserved), `ground`, `motion`, `density`, `build`, and `styles` are `text`, with `content/intake-examples/types.ts` remaining the single source of truth and `taxonomy.ts`'s `Record<Union, …>` already failing the build when a value has no words. The three-tag ceiling is `check (coalesce(array_length(styles, 1), 0) <= 3)` — a rule about how many, not about which, so it survives every vocabulary edit. `width` and `height` on `example_captures` are `NOT NULL`, which makes PORT-7's dimensions law a database property rather than a TypeScript promise.
**Consequences:** Nullable columns on `example_sites` are exactly the ones a draft legitimately lacks — the database models the draft, the `ExampleSite` domain type models the published site, and the publish gate is the transition. An invalid taxonomy value could reach a row through a write that bypasses the service; the read path validates and **drops-and-reports** rather than rendering it, so the worst case is a missing site, never a broken one — the posture D-PORT-12 already takes. No `position` column: ordering is deferred and would belong on the join, so adding one now is scaffolding an empty seam. No unique constraint on `url` — two rows may legitimately share a host (PORT-22 keeps the path for `duranlevinson.com/hello/musicvideo`), so the paste box normalises and reports rather than constraining.
**Revisit trigger:** An invalid taxonomy value actually reaching a row, which makes `CHECK` constraints worth one migration; or reordering shipping, which adds a column to `example_site_packs`.

## 2026-09-04 · PORT-28 · M-PORT-43 · `example_packs` is fail-closed by construction — a missing row means the gallery is off

**Context:** D-PORT-21 separates the per-pack "show this gallery to clients" switch from per-site publish, so that publishing site one cannot put a one-site gallery in front of a client. The switch has to live somewhere, for at most six packs.
**Options weighed:** A) A boolean on a settings/key-value row — a second shape for a thing that is plainly an entity. B) A table seeded with six rows by `yarn db:seed`, like `products` — correct, and a database that was never seeded has no rows, so the read has to decide what absence means anyway. C) A table with `pack` as the primary key and **no seed**, where a missing row means off.
**Decision:** C. `pack` is the primary key rather than a uuid because this is a fixed enumeration of at most six rows, not an entity stream. The switch upserts on first use. A database that was never seeded, or a pack nobody has touched, cannot show a client anything.
**Consequences:** The admin's six-pack overview lists packs from the TS union, not from the table, so a pack with no row still renders with its honest "Not shown" state. `loadExampleSet` returns `curated: true` only when the switch is on **and** at least one published site came back, and returns no sites otherwise — so `output.ts`'s existing `gallery.curated && gallery.sites.length > 0` test stays correct untouched, and the step's absent state is reached by the path it is reached by today. Fail-closed means the D-PORT-12 law survives a fresh database, a restored backup, and a migration run out of order.
**Revisit trigger:** A per-pack fact that needs to exist before the switch is ever touched (a curation note, an ordering), which would make a seed worth writing.

## 2026-09-04 · PORT-28 · M-PORT-44 · The slug is immutable after first publish, enforced in the service, because the blast radius is already bounded by shipped behaviour

**Context:** `taste.picks[].siteKey` stores a client's answer. D-PORT-11 and M-PORT-35 make it binding that a stored pick is never silently invalidated. The row needs a stable, human-readable identity alongside its uuid.
**Options weighed:** A) Key picks on the uuid — stable by construction, and it makes every stored answer and every debugging session unreadable, and orphans nothing more gracefully than a slug does. B) A slug with a database trigger refusing an update once `first_published_at` is set — the strongest layer, and a trigger for a single-user admin. C) A unique slug, immutable past first publish, enforced by the one service function that owns status transitions and renames, with the editor rendering the field read-only past that point.
**Decision:** C. The reason it is safe to stop at the service rather than reach for the trigger is that the failure is **already bounded by behaviour that shipped in PORT-22**: a pick whose key no longer resolves prints by its stored key with a marker and is never dropped. A slug that somehow moved degrades honestly instead of losing an answer.
**Consequences:** One function owns `draft → published → archived` and the rename refusal; the editor reflects it (Vesper §3.3) rather than deciding it. Archive is a status, never a delete: an archived row leaves the gallery, stays visible in admin, and keeps resolving stored picks — which is why the admin has no delete control at all (D-PORT-23).
**Revisit trigger:** A second writer to these tables — a second admin, an import script, a sync — at which point the trigger is one migration.

## 2026-09-04 · PORT-32 · M-PORT-45 · A public `intake-examples` bucket created by setup SQL; both capture routes converge on it; dimensions are read by an in-house header parse rather than a new dependency

**Context:** Taylor's answer on captures (2026-09-04): an image URL or an upload, landing in Supabase storage. The row cannot exist without real intrinsic pixels (M-PORT-42), so something must measure them. `sharp` is present in `node_modules` only transitively through Next; making it — or `image-size` — a direct dependency amends `specs/README.md`'s "no new dependency beyond `lucide-react`".
**Options weighed (storage):** A) Store the remote URL for the image-URL route — requires `remotePatterns` for arbitrary hosts, which is an open image proxy, and leaves the capture on a host that goes dark when the site it depicts does. B) A folder inside the private `intake` bucket — two access rules in one bucket, which is how a privacy promise gets broken by a later policy edit. C) A separate **public** bucket, both routes copying into it.
**Options weighed (dimensions):** A) `sharp` pinned exact — a native-binary dependency in a serverless function, needing ratification. B) `image-size` — smaller, still a dependency, still needs ratification. C) `lib/media/intrinsic-size.ts`, reading JPEG `SOF`, PNG `IHDR`, and WebP `VP8`/`VP8L`/`VP8X`, with AVIF dropped from accepted inputs.
**Decision:** C and C. The bucket is created by `db/supabase/setup/03-example-sites-rls-and-bucket.sql`, idempotent and role-guarded like `01`, re-asserting `public = true` on conflict so a dashboard click cannot survive the next setup run — the deliberate mirror of `01` re-asserting `public = false` for `intake`. Size limit and MIME allowlist are set in the same insert. Path: `sites/<slug>/<n>-<8 hex>.<ext>`, the random segment ensuring a replaced capture never reuses a URL and is therefore never served stale from the CDN. `remotePatterns` gets one entry whose hostname is **derived from `SUPABASE_URL`**, scoped to `/storage/v1/object/public/intake-examples/**`.
**Consequences:** Taylor creates nothing by hand — Supabase paths are virtual, so the `sites` folder needs no placeholder object, and the bucket comes from the setup file he already runs. `image/avif` leaves the accepted inputs (an amendment to Vesper's §4.2); `next/image` still *serves* AVIF, it just stops being an accepted upload. The header parse is ~70 lines against three well-specified formats, covers everything the pipeline produces (Playwright shoots JPEG), has no deployment surface, and is exercisable by `verify:tracks`, which has neither network nor database — two consumers, which is what puts it in `lib/` rather than beside the service. The image-URL fetch is https-only with `redirect: "error"` (killing the redirect-to-internal class outright), a 10 MB cap enforced while streaming, a content-type check against the decoded header as well as the claimed one, and a short timeout — proportionate for an admin-only path behind `requireAdmin`, and written down so the next person knows which threats it does and does not address.
**Revisit trigger:** A capture format the parser does not read, or a second consumer needing real image processing (a crop, a resize), at which point `sharp` earns its ratification.

## 2026-09-04 · PORT-30 · M-PORT-46 · The six set files are deleted; `content/intake-examples/` keeps the contract and the vocabulary and does not move; `capture:example` narrows to a shooter

**Context:** All six `content/intake-examples/*.ts` sets are empty, so this is a greenfield table with a shape already designed and type-checked — there is no data to migrate. `types.ts` and `taxonomy.ts` are read by the step, the overlay, the document, and the verifier, and the handoff's §5 and the ratified UX scope both keep the taxonomy in code. Separately, Vesper's answer removed server-side shooting, which raises a question the UX scope did not have to answer: where a correctly-shaped 1512 × 982 capture comes from, given the publish gate measures the aspect and an upload is only as good as whatever took the screenshot.
**Options weighed (the folder):** A) Move the contract and vocabulary out of `content/` now that the content is rows — honest naming, and roughly fifteen import sites churned for no behavioural gain. B) Leave the folder, delete the six sets, keep `types.ts` and `taxonomy.ts`, and note in `index.ts` that the sites are rows now.
**Options weighed (the CLI):** A) Delete it — throws away the one tool that guarantees the aspect. B) Have it upload and create a draft row — a third write path to the database, contradicting the two Taylor chose. C) Keep it shooting three JPEGs at 1512 × 982 at 2× into a local scratch directory and printing the paths; Taylor uploads them through the admin.
**Decision:** B and C. `examplesFor`, `exampleByKey`, and `SETS` are deleted from `index.ts`, which keeps its type re-exports and gains `EMPTY_EXAMPLE_SET`. `exampleByKey` is replaced by `siteByKey(set, key)` in `lib/intake/taste-picks.ts`, beside `picksOf` and `hostOf` — pure, no database, safe for the verifier. The CLI loses `--pack`, the entry-printing, and the framing-verdict comment (the frame check replaces it, D-PORT-26); `playwright` stays a pinned devDependency (M-PORT-40) and no browser ever runs on a server.
**Consequences:** An inherited path nobody would choose again still beats two paths — `content/intake-examples/` holding the shape and the words is mildly wrong and costs one header comment, where the rename costs fifteen edits and a week of stale references in specs. The six curation-contract headers are lost, and their guidance (12–24 sites, spread across groups and axes) is not: it becomes the admin's coverage advisories, which is where it can actually be read at the moment it applies.
**Revisit trigger:** A third capture source, or the taxonomy becoming editable data, either of which changes what the folder is for.

## 2026-09-04 · PORT-30 · M-PORT-47 · The taste content rules become one pure validator, called by both the publish gate and `verify:tracks`; the duplication is deliberate

**Context:** `scripts/verify-track-cartridge.ts` §PORT-16 and §PORT-22 walk `examplesFor(f)` over six files to assert the three-tag ceiling, the 1512:982 capture aspect, a parseable `checkedOn`, and every tag resolving to words. It runs with no database, and the handoff names it the cheapest oracle in the repo. With rows, that walk has nothing to walk. Separately, Vesper's D-PORT-25 puts the same rules on the publish control as a gate evaluated before the click.
**Options weighed:** A) Give the verifier a database — it stops being runnable offline and stops being cheap, which is the property that makes it get run. B) Drop the content rules from the verifier and rely on the publish gate — the gate catches Taylor and catches nothing written around him. C) One exported pure validator, `validateExampleSite(site): string[]`, returning plain reasons; the verifier exercises it against fixtures and the gate calls it on a row.
**Decision:** C, in `lib/intake/example-site-rules.ts`. The verifier asserts that a good site passes and that a four-tag site, a wrong-aspect capture, and an unparseable date each fail **with a named reason** — testing the rule rather than the (empty) content, which is a stronger assertion than the one it replaces. The PORT-16 "every pack has its own set" assertion is dropped, having asserted a property of six files that no longer exist; the existing pack-union/`taxonomy.ts` coverage check replaces it.
**Consequences:** Two evaluations of one rule set, asked for deliberately: the gate is the cheap early one at the moment a mistake is still free to fix, and the verifier is the loud backstop for a row written around the admin. One home for the rules means they cannot disagree. The durable-document checks gain a case — the taste document rendered against a synthetic curated set, with no database, which PORT-22 could only reach by hand-editing a content file.
**Revisit trigger:** A rule that genuinely cannot be evaluated without a database (a live link check, a storage-object existence check), which belongs in a separate sweep rather than in this validator.
