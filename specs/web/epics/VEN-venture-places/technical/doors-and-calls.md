---
epic: VEN
status: approved
---

# VEN — technical notes: one-way doors and routed calls

## One-way doors

Matched against `toolkit.json`'s reviewer rows (verified 2026-10-20).

| Door                                                                                                                                            | Path glob                                                                     | Record or ratification                                                                                                                                         | Reviewer                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Schema, migration, enum                                                                                                                         | `**/schema/**`, `**/migrations/**`, `**/*.sql`                                | **Not touched.** Answers are JSONB; `intake_files.field_key` is text; `example_pack` is unchanged (C7); tags are `text[]`. No ticket goes to Q3 on this ground | —                                          |
| Stored answer names: every key, option value and spectrum id becomes storage on its first client save, and a rename orphans answers (M-PORT-35) | `lib/validators/showcase-intake.ts`, pack option values, `tasteSpectrums` ids | **Ratified** by the UX approval on 2026-10-20, as written there. No rename once the first venture-place intake saves                                           | mason (no toolkit row; named by this file) |
| The licensed-inference allowlist (`NON_CRITICAL`)                                                                                               | `lib/intake/showcase-primer-fields.ts`                                        | **Ratified** for `imageBrief` by Taylor, 2026-10-20. Recorded per C8                                                                                           | mason, loom                                |
| What a model may write into a client's answers (ingestion scope)                                                                                | `lib/intake/showcase-primer-fields.ts`, `server/services/extract.ts`          | **Ratified** by Taylor, 2026-10-20: C3, C9; the `funded` exclusion (verdict, rabbit hole 2)                                                                    | mason, loom                                |
| The CI gate (`yarn verify`)                                                                                                                     | `package.json`                                                                | **Ratified** by Taylor, 2026-10-20: C11                                                                                                                        | mason                                      |
| Public API shape                                                                                                                                | `app/api/**`                                                                  | **Not touched.** The upload route is unchanged                                                                                                                 | —                                          |

- **No Warden, confirmed.** There is no new store and no new kind of personal data.
  - Decks and reference images go to the same private bucket, on the same path as `documents`, through short-lived signed links.
  - Speaker names and sign-up policy are answers in the existing document, like the roster.
  - Captures need no admin session, which was the one place a session file would have entered (verdict, rabbit hole 4).

## Calls routed to Taylor

Each call carries one recommendation and the cost of being wrong. C1–C8 are the Technical prompt's calls 3a–3h. C9–C13 surfaced in the code. Everything here is reversible until the first venture-place intake saves, except where a call says otherwise.

**C1. The sub-type mechanism (3a).**

- **Recommendation:** as in `data-contract.md`.
  - The registry gets `VENTURE_TYPES`, with groups on each entry.
  - The kind lookup gains a sibling, `ventureTypeFor(answers)`, and `groupsFor` takes the sub-type as a second argument.
  - Copy gets a `place` overlay that `resolvePack` precomputes.
  - Plain venture and the other five values return the venture pack _by reference_, so "exactly as today" is an identity check, not a comparison.
- **Rejected:** a seventh flavour (`venturePlace`).
  - `ShowcaseFlavour` mirrors the `example_pack` enum (`db/schema/example-pack.ts`), so the next session would add the pack value, and with it a migration.
- **Cost if wrong:** every step would read the pack through a new flavour, and that is a refactor across ten components.

**C2. The `ForKinds` signature and the overview tag (3b; Turner consulted).**

- **Recommendation:**
  - `KindTest = (kind, ventureType) => boolean`.
  - `ForKinds` and `ForKindsStub` take a **required** `ventureType` prop. There are 15 call sites and the change is mechanical; if a site forgets the prop, the type check fails, instead of a block silently going missing.
  - `hasGroup` reads the sub-type. `asks`, `fills` and `not` pass it through.
  - The tag reads `asked of: practice · studio · venture (place)`, computed by `kindsMeeting(test)` over each kind, plus each sub-type that passes where the bare kind fails.
  - The card rows: `AskEntryCard` and `PieceEntryCard` receive `kind`, `ventureType`, and their test as a prop (`hasGroup("raise")`, `hasGroup("place")`), and wrap the new rows in `ForKinds`. A card never compares a kind.
  - The invest rows also need `entry.ask === "invest"`. That is a check on an answer, not a reveal.
- **Turner's ruling:** the tag text above. In the overview, one stub per block, not per field.
- **Cost if wrong:** a prop rename at 15 sites.

**C3. `KIND_GATED` for the `raise` and `place` keys (3c).**

- **Recommendation:**
  - Each gate becomes `(kind, ventureType) => boolean` and reads `groupsFor(kind, ventureType)`.
  - `ingestionFieldsFor(kind, ventureType = null)`. Defaulting to `null` fails closed: it reads as plain venture, so no place key is written.
  - The ingest action passes `ventureTypeOf(answers)` explicitly.
- **Cost if wrong:** ingestion writes a place key into plain venture's answers. C-VEN-place-4 tests for exactly this.

**C4. `?state=` fixtures (3d).**

