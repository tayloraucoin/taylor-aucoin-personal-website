# Pre-flight — SITE

> Written by `yarn review:run vigil SITE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 89ebcb461da1bb23b0dc9711298c9b7057bcc929
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-18T05:28:04Z
- tokens_input: 26
- tokens_cache_read: 1167004
- tokens_cache_write: 130185
- tokens_output: 10202
- seconds: 126.1

## Verdicts

- SITE-1: PASS (contract 0bcd185797f7)
- SITE-2: PASS (contract ed3120dc0c6c)
- SITE-3: PASS (contract a162d62739c7)
- SITE-4: PASS (contract 03f78bfa0a18)
- SITE-5: PASS (contract 4f87289ea4da)
- SITE-6: PASS (contract b4de9d945800)
- SITE-7: PASS (contract ee886f6c8f25)
- SITE-8: PASS (contract efddd2a7eed5)
- SITE-9: PASS (contract 342337906184)
- SITE-10: PASS (contract bfcc45969062)
- SITE-11: PASS (contract 785f82e34f16)
- SITE-12: PASS (contract ad878244d4c6)
- SITE-13: PASS (contract 3328f409c2d3)
- SITE-14: PASS (contract 26a80ee9ab7c)
- SITE-15: PASS (contract 822510970a84)
- SITE-16: PASS (contract 5a183c85569a)
- SITE-17: PASS (contract b73d5fcc0af7)
- SITE-18: PASS (contract 7100db40c809)
- SITE-19: PASS (contract 5fdb48fd2440)
- SITE-20: PASS (contract 6c40f85fdda9)
- SITE-21: FAIL (contract b4606bd4ef94)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil SITE`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic SITE in fresh context. Judge only from the files.

Read the brief (specs/web/epics/SITE-public-site-redesign/brief.md), the approved UX proposals under specs/web/epics/SITE-public-site-redesign/ux/, specs/web/epics/SITE-public-site-redesign/technical.md if it exists, and each drafted contract:
- SITE-1: specs/web/epics/SITE-public-site-redesign/tickets/SITE-001-test-harness/contract.md
- SITE-2: specs/web/epics/SITE-public-site-redesign/tickets/SITE-002-routes-and-not-found/contract.md
- SITE-3: specs/web/epics/SITE-public-site-redesign/tickets/SITE-003-analytics-seam/contract.md
- SITE-4: specs/web/epics/SITE-public-site-redesign/tickets/SITE-004-site-header/contract.md
- SITE-5: specs/web/epics/SITE-public-site-redesign/tickets/SITE-005-site-footer/contract.md
- SITE-6: specs/web/epics/SITE-public-site-redesign/tickets/SITE-006-page-close/contract.md
- SITE-7: specs/web/epics/SITE-public-site-redesign/tickets/SITE-007-content-contract/contract.md
- SITE-8: specs/web/epics/SITE-public-site-redesign/tickets/SITE-008-work-derivations/contract.md
- SITE-9: specs/web/epics/SITE-public-site-redesign/tickets/SITE-009-home-hero-and-proof/contract.md
- SITE-10: specs/web/epics/SITE-public-site-redesign/tickets/SITE-010-home-pillars-and-capabilities/contract.md
- SITE-11: specs/web/epics/SITE-public-site-redesign/tickets/SITE-011-home-selected-work/contract.md
- SITE-12: specs/web/epics/SITE-public-site-redesign/tickets/SITE-012-home-lower/contract.md
- SITE-13: specs/web/epics/SITE-public-site-redesign/tickets/SITE-013-notes-signup/contract.md
- SITE-14: specs/web/epics/SITE-public-site-redesign/tickets/SITE-014-work-index/contract.md
- SITE-15: specs/web/epics/SITE-public-site-redesign/tickets/SITE-015-case-study-page/contract.md
- SITE-16: specs/web/epics/SITE-public-site-redesign/tickets/SITE-016-case-study-formats/contract.md
- SITE-17: specs/web/epics/SITE-public-site-redesign/tickets/SITE-017-about-story/contract.md
- SITE-18: specs/web/epics/SITE-public-site-redesign/tickets/SITE-018-about-close/contract.md
- SITE-19: specs/web/epics/SITE-public-site-redesign/tickets/SITE-019-work-with-me/contract.md
- SITE-20: specs/web/epics/SITE-public-site-redesign/tickets/SITE-020-contact/contract.md
- SITE-21: specs/web/epics/SITE-public-site-redesign/tickets/SITE-021-book-screening/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
SITE-1: PASS or FAIL, with the reason
SITE-2: PASS or FAIL, with the reason
SITE-3: PASS or FAIL, with the reason
SITE-4: PASS or FAIL, with the reason
SITE-5: PASS or FAIL, with the reason
SITE-6: PASS or FAIL, with the reason
SITE-7: PASS or FAIL, with the reason
SITE-8: PASS or FAIL, with the reason
SITE-9: PASS or FAIL, with the reason
SITE-10: PASS or FAIL, with the reason
SITE-11: PASS or FAIL, with the reason
SITE-12: PASS or FAIL, with the reason
SITE-13: PASS or FAIL, with the reason
SITE-14: PASS or FAIL, with the reason
SITE-15: PASS or FAIL, with the reason
SITE-16: PASS or FAIL, with the reason
SITE-17: PASS or FAIL, with the reason
SITE-18: PASS or FAIL, with the reason
SITE-19: PASS or FAIL, with the reason
SITE-20: PASS or FAIL, with the reason
SITE-21: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

