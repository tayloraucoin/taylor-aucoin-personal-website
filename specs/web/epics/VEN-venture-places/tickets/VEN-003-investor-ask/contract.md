---
id: VEN-3
size: small
objective: "a venture founder hands over what counsel said about the raise (issuer, jurisdictions, return wording, and for a place what investors and co-owners receive, perks and raise progress), quoted or Not sure yet, and nothing about the raise is proposed by a model or drafted by the form"
slice_type: "critical claims rows in the existing ink cluster, two reveals, three invest-card rows and a Site row; risks a model writing counsel's words, a reveal-gated key proposed, return or scarcity wording in the form's own copy, and a raise row reaching a kind that does not raise"
non_negotiables:
  - "Every key is registered once: KIND_GATED raise (issuerEntity, jurisdictions, returnWording, returnWordingQuote) or place (investorReceives, coOwnerDiffers, coOwnerLines, perks, raiseProgress), radios in CHOICE_BACKED, reveal rows in REVEAL_GATED; never a kind or sub-type compare in a component (C2)"
  - "Every text key is critical, quote-or-nothing; investorReceives and perks go in EXCLUDED_FIELDS as counsel's words (C9); currency, sameMinimum and eligibility are entry keys outside the inventory"
  - "showAvailability stays in NON_CRITICAL; raiseProgress is critical (D-VEN-8)"
  - "The form never models share wording or suggests investment wording: no return, yield, income, appreciation or scarcity words in the pack except in returnWording and returnWordingQuote, which ask about them (C-VEN-ask-7)"
  - "Nothing preselected; an unanswered returnWording prints not answered (D-VEN-10)"
  - "Cards receive kind, ventureType and their test as props (hasGroup raise); the invest rows also need entry.ask === invest, a check on an answer (C2)"
  - "Strings are [COPY — pending Taylor]; [REQUIRES LICENSED ATTORNEY] stays with the client's counsel"
devs_call: "Fixture text, test names, how the claims-boundary scan tokenises strings, the order of edits within this ticket's own sections"
cites:
  - "specs/web/epics/VEN-venture-places/ux/intake/investor-ask.md"
  - "D-VEN-5"
  - "D-VEN-8"
  - "D-VEN-10"
  - "C-VEN-ask-1"
  - "C-VEN-ask-2"
  - "C-VEN-ask-3"
  - "C-VEN-ask-4"
  - "C-VEN-ask-5"
  - "C-VEN-ask-6"
  - "C-VEN-ask-7"
  - "C-VEN-ask-8"
  - "C-VEN-ask-9"
truth_files: "none: the epic's ux/ proposals promote to specs/web/ux/intake/ when VEN ships"
qa: Q2
reviewers: [ vigil ]
focus:
  - "investment facts: every claims key critical and quote-or-nothing; reveal-gated, entry and C9 keys never proposed or written (vigil, Q2)"
  - "the claims-boundary scan: catches return, yield, appreciation and scarcity wording in raise, placeVenture and the place claims overlay (vigil, Q2)"
operator_review: false
planned_paths:
  - "lib/intake/showcase-copy.ts"
  - "lib/validators/showcase-intake.ts"
  - "lib/intake/showcase-primer-fields.ts"
  - "lib/intake/showcase-answer-labels.ts"
  - "server/services/output.ts"
  - "app/websites/coded/intake/_components/steps/step-work.tsx"
  - "app/websites/coded/intake/_components/steps/step-site.tsx"
  - "app/websites/coded/intake/_components/ask-entry.tsx"
  - "components/intake/venture-fixtures.ts"
  - "scripts/verify-track-cartridge.ts"
  - "tests/unit/intake-venture-*.test.ts"
  - "tests/e2e/intake-venture.spec.ts"
depends_on: [ VEN-1 ]
out_of_scope:
  - "The event section and its investment row: P3. Image facts, renderLabel and decks: P4. The askField options reserve, hire, register: VEN-2"
  - "Excluding the existing requiredWording and signOff from ingestion (rabbit hole 13)"
