# Pre-flight — SITE

> Written by `yarn review:run vigil SITE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 466ce10082f44a81ac953e693c79e0efb2d8d42b
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-18T19:30:17Z
- tokens_input: 48
- tokens_cache_read: 2905389
- tokens_cache_write: 165183
- tokens_output: 19323
- seconds: 222.7

## Verdicts

- SITE-1: PASS (contract a8cb9ee492c6)
- SITE-2: PASS (contract ed3120dc0c6c)
- SITE-3: PASS (contract a162d62739c7)
- SITE-4: PASS (contract 03f78bfa0a18)
- SITE-5: PASS (contract 4f87289ea4da)
- SITE-6: PASS (contract b4de9d945800)
- SITE-7: PASS (contract 5ca4cc3fcdde)
- SITE-8: PASS (contract efddd2a7eed5)
- SITE-9: PASS (contract 13daf18b4eff)
- SITE-10: PASS (contract bb868f8c4277)
- SITE-11: PASS (contract bca60cc383b6)
- SITE-12: PASS (contract fd3c3e1cbd66)
- SITE-13: PASS (contract f3420a026aaa)
- SITE-14: PASS (contract 675ce63bfa86)
- SITE-15: PASS (contract 419d15c47b6d)
- SITE-16: PASS (contract 862e2a9e6a0f)
- SITE-17: PASS (contract dc7b3985b534)
- SITE-18: PASS (contract 7100db40c809)
- SITE-19: PASS (contract 3ba6b69ab426)
- SITE-20: PASS (contract 4ce78ff7cc70)
- SITE-21: PASS (contract 88924ae21c93)
- SITE-22: PASS (contract 2e4980021759)
- SITE-23: PASS (contract 67b063128027)
- SITE-24: PASS (contract f1c0480e040e)
- SITE-25: PASS (contract daff4eedf723)
- SITE-26: FAIL (contract 866b7f6de626)

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
- SITE-22: specs/web/epics/SITE-public-site-redesign/tickets/SITE-022-book-handoff/contract.md
- SITE-23: specs/web/epics/SITE-public-site-redesign/tickets/SITE-023-book-not-a-fit/contract.md
- SITE-24: specs/web/epics/SITE-public-site-redesign/tickets/SITE-024-websites-route/contract.md
- SITE-25: specs/web/epics/SITE-public-site-redesign/tickets/SITE-025-websites-page/contract.md
- SITE-26: specs/web/epics/SITE-public-site-redesign/tickets/SITE-026-capabilities-page/contract.md

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
SITE-22: PASS or FAIL, with the reason
SITE-23: PASS or FAIL, with the reason
SITE-24: PASS or FAIL, with the reason
SITE-25: PASS or FAIL, with the reason
SITE-26: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

SITE-1: PASS: each proof is built to fail when it should: a runner that finds no tests, an axe helper that never fails, a build-output scan over an empty folder. Browser tests stay on :4310, and C6 proves the `@/` alias and the `server-only` stub.
SITE-2: PASS: the two 308s are tested with and without a query, unknown paths and slugs answer 404 with one h1, and `resolveStudy` is tested on injected data. The waiver gives its reason, and the `/services` and `/websites/coded` lines are handed to SITE-19 and SITE-24, which both exist.
SITE-3: PASS: Q3 with Warden. The tests read the real collect requests for `q` in `dl` and `dr`, cover the ask, declined, GPC and withdrawn states, keep the test route out of production and check the SITE-M1 definition. Its deferred `?q=` check depends on SITE-27, which isn't cut (Consider 3).
SITE-4: PASS: the current-item and call-surface rules are unit-tested. The browser tests cover the 1440 and 390 layouts, the hidden call button on `/websites` and `/book`, the event's closed fields and the dark default. It proves the header part of other pages' criteria once.
SITE-5: PASS: one footer outside one `main#main` on ten pages, a skip link that moves focus, hidden chrome on intake, legal and admin pages, and an import guard. The golden-file handoff to SITE-24 is stated.
SITE-6: PASS: all three close forms are tested on a route that answers 404 in production: the event, no email address or mailto, the 390 rows and targets, and one primary per form.
SITE-7: PASS: unit tests cover each new field's shape, the six rows and their slug guard, aiSat on Conscious Connections only (D-SITE-233), the formats (D-SITE-91, 193, 232) and newest-first order, plus a typecheck.
SITE-8: PASS: a pure module over injected data that owns work-index-4 and 9. It tests the fallbacks, chips, group order, empty tabs and chips, and `workHref`. C2's wording has small faults (Consider 4).
SITE-9: PASS: tests cover one hero primary with its event, the proof bar as a ledger, the banner at 390x844 via the real regime table, 44px targets and the skip-link target. The `pillar-open` gate and the headshot are named as pre-build items.
SITE-10: PASS: pillars and chips open in place with focus kept or returned on Esc, no rating reaches the HTML, reduced motion is tested, and the three states plus an unchanged `/capabilities` are captured.
SITE-11: PASS: the tabs follow the ARIA pattern with arrow keys, the chips use `aria-pressed`, See all work carries the filter, story links show only for published slugs, empty galleries render no frame, and See the work moves focus. SITE-8's logic is cited, not re-proven.
SITE-12: PASS: covers the three lower sections, the whole-page order, the name scan read from the legacy naming folder, the keyboard walk, the full capture, and the launch bracket check deferred to launch.
SITE-13: PASS: Q3 with Warden and Mason. All five `notes-*` states, the bot rules, a listed address answered byte for byte like a new one, a migration that creates only its own table, a database test that fails rather than skips, and no address in a URL or a Google request.
SITE-14: PASS: every `/work` view, chips as links holding focus and scroll, reload stability, described repeated links, the fixture-backed gallery opener, the name scan and the launch check (deferred, since `/work` renders per request).
SITE-15: PASS: block order, absent blocks leaving no trace, one primary with its event, Escape, meta descriptions, the 390 rules and the skip-link target, on every published study.
SITE-16: PASS, with Should-fix 1: the four What I built formats chosen by `builtFormat`, the lightbox focus trap and return, an honest All n images count, no autoplay, and the captures. It contradicts itself on when the D-SITE-196 re-export must land.
SITE-17: PASS: section order, Experience read from `content/about.ts` (D-SITE-197), link names unique by row, dates on their own line at 390, the forbidden-content scan, and the headshot as a manual pre-build check.
SITE-18: PASS: Tools from core items only, four full testimonials with no tabs, the pending card kept out of production, one primary, no Cal.com link, the event, the anchor landing (manual, as about-6 asks) and both captures.
SITE-19: PASS: the 308 that keeps the query, five role rows and three building rows, the price line once, note and call links, both events, the open FAQ, the skip-link target, and the prices as a deferred launch check (D-SITE-203).
SITE-20: PASS: Q3 with Warden. A recording transport proves the ops address is the only recipient and the sender is reply-to. Tests cover the caps, the bot rules, sending, offline, sent, the mailto in every form state, sentinel checks on the wire, and both events.
SITE-21: PASS: Q3 with Warden. All 140 combinations are checked against a table written from D-SITE-166's text, not from the code. Tests also cover the native-radio chips, focus on the first invalid field, no call button or current item on `/book`, the URL staying `/book`, and sentinel checks.
SITE-22: PASS: Q3 with Warden. POST only, re-validates and re-runs the fit, takes the target from `BOOKING_URL`, answers 303 to `/book` on tampered input and 405 to GET, and runs the sentinel checks against a stubbed Cal.com host.
SITE-23: PASS: Q3 with Warden. The prefill and hidden screening answers, the `/websites` line whatever the budget and start, no call anywhere including after sending, sent staying on `/book`, the carried render time, and the three captures.
SITE-24: PASS: an exact-path 308 that keeps the query, the intake start and resume routes pinned to what `main` builds, the chooser deleted, a golden file taken from `main` with the footer removed and proven to catch a one-word change. Last run's Should-fix (C4 tripping on comments) is fixed: comments are now excluded.
SITE-25: PASS: last run's Blocking is fixed. C1 now scans only `app/websites/page.tsx`, `_components/**` and the five shared components, string literals and JSX text only, and the description moves into content. I checked `components/websites/`: every `$` amount there sits in a comment. Tests cover one label per destination, the published-row rule, the FAQ, the event and the golden file after each change.
SITE-26: FAIL: the surface's `filtered` and `filter-empty` states and C-SITE-capabilities-3, 4, 6, 11, 12, 13, 15, 16 and 17 are handed to SITE-27, and SITE-27 has no contract. Its filter field, no-match path, status region and `?q=` analytics boundary are covered by no ticket that exists.

