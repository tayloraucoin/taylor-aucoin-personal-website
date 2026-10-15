# Portfolio intake track — Technology scope (architecture pass)

Author: Mason. Status: **Draft for Taylor's ratification** — the forks that need his answer are §10; everything else is decided here or provisional-with-label.

**Document authority.** Product behavior → [`PORTFOLIO-INTAKE-UX-SCOPE.md`](PORTFOLIO-INTAKE-UX-SCOPE.md) (Vesper; its §11 D-PORT log once ratified) above [`portfolio-intake-questions-v2.md`](portfolio-intake-questions-v2.md) for presentation, with the v2 doc binding on **what is asked and every line of client-facing copy — verbatim, never paraphrased**. Scoping-thread decisions → [`portfolio-intake-handoff-prompt.md`](portfolio-intake-handoff-prompt.md). Existing-machine law → [`../intake/TECH-SCOPE.md`](../intake/TECH-SCOPE.md) and `docs/intake/specs/TECHNICAL-DECISIONS.md` (M-INT-1…23), which this file extends rather than repeats. Site law → repo `CLAUDE.md`. New decisions with real alternatives are recorded as `M-PORT-n` in [`specs/TECHNICAL-DECISIONS.md`](specs/TECHNICAL-DECISIONS.md); this file states the resulting shape.

---

## 1. Problem frame

- **Who imports this?** The same single app. The portfolio track is a **parameterization of the existing intake machine, not a fork** (handoff decision 1). What varies per track: step registry contents, validators, answer labels, example-site content, microcopy. What must not fork: persistence, autosave, upload, payment, token security, completion. The Durable track's behavior ships byte-for-byte unchanged — its routes, its step registry contents, its catalogue rows, its emails.
- **Which rail?** Unchanged from M-INT-2: server actions for client-initiated writes, route handlers for webhook/cron/upload issuance. The one new compute call (extraction) is a server action calling a service — it is a client-initiated request with no third-party-inbound or streaming character.
- **One-way doors in this build:** the migration (three columns, one enum), the new catalogue rows and their Stripe Prices, the promo-mechanism extension, and the track-key vocabulary that ends up inside stored JSONB and `products.track`. Those get the scrutiny. Everything rendering a step is reversible.
- **Data sensitivity:** same class as the existing track (business-confidential, voice recordings) **plus** pasted career blobs sent to a third-party model. The blob is client-supplied content bound for Anthropic's API — it never touches logs, and the extraction service is the only place it transits.
- **Worst moments:** unchanged two from INT (paid-but-broken form; webhook failure), plus one new: **an extraction failure that eats the paste.** The blob field autosaves like any field before extraction runs; the failure contract is that the paste is never lost.

## 2. Stack additions

One new dependency: **`@anthropic-ai/sdk`** (exact version pinned at PORT-6 and recorded at closure) for the extraction endpoint. Model: **`claude-sonnet-5`** — pinned by the handoff, not a builder choice. One new env var: `ANTHROPIC_API_KEY`, read through `lib/env.ts` only, added to the static-literal switch (`M-INT-22`: env is collapsed at build time in `next.config.ts`; a dynamic lookup is invisible to it). Untier'd — one key serves staging and production `[PROVISIONAL — cheap to split later]`.

Nothing else. No new datastore, no queue, no image processing. Example-site screenshots are static assets.

## 3. Track cartridge (M-PORT-1) — the shape of the parameterization

**Internal track key: `showcase`.** "Portfolio" already means tayloraucoin.com itself in this codebase (`legalRoutes`, `content/legal.ts` comments — handoff decision 2); public URLs may say `portfolio`, internal identifiers never do.

```
lib/types/intake.ts        # gains: INTAKE_TRACK_KEYS = ["durable","showcase"], IntakeTrackKey,
                           #   SHOWCASE_STEP_KEYS + ShowcaseStepKey (about · audience · experience ·
                           #   work · taste · words · media · site · access); existing keys untouched
lib/intake/tracks.ts       # NEW — the one home for track identity: per-track step registry,
                           #   step-key schema, label map, and copy-flavour resolution.
                           #   lib/intake/steps.ts keeps exporting the durable registry unchanged;
                           #   tracks.ts maps track → registry so every consumer resolves through one seam.
lib/validators/showcase-intake.ts   # per-step Zod schemas, all-optional, mirroring lib/validators/intake.ts
lib/intake/showcase-answer-labels.ts # flat key→label map for the output document
content/intake-examples/   # film.ts · generic.ts — typed ExampleSite[], stub sets first (handoff decision 7)
```

