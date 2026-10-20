---
id: VEN-2
size: small
objective: "a venture-place founder tells us what the place is today (title, location, visits, size, permits, each phase's funding, how people apply), and the document prints it, while plain venture and every other kind see none of it"
slice_type: "new critical text and radio keys behind the place group, a piece-card row and a copy overlay on existing slots; risks a place key shown or ingested off place, a renamed option value orphaning answers, and a funding status written by a model"
non_negotiables:
  - "Every key here is registered once: in KIND_GATED on group place in lib/intake/showcase-primer-fields.ts, radios also in CHOICE_BACKED, labels in showcase-answer-labels.ts; a component renders it through ForKinds and never compares a kind or sub-type (C-VEN-place-3)"
  - "Every text key is critical, quote-or-nothing; pieces[].funded is an entry key outside the inventory and is dropped from piece extraction (rabbit hole 2)"
  - "Option values offering, residents, members never change; the overlay changes labels only, and only under resolvePack(venture, place) (C-VEN-place-5)"
  - "Critical radios end Not sure yet and nothing is preselected (D-VEN-10)"
  - "Strings go in the place overlay's placeVenture slot and whole-slot overrides built from the floor with spreads; each is [COPY — pending Taylor], names synthetic (D-PORT-14)"
  - "No reveal, no new primitive, no new primary action"
devs_call: "Fixture text, the piece card's internal layout of the new row, test names, the order of edits within the ticket's own sections"
cites:
  - "specs/web/epics/VEN-venture-places/ux/intake/venture-place.md"
  - "D-VEN-6"
  - "D-VEN-13"
  - "C-VEN-place-1"
  - "C-VEN-place-2"
  - "C-VEN-place-3"
  - "C-VEN-place-4"
  - "C-VEN-place-5"
  - "C-VEN-place-6"
  - "C-VEN-place-7"
  - "C-VEN-place-8"
truth_files: "none: the epic's ux/ proposals promote to specs/web/ux/intake/ when VEN ships"
qa: Q2
reviewers: [ vigil ]
focus:
  - "the place keys: each registered once, in group place and the primer maps, never inline in a component; none reaches plain venture's form or ingestion (vigil, Q2)"
  - "server/services/extract.ts: funded never derived from a source (vigil, Q2)"
operator_review: false
planned_paths:
  - "lib/intake/showcase-copy.ts"
  - "lib/validators/showcase-intake.ts"
  - "lib/intake/showcase-primer-fields.ts"
  - "lib/intake/showcase-answer-labels.ts"
  - "server/services/output.ts"
  - "server/services/extract.ts"
  - "app/websites/coded/intake/_components/steps/step-about.tsx"
  - "app/websites/coded/intake/_components/steps/step-audience.tsx"
  - "app/websites/coded/intake/_components/steps/step-work.tsx"
  - "app/websites/coded/intake/_components/piece-entry.tsx"
  - "components/intake/venture-fixtures.ts"
  - "tests/unit/intake-venture-*.test.ts"
  - "tests/e2e/intake-venture.spec.ts"
depends_on: [ VEN-1 ]
out_of_scope:
  - "The investor ask, claims rows and raiseProgress: VEN-3 (investor-ask.md); photosOfPlace and image facts: P4 (media.md); the five forks: P5"
  - "The event section between Applying and claims: P3"
