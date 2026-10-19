---
id: SITE-28
size: small
objective: "a client in either intake meets the new brand on every shared piece (step shell, save line, fields, choice group, resume list, deposit gate, confirming, unavailable, done) with one main and one h1 per screen, while money, sessions and saves behave exactly as on main"
slice_type: "a token restyle over a shared component tree, plus a fixture reach for its drawn states; risks a restyle that edits payment or save code, a save line announced twice, a screen with two mains or none, and a state fixture that leaks to the public"
non_negotiables:
  - "The token rules in intake-coded.md apply to every file under app/websites/intake/ outside _actions/ (34 files, 173 idiom lines by grep): meta 13 for mono caps, text or a mark for gold text, no Eyebrow use, GradientButton as the one primary, no GradientRing, weights 400 and 500 (D-SITE-158)"
  - "The platform intake changes only through these shared pieces: no screen, layout or copy work there (D-SITE-112); every string stays today's"
  - "No file under server/, _actions/, lib/intake/ or lib/extras/ changes (C-SITE-intake-coded-12)"
  - "One main and one h1 per screen; the save line announced once, politely; the resume list's current row carries aria-current step and each visited row a hidden word"
  - "Drawn states are reached by the admin client preview over synthetic engagements held in memory, writing nothing; never a public ?state= on an intake route (D-SITE-218)"
  - "No header, footer, analytics or consent banner in the intake (C-SITE-intake-coded-4); the theme stays the Light, Dark, System group at 48px, restyled (D-SITE-219)"
  - "Under reduced motion every transition is 0ms and the working line shows its first line only (D-SITE-178)"
