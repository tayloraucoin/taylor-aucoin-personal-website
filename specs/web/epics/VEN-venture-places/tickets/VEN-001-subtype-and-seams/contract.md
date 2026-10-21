---
id: VEN-1
size: small
objective: "a venture founder says what kind of venture it is (about.ventureType, or absent), and later VEN pieces get their seams (groups, two-argument kind test, place overlay, sub-type-aware inventory, fixtures) while every kind renders as today"
slice_type: "registry and seam extension, a 15-site prop change, a fixture reach; risks a stale sub-type leaking place groups, a model writing an unseen key, plain venture drifting"
non_negotiables:
  - "VENTURE_TYPES lives in lib/intake/showcase-kinds.ts only; components, the start form and copy reach it through lib/intake/tracks.ts; no component compares a sub-type (C-VEN-kind-5)"
  - "ventureTypeFor returns null unless kindFor(answers) is venture and about.ventureType is a listed key; the sub-type is derived, never stored twice"
  - "Plain venture and company, fund, cause, launch, other get RESOLVED.venture by reference; no flavour, enum value, column or migration is added (C1, C7)"
  - "ForKinds and ForKindsStub take a required ventureType prop at all 15 sites, so a missed site fails yarn typecheck (C2)"
  - "ingestionFieldsFor(kind, ventureType = null) fails closed; the ingest action passes ventureTypeOf(answers) explicitly (C3)"
  - "Fixtures are synthetic (D-PORT-14), carry FIXTURE_SENTINEL, and are read only via readPageState and the harness, a 404 in production (D-SITE-218)"
devs_call: "Fixture shapes within C4's fields, the harness view's internals, test names, helper names below the seam"
cites:
  - "specs/web/epics/VEN-venture-places/ux/intake/kind-picker.md"
  - "D-VEN-2"
  - "D-VEN-3"
  - "D-VEN-4"
  - "C-VEN-kind-1"
  - "C-VEN-kind-2"
  - "C-VEN-kind-3"
  - "C-VEN-kind-4"
  - "C-VEN-kind-5"
  - "C-VEN-kind-6"
  - "C-VEN-kind-7"
  - "C-VEN-kind-8"
truth_files: "none: the epic's ux/ proposals promote to specs/web/ux/intake/ when VEN ships"
qa: Q2
reviewers: [ vigil ]
focus:
  - "showcase-primer-fields.ts and ingestion.ts: ingestionFieldsFor and askedOf over every kind × (null + six sub-types), failing closed (vigil, Q2)"
operator_review: true
planned_paths:
  - "lib/intake/showcase-kinds.ts"
  - "lib/intake/tracks.ts"
  - "lib/intake/showcase-copy.ts"
  - "lib/intake/showcase-primer-fields.ts"
  - "lib/intake/showcase-answer-labels.ts"
  - "lib/validators/showcase-intake.ts"
  - "server/services/output.ts"
  - "server/services/ingestion.ts"
  - "app/websites/coded/intake/_actions/start.ts"
  - "app/websites/coded/intake/_actions/ingest.ts"
  - "app/websites/coded/intake/_components/**"
  - "app/websites/coded/intake/[token]/[step]/page.tsx"
  - "components/intake/**"
  - "app/test-harness/intake/page.tsx"
  - "app/admin/(protected)/intake/questions/**"
  - "scripts/verify-track-cartridge.ts"
  - "scripts/eval-primer.ts"
  - "package.json"
  - "tests/unit/intake-venture-*.test.ts"
  - "tests/e2e/intake-venture.spec.ts"
depends_on: []
out_of_scope:
  - "Every place, raise, event, media and taste key and string: P2 to P5; this builds the mechanism"
  - "C6 and C12: P4. A preview-rail sub-type control; other sub-types' design (rabbit hole 13)"
criteria:
  - id: C1
    statement: "On the harness, kind-other shows no ventureType group; venture-chosen shows it directly after the siteKind group with place, company, fund, cause, launch, other in that order and none checked; place-chosen has place checked (C-VEN-kind-1)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C2
    statement: "The start action's seed mapping gives about.ventureType = place for venture + place, no key for venture with nothing sent, and no key for any other kind sent place (C-VEN-kind-2)"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "ventureTypeFor is null for an absent value, an unknown value and a non-venture kind holding place, and each listed value on venture; groupsFor(kind, stale) equals groupsFor(kind) for every non-venture kind; venture gains raise, and place adds place only on venture (C-VEN-kind-4, rabbit hole 8)"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "resolvePack(venture, t) is the same reference as resolvePack(venture) for null and the five non-place values; resolvePack(venture, place) is not; every other flavour returns its own pack for any overlay key (C-VEN-kind-3)"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "verify:tracks asserts the C4 identity, overlay keys within VENTURE_TYPES, a pack label per value, and no sub-type comparison under the coded _components/; a fixture holding ventureType === \"place\" fails the scan (C-VEN-kind-3, kind-5)"
    evidence: check
    command: "yarn verify:tracks"
  - id: C6
    statement: "Generated over every kind × (null + six sub-types): ingestionFieldsFor never holds ventureType or any CHOICE_BACKED or REVEAL_GATED key, ingestionFieldsFor(kind) equals ingestionFieldsFor(kind, null), and askedOf(key, kind, t) is KIND_GATED[key]?.(kind, t) ?? true; primerField(ventureType).critical is true"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "collectUnanswered and answerTally on a synthetic portfolio engagement list no stage, claims or tools key it was never asked and keep every asked key; on venture they list ventureType (C10)"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "The inventory guard passes with pagesOther gone from EXCLUDED_FIELDS (C11)"
    evidence: check
    command: "yarn eval:primer --inventory"
  - id: C9
    statement: "package.json's verify script runs yarn verify:tracks and yarn eval:primer --inventory (C11)"
    evidence: test
    command: "yarn test"
  - id: C10
    statement: "On the harness, subtype-changed shows About's picker with company checked and kindChangeLine under it; axe reports no serious or critical violation on the four kind keys"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C11
    statement: "kindsMeeting(hasGroup(place)) tags venture (place), hasGroup(raise) tags venture, and a kind-only test gives today's tags (C-VEN-kind-8)"
    evidence: test
    command: "yarn test"
  - id: C12
    statement: "venture-chosen, place-chosen and subtype-changed captured at 390, 834 and 1440, light and dark, reduced motion (C-VEN-kind-6)"
    evidence: capture
    path: "specs/web/epics/VEN-venture-places/tickets/VEN-001-subtype-and-seams/evidence/states/"
  - id: C13
    statement: "Keyboard only: Tab reaches the sub-type group straight after the kind group, arrows change the choice, focus stays on the kind radio on reveal (C-VEN-kind-7)"
    evidence: manual
    reason: "Focus order and screen-reader reading need a person (Threshold); axe in C10 is the floor"
