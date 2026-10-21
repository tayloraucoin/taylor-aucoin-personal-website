---
epic: VEN
status: approved
---

# VEN — technical notes: verdict, build order, rabbit holes

Technical stage, 2026-10-20. Mason leads. Turner was consulted on the `ForKinds` signature and the two card rows, and Loom on the primer and ingestion inventories; each is labelled where they decide. As one file this runs past the 2,000-token cap, so it is split by section (the SITE precedent):

| File                 | Holds                                                           |
| -------------------- | --------------------------------------------------------------- |
| `verdict.md`         | Appetite verdict, build order, shared-file owners, rabbit holes |
| `placement.md`       | Where every new piece goes, by consumer                         |
| `data-contract.md`   | Keys, shapes, inventory sets, files, where state lives          |
| `doors-and-calls.md` | One-way doors, and the calls routed to Taylor                   |
| `test-shape.md`      | The test type per risk, mapped to the C-VEN criteria            |

Labels: verified (read in a named file, or run on 2026-10-20), judgment (a role's call), estimate.

Pieces are the brief's: P1 sub-type, P2 venture-place questions, P3 event section, P4 image brief and media, P5 spectrums and tags, P6 gallery entry.

## Appetite verdict

**Possible in two build days: yes, at the edge.** (Mason; estimate.)

- P1, the sub-type and the seams every other piece needs: registry, seam, copy overlay, `ForKinds`, inventory signature, fixture module, two guard repairs. 0.4 day.
- P2: place questions 0.5, investor ask 0.45.
- P3: event section 0.35.
- P4: media 0.3.
- P5: spectrums and tags 0.1.
- Total: about 2.1 days, including each ticket's Q2 harden.
- The UX added about 35 `?state=` fixtures that the brief did not cost. Capturing them on the existing SITE-28 harness (rabbit hole 4), instead of building an admin-session capture path, is what keeps them inside the box.
- If P2 runs over, the brief's cut order applies with no new call: Applying first (D-VEN-12), then event rows 17–18, then the extra tags. No builder veto.

## Build order (for Reeve to wave)

- **Wave 1: P1 alone.** Every other piece needs the `raise` and `place` groups, the two-argument `KindTest`, the overlay resolver and the fixture module.
- **Wave 2:** P2-place (About, the piece card, Work's place rows, Applying), P4 media, P5 taste. They touch different steps.
- **Wave 3:** P2-ask and P3 event.
  - Both edit `step-work.tsx` between the asks block and the claims cluster, and both append to `stepWorkSchema`.
  - They can run in parallel only if each stays in its own region (the table below). Otherwise run them in series, ask first.
- **P6** (Taylor's gallery entry, no code) can happen any time after P5, and must land before the first venture-place intake is sent.
- [PROPOSED for the Tickets gate] P2 is a day of work. The half-day rule splits it into two tickets on its two surface files (`venture-place.md`, `investor-ask.md`), which also keeps one surface per ticket.

**Shared files.** Each ticket appends to its own section and never edits another ticket's.

| File                                    | P1                                       | P2-place                                        | P2-ask                                     | P3                           | P4                                               | P5                       |
| --------------------------------------- | ---------------------------------------- | ----------------------------------------------- | ------------------------------------------ | ---------------------------- | ------------------------------------------------ | ------------------------ |
| `lib/intake/showcase-copy.ts`           | overlay mechanism, `ventureType` slot    | `placeVenture` rows, overlays of existing slots | `raise` claims rows, ask overlay           | floor `event`                | floor `imageBrief`, `raise` image rows and decks | overlay `tasteSpectrums` |
| `lib/validators/showcase-intake.ts`     | `about.ventureType`, start input         | about and work place keys, `funded`             | claims keys, ask sub-keys, `raiseProgress` | `EVENT_FIELDS`               | media keys                                       | none                     |
| `lib/intake/showcase-primer-fields.ts`  | signatures, `askedOf`, `pagesOther` drop | its keys in the sets                            | its keys                                   | its keys                     | its keys, `NON_CRITICAL`                         | none                     |
| `lib/intake/showcase-answer-labels.ts`  | `ventureType`                            | its keys                                        | its keys                                   | its keys                     | its keys, file keys                              | none                     |
| `server/services/output.ts`             | Not-answered filter, overlay spectrums   | `funded` labels                                 | ask sub-key labels                         | event gate, derived audience | `## Decks`                                       | none                     |
| `components/intake/venture-fixtures.ts` | module, kind-picker states               | its states                                      | its states                                 | its states                   | its states                                       | its states               |

## Rabbit holes

Each is patched in a sentence or declared out of bounds.

1. **The "Not answered" list floods.**
   - `collectUnanswered` and `answerTally` (`server/services/output.ts:750`, `:802`) list every schema key with no kind filter (verified). About 50 new keys would land on every client's done screen as "we'll cover these on the call".
   - Patched by C10: both read `askedOf`, and event keys are dropped unless `hasEvent = yes`.
2. **Entry extraction derives `funded`.**
   - The piece extractor builds its output from `pieceEntrySchema`'s string fields (`server/services/extract.ts:120`, verified), so a new `funded` field would be filled from a deck.
   - Patched: `extract.ts` drops `funded` beside `NOT_ANSWERS`, with its reason: a funding status is money and the client's to state. The ask sub-keys are safe, because asks are not an extraction mode.
3. **Place forks print without labels.**
   - The document resolves spectrums through `copyPackFor(galleryFlavourOf(answers))` (`output.ts:1165`), which is the plain venture pack.
   - Patched: it reads `copyPackFor(galleryFlavourOf(answers), ventureTypeOf(answers))`.
4. **Captures of an admin route need a session.** `yarn capture` cannot sign in to `/admin/intake/questions`. Patched:
   - The VEN fixtures get a second reader: the SITE-28 harness (`/test-harness/intake?state=<key>`, 404 in production, D-SITE-218).
   - Captures and e2e run there. The admin route keeps `&state=` for Taylor's review (D-VEN-2).
5. **`FileDrop`'s upload states are not reachable by URL.** Tiles are seeded only as `done` (`file-drop.tsx:64`). Patched by C12, a seed used only by fixtures.
6. **The drift guards are outside CI, and one is red.**
   - Neither `yarn verify:tracks` nor `yarn eval:primer --inventory` is in `yarn verify`.
   - The inventory guard fails today on the stale `pagesOther` (run 2026-10-20).
   - Patched by C11.
7. **A promise check is claimed but does not exist.**
   - `document-drop.tsx` says `verify:tracks` asserts the documents promise line. No such check exists in `scripts/verify-track-cartridge.ts` (verified).
   - Patched by C6, which adds the check and corrects the comment.
8. **A stale sub-type on a non-venture kind.** `ventureTypeFor` returns `null` unless the kind is venture, so `place` groups never reach a kind the client switched to (D-VEN-4, D-PORT-11).
9. **About derives the kind live from its own form** (`step-about.tsx:163`). The sub-type is derived the same way, through `ventureTypeFrom(kind, form.values.ventureType)`, never from the page prop alone.
10. **The "Every kind" overview has no venture words** (it renders the generic pack). Raise and place blocks render as `ForKindsStub`, one per block, as `stage` does (D-ADM-11). The full words show under `kind=venture&subtype=place`.
11. **Schema and labels as silent failures.**
    - Zod strips unknown keys on save, so every key is in its step schema before its input ships.
    - `verify:tracks` fails on any schema key without a label, so `decks` and `image_references` get labels too.
12. **Event print order is schema order.** `EVENT_FIELDS` declares the keys in row order (1 to 21).
13. **Out of bounds:**
    - a sub-type control on the preview rail (layout; URL only);
    - per-row reveal logic in "Not answered" (a closed reveal row lists as unanswered, as `registrar` does today);
    - excluding the existing `requiredWording` and `signOff` from ingestion (the C9 reasoning applies, but that is not this epic's to reopen);
    - every other venture sub-type's design.
