---
id: SITE-21
size: small
objective: "a hirer who presses Book a 30-minute call answers four quick questions at /book and learns, on the same URL, whether a call fits now or a note comes first; the server decides, and nothing typed reaches a URL or GA"
slice_type: "a public POST over personal data with a server-only rule; risks the wrong door, a rule the client can compute, answers in a URL or GA, and a call offered where it was declined"
non_negotiables:
  - "The fit rule runs on the server only, in app/book/_lib/fit.ts, exactly as D-SITE-166: role website-or-brand gives website; budget 15k-75k, over-75k or salary with start this-month or 1-3-months gives fit; anything else not_a_fit"
  - "Client and server share lib/validators/book.ts with data-contract.md's keys and caps; option keys are code, labels copy"
  - "The URL stays /book in every view; no answer, name or email enters a URL on this origin; nothing is stored"
  - "screening_outcome carries outcome only, fired on the action's returned result; no name, email, typed text, budget or start in any event (D-SITE-176, 226)"
  - "Chips are native radios, one checked per group, aria-required, selection shown by border, fill and the 3px mark bar at unchanged width (D-SITE-168, 170, 177)"
  - "No header call button and no current nav item on /book in any view; not-a-fit and website views offer no call anywhere (D-SITE-167)"
  - "A filled honeypot or a submit under two seconds answers not_a_fit and records nothing; sending and errors behave as SITE-20's form (D-SITE-169, 170)"
devs_call: "Component names under app/book/_components/, the action's state shape, the hidden field names the fit view posts, and test file names"
waiver: "One surface, Work with me's /book view, split for the token cap: services.md holds the states, services-build.md layout and access, services-words.md the strings, services-criteria.md the criteria; data-contract.md holds the form contract and decisions-14.md the QA ruling"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-words.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/services-criteria.md"
  - "specs/web/epics/SITE-public-site-redesign/technical/data-contract.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-166"
  - "D-SITE-167"
  - "D-SITE-168"
  - "D-SITE-169"
  - "D-SITE-170"
  - "D-SITE-176"
  - "D-SITE-201"
  - "D-SITE-226"
  - "D-SITE-227"
  - "C-SITE-services-8"
  - "C-SITE-services-9"
  - "C-SITE-services-10"
  - "C-SITE-services-11"
  - "C-SITE-services-15"
  - "C-SITE-services-16"
  - "C-SITE-services-19"
  - "C-SITE-services-20"
  - "C-SITE-services-21"
  - "C-SITE-services-22"
  - "C-SITE-services-23"
  - "C-SITE-services-25"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q3
reviewers: [ warden ]
focus:
  - "The rule and the action: the outcome comes only from the server, the 140 combinations match D-SITE-166, and no answer, name or email reaches a URL, a log line or GA (warden, Q3)"
operator_review: false
planned_paths:
  - "app/book/page.tsx"
  - "app/book/_components/**"
  - "app/book/_actions/**"
  - "app/book/_lib/**"
  - "app/book/_fixtures.ts"
  - "lib/validators/book.ts"
  - "lib/routes.ts"
  - "content/book.ts"
  - "tests/**"
depends_on: [ SITE-20 ]
out_of_scope:
  - "app/book/handoff/route.ts, the 303 to Cal.com and the fit button's book_call_click at screening_fit (C-SITE-services-12's Cal.com half): SITE-22 book-handoff"
  - "The not-a-fit note: prefill, hidden screening answers, the /websites line and sent-from-not-a-fit (C-SITE-services-13, 14, 18): SITE-23 book-not-a-fit"
  - "hidesCallButton itself: proven by SITE-2 and SITE-4; this ticket proves it on the real page"
