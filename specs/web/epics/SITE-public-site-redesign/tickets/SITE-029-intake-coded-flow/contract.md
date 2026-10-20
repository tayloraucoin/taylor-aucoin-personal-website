---
id: SITE-29
size: small
objective: "a client in the coded intake meets the new brand from start to done: start with its resume offer, welcome, the plain question steps, the pay gate and checkout, add-ons, done and review, with amounts, sessions and saves exactly as on main"
slice_type: "a token restyle over the coded tree's entry, money and question screens; risks a restyle that edits a pay or save path, two primaries in one view, an error that is not announced, and the Agora eyebrow left on a screen"
non_negotiables:
  - "The token rules in intake-coded.md apply to this ticket's coded files (38, about 182 idiom lines by grep): page.tsx, layout.tsx, the [token] entry, [step], done and review pages, add-ons/page.tsx, showcase-start-form, -welcome, -pay-gate, -checkout, -pay-button, -waive-button, -done, extras-checkout, feedback-block, custom-pages, upsell-block, steps about, access, audience, experience, media, site and work, and their kin (the six entry components, entry-collapse, person-proof, top-five, home-shortlist, for-kinds, video-list, document-drop)"
  - "SITE-28's shared pieces, fixtures and harness are reused, never restyled again or forked"
  - "No file under server/, _actions/, lib/intake/ or lib/extras/ changes: plans, amounts, promo, Stripe sessions and returns, and autosave stay as on main (C-SITE-intake-coded-12; D-SITE-157, drawn only)"
  - "One solid primary per view (A-17): Start, Continue, Finish, Pay today — $n at full width; done has none and Review my answers stays a ghost (D-SITE-157)"
  - "The Agora eyebrow leaves every coded screen and nothing replaces it; eyebrow.tsx is deleted with no import left (D-SITE-220); every string stays today's"
  - "One main and one h1 per screen; the email error is announced as an alert and its input takes the 2px text-colour border (D-SITE-154)"
  - "States are reached by the admin client preview and SITE-28's harness, never a public ?state=; no analytics and no consent banner (D-SITE-218, C-SITE-intake-coded-4)"