- **Recommendation:**
  - The data lives in one module, `components/intake/venture-fixtures.ts`. Each fixture names its kind, sub-type, answers per step, files per field key, an optional synthetic gallery, and an optional start-form seed.
  - Every fixture carries `FIXTURE_SENTINEL` and synthetic names.
  - **The admin route** (D-VEN-2) reads `state` through `readPageState` and seeds `QuestionStack`. The fixture's kind and sub-type win over the URL's, so a state is a whole scene.
  - **The harness** renders each key's one step in `StepShell`. This is what captures and e2e use.
  - **SaveIndicator:** the shared rows `save-error`, `offline` and `saved` are already drawn at `/test-harness/intake?state=save` (SITE-28), so VEN adds no SaveIndicator fixture. `empty` is the default view; `partial` is covered by the surface states that open reveals.
  - **FileDrop:** the deck states seed tiles through C12. Their file names are synthetic, for example `commons-deck-v3.pdf`.
- **Cost if wrong:** fixture rework only.

**C5. The intake document (3e).**

- **Recommendation:**
  - **Decks** leave the Files list and print as their own `## Decks` section, just before `## Files`.
  - **The event block:** unless `hasEvent = yes`, every event key, `hasEvent` included, is dropped from the _resolved_ Work answers. The stored answers are untouched.
  - **Event attendees:** when `hasEvent = yes`, the printed audiences gain `event.derivedAudience`. It is never stored.
  - **Labels:** `funded` and the ask sub-keys print through the entry option maps.
- **Cost if wrong:** document-only.

**C6. The promise line (3f).**

- **Recommendation:** `verify:tracks` gains one check that every pack's `documents.help` and the venture pack's decks help end with the promise sentence.
  - There is no existing check to extend, despite the comment in `document-drop.tsx`, which is corrected in the same ticket.
- **Cost if wrong:** none.

**C7. The gallery pack (3g).**

- **Recommendation:** confirm `venture`. No enum migration.
- **The consequence:** once Taylor shows the venture pack, every venture sub-type meets the place set. [ASSUMPTION: no non-place venture intake is pending.]
- **Revisit trigger:** the first non-place venture intake sent while the venture pack is shown.
- **The overrule's cost:** an `ALTER TYPE … ADD VALUE` migration (Postgres enum values do not come out), `galleryFlavourOf` branching, the pack admin, and Q3 on that ticket. About half a day.

**C8. `imageBrief` joins `NON_CRITICAL` (3h, ratified 2026-10-20).**

- **Record it where the allowlist records ratification:** the `NON_CRITICAL` docblock's `[RATIFIED — …]` tag. The tag gains `imageBrief — Taylor, 2026-10-20 (VEN overview)`.
- **Amend:** the module docblock's "deliberately three fields long" becomes four, with the reason: a preference about the site, not a claim about the business.
- **No ledger line:** nobody else cites the allowlist.

**C9. Counsel's wording stays out of the ingestion run (Loom).**

- **Recommendation:** `investorReceives`, `perks` and `renderLabel` go into `EXCLUDED_FIELDS`, with the reason that they are counsel's words, and a sentence from a deck is not counsel's approval.
- **Why:** quote-or-nothing guarantees a _quote_, not _whose_ quote it is. A deck's line could land in "What an investor receives", where the only flag is the document's "not yet confirmed" list.
- **This keeps the UX's criticality** (critical, never proposed) and removes three keys from the run.
- **Cost if declined:** Taylor builds the model page from marketing copy that he believes is counsel's.

**C10. The Not-answered list and the review tally read `askedOf` (patch for rabbit hole 1).**

- **Recommendation:** filter by `askedOf` for every key, and drop event keys unless `hasEvent = yes`.
- **This also changes today's lists:** a portfolio's done screen stops listing `stage`, the claims keys and the tools keys it was never asked.
- **Cost if declined:** about 50 venture and event questions on every client's done screen.

**C11. The drift guards join the gate.**

- **Recommendation:**
  - P1 removes the stale `pagesOther` from `EXCLUDED_FIELDS`.
  - P1 appends `yarn verify:tracks && yarn eval:primer --inventory` to `yarn verify`. Both run without a database or an env file (run 2026-10-20).
- **Cost if declined:** C-VEN-kind-3, place-3, taste-5 and media-5 are proved only when someone remembers to run the scripts.

**C12. A fixture-only tile seed in `FileDrop` (D-VEN-11's "no `FileDrop` change").**

- **Recommendation:** `ExistingFile` gains optional `seedStatus` (`uploading`, `failed`, `too_large`) and `seedProgress`, which `tileFrom` honours.
  - Server rows never carry them.
  - A seeded tile has no `File`, so `send` returns early and nothing uploads.
- **Reading of D-VEN-11:** it ruled out per-file tagging, not this. A seed is the only way `deck-uploading`, `deck-failed` and `deck-too-large` are reachable by URL (C-P08).
- **Alternative:** reach them by interaction and record them as manual. That waives C-P08 for three states.

**C13. Venture's documents help (`media.md` against D-VEN-13).**

- **The conflict:** D-VEN-13 lists two exceptions to "plain venture's strings stay", the claims intro and the name help. `media.md` adds a third: the documents help drops "a deck", because decks get their own drop.
- **Recommendation:** build what `media.md` says, and read D-VEN-13's list as incomplete. Leaving "a deck" in the help, beside a deck drop, asks for the same file twice.
- **Cost if wrong:** one string.

**Taylor's rulings:** every call, C1 to C13, ratified as recommended, 2026-10-20 (Taylor, in the Technical thread: "use your recommendation for each"). Nothing blocks the Tickets stage.