Consumers parameterize by reading the engagement row's `track`: the `[token]` state router, `saveStepAnswers` (schema lookup), the resume list, the skipped-items inventory, and `renderIntakeMarkdown` (registry + labels). Each currently imports `INTAKE_STEPS` / `STEP_SCHEMAS` directly; PORT-1 moves them to the `tracks.ts` seam. **Step identity keeps exactly one home per track, and one resolver across tracks.**

Copy flavour (Vesper D-PORT-5): resolved from the start form's discipline answer, stored in the answers document; `tracks.ts` owns `resolveFlavour(answers)` — exactly one checked discipline with a shipped pack → that pack, else generic. Film ships first.

## 4. Routes (M-PORT-2)

**Amended 2026-08-26 by M-PORT-7.** A parallel thread's `PORTFOLIO-MARKETING-EXECUTION-SCOPE.md` retired "portfolio" as a public slug (its R-1: naming is by deliverable) and built the coded-track sales page at `/websites/coded`, with the old `/websites` sales page moved to `/websites/platform` and `/websites` now a chooser. The showcase intake nests under its sales page; the redirect stub this section originally specified is dropped, because the sales page now does that job properly.

```
/websites/coded                        → the coded-track sales page (built by the marketing thread, not here)
/websites/coded/intake                 → PUBLIC start form for the showcase track (v2 doc's field set)
/websites/coded/intake/[token]         → state-routed entry (pay | welcome | resume | done)
/websites/coded/intake/[token]/[step]
/websites/coded/intake/[token]/done
```

Nested under its sales page for the same reason the durable tree is nested under `/websites` (WEBSITES-PAGE-SPEC §7: a trimmed URL lands on an explainer, never a 404). The durable intake stays exactly where it is — that thread's R-3 and this one's byte-for-byte law agree. The slug `coded` is `[PROPOSED — Taylor ratifies]` in the marketing scope §3 and is already built into the working tree; renaming it later is one constant in `lib/routes.ts` plus one folder. The pages are **thin wrappers over shared, track-parameterized components** extracted from the existing tree; the existing `/websites/intake` files are not modified beyond what extraction of shared pieces requires, and the Durable surface must render byte-identically after it (acceptance-tested in PORT-1/2). `lib/routes.ts` gains `showcaseIntakeRoutes` (the literal lives only there) and `isIntakePath` covers both prefixes so chrome and analytics stand down (M-INT-10/13 law).

## 5. Data model — one migration (M-PORT-3)

Three additions, one migration, authored in PORT-1, **Taylor reviews and runs it** (standing rule):

- `engagements.track` — `pgEnum("intake_track", ["durable", "showcase"])`, notNull, default `'durable'`. Every existing row is durable by construction.
- `products.track` — same enum, notNull, default `'durable'`. `listCheckoutAddons`, `getDepositProduct` and friends gain a track argument; the Durable pay screen's queries are unchanged in result by the default.
- `intake_files.entryKey` — text, nullable. Associates an upload with one repeatable-block entry (per-project images). Entries carry a short client-generated key (8–12 chars, nanoid-style) stored in the answers document; `fieldKey` stays the field's name (`project_images`), `entryKey` scopes it. Null for every non-entry upload.
- `engagements.extractionRuns` — integer, notNull, default 0. The extraction rate-limit counter (§8).

No new tables. Answers stay one JSONB document (binding law: adding a question never requires a migration); favourites, notes, ranks, project entries, and discipline flags are all answer content. `businessName` (notNull) carries the client's display name on showcase engagements — no new column for a fact that fits an existing one.

## 6. Payment (M-PORT-4)

**Checkout stays `mode: "payment"`, hosted, webhook-fulfilled — the existing machine.** New catalogue rows (seeded in PORT-3; `yarn stripe:catalogue --apply` mints the Prices):

