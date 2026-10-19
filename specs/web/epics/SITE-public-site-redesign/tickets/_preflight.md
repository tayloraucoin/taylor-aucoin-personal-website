# Pre-flight — SITE

> Written by `yarn review:run vigil SITE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: c1e81e91e811428ad300f87d3bdc3ef275dcdfad
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-19T01:52:22Z
- tokens_input: 38
- tokens_cache_read: 2119927
- tokens_cache_write: 187466
- tokens_output: 16183
- seconds: 181

## Verdicts

- SITE-1: PASS (contract a8cb9ee492c6)
- SITE-2: PASS (contract ed3120dc0c6c)
- SITE-3: PASS (contract 2a503f53b255)
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
- SITE-26: PASS (contract 866b7f6de626)
- SITE-27: PASS (contract e5220468e62c)
- SITE-28: PASS (contract de3799826f65)
- SITE-29: FAIL (contract f200df013ac4)

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
- SITE-27: specs/web/epics/SITE-public-site-redesign/tickets/SITE-027-capabilities-filter/contract.md
- SITE-28: specs/web/epics/SITE-public-site-redesign/tickets/SITE-028-intake-shared/contract.md
- SITE-29: specs/web/epics/SITE-public-site-redesign/tickets/SITE-029-intake-coded-flow/contract.md

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
SITE-27: PASS or FAIL, with the reason
SITE-28: PASS or FAIL, with the reason
SITE-29: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

SITE-1: PASS. Every proof is set up to fail when it should: a runner that finds no tests, an axe helper tested against a seeded violation, and a build-output check that fails on an empty folder. Browser tests stay on :4310, and C6 proves the `@/` alias and the `server-only` stub.
SITE-2: PASS. The two 308s are tested with and without a query, and the four `/websites` and `/services` answers are pinned at 200. Unknown paths and slugs answer 404 with one h1. `resolveStudy` is tested on injected data. The waiver gives its reason, and the lines it hands to SITE-19 and SITE-24 go to tickets that exist.
SITE-3: PASS. Q3 with Warden. The tests read the real collect requests for `q` in `dl` and `dr`, and cover the ask, declined, GPC and withdrawn states. The test route is kept out of production, and the SITE-M1 definition is checked. Its deferred `?q=sentinel` check is now tied to SITE-27, which exists (last run's Consider 3 is fixed).
SITE-4: PASS. The current-item and call-surface rules are unit-tested. Browser tests cover 1440 and 390, the hidden call button on `/websites` and `/book`, the event's closed fields and the dark default. It proves the header part of other pages' criteria once.
SITE-5: PASS. One footer outside one `main#main` on ten pages, a skip link that really moves focus, no chrome on intake, legal and admin pages, and an import guard. The golden-file handoff to SITE-24 is stated.
SITE-6: PASS. All three close forms are tested on a route that answers 404 in production: the event, no email address or mailto, the 390 rows and targets, and one primary per form.
SITE-7: PASS. Unit tests cover each new field's shape, the six rows and their slug guard, aiSat on Conscious Connections only (D-SITE-233), the formats and newest-first order, plus a typecheck.
SITE-8: PASS. A pure module over injected data, which proves work-index-4 and 9. It tests the fallbacks, chips, group order, empty tabs and chips, and `workHref`. C2's wording still has small faults (Consider 4).
SITE-9: PASS. One hero primary with its event, the proof bar as a ledger, the banner at 390x844 through the real regime table, 44px targets and the skip-link target. The `pillar-open` gate and the headshot are named as pre-build items.
SITE-10: PASS. Pillars and chips open in place, and focus is kept or returned on Esc. No rating reaches the HTML, reduced motion is tested, and the three states plus an unchanged `/capabilities` are captured.
SITE-11: PASS. The tabs follow the ARIA pattern with arrow keys, and the chips use `aria-pressed`. See all work carries the filter, story links show only for published slugs, empty galleries render no frame, and See the work moves focus. SITE-8's logic is cited, not proven again.
SITE-12: PASS. Covers the three lower sections, the whole-page order, the name scan (names read from the legacy folder), the keyboard walk and the full capture. The launch check for leftover brackets is deferred to launch.
SITE-13: PASS. Q3 with Warden and Mason. All five `notes-*` states, the bot rules, and a listed address answered byte for byte like a new one. The migration creates only its own table, the database test fails rather than skips, and no address reaches a URL or a Google request.
SITE-14: PASS. Every `/work` view, chips as links that keep focus and scroll, the same view after reload, repeated links described by their row, a gallery opener tested on a fixture, the name scan, and the launch check (deferred, because `/work` renders per request).
SITE-15: PASS. Block order, absent blocks leaving no trace, one primary with its event, Escape, meta descriptions, the 390 rules and the skip-link target, on every published study.
SITE-16: PASS, with Should-fix 1 still open. The four What I built formats are chosen by `builtFormat`, the lightbox traps focus and returns it, the All n images count is honest, nothing autoplays, and the captures are listed. It still contradicts itself on when the D-SITE-196 re-export must land.
SITE-17: PASS. Section order, Experience read from `content/about.ts` (D-SITE-197), link names unique by row, dates on their own line at 390, the forbidden-content scan, and the headshot as a manual pre-build check.
SITE-18: PASS. Tools from core items only, four full testimonials with no tabs, the pending card kept out of production, one primary, no Cal.com link, the event, the anchor landing (manual, as about-6 asks) and both captures.
SITE-19: PASS. The 308 keeps the query. It covers five role rows and three building rows, the price line once, the note and call links, both events, the open FAQ, the skip-link target, and the prices as a deferred launch check (D-SITE-203).
SITE-20: PASS. Q3 with Warden. A recording transport proves Taylor's ops address is the only recipient and the sender is reply-to. Tests cover the caps, the bot rules, sending, offline, sent, the mailto in every form state, sentinel values checked on the wire, and both events.
SITE-21: PASS. Q3 with Warden. All 140 combinations are checked against a table written from D-SITE-166's text, not from the code. Also covered: native-radio chips, focus on the first invalid field, no call button or current item on `/book`, the URL staying `/book`, and sentinel checks.
SITE-22: PASS. Q3 with Warden. POST only. It re-validates and re-runs the fit, takes the target from `BOOKING_URL`, answers 303 to `/book` on tampered input and 405 to GET, and runs the sentinel checks against a stubbed Cal.com host.
SITE-23: PASS. Q3 with Warden. Covers the prefill and hidden screening answers, the `/websites` line whatever the budget and start, no call anywhere (including after sending), sent staying on `/book`, the carried render time, and the three captures.
SITE-24: PASS. An exact-path 308 that keeps the query. The intake start and resume routes are pinned to what `main` builds, the chooser is deleted, and the golden file is taken from `main` with the footer removed and proven to catch a one-word change.
SITE-25: PASS. The dollar scan is limited to string literals and JSX text in the page, its components and the five shared ones. Tests cover one label per destination, the published-row rule, the FAQ, the event, and the golden file re-checked after each change to a shared component.
SITE-26: PASS. Last run's FAIL is fixed: SITE-27 now exists and claims the filter, `?q=`, no match, the status region, the motion and C-SITE-capabilities-3, 4, 6, 11–13, 15–17. The tablist pattern, `replaceState`, tab fallback, proof hrefs, the `tabs` fill and the close are all tested. C-SITE-capabilities-7 and 8 are never proven on this page (Consider 6).
SITE-27: PASS. The filter is tested by typing. The query lives in the URL with no history entry, survives tab changes, and the status region is updated once after typing settles. Clearing returns focus to the field, reduced motion is 0s, the `q`/sentinel check reads real collect requests, and the 44px targets and captures are listed. The motion timing is manual, as C-SITE-capabilities-11 asks.
SITE-28: PASS. A token scan with a fixture self-test, a boundary matcher over `server/`, `_actions/`, `lib/intake/` and `lib/extras/`, and the save line announced once. Also covered: the resume list's `aria-current`, one main and one h1 per screen, no chrome or Google request, reduced motion, and a harness that answers 404 in production (D-SITE-241). Fixture placement matches `placement.md`.
SITE-29: FAIL. It gives the rest of the coded intake to SITE-30, which has no contract. The `taste`, `import` and `import-mark` states, C-SITE-intake-coded-8 (focus trapped in the import dialog), and the token rules over about 185 idiom lines are claimed by no ticket that exists. C-SITE-intake-coded-2 ("both intake trees") cannot pass while those files are unclaimed.