SITE-1: PASS. Every criterion is a named test that also proves its failure path (the seeded axe violation, the wrong-status exit, the empty-folder and draft-mark failures). It is the first ticket, so it has no dependencies.
SITE-2: PASS. The 308s carry the query, unknown URLs answer 404, the slug lookup is tested with injected data, and there is a not-found capture, all traced to about criterion 5 and case-study criterion 7. The waiver for three surfaces gives its reason.
SITE-3: PASS. It is Q3 with a Warden review criterion. The tests read real GA collect requests for `q` in both the page URL and the referrer, across the ask, declined, GPC and withdrawn states, and the test route answers 404 in production.
SITE-4: PASS. The current-item and event-surface rules are unit-tested, with browser tests for the layout, the hidden call button, the click event and the dark default. It depends on SITE-2 and SITE-3. Its `cites` list is short (Consider 1).
SITE-5: PASS. It proves one footer, one `main#main` and a skip link that really moves focus, across ten pages; no chrome on intake, legal and admin pages; and a unit test that guards the footer import. The `/websites/platform` golden file is handed to wave 4 with a reason.
SITE-6: PASS. All three forms of the close are proven on a test-only route that answers 404 in production: the event, no email or mailto, the 390 layout. The Words note now says the `[draft]` mark comes only from Work with me's props.
SITE-7: PASS. Every new field, the six rows, the slug guard and newest-first order are unit-tested, with typecheck as a check. D-SITE-233 and 238 are applied, and draft marks are kept.
SITE-8: PASS. A pure module over injected data. Its tests cover fallbacks, chips, group order, empty tabs and chips, the `/work` links and the en dash, so `/work` criteria 4 and 9 have an owner.
SITE-9: PASS. It covers the hero, its single primary button, the event, the proof bar as facts rather than big numbers, the consent banner at 390x844, 44px targets and the capture (home criteria 3, 20, 23, 25). The `pillar-open` start gate and the graded headshot are named as pre-build items.
SITE-10: PASS. It covers open, close and focus on Esc; no rating anywhere in the HTML; reduced motion; 44px targets; the three state captures including `pillar-open`; and C8 proving `/capabilities` unchanged against main.
SITE-11: PASS. It covers tabs, chips, See all work's links, story links, the lightbox, empty galleries and See the work's focus target. D-SITE-238 is applied, and SITE-8's logic is cited, not proved again.
SITE-12: PASS. It covers the three lower sections, the whole-page order, the forbidden-name scan, the keyboard walk and the full capture. The launch check for leftover brackets is deferred, as D-SITE-185 allows.
SITE-13: PASS. It is Q3 with Warden and Mason as review criteria. It covers all five `notes-*` states, the bot rules, a listed address that answers exactly like a new one, a migration that touches only the new table, and a database test that fails rather than skips.
SITE-14: PASS. Every `/work` state, the keyboard order and the 2px focus ring in both themes are covered, and the gallery opener is tested on a synthetic row. work-index.md confirms openers belong only to rows without a study.
SITE-15: PASS. It covers section order, absent blocks leaving no trace, one primary button, the testimonial excerpt, Escape doing nothing outside the lightbox, meta descriptions and the state captures. Not-found, the header and `no-testimonial` each have a named owner.
SITE-16: PASS. It covers the four What I built layouts, the lightbox's focus trap and focus return, honest image counts, the 390 layout and the layout captures (case-study criteria 2, 8, 9, 11).
SITE-17: PASS. It covers section order, Experience read from `content/about.ts`, unique link names, dates on their own line at 390, the forbidden-content scan, and the headshot as a manual check, as the spec says.
SITE-18: PASS. It covers Tools, testimonials in full with no tabs, the pending state kept out of production, one primary button, no Cal.com link, the event, the anchor landing (manual, as the spec says) and both captures.
SITE-19: PASS. It covers the 308 with the query carried, the five roles and three building rows, the price line shown once, every note and call link, the event, the open FAQ and the capture. The check on Taylor's prices at launch is deferred.
SITE-20: PASS. Notes go to one recipient with the sender as reply-to, proven against a recording transport. It covers the bot rules, length caps, the sending, offline and sent views, the check that no typed text reaches GA or a URL, and three captures, at Q3 with Warden. It hands the not-a-fit note to SITE-23, which does not exist (Blocking 1).
SITE-21: FAIL. Its ten criteria are sound, but it hands off to "SITE-22 book-handoff" and "SITE-23 book-not-a-fit", and neither exists: no folder and no row in `specs/_status.md`. So services criteria 12, 13, 14 and 18 have no owner, nothing builds `/book/handoff`, and the fit view's button posts to a route no ticket builds.