| key | kind | priceCents | track | offeredAtCheckout | Note |
|---|---|---|---|---|---|
| `showcase_deposit` | build | 100000 | showcase | false | Half now |
| `showcase_balance` | build | 100000 | showcase | false | Invoiced before launch |
| `showcase_full` | build | 190000 | showcase | false | Pay-in-full **as its own product row** (handoff decision 4 — not a runtime discount; simpler and auditable) |
| `showcase_admin_panel` | addon | 50000 | showcase | `[PROPOSED]` | Row seeded inactive until Taylor signs off |
| `showcase_logo` | addon | 25000 | showcase | true | Own row, not `logo_refresh` — the v2 copy differs and `name`/`description` render on the pay screen |
| `showcase_booking` | addon | 25000 | showcase | true | Same reasoning |
| `showcase_care_plan` | care_plan | 10000 | showcase | false | `[PROPOSED]` — **never charged at checkout in v1** (below) |

- **The plan choice selects the build line:** half → `showcase_deposit`, full → `showcase_full`. One line item either way; add-ons stack on top exactly as the Durable P0 does.
- **Fulfillment fix:** `fulfillDeposit` currently finds the basket's build line by `products.key === "deposit"` — a hardcoded key the new track breaks. PORT-3 generalizes the lookup to `kind === "build"` within the unpaid basket (one build line per basket, both tracks). The Durable path's behavior is unchanged; the settlement UPDATE's idempotency shape (M-INT-15) is untouched.
- **Care plan is a subscription and does not ride the payment-mode session.** Mixing a recurring price into the deposit session means `mode: "subscription"`, a Stripe customer object, and a billing-start question that is itself open (Vesper §10.4). Recommendation, `[PROVISIONAL — Taylor]`: v1 records the care-plan *selection* on the engagement (answer content), charges nothing for it at checkout, and Taylor activates the subscription at launch via a Stripe payment link or the Dashboard. The pay screen renders its row per the UX scope with the "starts at launch" truth once ruled. Cost of being wrong: one later slice adds subscription-mode checkout; nothing here forecloses it.
- **Kryshan's $1,600 cannot ride the promo mechanism as it exists.** The promo law (D-INT-12, `lib/intake/promo.ts`) grants $0 catalogue items and **never discounts** — there is no lawful path from $2,000 to $1,600 through it. Extension, `[NEEDS DECISION — Taylor]` with a recommended default: the promo map gains an optional `overridesBuildKey`, letting a code **substitute the build line with a different catalogue row** — still additive, still a seeded row with a real Stripe Price, still auditable (the arithmetic never changes, the row does). Seed `showcase_deposit_1600` ($800) / `showcase_full_1600` ($1,520 — 5% off $1,600) `[values NEED DECISION: how $1,600 splits and whether pay-in-full applies]`. The alternative — a Stripe coupon — puts a second pricing mechanism beside the catalogue and breaks "everything charged is a row."
- **Extra pages:** `extra_page` ($150 — note the existing row is quantity-shaped and never `offeredAtCheckout`, which already matches the confirm-before-charge promise). The post-intake charge path is PORT-9: **Taylor-initiated** scoped checkout re-entry (CLI/admin mints a session for `extra_page × N` against the engagement). Structural enforcement of confirm-before-charge: the client has no surface that can create the session — auto-charging is impossible by construction, not by copy.

## 7. Uploads

The existing path verbatim (M-INT-18: browser → storage direct, seam-gated issuance, 50MB size-only refusal). Extensions: `uploadIssueInput` gains optional `entryKey` (validated shape only); `intake_files` rows carry it; the step-key enum accepts showcase keys. No cap on project count or images-per-project — the law "size is the only thing that may reject a file, never format, never count" is restated in every upload-touching ticket.

## 8. Extraction — "Sort this for me" (M-PORT-5)