devs_call: "How each token maps to a class, fixture names for the new keys, and test file names"
waiver: "One surface, the coded intake, split for the token cap: intake-coded.md holds the token rules and states, intake-coded-build.md layout, access and criteria"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/intake-coded.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/intake-coded-build.md"
  - "D-SITE-154"
  - "D-SITE-155"
  - "D-SITE-157"
  - "D-SITE-158"
  - "D-SITE-218"
  - "D-SITE-220"
  - "C-SITE-intake-coded-1"
  - "C-SITE-intake-coded-2"
  - "C-SITE-intake-coded-3"
  - "C-SITE-intake-coded-6"
  - "C-SITE-intake-coded-10"
  - "C-SITE-intake-coded-12"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/websites/coded/intake/**"
  - "app/websites/intake/_components/eyebrow.tsx"
  - "components/intake/**"
  - "app/admin/(client-preview)/intake/preview/**"
  - "tests/**"
depends_on: [ SITE-28 ]
out_of_scope:
  - "The taste gallery, credits import and machine-filled mark, voice recorder and extraction (step-taste, step-ingest, step-words, taste/, ingest-run, source-list, extraction-block, step-proposals, voice-recorder, preview-recorder, come-across): SITE-30"
  - "The shared tree, the save line, resume list, confirming and unavailable: SITE-28; cite, never re-prove"
  - "Copy: intake-coded-copy.md is Taylor's to rewrite (D-SITE-220, 221)"
criteria:
  - id: C1
    statement: "SITE-28's token scan, run over this ticket's file list, finds none of the five idioms; app/websites/intake/_components/eyebrow.tsx does not exist and no file imports an Eyebrow (C-SITE-intake-coded-2)"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "No commit whose subject starts SITE-29: changes a path under server/, a path containing /_actions/, lib/intake/ or lib/extras/ (C-SITE-intake-coded-12)"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "On GET /websites/coded/intake, an email that fails the check, on blur, shows the error line in an element with role alert, the input has aria-invalid true and computes a 2px border in the text colour, and Start keeps its label (C-SITE-intake-coded-6)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-flow.spec.ts"
  - id: C4
    statement: "Exactly one main and one h1 on GET /websites/coded/intake, /websites/coded/intake/add-ons, /websites/coded/intake/<synthetic token>/review, and the harness keys start-resume, welcome, step, pay and done; none of them holds the text Agora · (C-SITE-intake-coded-10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-flow.spec.ts"
  - id: C5
    statement: "On pay, the plans are one radio group, the add-ons and the agreement native checkboxes, the agreement names its two documents as links, the total uses tabular figures, and Pay today is the only solid primary, full width at 390; on done no solid primary shows and Review my answers is a link; welcome lists ten numbered steps"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-flow.spec.ts"
  - id: C6
    statement: "At 390 every meta-size text link on these keys has a 44px hit area with no horizontal scroll; axe reports no serious or critical violation on them at 390 and 1440, dark and light; with prefers-reduced-motion reduce every element computes transition-duration 0s"
    evidence: test
    command: "yarn test:e2e tests/e2e/intake-coded-flow.spec.ts"
  - id: C7
    statement: "start, start-resume, invalid, welcome, step, pay and done on the harness match captures/intake-coded/ at 390 and 1440, dark and light, with at most one solid primary in view (C-SITE-intake-coded-1, 3)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-029-intake-coded-flow/evidence/states/"
---

# Contract — SITE-29 intake-coded-flow

## Build notes

Wave 4, after SITE-28 (the shared tree, the fixtures module, the harness, the token and boundary tests). SITE-30 takes the rest of the coded tree.

- **Approach:** restyle this ticket's files by the token rules, remove every `Eyebrow` use and then the component, and give each screen one `main`. Add harness keys and preview sections `start`, `start-resume`, `invalid`, `welcome`, `step` (step 2, About you, as drawn), `pay` (a plan chosen, one add-on, the agreement ticked) and `done` (two skipped answers) to SITE-28's fixtures module. Extend SITE-28's token test with this file list and its boundary test with `SITE-29`.
- **Decisions that apply:** D-SITE-155: entry screens "keep the step's pattern: every h1 at Heading 2, no 'Agora · Custom build' eyebrow, footnotes in sentence-case meta, numbered step rows with muted numbers… The resume offer is a surface card with a text link." D-SITE-157: "Pay gate (drawn only; no payment, Stripe or save behaviour changes): plan rows carry amounts in text colour… add-ons as hairline checkbox rows, the total as a ledger row, 'Pay today — $n' full width as the one primary… Done uses Heading 4 sections and has no primary; 'Review my answers' stays a ghost." D-SITE-154: the error look. D-SITE-220: "the Agora eyebrow is replaced by nothing."
- **Interfaces:** the seven harness keys and preview sections above; nothing else exported.
- **Per path:** `app/websites/coded/intake/**`: this ticket's files only (non-negotiable 1). `eyebrow.tsx`: deleted. `components/intake/`: the new fixtures. The preview page: the new sections. `tests/e2e/intake-coded-flow.spec.ts`; the two unit tests extended.
- **Gotchas:** `eyebrowFor()` in `lib/intake/tracks.ts` stays (C2); its callers stop rendering it, and Agora stays the charging entity on statements. The add-ons and review pages are not drawn: token rules only, and C4 reaches their no-engagement branch. Keep `showcase-checkout.tsx`'s handlers, props and server calls byte for byte; only class names and wrappers move. Map tokens through `.claude/rules/house-design.md`; stop and ask before inventing one. Commit as `SITE-29: <outcome>`. Capture: `yarn capture --route /test-harness/intake --keys start,start-resume,invalid,welcome,step,pay,done --out <C7's path>`.
- **Model:** Opus 5.5 at medium recommended; Sonnet 5.5 at high minimum. Choosing down risks a handler moved in the checkout and a second primary on pay.
