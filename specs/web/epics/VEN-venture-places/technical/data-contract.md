---
epic: VEN
status: approved
---

# VEN — technical notes: data contract

## Where state lives

- **Answers: server.** One JSONB document on the engagement (`db/schema/engagements.ts:29,51`), written by the existing autosave (`saveStep`, `saveStepAnswers`).
  - Every key below is an optional `text` field in its step schema unless marked otherwise.
  - Radios store their option value as text, with bounds only (the D-PORT-8 pattern). Option lists live in the packs, and values never change once shipped.
- **Files: server.** `intake_files` rows, with `field_key` as text (`db/schema/intake-files.ts:43`), go to the private bucket through the unchanged upload route.
- **Sub-type: derived, never stored twice.**
  - The step page resolves `ventureTypeOf(answers)`.
  - About resolves `ventureTypeFrom(kind, form.values.ventureType)` live.
  - The start form holds it in component state until submit.
- **URL.**
  - Admin `/admin/intake/questions?track=showcase&kind=<kind>&subtype=<ventureType>&state=<key>`. `subtype` is a review view, as `kind` is. `state` is read only through `readPageState`, so it is `default` in production.
  - Harness `/test-harness/intake?state=<key>`, which is a 404 in production.
- **No DB column, no migration, no enum value.** C7 confirms the gallery pack. The six tags are `text[]`.

## The sub-type

`VENTURE_TYPES`, in this order: `place`, `company`, `fund`, `cause`, `launch`, `other`.

- Each entry is `{ key, groups }`. `place` has `groups: ["place"]`; the rest have `[]`.
- Venture's own groups gain `raise`.
- `ventureTypeFor(answers)` returns `null` unless `kindFor(answers) === "venture"` and `about.ventureType` is a listed key. An unknown value reads as absent, as `kindFor` already treats an unknown kind.
- `groupsFor(kind, ventureType = null)` is the kind's groups, plus the sub-type's groups only when the kind is venture.

## Keys by step

Tags in brackets: `R` = KIND_GATED `raise` (all venture), `P` = KIND_GATED `place`, `C` = `CHOICE_BACKED`, `G` = `REVEAL_GATED`. Every text key is critical (quote-or-nothing) unless marked otherwise.

- **about**
  - `ventureType` [R C]
  - `propertyStatus` [P C]
  - `propertyTitle` [P]
  - `locationPrecision` [P C]
  - `locationWhy` [P]
  - `visitsNow` [P]
- **audience**
  - No new key.
  - `audiences` gains the values `guests`, `coOwners`, `facilitators`.
  - "Event attendees" is never stored (D-VEN-14).
- **work: place**
  - `placeSize`, `permits`, `applyWho`, `applyAfter`, `applyFee`, `applyQuestions` [P]
- **work: claims rows**
  - `issuerEntity` [R]
  - `investorReceives` [P]
  - `coOwnerDiffers` [P C]
  - `coOwnerLines` [P G]
  - `jurisdictions` [R]
  - `returnWording` [R C]
  - `returnWordingQuote` [R G]
  - `perks` [P]
- **work: `EVENT_FIELDS`**
  - Declared as one object spread into `stepWorkSchema`, in row order; `EVENT_FIELD_KEYS = Object.keys(EVENT_FIELDS)`.
  - `hasEvent` [C].
  - `eventType` through `eventOthers` are all [G].
  - Of those, the radios are also [C]: `eventType`, `eventFormat`, `eventPlaceConfirmed`, `eventWhenFull`, `eventPricing`, `eventRegistry`, `eventConsent`, `eventInvestment`.
  - `eventInvestment` is also [R].
  - Criticality follows `event-section.md`. The rows it leaves unmarked (1–3, 8, 14, 15, 18, 20, 21) still stay out of `NON_CRITICAL`, as it says, which costs nothing: every event key is choice-backed or reveal-gated, so it is never written.
- **work: entries**
  - `pieceEntrySchema` gains `funded`.
  - `askEntrySchema` gains `currency`, `sameMinimum`, `eligibility`.
  - All of these are outside the inventory. `funded` is also dropped from extraction (verdict, rabbit hole 2).
  - `asks[].ask` gains `reserve`, `hire`, `register`.
- **media**
  - `photosOfPlace` [P]
  - `rendersAndAi`, `renderLabel`, `stockImages`, `imageCredits` [R]
  - `imageBrief`: every kind, **non-critical** (C8)
- **site**
  - `raiseProgress` [P C G]
  - `pages` gains `stays`, `events`. `offering` is relabelled only.
