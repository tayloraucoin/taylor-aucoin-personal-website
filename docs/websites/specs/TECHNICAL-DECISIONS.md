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
