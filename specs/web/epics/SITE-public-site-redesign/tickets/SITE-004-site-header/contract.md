---
id: SITE-4
size: small
objective: "every page with chrome opens dark under one header, Work, About, Work with me and Contact with the current page marked, and one Book a 30-minute call to /book that fires book_call_click, absent at 390 and wherever hidesCallButton is true"
slice_type: "shared chrome and the first caller of track(); risks a call button on a page that hides it, a click that sends a field outside the registry, and a header that differs per page"
non_negotiables:
  - 'One label, "Book a 30-minute call", always to siteRoutes.book, never to Cal.com directly (A-17, D-SITE-165); the only other label BookCallLink accepts is the /websites ticket''s "Book a call first" (D-SITE-210), by type'
  - "BookCallLink sends book_call_click only through SITE-3's track(), with surface, placement and, on a case study, slug; it never calls gtag; the link works with or without consent"
  - "No header call button at 390 (D-SITE-180) or where hidesCallButton(pathname) is true (D-SITE-23, 167)"
  - "The current item carries aria-current and the 2px mark underline at both widths; Work is current on /work and every /work/[slug]; no item is current on / or /book"
  - "Every href comes from siteRoutes or SITE; no new dependency"
  - "The header stays hidden on intake, legal and admin paths, as SiteChrome does today"
  - "With no stored choice the site renders dark whatever the system prefers; light only after the toggle (D-SITE-61)"
devs_call: "The breakpoint between 390 and 1440 where the call button appears (no overflow at 834), Button's internal shape, the nav's markup within the captures, and test file names"
waiver: "Site chrome, one component on every page: overview.md's Navigation defines it, and home-build.md holds its drawn layout and its criteria; the other pages' header and footer criteria are proven once here and cited by their tickets"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/overview.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/home-build.md"
  - "D-SITE-2"
  - "D-SITE-61"
  - "D-SITE-130"
  - "D-SITE-167"
  - "D-SITE-176"
  - "C-SITE-home-4"
  - "C-SITE-home-20"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "components/site/**"
  - "components/ui/SiteHeader.tsx"
  - "components/ui/Button.tsx"
  - "app/layout.tsx"
  - "tests/**"
depends_on: [SITE-2, SITE-3]
out_of_scope:
  - "The footer, the skip link and main's id: the footer ticket"
  - "Hero, close and in-body call buttons: the close ticket and each page ticket place BookCallLink with their own placement"
  - "The /book and /contact pages: /work-with-me and /contact answer 404 on the branch until the Work with me ticket (wave 3)"
  - "tabVariants and chipVariants: the home and /work tickets"
criteria:
  - id: C1
    statement: "currentNavItem returns work for /work and /work/any-slug, about for /about, work-with-me for /work-with-me and /services, contact for /contact, and null for /, /book, /privacy and /no-such-page"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "headerCallSurface returns home, work-index, about, services (for /work-with-me, /services and /contact) and capabilities for their paths, case-study with the slug for /work/<slug>, and null for /privacy and /no-such-page"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "At 1440 on /, /about, /services and /work/conscious-connections the header holds the wordmark link to /, then Work, About, Work with me and Contact linking to their siteRoutes, then one Book a 30-minute call link to /book, then the theme toggle; the current item (none on /) has aria-current and a 2px underline by computed style; no Résumé link; no serious or critical axe violation (C-SITE-home-4, C-SITE-about-3)"
    evidence: test
    command: "yarn test:e2e tests/e2e/header.spec.ts"
  - id: C4
    statement: "At 390 on / and /about the header has no call button and its nav sits below the wordmark and toggle row; at 1440 /websites, /websites/coded and /websites/platform have Contact and no call button; /websites/coded/intake, /websites/privacy and /admin/login render no header (C-SITE-websites-coded-2)"
    evidence: test
    command: "yarn test:e2e tests/e2e/header.spec.ts"
  - id: C5
    statement: "With consent granted, pressing the header call button on /about sends one book_call_click collect request with surface about, placement header and no other event parameter, and on /work/conscious-connections adds slug conscious-connections; with consent declined it sends no request to any Google host; both navigate to /book (C-SITE-home-20, C-SITE-case-study-6)"
    evidence: test
    command: "yarn test:e2e tests/e2e/header.spec.ts"
  - id: C6
    statement: "With nothing stored under ta-theme and the browser preferring light, / renders with the dark ground; after choosing Light in the toggle and reloading, it renders light"
    evidence: test
    command: "yarn test:e2e tests/e2e/header.spec.ts"
  - id: C7
    statement: "The header on / and /about at 390 and 1440, dark and light, matches captures/home/default-* and captures/about/default-*, with Contact after Work with me (D-SITE-130)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-004-site-header/evidence/header/"