- **Placement:** `server/services/extract.ts` (the logic, once) + a thin server action under the showcase `[token]/_actions/`. Steps 3 and 4 share the one service with a `mode: "experience" | "projects"` argument — one prompt file per mode, one schema per mode.
- **Contract:** blob in → validated entries out, **client-side prefill only** — the service and the action write nothing. The blob field autosaves like any long-text field, so the paste survives any failure.
- **Correction, 2026-08-26 (verified, not assumed):** this section and D-PORT-3 both described the commit as happening on "field blur or step change". That is not what the autosave engine does — it also debounce-saves on change, so extracted entries reach the database roughly a second after they render, without the client blurring anything. The seen-first property still holds in the sense the copy promises (entries are on screen, editable, and the after-line invites correction before anything else happens), and the stronger law is better served: a client who closes the tab straight after extracting keeps their entries instead of losing a run's work. **But the mechanism is not the one that was specified, and it touches a client-facing promise — routed to Taylor (§10).**
- **API shape:** `@anthropic-ai/sdk`, `model: "claude-sonnet-5"`, structured output via `output_config.format` (the current API — the deprecated `output_format` parameter and assistant-prefill tricks are both off the table; prefill returns 400 on this model family). The Zod schemas in `lib/validators/showcase-intake.ts` are the single shape authority; the JSON schema sent to the API is derived from them, not hand-written twice.
- **Rate limit:** `engagements.extractionRuns` incremented in the service; cap **25 runs per engagement** `[PROVISIONAL — generous for one intake, bounds the spend]`. Over-cap returns the calm rate-limited state, never an error page. Cost envelope at Sonnet 5 pricing: a large blob run is well under a cent; the cap bounds abuse, not usage.
- **Privacy:** the blob is answer content. It is never logged, never in error messages, never in analytics (there are none on this surface). The Anthropic call carries the blob and nothing else about the engagement — no name, no email, no token.
- **Failure contract:** timeout/API error/refusal → typed failure to the client; UI keeps the blob and offers retry (UX scope §6.1). The service throws typed errors; the action maps them to the three client states (failed / rate-limited / ok).

## 9. Output, emails, done

`renderIntakeMarkdown` and the completion/reminder email bodies parameterize by track through the `tracks.ts` seam (registry + label map + a heading string or two). The email machinery — `email_events` idempotency, three-reminder ceiling, cron sweep — is consumed unchanged. Portfolio-variant copy slots are enumerated in PORT-8 and quote the v2 doc where the deliverable is named ("You'll see the first look at your site within three days").

## 10. Open items (routed)

**Ruled 2026-08-26 (Taylor) — M-PORT-6.** The promo build-line override is the mechanism for Kryshan's $1,600 (amounts `[PROVISIONAL]`: $800 half / $1,520 full). The care plan is not sold at checkout at all in v1 — §6's subscription question is closed and no recurring code ships. The admin panel is a live $500 add-on. Still open:

| Item | Owner | Blocks |
|---|---|---|
| Refund sentence for this track (Vesper §10.1 — D-INT-10 covered $600, not $1,900) | Taylor | First real charge |
| **Extracted entries autosave ~1s after appearing, not on the client's next deliberate action** (M-PORT-16). The copy says "nothing saves as fact until you've seen it" and they are on screen when it happens — but an unread entry can reach the intake document. Options: leave it (a closed tab keeps the work), or have PORT-8 flag entries that were extracted and never edited | Taylor | Nothing — shipped as-is and logged |
| The $1,600 split, if $800 / $1,520 is not what he meant | Taylor | Nothing — seeded as a labeled default; changing it is a seed edit |
| Terms coverage: does `/websites/terms` bind this track or need a portfolio section | Taylor | Pay-screen acceptance line accuracy |
| Five included pages + coming-soon category rows | Taylor | Step-8 note copy; start-form rows |
| Example-set curation (12–24 real sites per discipline + captures) | Taylor | Nothing — PORT-7 builds against a labeled stub set |

Everything else is decided above, provisional-with-label, or the builder's call as marked in tickets. Verification for every PORT ticket: `yarn build` · `npx tsc --noEmit` · `yarn lint` (this repo is Yarn 4 — the INT-era `npm run` strings are stale; never npm), plus the happy path against local Postgres/Supabase where the slice touches data, **plus the Durable-track regression check wherever a shared file was touched**.
