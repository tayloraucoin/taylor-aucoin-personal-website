---
id: SITE-5
size: small
objective: "every page with chrome begins with a skip link to its one main and ends in one footer, rendered once by the root layout: About, Résumé, Contact, GitHub, LinkedIn, Privacy, with the address beside the domain"
slice_type: "shared chrome across every public page; risks a page left with two footers or none, two mains, a skip link that moves nothing, and an edit that leaks into a page's body"
non_negotiables:
  - "One footer, rendered by the root layout inside SiteChrome after the page; no page imports a footer, and components/sections/Footer.tsx is deleted (D-SITE-130: one edit)"
  - '"Email" becomes "Contact" to siteRoutes.contact; the address shows beside the domain; Résumé points at SITE.resume and names "(PDF)" (D-SITE-130, D-SITE-2)'
  - "The skip link is the first focusable element on every chrome page, visible when focused, and moves focus to the page's main"
  - "Every public page has exactly one main, with id main, and the footer sits outside it"
  - "Intake, legal and admin paths render neither, as SiteChrome hides the header today"
  - "Each page file changes only by its footer import and its main's id: no body content, class or copy moves"
devs_call: "The footer's markup within the captures, how the skip link is hidden until focused, how focus lands in main (tabindex on main or a target inside it), and test file names"
waiver: "Site chrome, one component on every page: overview.md's Navigation defines it, and home-build.md holds its drawn layout and its criteria; the other pages' header and footer criteria are proven once here and cited by their tickets"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/overview.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-build.md"
  - "D-SITE-2"
  - "D-SITE-130"
  - "C-SITE-home-4"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "components/site/SiteFooter.tsx"
  - "components/site/SkipLink.tsx"
  - "components/sections/Footer.tsx"
  - "app/layout.tsx"
  - "app/page.tsx"
  - "app/about/page.tsx"
  - "app/capabilities/page.tsx"
  - "app/services/page.tsx"
  - "app/privacy/page.tsx"
  - "app/websites/page.tsx"
  - "app/websites/coded/page.tsx"
  - "app/websites/platform/page.tsx"
  - "app/work/[slug]/page.tsx"
  - "app/not-found.tsx"
  - "tests/**"
depends_on: [SITE-2]
out_of_scope:
  - "The header and the call button: the header ticket"
  - "Each page's own restyle: its page ticket; this ticket moves the footer out and sets main's id, nothing else"
  - "The /websites/platform golden file: the /websites ticket (wave 4) takes it from main with the footer element removed, since this ticket moves the footer out of that page's main (D-SITE-230)"
  - "The /about anchors and the /contact page: their tickets; Contact answers 404 on the branch until the Work with me ticket"
criteria:
  - id: C1
    statement: "On /, /about, /capabilities, /services, /privacy, /websites, /websites/coded, /websites/platform, /work/conscious-connections and /no-such-page there is exactly one contentinfo footer, outside the one main, which has id main; its named nav links About to /about, Résumé to SITE.resume with (PDF) in its accessible name, Contact to /contact, GitHub, LinkedIn and Privacy to /privacy, in that order; the address shows beside the domain and no link is named Email (C-SITE-home-4)"
    evidence: test
    command: "yarn test:e2e tests/e2e/footer.spec.ts"
  - id: C2
    statement: "On the same pages the first Tab press focuses the skip link, which is then inside the viewport and visible; activating it puts focus on main#main or inside it; no serious or critical axe violation"
    evidence: test
    command: "yarn test:e2e tests/e2e/footer.spec.ts"
  - id: C3
    statement: "/websites/coded/intake, /websites/privacy and /admin/login render no footer and no skip link"
    evidence: test
    command: "yarn test:e2e tests/e2e/footer.spec.ts"
  - id: C4
    statement: "No file under app/ or components/ imports a footer except app/layout.tsx importing components/site/SiteFooter.tsx, and components/sections/Footer.tsx does not exist"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The footer on / and /about at 390 and 1440, dark and light, matches captures/home/default-* and captures/about/default-*, with Contact for Email and the address beside the domain (D-SITE-130)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-005-site-footer/evidence/footer/"
---

# Contract — SITE-5 site-footer

## Build notes

Wave 1, after SITE-2 (`siteRoutes.contact`, `app/not-found.tsx`). Runs beside the header ticket: the two touch different files except `app/layout.tsx`, where each adds one import.

- **Approach:** `SiteFooter` in `components/site/`, from `components/sections/Footer.tsx`, placed by `app/layout.tsx` inside `SiteChrome` after `children`; `SkipLink` first inside `SiteChrome`, before the header. Each page drops its `Footer` import and gives its `main` `id="main"`; `/work/[slug]` and the not-found page, which have no footer today, gain it from the layout.
- **Decisions that apply:** D-SITE-130: "Site-wide, the header gains "Contact" after Work with me, and the footer's "Email" becomes "Contact" with the address beside the domain; locked pages pick both up as a follow-up, not a redraw." D-SITE-2: "Résumé moves to footer and `/about`." D-SITE-230: "`/websites/platform` takes the site's new header and footer (D-SITE-130); D-SITE-209 binds its body, proven by a golden file." Home build, Access: "Order: skip link, header, …, footer." Services build: "Footer (D-SITE-130): hairline, meta domain · address left, About · Résumé · Contact · GitHub · LinkedIn · Privacy right; wraps under at 390." Overview, Open: "Site-wide, at Technical: no skip link exists today."
- **Interfaces:** `SiteFooter()`, `SkipLink()`; the `#main` target on every public page.
- **Per path:** `components/site/SiteFooter.tsx`, `SkipLink.tsx`: new. `components/sections/Footer.tsx`: deleted. `app/layout.tsx`: both placed. The nine page files and `app/not-found.tsx`: the import dropped, `id="main"` set. `tests/e2e/footer.spec.ts`, `tests/unit/footer-imports.test.ts`.
- **Words:** home-words.md, Chrome: "tayloraucoin.com, the address beside it (D-SITE-130) · About · Résumé · Contact · GitHub · LinkedIn · Privacy"; the address is `SITE.email`; Résumé's accessible name adds "(PDF)" (about-build, Accessible names). The skip link reads "Skip to content" (D-SITE-235); the footer's nav is named "Site" (D-SITE-237).
- **Gotchas:** today every footer sits inside its page's `main` and borrows its column; once it moves out it needs its own, and home's column is 1200 at 1440 while the others are 1080: match the captures, and if one width serves every page, say which at the operator's look. Moving the footer changes `/websites/platform`'s `main` HTML: D-SITE-230 allows it, and the wave 4 golden file must leave the footer out (handed off above). The case study's page renders `main` with no column; give it the id only. A skip link to an element that cannot take focus scrolls without moving focus: C2 checks `document.activeElement`. The spec's token names are the kit's (`--hairline`, `--focus`): map through `.claude/rules/house-design.md`, never invent one.
- **Model:** Sonnet 5.5 at medium, minimum and recommended: mechanical edits across ten files under tight tests. Choosing down risks a page left with its old footer or a second main.
