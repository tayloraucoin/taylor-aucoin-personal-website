---
id: SITE-3
size: small
objective: "GA4 receives only the three named events with closed parameter sets, and no hit (page view or event) carries q in its page URL or referrer"
slice_type: "analytics seam at a third-party boundary; risks personal data or the filter query reaching GA, which cannot be recalled once collected"
non_negotiables:
  - "track() sends only the registry's three events, only their listed parameters, and only values from each parameter's closed set; anything else is dropped, never sent"
  - "No string parameter is free text: never a name, an email, typed text, the filter query, the budget or start answers (D-SITE-176)"
  - "Gtag loads with send_page_view false; PageViews sends every page view, the first included; every hit's page_location and page_referrer have q removed and keep tab (D-SITE-179)"
  - "No Google request in the ask state, after a decline, with GPC set, or after consent is withdrawn on /privacy"
  - "Intake, legal and admin paths stay unmeasured, as today (M-INT-10)"
  - "Tests never send a hit to Google: collect requests are intercepted and answered locally"
  - "coded_intake_start does not exist (D-SITE-226)"
devs_call: "How gtag is loaded once @next/third-parties' GoogleAnalytics is replaced, the registry's TypeScript shape, and file names under tests/"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-226"
  - "D-SITE-176"
truth_files: "none: no living UX file exists yet; analytics changes nothing a visitor sees"
qa: Q3
reviewers: [warden]
focus:
  - "track(), stripQuery and the page_location set before each hit: every non-enum value, unknown parameter and q variant dropped; no hit carries q in dl or dr (warden, Q3)"
operator_review: false
planned_paths:
  - "lib/analytics/events.ts"
  - "lib/analytics/location.ts"
  - "components/analytics/Analytics.tsx"
  - "components/analytics/PageViews.tsx"
  - "lib/work/published.ts"
  - "app/test-harness/analytics/page.tsx"
  - "docs/measurement/metrics/definitions.md"
  - "tests/**"
depends_on: [SITE-1]
out_of_scope:
  - "Firing book_call_click from BookCallLink: the chrome ticket; screening_outcome and contact_note_sent: the /book and /contact ticket"
  - "The GA4 custom dimensions and turning off enhanced form interactions: Taylor's, in GA4 admin (D-SITE-226)"
  - "The consent banner's look and regimes, unchanged"
criteria:
  - id: C1
    statement: "stripQuery removes every q parameter (repeated, empty, percent-encoded key) from a URL and keeps tab, every other parameter, the path and the hash"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "track() drops an unknown parameter, a value outside its closed set, a slug that is not a published case study, and a slug on any surface but case-study; it drops the whole event when a required parameter is missing or the event name is unknown at runtime; it sends nothing before the tag has loaded"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "With consent granted and real gtag.js loaded, opening /?q=sentinel&tab=x sends exactly one page_view collect request, whose dl has tab=x and no q, and no collect request holds sentinel anywhere in its URL or body"
    evidence: test
    command: "yarn test:e2e tests/e2e/analytics.spec.ts"
  - id: C4
    statement: "A client navigation to a different path with ?q=sentinel sends one more page_view without q in dl or dr; a full load whose referrer is /?q=sentinel sends dr without q; on the analytics test route, after history.replaceState adds ?q=sentinel, its button's track() call sends a collect request with no q in dl or dr"
    evidence: test
    command: "yarn test:e2e tests/e2e/analytics.spec.ts"
  - id: C5
    statement: "No request leaves for any Google host across two page loads in each of: the ask state with no choice made, consent declined, GPC set, and after withdrawing consent through the /privacy control (then a navigation and a track() call)"
    evidence: test
    command: "yarn test:e2e tests/e2e/analytics.spec.ts"
  - id: C6
    statement: "With consent granted, loading an intake, a legal and an admin login path makes no request to any Google host"
    evidence: test
    command: "yarn test:e2e tests/e2e/analytics.spec.ts"
  - id: C8
    statement: "The analytics test route calls notFound() when isProductionDeployment() is true (helper injected), and PUBLISHED_SLUGS equals the slugs of content/work's published studies"
    evidence: test
    command: "yarn test"
  - id: C7
    statement: "docs/measurement/metrics/definitions.md holds SITE-M1 v1: Cal.com bookings carrying source=site-screening, over book_call_click at placement screening_fit (a unit test reads the file for each part)"
    evidence: test
    command: "yarn test"
  - id: review:warden
    statement: "Warden reviews the seam: no personal data, free text or q can reach GA through track(), PageViews or the gtag config"
    evidence: manual
    reason: "A fresh-context specialist review, recorded by yarn review:run warden"
---

# Contract — SITE-3 analytics-seam

## Build notes