## Findings

I read the brief, `decisions-14.md`, the build files' criteria tables for every surface, the states tables for home, Work with me and capabilities, the events table in `technical/data-contract.md`, and all 26 contracts. There is no single `technical.md`; the `technical/` folder stands in for it. I also checked the repo for the SITE-25 dollar scan and for the tier SITE-20's mail transport resolves to.

Every criterion in the home, about, case-study, Work with me, work-index, websites and websites-coded tables is claimed by at least one drafted ticket, with header and redirect criteria proven once in SITE-2 and SITE-4 and cited elsewhere. The capabilities and intake-coded tables are not fully claimed.

### Blocking

**1. Wave 4 is only partly cut: SITE-27 to SITE-31 have no contracts.**
- D-SITE-222 says "Every ticket is cut now". D-SITE-239 adds "D-SITE-222 is met when SITE-31 is cut". The brief says "All tickets are cut before any build".
- With no ticket:
  - SITE-27: the `/capabilities` filter, `?q=`, no match, status region, cross-fade and reduced motion. That is C-SITE-capabilities-3, 4, 6, 11, 12, 13, 15, 16 and 17, and the `filtered` and `filter-empty` states.
  - SITE-28 to 30: the intake restyle. C-SITE-intake-coded-1 to 4 and 6 to 13 have no ticket; only 5 is claimed (SITE-24).
  - SITE-31: the legal restyle.