criteria:
  - id: C1
    statement: "On the harness, place-filled shows propertyStatus after stageDetail then propertyTitle, locationPrecision after basedIn then locationWhy and visitsNow, funded after When on each piece card, placeSize and permits after the pieces block, and the Applying group after the asks with applyWho, applyAfter, applyFee, applyQuestions; place-empty shows each radio's options in the stated order ending Not sure yet, none checked, and Applying's skip line (C-VEN-place-1)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C2
    statement: "On the harness, plain-venture renders none of these keys and today's venture labels for audiences, asks and pages; axe reports no serious or critical violation on the four place keys (C-VEN-place-2)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C3
    statement: "Each of the 11 place keys passes KIND_GATED only for venture with place, propertyStatus and locationPrecision are in CHOICE_BACKED, and primerField(key).critical is true for all 11 (C-VEN-place-3)"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "verify:tracks passes: every new key and funded value has a label, the place overlay's keys stay within VENTURE_TYPES, and no coded component compares a sub-type (C-VEN-place-3)"
    evidence: check
    command: "yarn verify:tracks"
  - id: C5
    statement: "Generated over every kind × (null + six sub-types): no place key is in ingestionFieldsFor off venture with place; for place it holds propertyTitle, locationWhy, visitsNow, placeSize, permits and the four apply keys, and never propertyStatus or locationPrecision (C-VEN-place-4)"
    evidence: test
    command: "yarn test"
  - id: C6
    statement: "The piece extraction schema holds no funded key, and a synthetic source saying a phase is fully funded yields a piece with no funded value (rabbit hole 2)"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "Under resolvePack(venture, place), the audiences, asks and pages options keep every plain venture value, add guests, coOwners, facilitators after residents, reserve, hire, register before contact, and stays, events after apply; offering, residents and members keep their values with new labels; plain venture's labels equal today's (C-VEN-place-5)"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "renderIntakeMarkdown over place-filled prints every answer under its label and each piece's funded label beside the piece; the same answers with ventureType company still print every place answer (C-VEN-place-6, C-VEN-kind-4)"
    evidence: test
    command: "yarn test"
  - id: C9
    statement: "place-empty and place-filled on About and Work captured at 390, 834 and 1440, light and dark (C-VEN-place-7)"
    evidence: capture
    path: "specs/web/epics/VEN-venture-places/tickets/VEN-002-venture-place-questions/evidence/states/"
  - id: C10
    statement: "Keyboard only through About and Work: every new control is reached in visual order and each legend is announced (C-VEN-place-8)"
    evidence: manual
    reason: "Reading order and announced legends need a person (Threshold); axe in C2 is the floor"
---

# Contract — VEN-2 venture-place-questions

## Build notes

Wave 2, after VEN-1; runs beside P4 and P5 (other steps). Paths: `technical/placement.md`; shared-file sections: P2-place's column in `technical/verdict.md`, appending to your own section only. If it runs over, Applying is cut first (D-VEN-12), with no new call.

- **Approach:** keys first (schema, primer sets, labels), then the `placeVenture` slot and overrides in `VENTURE_PLACE`, then the rows inside `ForKinds` with `hasGroup("place")`, then fixtures and the document. All strings and option orders are in `venture-place.md` › Words; copy them exactly.
- **Decisions that apply:** D-VEN-6 "`asksPortrait` and `asksVideo` stay false; help lines carry the intent" (the `rosterLeadHelpSuffix`). D-VEN-9 "Piece cards gain 'Is it funded?'; size and permits are long answers". D-VEN-10 "Critical choices end 'Not sure yet'; nothing is preselected". D-VEN-12 "Applying sits under the asks and is cut first". D-VEN-13 "Plain venture's strings stay, except the claims intro and name help": the all-venture `nameHelp` ending "If the legal name is different, step 5 asks for it." is built here. C1, C3 as ratified.
- **Interfaces:** keys about `propertyStatus`, `propertyTitle`, `locationPrecision`, `locationWhy`, `visitsNow`; work `placeSize`, `permits`, `applyWho`, `applyAfter`, `applyFee`, `applyQuestions`; entry `pieces[].funded` (`funded`, `partly`, `notYet`, `unsure`); option values audiences `guests`, `coOwners`, `facilitators`, asks `reserve`, `hire`, `register`, pages `stays`, `events`; states `plain-venture`, `place-empty`, `place-filled`, `place-searching`.
- **Per path:** copy: `placeVenture` (About rows, `funded`, `placeSize`, `permits`, Applying) and overrides of `audiences`, `ask` options, `pages`, `representation`, the piece placeholder, `rosterLeadHelpSuffix`. Validators: text keys (bounds only) and `funded` in `pieceEntrySchema`. Primer: the 11 keys in `KIND_GATED` place, two radios in `CHOICE_BACKED`. Labels: each key and `funded`'s values. `output.ts`: `funded` printed through the entry option map. `extract.ts`: drop `funded` beside `NOT_ANSWERS`, reason: a funding status is money and the client's to state. Steps: About and Work rows; Audience takes `ventureType` and the overlay pack only. `piece-entry.tsx`: the row, id `f-piece-funded-${index}`, test as a prop. Fixtures: the four states.
- **Gotchas:** option lists live in the packs; `choice` and `text` hold bounds only, so a value is added in the pack, never as an enum. Zod strips unknown keys: the key is in its schema before its input ships. Applying is `role="group"` with `aria-labelledby` its heading and help on `aria-describedby`. `place-searching` keeps `propertyTitle`'s label. Captures: `yarn capture --route /test-harness/intake --keys place-empty,place-filled --out <C9's path>`. Commit as `VEN-2: <outcome>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a key rendered with an inline kind check and an option value renamed with its label.