---

# Contract — VEN-1 subtype-and-seams

## Build notes

Wave 1, alone. Paths: `technical/placement.md`; shared-file sections: P1's column in `technical/verdict.md`.

- **Approach:** `VENTURE_TYPES` = `place, company, fund, cause, launch, other`, each `{ key, groups }`; `place` has `["place"]`, the rest `[]`; venture's own groups gain `raise`. `groupsFor(kind, ventureType = null)` adds sub-type groups only on venture. In `showcase-copy.ts`: `VENTURE_PLACE: Partial<ShowcaseCopyPack>`, `SUBTYPE_OVERLAYS` keyed by plain strings, `resolvePack(flavour, overlay?)` precomputing `{ ...RESOLVED.venture, ...VENTURE_PLACE }`; the venture pack's `ventureType?` slot (label, help, labels by value) joined by `ventureTypeChoices(pack)`. Start form: a `ChoiceGroup` revealed under `siteKind = venture`, hidden input; About: a `ChoiceAnswer` under `f-siteKind`, above `kindChangeLine`, derived live through `ventureTypeFrom(kind, form.values.ventureType)` (rabbit hole 9).
- **Decisions that apply:** D-VEN-2 "`?state=` lives on the admin preview, with fixtures outside production only". D-VEN-3 "Sub-type is a radio revealed under the venture choice; six values; optional". D-VEN-4 "A sub-type change keeps the answers, and they still print". C1–C4, C10, C11 as ratified in `technical/doors-and-calls.md`. Turner: the overview tag reads `asked of: practice · studio · venture (place)`, one `ForKindsStub` per block.
- **Interfaces:** seam `ventureTypeOf`, `ventureTypeFrom`, `ventureTypeChoices`, `showcaseVentureTypes`, `groupsFor(kind, t)`, `copyPackFor(flavour, t)`; `KindTest = (kind, ventureType) => boolean`, `kindsMeeting(test)`; `askedOf(key, kind, t)`, `ingestionFieldsFor(kind, t = null)`, `runIngestion(id, kind, ventureType, source)`; `VEN_STATE_KEYS` `kind-other`, `venture-chosen`, `place-chosen`, `subtype-changed`; admin `&subtype=`, `&state=`.
- **Per path:** Validators: `about.ventureType` (text, bounds only) and the start input. Primer: `ventureType` in `CHOICE_BACKED` and `KIND_GATED` raise; drop `pagesOther`. Labels: `ventureType`. `output.ts`: C10 filter via `askedOf`, spectrums through `copyPackFor(galleryFlavourOf(answers), ventureTypeOf(answers))` (rabbit hole 3). `for-kinds.tsx`: the prop, tags, `kindsMeeting`. Start form: a fixture `seed` prop. Step page: passes `ventureType`. `components/intake/venture-fixtures.ts` (C4's fields) and `venture-state-view.tsx` (one step in `StepShell`); keys appended in `intake-fixtures.tsx`. Admin page and `question-stack.tsx` seed from `state` (the fixture's kind and sub-type win); `preview-controls`, `preview-link`, `to-markdown` carry `subtype`; `pack-diff` adds the overlay column. `verify-track-cartridge.ts`: C5. `package.json`: append `yarn verify:tracks && yarn eval:primer --inventory` to `verify`. `eval-primer.ts`: new signature.
- **Gotchas:** Zod strips unknown keys, so `ventureType` is in `stepAboutSchema` before the input ships; `verify:tracks` fails on a key without a label. `SHOWCASE_COPY_SLOTS` is `Object.keys(GENERIC)`: `ventureType` is a venture-pack extra, not a floor slot. Strings: `[COPY — pending Taylor]`. Commit as `VEN-1: <outcome>`. Capture: `yarn capture --route /test-harness/intake --keys venture-chosen,place-chosen,subtype-changed --out <C12's path>`. Operator review: Taylor opens `/admin/intake/questions?track=showcase&kind=venture&subtype=place` at harden.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks `place` leaking to a stale kind and a `ForKinds` default papering over a missed site.