criteria:
  - id: C1
    statement: "On the harness, ask-place-empty shows the cluster with the place intro and rows signOff, issuerEntity, investorReceives, coOwnerDiffers, jurisdictions, cantSay, returnWording, perks, requiredWording in order with no reveal open (C-VEN-ask-1)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C2
    statement: "On the harness, ask-plain shows the all-venture intro and only signOff, issuerEntity, jurisdictions, cantSay, returnWording, requiredWording; axe reports no serious or critical violation on the six ask keys (C-VEN-ask-2)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C3
    statement: "hasGroup(raise) and hasGroup(place) are false for portfolio, practice, studio, business and other with any sub-type, and those packs hold no raise slot and today's claims strings (C-VEN-ask-2)"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "On the harness, coOwnerLines opens only on coOwnerDiffers = different and returnWordingQuote only on returnWording = approved, each right after its trigger; closing and reopening shows the typed text (C-VEN-ask-3)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C5
    statement: "On the harness, ask-invest-card shows currency and sameMinimum after The number and eligibility after Show it on the site? on the Invest card, and none of them on the Apply card; ask-raise-progress shows raiseProgress inside the availability reveal after availabilityDetail (C-VEN-ask-4, ask-5)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-venture.spec.ts"
  - id: C6
    statement: "The invest-row test is false off venture and on any ask but invest; renderIntakeMarkdown prints an invest card's currency, sameMinimum label and eligibility, and an unanswered returnWording as not answered (C-VEN-ask-4)"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "Generated over every kind × (null + six sub-types): ingestionFieldsFor never holds coOwnerDiffers, coOwnerLines, returnWording, returnWordingQuote, raiseProgress, investorReceives, perks or an ask entry key; it holds issuerEntity and jurisdictions on venture only; every key here is critical, showAvailability is not (C-VEN-ask-5, ask-6)"
    evidence: test
    command: "yarn test"
  - id: C8
    statement: "verify:tracks scans raise, placeVenture and the place claims overlay for return, yield, income, appreciation, only … left and scarcity words, outside returnWording and returnWordingQuote, and runs the client-name guard; a fixture string holding a yield figure fails it (C-VEN-ask-7)"
    evidence: check
    command: "yarn verify:tracks"
  - id: C9
    statement: "ask-plain, ask-place-empty, ask-coowner, ask-returns, ask-invest-card and ask-raise-progress captured at 390, 834 and 1440, light and dark (C-VEN-ask-8)"
    evidence: capture
    path: "specs/web/epics/VEN-venture-places/tickets/VEN-003-investor-ask/evidence/states/"
  - id: C10
    statement: "Keyboard and screen reader on ask-coowner: the reveal is next in Tab order and the cluster's intro is read on entering the region (C-VEN-ask-9)"
    evidence: manual
    reason: "What a screen reader announces needs a person (Threshold); axe in C2 is the floor"
---

# Contract — VEN-3 investor-ask

## Build notes

Wave 3, after wave 2: it shares `step-work.tsx` and `stepWorkSchema` with VEN-2 and P3. Beside P3 only if each stays in its own region (claims cluster and ask cards here; the event section there); otherwise this goes first. Paths: `technical/placement.md`; shared-file sections: P2-ask's column in `technical/verdict.md`.

- **Approach:** keys and sets, then strings, then rows inside the existing `InkCluster` through `ForKinds` (`hasGroup("raise")` for rows 2, 6, 8, 9; `hasGroup("place")` for 3, 4, 5, 10), the two `Reveal`s, the card rows, `raiseProgress` in Site's existing reveal, then fixtures, the scan, the document. All strings are in `investor-ask.md` › Words; copy them exactly.
- **Decisions that apply:** D-VEN-5 "The investor ask lives inside the claims ink cluster". D-VEN-7 "Invest cards gain currency, a same-minimum row and eligibility". D-VEN-8 "Raise progress is its own critical field; `showAvailability` stays non-critical". D-VEN-10 "Critical choices end 'Not sure yet'; nothing is preselected". D-VEN-13: the all-venture claims intro is one of plain venture's two changed strings. C2, C3, C9 as ratified.
- **Interfaces:** work `issuerEntity`, `investorReceives`, `coOwnerDiffers` (`same`, `different`, `unsure`), `coOwnerLines`, `jurisdictions`, `returnWording` (`none`, `approved`, `unsure`), `returnWordingQuote`, `perks`; entry `asks[].currency`, `sameMinimum` (`yes`, `no`, `unsure`), `eligibility`; site `raiseProgress` (`approved`, `no`, `unsure`); states `ask-plain`, `ask-place-empty`, `ask-coowner`, `ask-returns`, `ask-invest-card`, `ask-raise-progress`.
- **Per path:** copy: venture pack `raise` (rows 2, 6, 8, 9, invest rows) and its `claims` intro override; `VENTURE_PLACE` `placeVenture` rows 3–5, 10 and `raiseProgress`, and the place `claims` override (intro, `signOff` and `requiredWording` help) built from the floor with spreads. Validators: work keys, `askEntrySchema` sub-keys, site `raiseProgress`. Primer: the sets above; `EXCLUDED_FIELDS` gains `investorReceives`, `perks`, reason: counsel's words, and a sentence from a deck is not counsel's approval. Labels: every key and value. `output.ts`: sub-key labels through the entry option map. `ask-entry.tsx`: rows with ids `f-ask-currency-${index}`, `f-ask-sameMinimum-${index}`, `f-ask-eligibility-${index}`. `step-site.tsx`: the row after `availabilityDetail`. Scan: C8.
- **Gotchas:** a closed reveal leaves the tab order and keeps its stored text, and lists as unanswered (rabbit hole 13). The build treats an unanswered `returnWording` as `none`. Zod strips unknown keys: schema before input. `raiseProgress` is in three sets at once. Captures: `yarn capture --route /test-harness/intake --keys <C9's six> --out <C9's path>`. Commit as `VEN-3: <outcome>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a reveal-gated key left proposable and help text that suggests investment wording.
