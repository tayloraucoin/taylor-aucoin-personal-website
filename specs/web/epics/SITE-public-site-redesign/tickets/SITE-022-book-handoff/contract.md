---
id: SITE-22
size: small
objective: "a hirer whose screening fits presses Book a 30-minute call and lands on Taylor's Cal.com page with their name, email and what they're building already filled in; the server re-checks the fit, and nothing they typed reaches a URL on this origin or GA"
slice_type: "a public POST route handler that hands personal data to a third party; risks a forged or tampered hand-off reaching Cal.com, answers in a URL on this origin or GA, and a redirect target taken from input"
non_negotiables:
  - "app/book/handoff/route.ts accepts POST only; it re-parses with lib/validators/book.ts and re-runs fit() from app/book/_lib/fit.ts; only a fit answers 303 to Cal.com (D-SITE-225)"
  - "The 303's origin and path are BOOKING_URL's from lib/config.ts, never from input; the query is Cal.com's prefill: name (omitted when blank), email, notes (the What are you building? text), metadata[source]=site-screening and metadata[role] (the role key), nothing else"
  - "Invalid, tampered, not_a_fit or website input answers 303 to /book with no query; nothing is stored and no field reaches a log line"
  - "No name, email, typed text, budget or start enters a URL on this origin; the answers ride only in the POST body"
  - "The fit button fires book_call_click through track() with surface services and placement screening_fit only, on press, before the navigation (D-SITE-176, 226)"
devs_call: "The pure URL builder's name and file under app/book/_lib/, how the button awaits the event, the route's response headers beyond Location, and test file names"
waiver: "One surface, Work with me's /book fit hand-off, split for the token cap: services.md holds the fit state, services-criteria.md the event and criteria; data-contract.md holds the hand-off contract and decisions-14.md the prefill ruling"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-criteria.md"
  - "specs/web/epics/SITE-public-site-redesign/technical/data-contract.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-166"
  - "D-SITE-176"
  - "D-SITE-225"
  - "D-SITE-226"
  - "D-SITE-227"
  - "C-SITE-services-12"
  - "C-SITE-services-22"
  - "C-SITE-services-23"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q3
reviewers: [ warden ]
focus:
  - "The route handler: only a server-confirmed fit reaches Cal.com, the target never comes from input, and no answer reaches a URL on this origin, a log line or GA (warden, Q3)"
operator_review: false
planned_paths:
  - "app/book/handoff/route.ts"
  - "app/book/_lib/**"
  - "app/book/_components/**"
  - "tests/**"
depends_on: [ SITE-21 ]
out_of_scope:
  - "The fit rule, the validator, the fit view and its POST form's fields: SITE-21; cite, never re-prove"
  - "The not-a-fit note and the website line (C-SITE-services-13, 14, 18): SITE-23 book-not-a-fit"
  - "Analytics on the Cal.com event type: none is installed (D-SITE-225); installing one reopens the ruling, outside any ticket"
criteria:
  - id: C1
    statement: "The URL builder, given a fit answer set, returns BOOKING_URL's origin and path with name, email, notes, metadata[source]=site-screening and metadata[role], each URL-encoded, and no other parameter; with name blank it carries no name parameter"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The route's POST, called with a form body: a fit set answers 303 to C1's URL; a set that re-runs to not_a_fit or website, a missing or unknown chip key, a malformed email or an empty body each answer 303 to /book with no query; no response's Location host is other than Cal.com's or this origin's"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "GET /book/handoff answers 405 and never redirects to Cal.com"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-handoff.spec.ts"
  - id: C4
    statement: "With sentinel name, email and building text, a fit set's Book a 30-minute call sends one POST to /book/handoff and reaches the Cal.com host (stubbed) with the sentinels as name, email and notes; no navigation or request URL on this origin holds a sentinel, budget or start key, and the page URL on this origin is only ever /book (C-SITE-services-12)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-handoff.spec.ts"
  - id: C5
    statement: "With consent granted, the press sends one book_call_click collect with surface services and placement screening_fit only, and no Google request holds a sentinel or the Cal.com URL's query; with consent declined or GPC set no request reaches a Google host (C-SITE-services-22, 23)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-handoff.spec.ts"
  - id: review:warden
    statement: "Warden reviews the route handler, the URL builder and the button's event"
    evidence: manual
    reason: "A fresh-context specialist review, recorded by yarn review:run warden"
---

# Contract — SITE-22 book-handoff

## Build notes

Wave 3, after SITE-21 (the fit view, its POST form to `siteRoutes.bookHandoff` with the answers in hidden fields, `bookSchema`, `fit()`). SITE-23 book-not-a-fit is independent of this.

- **Approach:** `app/book/handoff/route.ts` exports `POST` only: read `formData`, parse with `bookSchema`, run `fit()`; a fit answers `NextResponse.redirect(url, 303)` to a pure builder in `app/book/_lib/` (`import "server-only"`); everything else 303 to `siteRoutes.book`. The fit view's submit button (SITE-21's component) gains `track("book_call_click", { surface: "services", placement: "screening_fit" })` on press.
- **Decisions that apply:** D-SITE-225: 303 to Cal.com with name, email, the building text, the role and `source=site-screening`; Taylor confirmed no analytics app on that event type. D-SITE-226: SITE-M1 counts bookings carrying `source=site-screening`; `book_call_click` at `screening_fit` is its denominator. D-SITE-227: Q3 with Warden.
- **Interfaces:** the route `POST /book/handoff`; the builder `(input: BookInput) => URL`. No new route constant: `siteRoutes.bookHandoff` exists (SITE-21).
- **Per path:** `tests/unit/handoff*.test.ts` (C1, C2), `tests/e2e/book-handoff.spec.ts` (C3 to C5).
- **Gotchas:** check Cal.com's prefill parameter names against its docs before writing C1's test. Build with `URL` and `searchParams.set`, never string concatenation. Stub the Cal.com host with `page.route` so e2e stays offline; read the 303 with `maxRedirects: 0` in C2-style checks. A form submit unloads the page: gtag must send by beacon, and the button must not wait on the event longer than a short timeout. Read real collect requests with the fake-ID build and SITE-1's opt-in, as SITE-4. Route handlers get no server-action origin check; the target is fixed, so a forged POST only sends its own sender to Cal.com.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a redirect target read from the form or a fit trusted from the hidden fields.
