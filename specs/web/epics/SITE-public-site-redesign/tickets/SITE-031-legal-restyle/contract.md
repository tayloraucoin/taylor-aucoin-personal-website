---
id: SITE-31
size: small
objective: "a reader of /privacy, /websites/privacy or /websites/terms sees the new brand's tokens on the same layout and the same words as on main"
slice_type: "a token-only restyle of three legal pages and their shared reading shell; risks a string, a clause or a metadata line changed in passing, a consent control that stops withdrawing, and chrome appearing on the service's legal pages"
non_negotiables:
  - "Tokens only (brief: 'Restyled only: new tokens, no layout or content work'): no layout change, no new section, no copy work; every string, title and description stays byte for byte"
  - "The files: app/privacy/page.tsx, app/websites/privacy/page.tsx, app/websites/terms/page.tsx and the shell they render through, components/websites/legal/ (LegalPageShell, LegalArticle, prose)"
  - "content/legal.ts, lib/legal/, components/analytics/ and lib/analytics/ do not change: the documents' text and version, and the /privacy consent control, behave as on main (SITE-3 C5 drives the control: cite, never re-prove)"
  - "/websites/privacy and /websites/terms stay chrome-free (isLegalPath, SITE-5); /privacy keeps the site header and SITE-5's one footer outside its main"
  - "One main and one h1 per page"
  - "The old idioms leave these files by the same five checks as SITE-28's token scan: no mono caps, no Eyebrow or GradientRing, no font-light, no --color-c2 or c3 as text (house-design.md maps the tokens)"
devs_call: "How each token maps to a class, the golden file's format, and test file names"
waiver: "No surface file: the brief's scope row for /privacy, /websites/privacy and /websites/terms reads 'Restyled only: new tokens, no layout or content work', so there is no state, layout or string to draw; decisions-14.md holds D-SITE-239, which puts this ticket in wave 4, and D-SITE-229"
cites:
  - "specs/web/epics/SITE-public-site-redesign/brief.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-229"
  - "D-SITE-239"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: true
planned_paths:
  - "app/privacy/page.tsx"
  - "app/websites/privacy/page.tsx"
  - "app/websites/terms/page.tsx"
  - "components/websites/legal/**"
  - "tests/**"
depends_on: [ SITE-5 ]
out_of_scope:
  - "The two /privacy statements Taylor writes (D-SITE-229): content, Taylor's, not this ticket's"
  - "The consent control's behaviour: SITE-3 (C5)"
  - "The intake's agreement overlay (legal-agreement.tsx), which renders LegalArticle: SITE-28's file"
  - "The contrast audit: WEB-13"
criteria:
  - id: C1
    statement: "On /privacy, /websites/privacy and /websites/terms, main's textContent with whitespace collapsed, document.title and the meta description equal a golden file taken from the branch before this ticket's first commit; changing one word in a fixture copy of that file makes the comparison fail"
    evidence: test
    command: "yarn test:e2e tests/e2e/legal-restyle.spec.ts"
  - id: C2
    statement: "No commit whose subject starts SITE-31: changes content/legal.ts or a path under lib/legal/, components/analytics/ or lib/analytics/, and at least one commit after the merge-base with main has a subject starting SITE-31:"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The token scan run over the three page files and components/websites/legal/ finds no class list holding font-mono with uppercase, no Eyebrow or GradientRing import, no font-light and no --color-c2 or --color-c3 as a text colour; the same scan over a fixture string holding each idiom finds all five"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "Each of the three pages has exactly one main and one h1; /websites/privacy and /websites/terms render no banner, no skip link and no site footer; /privacy renders the site header and one contentinfo footer outside its main"
    evidence: test
    command: "yarn test:e2e tests/e2e/legal-restyle.spec.ts"
  - id: C5
    statement: "axe reports no serious or critical violation on the three pages at 390 and 1440, dark and light, and none scrolls horizontally at 390"
    evidence: test
    command: "yarn test:e2e tests/e2e/legal-restyle.spec.ts"
  - id: C6
    statement: "Taylor looks at the three pages at 390 and 1440, dark and light, and says they read in the new brand with the layout unchanged"
    evidence: manual
    reason: "There is no drawn state to compare against: the brief scoped this as tokens only, so the look is the operator's call"
---

# Contract — SITE-31 legal-restyle

## Build notes

Wave 4, the brief's legal row (D-SITE-239: "SITE-31 the brief's legal restyle (`/privacy`, `/websites/privacy`, `/websites/terms`, tokens only)"). After SITE-5, which edits `app/privacy/page.tsx` first (its footer import out, `id="main"` in). Its cut meets D-SITE-222.

- **Approach:** take the golden file first, from the branch as it stands. Then swap classes only: mono caps kickers and row labels to meta 13, sentence case, muted; the display h1s to the kit's heading role; `font-light` body to 400; c2 link colour to the text link (text colour, mark underline). Element order, wrappers and props stay. Then the tests.
- **Decisions that apply:** the brief's scope row, quoted in the first non-negotiable. D-SITE-229: "`/privacy` gains two statements before `/contact`, `/book` and the signup launch… Taylor's copy, Chancery's seat; blocks launch, not build."
- **Interfaces:** none.
- **Per path:** the three pages and `components/websites/legal/`: classes only. `tests/e2e/legal-restyle.spec.ts`, its golden file under `tests/`, and the token and commit checks.
- **Gotchas:** the token scan and the commit matcher are shared pieces with SITE-28 (`tests/unit/intake-tokens.test.ts`, `intake-boundary.test.ts`): whichever builds first creates them, the other reuses them with its own list; never both at once. `LegalArticle` also renders inside the intake's agreement overlay, so this restyle shows there; that reopens nothing. `textContent` ignores CSS case, so dropping `uppercase` keeps C1 green, as the brief means. The `googletagmanager.com` span is technical data: Fragment Mono stays, without caps. If D-SITE-229's lines land before this starts, the golden file holds them; if later, refresh it with them. Map tokens through `.claude/rules/house-design.md`; stop and ask before inventing one. Commit as `SITE-31: <outcome>`.
- **Model:** Sonnet 5.5 at medium, minimum and recommended: mechanical class swaps under a golden text file. Choosing down risks a changed clause the golden file then has to catch.