- **taste**
  - No schema change.
  - Forks store under `taste.spectrums` with the ids `placeOrModel`, `nowOrLater`, `programmeOrPlace`, `whoseVoice`, `whichDoor`, valued 1.0 to 7.0.
- **start form**
  - `startShowcaseIntakeInput.ventureType: z.string().trim().optional()`.
  - The action seeds `about.ventureType` only when `siteKind = venture` and a value was sent (C-VEN-kind-2).

**Files.** `decks` and `image_references` are rows with `step` 8 (media) and `entry_key` null, stored at `{engagementId}/{fieldKey}/{uuid}{ext}`.

- C-VEN-media-4's "under `media/decks`" is read as step `media` and field `decks`, not as a storage path.
- Both keys fit the route's 40-character bound. Neither file key is in the inventory.

## Inventory, in one view (Loom)

- **`CHOICE_BACKED`** gains 15 keys: `ventureType`, `propertyStatus`, `locationPrecision`, `coOwnerDiffers`, `returnWording`, `raiseProgress`, `hasEvent`, plus the 8 event radios listed above.
- **`REVEAL_GATED`** gains 23 keys: `coOwnerLines`, `returnWordingQuote`, `raiseProgress`, and the 20 event rows from `eventType` on.
- **`KIND_GATED` `raise`** gains 10 keys: `ventureType`, `issuerEntity`, `jurisdictions`, `returnWording`, `returnWordingQuote`, `rendersAndAi`, `renderLabel`, `stockImages`, `imageCredits`, `eventInvestment`.
- **`KIND_GATED` `place`** gains 17 keys:
  - About: `propertyStatus`, `propertyTitle`, `locationPrecision`, `locationWhy`, `visitsNow`.
  - Work: `placeSize`, `permits`, the four `apply*` keys, `investorReceives`, `coOwnerDiffers`, `coOwnerLines`, `perks`.
  - Site and Media: `raiseProgress`, `photosOfPlace`.
- **`NON_CRITICAL`** gains `imageBrief`.
- **What the ingestion run may then write, for a place client:**
  - `propertyTitle`, `locationWhy`, `visitsNow`, `placeSize`, `permits`
  - the four `apply*` keys
  - `issuerEntity`, `jurisdictions`
  - the five image-fact keys
  - `imageBrief`
  - `investorReceives`, `perks`
- Every one of those is quote-or-nothing except `imageBrief`. C9 recommends taking `investorReceives`, `perks` and `renderLabel` off that list.
- Plain venture loses every [P] key. Non-venture kinds also lose every [R] key. No kind gets an event key.
- **`askedOf(key, kind, ventureType)`** is `KIND_GATED[key]?.(kind, ventureType) ?? true`. It is the one predicate used by ingestion and by the document's Not-answered list (C10).

## Copy slots (`lib/intake/showcase-copy.ts`, D-VEN-24)

- **Floor (`GENERIC`), required in every pack:**
  - `event`: rows 1–21, their options, row 19's follow-up line, and `derivedAudience` ("Event attendees", the document's word).
  - `imageBrief`: the label, help, and the `references` drop.
- **Venture pack:**
  - `ventureType?`: label, help, and labels keyed by value. `ventureTypeChoices(pack)` joins them to `VENTURE_TYPES`, so values have one home and labels another (C-VEN-kind-5).
  - `raise?`: rows 2, 6, 8, 9; the three invest rows; the image-facts group and its four all-venture questions; decks.
  - Overrides of `claims` (the all-venture intro), `nameHelp`, `documents` (C13).
  - Additive suffix `imageBriefHelpSuffix`.
- **`place` overlay (`VENTURE_PLACE: Partial<ShowcaseCopyPack>`):**
  - Overlay-only slot `placeVenture?`, holding: the About rows, `funded`, `placeSize`, `permits`, Applying, rows 3–5 and 10, `raiseProgress`, `photosOfPlace`.
  - Whole-slot overrides, built from the floor with spreads as `ingestion` is today: `claims` (place intro, `signOff` and `requiredWording` help), `audiences`, `ask` (askField options), `pages`, `representation`.
  - `tasteSpectrums` (the five forks).
  - Additive suffixes `rosterLeadHelpSuffix` and `videosHelpSuffix`.
- **Resolution:**
  - `resolvePack("venture", "place")` returns a precomputed `{ ...RESOLVED.venture, ...VENTURE_PLACE }`.
  - Any other overlay key, or none, returns `RESOLVED[flavour]` itself, the same reference.
  - All strings are `[COPY — pending Taylor]`. Fixture and example names are synthetic (D-PORT-14).