Wave 1, after SITE-1 (its `yarn test:e2e`). Runs beside SITE-2. The chrome and `/book` tickets call `track()`; this ticket only builds it.

- **Approach:** a typed registry in `lib/analytics/events.ts` (`EVENTS`: each event's parameters and allowed values) and `track(name, params)`, which filters, then calls `gtag('set', { page_location, page_referrer })` from `stripQuery` and `gtag('event', …)` only when the tag is live. `stripQuery(href)` in `lib/analytics/location.ts`. Replace `<GoogleAnalytics>` in `Analytics.tsx` with a `next/script` gtag load whose config sets `send_page_view: false` and a stripped `page_location` and `page_referrer`; `PageViews` sends the first page view too (ref seeded with null; still Strict Mode safe by path) and sets both fields before each.
- **Decisions that apply:** D-SITE-226: "Events are D-SITE-176's three with closed parameter sets (`technical/data-contract.md`); `coded_intake_start` is dropped. Gtag loads with `send_page_view: false` and every page view is sent with `q` stripped. SITE-M1 v1 counts Cal.com bookings carrying `source=site-screening`; `book_call_click` at `screening_fit` is its denominator." D-SITE-176: "Never in a payload or a URL GA sees: a name, an email, typed text, the filter query, the budget or start answers." D-SITE-179: "`q` is stripped from `page_location` site-wide before any page view; `tab` stays."
- **The registry:** data-contract.md's Events table, exactly: three events, each parameter's closed set; `slug` on case-study only, a published slug; `contact_note_sent` fires on the server's confirmation (its caller's rule).
- **The trigger:** nothing calls `track()` until the chrome ticket, so `app/test-harness/analytics/page.tsx` renders one button that calls `track("book_call_click", { surface: "home", placement: "hero" })` through the real seam (never `gtag` directly) and a link to another path; it answers 404 when `isProductionDeployment()` is true (SITE-1's helper), so it never ships. C4 and C5 drive it.
- **Interfaces:** `track<E extends EventName>(name: E, params: EventParams<E>): void`; `stripQuery(href: string): string`; `EVENTS`; `PUBLISHED_SLUGS` in `lib/work/published.ts`, a slug-only list, so `events.ts` (imported by client leaves) never pulls `content/work` copy and images into every page's bundle.
- **Per path:** `lib/analytics/events.ts`, `location.ts`: the seams (new folder). `components/analytics/Analytics.tsx`: the gtag load; the gate, `setGaDisabled` and cookie clearing kept. `PageViews.tsx`: first view and the stripped fields. `docs/measurement/metrics/definitions.md` (Taylor's ruling at the Tickets gate; changelog 2026-10-16): SITE-M1 v1 from `definitions.template.md`, companion and denominator from `technical/doors-and-calls.md` C5. `tests/unit/analytics.test.ts`, `tests/unit/definitions.test.ts`, `tests/e2e/analytics.spec.ts`.
- **Gotchas:** gtag.js adds the page URL (`dl`) and referrer (`dr`) to every hit, events included, and `/capabilities` will put `q` in the URL by `replaceState`; only a `set` before each hit keeps it out, so the tests read the real collect requests, never only `dataLayer`. Load real gtag.js in the test: `googletagmanager.com/gtag/js` passes through, `**/g/collect**` and every other Google host are intercepted with `page.route` and answered 204 locally, and the spec first asserts gtag.js loaded with the fake ID; if the browser cannot fetch gtag.js, the spec fails, never skips. `@next/third-parties`' `GoogleAnalytics` takes no config parameters, so `send_page_view: false` needs our own script. With no `NEXT_PUBLIC_GA_ID` the gate renders nothing: the e2e build sets a fake ID. `start:agent` runs in production mode, where `middleware.ts` ignores `DEV_GEO_OVERRIDE` and rewrites the regime cookie: reach the ask state by sending `x-vercel-ip-country: DE` from Playwright (the real regime table), never by editing `lib/config.ts` or `isDev()`. A `granted` value under the consent storage key reaches load. Build with `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent` before this spec (SITE-1's build list); the test route 404s on the production build. `/test-harness/analytics` is a test-only literal in the page and spec, the one exception to `lib/routes.ts` (SITE-2 owns that file). `PUBLISHED_SLUGS` restates the slugs once, guarded by C8's equality test. `page.goto(url, { referer })` sets `document.referrer` for the full-load case.
- **For Taylor after the build (deferred):** on a preview with the real ID, `/capabilities?q=sentinel` then the call button: no `g/collect` request holds `sentinel`, `dl` and `dr` included. Also in GA4 admin: history-event page views and site search are off. Recorded `--verdict deferred` once `/capabilities` exists.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a filter that checks names but not values, or a strip on page views only.