- This is why SITE-26 fails, and it is why SITE-3's deferred check has nothing to test yet.
- **Fix:** cut SITE-27 to 31. The other route is for Taylor to amend D-SITE-222 and 239 on the record so the build can start before the last cut.
- **Owner:** Taylor and the next cutting thread.
- This is the same Blocking as last run's, still open.

### Should-fix

**1. SITE-16 gives two different times for the D-SITE-196 re-export.**
- Its out-of-scope line says the re-export lands "before this build starts". Its Pre-build note says "start the build, record C5 last". D-SITE-196 says "before the case-study build ticket".
- **Fix:** pick one, or ask Taylor on the record to loosen D-SITE-196 to "before C5 is recorded".
- **Owner:** SITE-16.

### Consider

1. **Evidence types and traceability on home.**
   - SITE-9 proves C-SITE-home-25 with a test, where home-build.md asks for a capture. The `consent-*` captures exist but no ticket compares against them.
   - SITE-4 C6 tests the dark default, but no ticket cites C-SITE-home-2.
   - Both are fixed by adding the IDs, plus one capture line in SITE-9.
2. **SITE-14 reaches its views by URL only.** The `websites`, `branding` and `filtered` keys from work-index.md are not `?state=` keys. Either register them or say in the contract why URL reach satisfies C-P08.
3. **SITE-3's deferred `?q=sentinel` check** says it is recorded "once `/capabilities` exists". `q` only enters the URL when SITE-27 lands, so tie the check to SITE-27.
4. **SITE-8 C2** needs a separator between its two `chipsForTab` lists, and it calls `chipsForTab(product)` while the interface takes `entries`.
5. **SITE-23's carried render time** makes the note's two-second bot check count from the screening form's render. A scripted client clears it after one slow screening. This is within D-SITE-224's "no rate limiter until abuse shows"; Warden should note it at review.

### Checks a person makes

1. **Before the build:**
   - Draw the `pillar-open` crop and decide its line (D-SITE-184). `home.md` still holds it `[NEEDS DECISION — BLOCKING]`, so `contract:init` refuses every home ticket until then.
   - Put the graded headshot on file (D-SITE-172).
   - Re-export the `no-testimonial` captures (D-SITE-196).
   - Taylor approves the `note_signups` migration on the database the local tier borrows from staging. SITE-13 C3 writes and deletes its own rows there.
2. **Before SITE-22's tests:** check Cal.com's prefill parameter names against its docs.
3. **At launch:**
   - `check:build-output` passes on a `VERCEL_ENV=production` build.
   - No bracketed or `[draft]` text remains on home, `/work`, `/work-with-me` or `/websites`, and both building prices show.
   - The two `/privacy` statements are in place (D-SITE-229).
   - The `/about#tools` and `/about#testimonials` landings work (SITE-18 C5).

VERDICT: FAIL