## Findings

I read the brief, the approved UX files, the `technical/` folder (there is no single `technical.md`), all 21 contracts and `specs/_status.md`. I also read the earlier `_preflight.md`, but only to see which findings it had already closed. The results here come from my own reading of the files. Since the last run, SITE-6's draft-mark ambiguity and SITE-16's start-gate dependency have both been fixed.

### Blocking

**1. SITE-22 (book-handoff) and SITE-23 (book-not-a-fit) are not cut.**
- **No owner for services criteria:**
  - 12: the fit view's call opens Cal.com.
  - 13: not-a-fit keeps the answers and offers no call.
  - 14: the website-or-brand role gets the line to `/websites`.
  - 18: a note sent from not-a-fit stays on `/book` with no call anywhere.
- **No owner for these states:** `screening-not-a-fit`, the website variant, and sent-from-not-a-fit.
- **Unbuilt:** `/book/handoff` and its 303 to Cal.com with `source=site-screening` (D-SITE-225).
- **Why it blocks:**
  - Every "Book a 30-minute call" leads to `/book`. As drafted, a hirer who passes the screening presses a button that goes nowhere.
  - A hirer who doesn't pass reaches "Let's talk first" with no form. That dead-ends the site's one action.
  - SITE-M1 (D-SITE-226) counts Cal.com bookings carrying `source=site-screening`. With no hand-off, it measures nothing.
- **Fix:** cut both, each at Q3 with Warden (D-SITE-227). SITE-22 depends on SITE-21; SITE-23 on SITE-20 and SITE-21.
- **Owner:** whoever cuts the tickets.

**2. D-SITE-222 says "Every ticket is cut now", but wave 4 is not cut.**
- **Still uncut:** the `/websites` (with the `/websites/coded` redirect), `/capabilities` and intake-restyle tickets.
- **Contracts that point at them:** SITE-2, 5, 6, 7 and 10, and D-SITE-234. SITE-3's deferred check also needs `/capabilities` to exist.
- **What I checked:** nothing in `docs/decisions/` or `decisions-14.md` amends D-SITE-222.
- **Fix:** cut wave 4, or have Taylor amend D-SITE-222 on the record to allow cutting wave by wave.
- **Owner:** Taylor, at the Tickets gate.

### Should-fix

None new.

### Consider

1. **SITE-4 `cites`** leaves out C-SITE-home-2, about-3, case-study-6 and websites-coded-2, though its C3 to C6 prove them and other tickets cite SITE-4 for them.
2. **SITE-14 cites work-index criterion 14 to SITE-4,** but SITE-4's click test (C5) never presses the call button on `/work`. Only the unit-tested surface rule covers it.
3. **SITE-16 C4 tests "never autoplays" only with reduced motion on.** Its non-negotiable says the recording never autoplays in any mode.
4. **Services criterion 24** (no draft tags in shipped strings) is claimed only by SITE-19 for `/work-with-me`. The draft strings on `/contact` and `/book` (SITE-20, 21) have no launch-check line.

### Checks a person makes after the build

1. **SITE-12 C8 and SITE-19 C7, at launch:** run `check:build-output` on a `VERCEL_ENV=production` build. No brackets should remain, and both of Taylor's prices should show.
2. **SITE-3:** on a preview with the real GA ID, open `/capabilities?q=sentinel` and press the call button. No `g/collect` request should contain "sentinel", in the page URL or the referrer. Also check in GA4 admin that history-based page views and site search are off.
3. **SITE-13:** Taylor approves running the migration on the local tier (it borrows staging's database). Then submit one address twice in different case: expect one row and identical responses.
4. **SITE-18 C5:** open `/about#tools` and `/about#testimonials` at 1440 and 390. The heading should sit below the header and have focus.
5. **SITE-9 and SITE-17:** the graded headshot must be on file first.
6. **Home tickets (SITE-9 to 13):** none can start until the `pillar-open` crop is drawn and its line is decided (D-SITE-184).

VERDICT: FAIL