devs_call: "Fixture names and their module, the harness route's file, how each token maps to a class, and test file names"
waiver: "One surface, the coded intake, split for the token cap: intake-coded.md holds the token rules and states, intake-coded-build.md layout, access and criteria, plumb-proposals-2.md the named pieces (the choice row, the step footer bar, the saved and error lines, the numbered step row)"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/intake-coded.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/intake-coded-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/plumb-proposals-2.md"
  - "D-SITE-112"
  - "D-SITE-154"
  - "D-SITE-158"
  - "D-SITE-159"
  - "D-SITE-178"
  - "D-SITE-218"
  - "D-SITE-219"
  - "C-SITE-intake-coded-1"
  - "C-SITE-intake-coded-2"
  - "C-SITE-intake-coded-3"
  - "C-SITE-intake-coded-4"
  - "C-SITE-intake-coded-7"
  - "C-SITE-intake-coded-9"
  - "C-SITE-intake-coded-10"
  - "C-SITE-intake-coded-11"
  - "C-SITE-intake-coded-12"
  - "C-SITE-intake-coded-13"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/websites/intake/**"
  - "components/intake/**"
  - "app/admin/(client-preview)/intake/preview/**"
  - "app/test-harness/intake/**"
  - "lib/routes.ts"
  - "tests/**"
depends_on: [ SITE-1, SITE-3, SITE-5, SITE-24 ]
out_of_scope:
  - "The coded tree's own files (app/websites/coded/intake/): SITE-29 and SITE-30; eyebrow.tsx stays until SITE-29 removes its last importers"
  - "Copy: the intake-coded-copy.md list is Taylor's to rewrite (D-SITE-220, 221); the hidden visited and current words render bracketed"
  - "The contrast audit: WEB-13"
criteria:
  - id: C1
    statement: "A scan of every file under app/websites/intake/ outside _actions/ finds no class list holding font-mono with uppercase, no Eyebrow or GradientRing import, no font-light and no --color-c2 or --color-c3 as a text colour; the same scan over a fixture string holding each idiom finds all five (C-SITE-intake-coded-2)"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "No commit whose subject starts SITE-28: changes a path under server/, a path containing /_actions/, lib/intake/ or lib/extras/; the path matcher, fed a fixture list, flags each of those four and passes app/websites/intake/_components/field.tsx (C-SITE-intake-coded-12)"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "On the harness, save in each of saving, saved, offline and error shows its line from save-indicator.tsx in one aria-live polite region whose text changes once per state; error shows a Try again button; on that step, 4 of 10, the progress fill's width is 30% of its track (C-SITE-intake-coded-7, 11)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-shared.spec.ts"
  - id: C4
    statement: "On the harness, resume at step 4 has exactly one row with aria-current step and three visited rows each holding a visually hidden word; the theme group is named Theme with Light, Dark and System, each at least 48px, and every meta-size text link has a 44px hit area at 390 (C-SITE-intake-coded-9)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-shared.spec.ts"
  - id: C5
    statement: "Exactly one main and one h1 on the harness keys save, resume, confirming, unavailable and unavailable-invalid, on GET /websites/intake, and on /websites/coded/intake/<synthetic token>; the harness answers 404 when isProductionDeployment() is true (C-SITE-intake-coded-10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-shared.spec.ts"
  - id: C6
    statement: "With consent granted, /websites/intake, /websites/coded/intake/<synthetic token> and the harness render no banner, contentinfo or consent element and send no request to a Google host; with prefers-reduced-motion reduce every harness element computes transition-duration 0s and the working line holds its first line for 3s (C-SITE-intake-coded-4, 13)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-shared.spec.ts"
  - id: C7
    statement: "axe reports no serious or critical violation on the harness keys at 390 and 1440, dark and light"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-shared.spec.ts"
  - id: C8
    statement: "save, resume, confirming and unavailable on the harness match captures/intake-coded/ at 390 and 1440, dark and light, with at most one solid primary in view (C-SITE-intake-coded-1, 3)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-028-intake-shared/evidence/states/"
---

# Contract — SITE-28 intake-shared

## Build notes

Wave 4, the first intake ticket. After SITE-24 (the intake prefix pinned), SITE-5 (chrome hidden on intake paths), SITE-3 (the GA test build) and SITE-1 (the harness). SITE-29 and SITE-30 reuse what this builds.

- **Approach:** restyle the shared tree by intake-coded.md's token rules, file by file, then the access fixes the build file names: a `main` on each screen that lacks one (today only `step-shell.tsx:135`), `aria-current="step"` and hidden words on resume rows, one polite save region, 44px hit areas. The reach: one fixtures module of synthetic engagements per state, built like `previewEngagement` and wrapped in `PreviewModeProvider`, read by the admin client preview (new sections) and by a test-harness page at `/test-harness/intake?state=<key>` that 404s in production and that `isIntakePath` covers, so it renders chrome-free and unmeasured, as an intake screen does.
- **Decisions that apply:** D-SITE-218: "Intake states are reached through the admin client preview with one seeded synthetic engagement per state; no public `?state=` on intake routes." D-SITE-241: the seeds are in memory, "Nothing is written to a database". D-SITE-112: the platform intake changes "with no screens or copy work". D-SITE-154: errors are "a 16px warning glyph and the sentence in text colour at meta size; an invalid field's border goes to text colour at 2px." D-SITE-159: "the progress fill counts finished steps, (n − 1)/10." D-SITE-219: "today's three-way Light, Dark, System theme group at 48px, restyled."
- **Interfaces:** harness keys `save` (four rows), `resume`, `confirming`, `unavailable` (expired), `unavailable-invalid`; preview sections of the same names. SITE-29 and SITE-30 add their keys to the same module.
- **Per path:** `app/websites/intake/**`: the restyle and access fixes. `components/intake/`: the fixtures module. The preview page: the new sections. `app/test-harness/intake/page.tsx`. `lib/routes.ts`: the harness path in `isIntakePath` only. `tests/unit/intake-tokens.test.ts`, `intake-boundary.test.ts` (both take a ticket's file list or id, so SITE-29 and 30 extend them), `tests/e2e/intake-shared.spec.ts`.
- **Gotchas:** keep `eyebrow.tsx`: the coded tree imports it. `eyebrowFor()` lives in `lib/intake/` and stays; its callers here stop rendering it. Map the kit's token names through `.claude/rules/house-design.md`; stop and ask before inventing one. Commit as `SITE-28: <outcome>` so C2 finds the commits. The synthetic token must match no engagement; read its main-side answer first, as SITE-24 C2. Capture: `yarn capture --route /test-harness/intake --keys save,resume,confirming,unavailable --out <C8's path>`; the captures show one theme icon, the build keeps the group (D-SITE-219).
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a restyle that edits an action, a second `main` inside the step shell, and fixtures that ship.
