---
id: SITE-2
size: small
objective: "the overlays and their old pages retire behind permanent redirects, the site's route constants exist in one place, and any unknown URL answers 404 with one not-found block"
slice_type: "routing at the platform boundary; risks a redirect that answers 307, drops the query or swallows the intake tree, and a not-found that answers 200"
non_negotiables:
  - "/stack → /about#tools and /testimonials → /about#testimonials are permanent (Next answers 308) and carry the query string"
  - "Nothing under /websites changes in this ticket: wave 4 owns it (D-SITE-215)"
  - "/services keeps answering 200 until /work-with-me exists: its redirect ships with the Work with me ticket, never before its page"
  - "Unknown paths and unknown or unpublished slugs answer HTTP 404 with the not-found block, never 200"
  - "No route string inline outside lib/routes.ts (the file's own law)"
  - "The intake cookie paths, resume links, Stripe returns and admin link builder are unchanged"
waiver: "Three surfaces, one boundary: overview.md retires the overlays, about-build.md owns the two redirects' criterion and case-study-build.md the site-wide not-found; all three are this site's HTTP answers and share one test file"
devs_call: "The not-found markup within the capture, how redirects are listed in next.config.ts, and siteRoutes' internal shape"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/overview.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/case-study-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/about-build.md"
  - "D-SITE-3"
  - "D-SITE-19"
  - "D-SITE-164"
  - "D-SITE-165"
  - "C-SITE-case-study-7"
  - "C-SITE-about-5"
truth_files: "none: no living UX file exists yet (specs/web/ux/ holds only .gitkeep); the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "lib/routes.ts"
  - "next.config.ts"
  - "app/layout.tsx"
  - "app/not-found.tsx"
  - "app/@modal/**"
  - "app/stack/**"
  - "app/testimonials/**"
  - "app/work/[slug]/page.tsx"
  - "lib/work/resolve.ts"
  - "tests/**"
depends_on: [SITE-1]
out_of_scope:
  - "/services → /work-with-me: the Work with me ticket (wave 3), with its page"
  - "/websites/coded → /websites and the intake prefix split: the /websites ticket (wave 4, D-SITE-215)"
  - "The /about anchors' scroll and focus (C-SITE-about-6): the /about ticket"
  - "Header, footer and skip link: the chrome ticket"
criteria:
  - id: C1
    statement: "GET /stack and /testimonials, with and without ?x=1, answer 308 with Location /about#tools and /about#testimonials, or /about?x=1#tools and /about?x=1#testimonials (C-SITE-about-5)"
    evidence: test
    command: "yarn test:e2e tests/e2e/routes.spec.ts"
  - id: C2
    statement: "GET /services, /websites, /websites/coded and /websites/coded/intake each answer 200 with no Location header, as on main today"
    evidence: test
    command: "yarn test:e2e tests/e2e/routes.spec.ts"
  - id: C3
    statement: "GET /no-such-page and /work/no-such-slug answer 404 with one h1, a link to /work and no serious or critical axe violation (C-SITE-case-study-7)"
    evidence: test
    command: "yarn test:e2e tests/e2e/routes.spec.ts"
  - id: C4
    statement: "resolveStudy(slug, studies, isPublished) returns null for a slug not in the injected studies and for one the injected isPublished rejects, and the study otherwise"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "From home, following a story link opens /work/[slug] as a full page scrolled to the top, with no <dialog> element and no role=dialog other than the consent banner"
    evidence: test
    command: "yarn test:e2e tests/e2e/routes.spec.ts"
  - id: C6
    statement: "siteRoutes returns each public path, caseStudy(slug) builds /work/<slug>, and hidesCallButton is true for /book and every path under /websites and false for /, /work, /about and /work-with-me"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "The not-found block matches captures/case-study/not-found-* at 390 and 1440, light and dark"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-002-routes-and-not-found/evidence/not-found/"
---

# Contract — SITE-2 routes-and-not-found

## Build notes

Wave 1, after SITE-1 (its `yarn test:e2e`). Runs beside SITE-3.

- **Approach:** add `siteRoutes` and `hidesCallButton` to `lib/routes.ts`; add `redirects()` to `next.config.ts` with the two entries; delete `app/stack/`, `app/testimonials/`, `app/@modal/` and the layout's `modal` prop and slot; add `app/not-found.tsx` with the block from the case study's `not-found` captures; pull the slug lookup into `resolveStudy` so the unpublished branch is testable without flipping `WORK_PUBLISHED` (today it holds only `conscious-connections: true`, so no slug is unpublished).
- **Decisions that apply:** D-SITE-3: "Stories open `/work/[slug]` full page, at the top; work overlay retired." Overview: "Retired: `/testimonials` and `/stack` redirect to `/about`, both overlays go (`@modal/(.)stack` and `@modal/(.)work`), and so does the `@modal` slot (D-SITE-3)." D-SITE-22: "`/stack` and `/testimonials` land at their `/about` section." C-SITE-about-5: "a request to `/stack` or `/testimonials` → permanent redirect to `/about#tools` or `/about#testimonials`." D-SITE-19: "`not-found` drawn once on the case study, used site-wide." C-SITE-case-study-7: "An unknown or unpublished slug → HTTP 404 and the not-found block with a link to `/work`." Case-study build: "Not found: its line is the h1"; "Not found is HTTP 404." D-SITE-164 and 165 name `/work-with-me`, `/book`, `/contact`. D-SITE-23 and 167: no header call button on `/book` or the `/websites` routes.
- **Interfaces:** `siteRoutes = { home, work, caseStudy(slug), about, workWithMe, book, contact, capabilities, websites }`; `hidesCallButton(pathname): boolean`; `resolveStudy(slug, studies = caseStudies, isPublished = isWorkPublished)` in `lib/work/resolve.ts` (both injected, so the unit test needs no content import); two permanent redirects; `app/not-found.tsx`.
- **Per path:** `lib/routes.ts`: the two exports; `websiteRoutes` untouched. `next.config.ts`: `redirects()`. `app/layout.tsx`: drop `modal`. `app/not-found.tsx`: the block between header and footer, its line the h1. `app/@modal/**`, `app/stack/**`, `app/testimonials/**`: deleted. `app/work/[slug]/page.tsx`: calls `resolveStudy`, `notFound()` on null. `tests/e2e/routes.spec.ts`, `tests/unit/routes.test.ts`, `tests/unit/resolve.test.ts`.
- **Capture (C7):** `yarn capture --route /no-such-page --keys not-found --expect 404 --out <C7's path>`, compared with `captures/case-study/not-found-*`; record with `yarn contract:record`.
- **Words:** case-study-words.md, "Not found": "This page isn't here." and "See all work". Taylor's drafts: the `[draft]` mark stays until Taylor clears it (D-SITE-185); never improve it.
- **Gotchas:** a carried query lands before the hash, `/about?x=1#tools`; assert the real `Location` (Playwright `request` with `maxRedirects: 0`). `permanent: true` is 308; never set `statusCode`. Before changing anything, confirm C2's four answers on main; if one differs, correct C2 before the ticket starts. `/about#tools` will not scroll to a section until the /about ticket lands. Components only the overlays used (`Overlay`, `PageDismiss`) stay for their page tickets to retire. This ticket proves C-SITE-about-5; the /about ticket cites this one for it and does not re-prove it.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks the 307 or the dropped query, which only an HTTP test sees.