## Findings

I read the brief, the overview, `decisions-14.md`, the `technical/` folder's verdict and placement, the capabilities and intake-coded surface and build files, all 29 contracts, and last run's `_preflight.md`. There is no single `technical.md`; the `technical/` folder stands in for it. I checked the repo for: which files import `eyebrow.tsx` (all coded-tree importers are in SITE-29's own list, so deleting it strands nothing), where `previewEngagement` lives, and whether the `capabilities/` and `intake-coded/` capture sets exist (they do, including `taste`, `import` and `import-mark`).

SITE-1 to 25 match what last run passed. The three home and capabilities Considers carried from last run are still open but do not block.

### Blocking

**1. Wave 4 is still only partly cut: SITE-30 and SITE-31 have no contracts.**
- D-SITE-239 says "D-SITE-222 is met when SITE-31 is cut". D-SITE-222 says "Every ticket is cut now", and the brief says "All tickets are cut before any build".
- Nothing has a ticket for:
  - **SITE-30:** the taste gallery, credits import, machine-filled mark, voice recorder and extraction. That means the `taste`, `import` and `import-mark` states, C-SITE-intake-coded-8, and a full-tree pass of C-SITE-intake-coded-2.
  - **SITE-31:** the restyle of `/privacy`, `/websites/privacy` and `/websites/terms`, which the brief puts in scope as "Restyled only".
- This is why SITE-29 fails. Last run's Blocking has narrowed from SITE-27–31 to SITE-30–31. It is not closed.
- **Fix:** cut SITE-30 and SITE-31, then re-run the gate. The only other route is for Taylor to amend D-SITE-222 and 239 on the record so the build can start before the last cut.
- **Owner:** Taylor, and the next thread that cuts tickets.

### Should-fix

**1. SITE-16 still gives two times for the D-SITE-196 re-export.**
- Its out-of-scope line says "before this build starts". Its Pre-build note says "start the build, record C5 last". D-SITE-196 says "before the case-study build ticket".
- **Fix:** pick one, or have Taylor loosen D-SITE-196 on the record to "before C5 is recorded".
- **Owner:** SITE-16.

### Consider

1. **Home evidence types (carried).** SITE-9 proves C-SITE-home-25 with a test where `home-build.md` asks for a capture, and no ticket compares against the `consent-*` captures. No ticket cites C-SITE-home-2, though SITE-4 C6 tests it.
2. **SITE-14's views are reached by URL only (carried).** The `websites`, `branding` and `filtered` views are not `?state=` keys. Either register them or say why reaching them by URL satisfies C-P08.
3. **SITE-8 C2 (carried).** It needs a separator between its two `chipsForTab` lists, and it calls `chipsForTab(product)` while the interface takes `entries`.
4. **SITE-23's carried render time (carried).** The two-second bot check counts from when the screening form rendered, so a scripted client clears it after one slow screening. This is within D-SITE-224; Warden should note it at review.
5. **SITE-28 C2 and SITE-29 C2 match on commit subjects.** A commit with the wrong prefix, or a squash, makes them pass on nothing. A diff against `main` limited to the ticket's planned paths would hold even with a stray subject.
6. **C-SITE-capabilities-7 and 8 are never proven on `/capabilities`.** SITE-26 and SITE-27 say SITE-10's component owns them, but SITE-10 C3 proves them only on home, and `/capabilities` drives the chips with tabs and no Show all. One line in SITE-26 C3 or C7 (press a chip, Esc returns focus) would close it.

### Checks a person makes

1. **Before the build:**
   - The `pillar-open` crop and its line (D-SITE-184).
   - The graded headshot (D-SITE-172).
   - The `no-testimonial` re-export (D-SITE-196).
   - Approval of the `note_signups` migration on the database the local tier borrows from staging.
2. **Before SITE-22's tests:** check Cal.com's prefill parameter names against its docs.
3. **At launch:**
   - `check:build-output` passes on a `VERCEL_ENV=production` build.
   - No bracketed or `[draft]` text remains, and both building prices show.
   - The two `/privacy` statements are in place (D-SITE-229).
   - The `/about#tools` and `/about#testimonials` landings work.

VERDICT: FAIL
