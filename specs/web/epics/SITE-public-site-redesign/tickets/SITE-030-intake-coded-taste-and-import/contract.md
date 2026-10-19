---
id: SITE-30
size: small
objective: "a client in the coded intake meets the new brand on the taste gallery, the credits import and its marks, extraction and the voice step, with picks, imports and recordings saving exactly as on main, and both intake trees clear of the old idioms"
slice_type: "a token restyle over the coded tree's richest screens, plus two focus fixes; risks a restyle that edits an import, extraction or upload path, a result dialog focus can leave, a gallery that strands focus on close, and a GradientRing left on the voice step"
non_negotiables:
  - "The token rules in intake-coded.md apply to this ticket's 23 coded files (178 idiom lines by grep; D-SITE-240 counted about 185): steps/step-taste, step-ingest and step-words, every file under _components/taste/, ingest-run, source-list, extraction-block, step-proposals, voice-recorder, preview-recorder, come-across, and _lib/recording-store, listed for D-SITE-240's count: it holds no idiom and stays as it is"
  - "SITE-28's shared pieces (step shell, machine-filled mark, working line, overlay), fixtures and harness, and SITE-29's files, are reused, never restyled again or forked"
  - "No file under server/, _actions/, lib/intake/ or lib/extras/ changes: imports, extraction, taste picks and voice uploads save as on main (C-SITE-intake-coded-12)"
  - "No file in either intake tree names GradientRing; components/ui/GradientRing.tsx stays for its pages outside the intake"
  - "The import result is a modal dialog: focus moves into it and stays until its primary; the taste gallery keeps its trap and returns focus to its opener; under reduced motion the import's working line is static (D-SITE-178)"
  - "One main and one h1 per screen; states are reached by the admin client preview and SITE-28's harness, never a public ?state=; no analytics and no consent banner (D-SITE-241, C-SITE-intake-coded-4)"
  - "Every string stays today's: intake-coded-copy.md is Taylor's to rewrite (D-SITE-220)"
devs_call: "How each token maps to a class, fixture names for the new keys, how the result dialog holds focus, and test file names"
waiver: "One surface, the coded intake, split for the token cap: intake-coded.md holds the token rules and states, intake-coded-build.md layout, access and criteria, plumb-proposals-2.md the named pieces (the accordion group head, the example row card, the result modal, the machine-filled mark); decisions-14.md holds D-SITE-240 and 241"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/intake-coded.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/intake-coded-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/plumb-proposals-2.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-156"
  - "D-SITE-158"
  - "D-SITE-159"
  - "D-SITE-178"
  - "D-SITE-220"
  - "D-SITE-240"
  - "D-SITE-241"
  - "C-SITE-intake-coded-1"
  - "C-SITE-intake-coded-2"
  - "C-SITE-intake-coded-3"
  - "C-SITE-intake-coded-4"
  - "C-SITE-intake-coded-8"
  - "C-SITE-intake-coded-10"
  - "C-SITE-intake-coded-12"
  - "C-SITE-intake-coded-13"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/websites/coded/intake/_components/steps/step-taste.tsx"
  - "app/websites/coded/intake/_components/steps/step-ingest.tsx"
  - "app/websites/coded/intake/_components/steps/step-words.tsx"
  - "app/websites/coded/intake/_components/taste/**"
  - "app/websites/coded/intake/_components/ingest-run.tsx"
  - "app/websites/coded/intake/_components/source-list.tsx"
  - "app/websites/coded/intake/_components/extraction-block.tsx"
  - "app/websites/coded/intake/_components/step-proposals.tsx"
  - "app/websites/coded/intake/_components/voice-recorder.tsx"
  - "app/websites/coded/intake/_components/preview-recorder.tsx"
  - "app/websites/coded/intake/_components/come-across.tsx"
  - "app/websites/coded/intake/_lib/recording-store.ts"
  - "components/intake/**"
  - "app/admin/(client-preview)/intake/preview/**"
  - "tests/**"
depends_on: [ SITE-29 ]
out_of_scope:
  - "SITE-29's 38 coded files and SITE-28's shared tree, machine-filled.tsx and working-indicator.tsx included: cite, never re-prove"
  - "Copy: intake-coded-copy.md is Taylor's to rewrite (D-SITE-220, 221)"
  - "The contrast audit: WEB-13"