criteria:
  - id: C1
    statement: "fit() returns, for all 140 budget × start × role combinations, the outcome of a table written from D-SITE-166's text: website-or-brand is always website, and not-sure follows the budget and start rule like any other role"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "The book validator accepts a full answer set with name blank and rejects a missing or unknown budget, start or role, an empty or 2001-character building answer, a name over 100 and a malformed or over-254 email"
    evidence: test
    command: "yarn test"
  - id: C3
    statement: "The action returns fit's outcome for valid input with the first word of the name, field errors and no outcome for invalid input, and not_a_fit for a filled honeypot or a render time under two seconds"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "/book at 390 and 1440 has no header call button and no aria-current nav item in the form, fit and not-a-fit views; each chip group is a fieldset or radiogroup named by its label with aria-required; choosing a chip leaves it the only checked one with its width unchanged and a 3px bar by computed style; Tab enters a group and arrow keys move and select; Name has autocomplete name and Email type and autocomplete email (C-SITE-services-8, 9, 10)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-screening.spec.ts"
  - id: C5
    statement: "Continue with the budget unanswered and the email malformed shows both error lines, aria-invalid and aria-describedby on each, focus on the budget group, and no action request (C-SITE-services-11)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-screening.spec.ts"
  - id: C6
    statement: "A valid Continue past two seconds holds the button at Sending… with aria-busy, not disabled, at 176px or more, and a second press makes no second request; sent offline, the error line shows under the button as role alert with every answer kept and the address as a mailto, and back online Continue reaches an outcome (C-SITE-services-15, 16)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-screening.spec.ts"
  - id: C7
    statement: "A fit answer set shows Let's book it, focused, with the title changed, a Book a 30-minute call button in a POST form to /book/handoff and Rather write first? to /contact; a not-a-fit set and a website-or-brand set show Let's talk first, focused, with no call offered; with Name blank the greeting drops , {first name}; the URL stays /book throughout (C-SITE-services-19, 25)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-screening.spec.ts"
  - id: C8
    statement: "With consent granted, each outcome sends one screening_outcome collect with outcome only; with sentinel name, email and building text, no Google request and no URL on this origin holds a sentinel or a budget or start key; with consent declined or GPC set no request reaches a Google host (C-SITE-services-22, 23)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-screening.spec.ts"
  - id: C9
    statement: "At 390 buttons are at least 44px, chips 36px and inline links 24px tall, with no horizontal scroll; axe reports no serious or critical violation in form, invalid, error, fit and not-a-fit; main has id main and the skip link moves focus into it (C-SITE-services-21)"
    evidence: test
    command: "yarn test:e2e tests/e2e/book-screening.spec.ts"
  - id: C10
    statement: "screening-form, screening-submit and screening-fit, opened by ?state=, match captures/services/ at 390 and 1440, dark and light (C-SITE-services-20)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-021-book-screening/evidence/states/"
  - id: review:warden
    statement: "Warden reviews the rule, the validator and the action"
    evidence: manual
    reason: "A fresh-context specialist review, recorded by yarn review:run warden"
---

# Contract — SITE-21 book-screening

## Build notes

Wave 3, after SITE-20 (the kit's textarea, focus-first-invalid and bot fields; `/contact` for the fit view's link). SITE-22 and SITE-23 follow.

- **Approach:** `app/book/page.tsx` (server) renders a client `ScreeningForm` on `useActionState`, posting to `_actions/screen.ts` (`"use server"`): parse, bot rules, then `fit()`, returning the outcome and the answers. The leaf swaps views on the result, moves focus to the view's H1, sets `document.title` and fires `screening_outcome`. The fit view renders a POST form to `siteRoutes.bookHandoff` with the answers in hidden fields; not-a-fit and website render the "Let's talk first" H1 and intro, and SITE-23 adds the note beneath.
- **Decisions that apply:** D-SITE-166: the rule above. D-SITE-167 to 170: as the non-negotiables. D-SITE-201: Name optional; the greeting uses its first word. D-SITE-176, 226: `screening_outcome` {outcome}. D-SITE-227: Q3 with Warden.
- **Interfaces:** `bookSchema`, `BookInput`, `Outcome` in `lib/validators/book.ts`; `fit(input): Outcome` in `app/book/_lib/fit.ts`, pure; `siteRoutes.bookHandoff` (`/book/handoff`) in `lib/routes.ts`; `screening-form`, `screening-submit`, `screening-fit` in `/book`'s States list from `app/book/_fixtures.ts`, synthetic (`@example.test`, never the canvas's Sam).
- **Per path:** `content/book.ts`: the strings. `tests/unit/fit.test.ts` (the table), `tests/unit/book*.test.ts`, `tests/e2e/book-screening.spec.ts`.
- **Words:** services-words.md, `/book`, as written; `[draft]` marks stay; tests match with or without them. The start, role and building error lines are Taylor's to write: render a bracketed `[Taylor's line]` in their place.
- **Gotchas:** write C1's table from D-SITE-166's sentence, never from `fit.ts`. `fit.ts` starts with `import "server-only"`, so a client import fails the build. The fit button posts to SITE-22's route: assert the form's method and action, not the landing. A server action fails offline by throwing in the client (SITE-13). Read real collect requests with the fake-ID build and SITE-1's opt-in, as SITE-4. Capture: `yarn capture --route /book --keys screening-form,screening-submit,screening-fit --out <C10's path>`.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a rule copied into the client or a table written from the code it tests.