---

# Contract — SITE-4 site-header

## Build notes

Wave 1, after SITE-2 (`siteRoutes`, `hidesCallButton`) and SITE-3 (`track()`). Runs beside the footer ticket; the close ticket follows this one.

- **Approach:** move `SiteHeader` to `components/site/` as a server shell holding the wordmark home link and a client leaf, `HeaderNav`, which reads `usePathname` for the current item and the call button. Two pure functions decide both, so the rules are unit-tested, not inferred from the DOM. `BookCallLink` is the one call link on the site: it renders a `next/link` to `siteRoutes.book` and calls `track("book_call_click", …)` on click. `Button.tsx` holds the looks the header and the close need: primary and ghost, small and default.
- **Decisions that apply:** D-SITE-2: "Header as above; Résumé moves to footer and `/about`." Overview, Navigation: "wordmark · Work · About · Work with me · Contact (D-SITE-130) · the call button to `/book` (hidden on `/book` and `/websites`, D-SITE-167, 23) · the theme toggle." D-SITE-180: "At 390 the header is two rows (wordmark and theme toggle, then the nav, which gains Contact at build per D-SITE-130) with no call button." D-SITE-167: "The header's call button is hidden on `/book` (form, fit and not-a-fit), as on `/websites` (D-SITE-23)." Services build: "On `/book` the call button is gone at every width and no nav item is current." D-SITE-61: "The site opens in dark and stays dark until the visitor toggles to light." D-SITE-176: `book_call_click` {surface, placement, slug?}. About build: "the header's current-page mark (2px `--mark` underline, `aria-current`, both widths)."
- **Interfaces:** `currentNavItem(pathname): "work" | "about" | "work-with-me" | "contact" | null` and `headerCallSurface(pathname): { surface; slug? } | null` in `components/site/nav.ts`. `BookCallLink({ surface, placement, slug?, variant, label? })`, where `surface` may be null: the link renders and no event is sent. `buttonVariants({ variant, size })` in `components/ui/Button.tsx`.
- **The rules:** current item: `/work` and `/work/*` → work; `/about` → about; `/work-with-me` and today's `/services` → work-with-me; `/contact` → contact; anything else → none. Header surface: `/` home; `/work` work-index; `/work/<slug>` case-study with that slug; `/about` about; `/work-with-me`, `/services`, `/contact` services; `/capabilities` capabilities; any other path (`/privacy`, a 404) → null, so no event: the registry's surfaces are closed (D-SITE-226), and a value outside them is dropped by `track()` anyway.
- **Per path:** `components/site/SiteHeader.tsx`, `HeaderNav.tsx`, `BookCallLink.tsx`, `nav.ts`. `components/ui/SiteHeader.tsx`: deleted. `components/ui/Button.tsx`: the looks. `app/layout.tsx`: the import. `tests/unit/nav.test.ts`, `tests/e2e/header.spec.ts`.
- **Words:** home-words.md, Chrome: "Taylor Aucoin · Work · About · Work with me · Contact" and "Book a 30-minute call"; the toggle keeps its name, "Theme". The nav's accessible name: "Main" (D-SITE-236).
- **Gotchas:** today's header has Résumé and a gold "Work with me"; both go (Résumé reaches the footer in its ticket). The spec names tokens (`--mark`, `--fill`, `--on-fill`, `--focus`) by the kit's names; `app/globals.css` names them its own way: map through `.claude/rules/house-design.md`, and stop and ask before inventing one. Home's column is 1200 at 1440 and the other pages' 1080: align the header to the captures; if it takes one width everywhere, say which at the operator's look. The event criterion reads real collect requests: build with the fake ID (`NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent`) and opt into real gtag.js through SITE-1's shared fixture, as SITE-3's spec does; a GA4 event parameter arrives as `ep.<name>`. Pressing the call button on the branch lands on a 404 until wave 3: assert the URL, not the status. `track()` already drops an unpublished slug; pass the path's slug as it is.
- **Nav name:** "Main" on every page (D-SITE-236, the Tickets gate; it replaces the case-study build's "Primary").
- **Other surfaces' criteria:** the header is one component, so its part of C-SITE-about-3, case-study-6 and websites-coded-2 is proven here; those page tickets cite this one and do not re-prove it.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a surface table that guesses and a call button shown at 834 over the nav.