criteria:
  - id: C1
    statement: "SITE-28's token scan, widened to every file under app/websites/intake/ and app/websites/coded/intake/ outside _actions/, finds none of the five idioms, and no file in either tree contains the string GradientRing (C-SITE-intake-coded-2, both intake trees)"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "No commit whose subject starts SITE-30: changes a path under server/, a path containing /_actions/, lib/intake/ or lib/extras/, and at least one commit after the merge-base with main has a subject starting SITE-30:, so a stray prefix fails rather than passing on nothing (C-SITE-intake-coded-12)"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "On the harness key import, the element with role dialog and aria-modal true holds document.activeElement on open, ten Tab and ten Shift+Tab presses leave it inside, and its one primary is a link to step 2 (C-SITE-intake-coded-8)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-taste.spec.ts"
  - id: C4
    statement: "On the harness key taste, the open group's head is a button with aria-expanded true; the gallery opened from an example row keeps focus inside its dialog under Tab and Shift+Tab, and Escape closes it with focus back on that opener"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-taste.spec.ts"
  - id: C5
    statement: "Exactly one main and one h1 on the harness keys taste, import, import-reading, import-mark and words; at 390 every meta-size text link on them has a 44px hit area with no horizontal scroll; axe reports no serious or critical violation on them at 390 and 1440, dark and light (C-SITE-intake-coded-10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-taste.spec.ts"
  - id: C6
    statement: "With prefers-reduced-motion reduce, every element on those five keys computes transition-duration 0s, and on import-reading the working line holds its first line for 3s (C-SITE-intake-coded-13)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-taste.spec.ts"
  - id: C7
    statement: "taste, import and import-mark on the harness match captures/intake-coded/ at 390 and 1440, dark and light, with at most one solid primary in view (C-SITE-intake-coded-1, 3)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-030-intake-coded-taste-and-import/evidence/states/"
---

# Contract — SITE-30 intake-coded-taste-and-import

## Build notes

Wave 4, the last intake ticket, after SITE-29. SITE-28 alone does not suffice: C1's scan passes only once SITE-29's 38 files are clean, SITE-29's files render this ticket's (`[step]/page.tsx` renders `StepProposals`; step-about, -experience and -work render `ExtractionBlock`; `feedback-block` renders `taste/pick-scale`), and both tickets add to the same fixtures module and tests.

- **Approach:** restyle this ticket's files by the token rules; take the voice step out of its `GradientRing` into a kit surface card with a hairline (token rules, Cards); give `DoneOverlay` in `ingest-run.tsx` the focus hold its `RunningOverlay` already has (today it moves no focus); keep `gallery-overlay.tsx`'s trap and opener return as they are. Add harness keys and preview sections to SITE-28's module: `taste` (one group open, one pick saved), `import` (the result over step 1), `import-mark` (a filled field on a later step), and two uncaptured keys the tests need, `import-reading` (the working line) and `words` (step 7, idle). Extend SITE-28's token test to both whole trees and its boundary test with `SITE-30` and the at-least-one-commit check.
- **Decisions that apply:** D-SITE-156: "Import result: the code has no result screen, so it is drawn as the 'Read it through' card over step 1 plus a crop of a filled-in field." D-SITE-159: the machine-filled quote is upright. D-SITE-178: "every transition is 0ms". D-SITE-240 sets this file list.
- **Interfaces:** the five harness keys and preview sections; nothing else exported.
- **Per path:** the coded files listed: restyle and the dialog fix. `components/intake/`: the new fixtures. The preview page: the new sections. `tests/e2e/intake-coded-taste.spec.ts`; the two unit tests extended.
- **Gotchas:** `machine-filled.tsx` and `working-indicator.tsx` are SITE-28's: `import-mark` and `import-reading` show them as SITE-28 left them. Restyling `pick-scale` and `extraction-block` changes SITE-29's done and step screens; that reopens nothing. `come-across.tsx` calls `_actions/come-across`, and the recorder uploads through actions: keep every call, prop and handler byte for byte, and `recording-store.ts` as it is. The commit check is the Consider's answer: a subject match can only be blind, never wrong, so requiring one match turns blindness into a failure; a squash at merge comes after proof. Map tokens through `.claude/rules/house-design.md`; stop and ask before inventing one. Commit as `SITE-30: <outcome>`. Capture: `yarn capture --route /test-harness/intake --keys taste,import,import-mark --out <C7's path>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a moved upload handler, a dialog Tab can leave, and a ring left on the voice step.
