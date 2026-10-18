# Pre-flight — SITE

> Written by `yarn review:run vigil SITE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: fc8c9c0c79715434eee7ffb933ac2d78dd5b221a
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-18T18:42:58Z
- tokens_input: 30
- tokens_cache_read: 1160244
- tokens_cache_write: 140586
- tokens_output: 10323
- seconds: 111.1

## Verdicts

- SITE-1: PASS (contract a8cb9ee492c6)
- SITE-2: PASS (contract ed3120dc0c6c)
- SITE-3: PASS (contract a162d62739c7)
- SITE-4: PASS (contract 03f78bfa0a18)
- SITE-5: PASS (contract 4f87289ea4da)
- SITE-6: PASS (contract b4de9d945800)
- SITE-7: PASS (contract 5ca4cc3fcdde)
- SITE-8: PASS (contract efddd2a7eed5)
- SITE-9: PASS (contract 342337906184)
- SITE-10: PASS (contract bb868f8c4277)
- SITE-11: PASS (contract bca60cc383b6)
- SITE-12: PASS (contract fd3c3e1cbd66)
- SITE-13: PASS (contract 3328f409c2d3)
- SITE-14: PASS (contract 97478bb0d94e)
- SITE-15: PASS (contract 87bba8629bec)
- SITE-16: PASS (contract 862e2a9e6a0f)
- SITE-17: PASS (contract 1e1a8ec5b6e7)
- SITE-18: PASS (contract 7100db40c809)
- SITE-19: PASS (contract 5fdb48fd2440)
- SITE-20: PASS (contract 73999564ef63)
- SITE-21: PASS (contract b4606bd4ef94)
- SITE-22: PASS (contract 2e4980021759)
- SITE-23: PASS (contract 67b063128027)

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

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

SITE-1: PASS: the proofs fail when they should, nothing runs against port 3000, and the unit loader now maps `server-only` to an empty module, proven by C6 (last run's Should-fix 1 is fixed).
SITE-2: PASS: the 308s keep the query string, unknown paths and slugs answer 404 with one h1, and `resolveStudy` is tested on injected data. The waiver gives its reason. Its out-of-scope `/websites/coded` redirect is handed to a ticket that doesn't exist (Blocking 1).
SITE-3: PASS: Q3 with Warden. The tests read real collect requests for `q` in `dl` and `dr`, cover the ask, declined, GPC and withdrawn states, keep the test route out of production, and check the SITE-M1 file.
SITE-4: PASS: the current-item and surface rules are unit-tested, and browser tests cover the layout, the missing call button at 390 and on `/websites`, the event and the dark default (home-2, 4, 20). The header's part of the other pages' criteria is proven once here.
SITE-5: PASS: one footer, one `main#main`, and a skip link that moves focus, on ten pages, plus an import guard. The `/websites/platform` golden file it hands off sits in a ticket that doesn't exist (Blocking 1), and later routes don't prove `#main` (Should-fix 1).
SITE-6: PASS: all three close forms are tested on a route that 404s in production, covering the event, no email address or mailto, and the 390 layout.
SITE-7: PASS: the fields, the six rows, the slug guard and newest-first order are unit-tested, plus a typecheck. D-SITE-232, 233 and 238 are applied.
SITE-8: PASS: a pure module over injected data, with tests for the fallbacks, chips, group order, empty tabs and `workHref`. It owns work-index-4 and 9.
SITE-9: PASS: one primary button in the hero, the event, the proof bar as a ledger, the banner at 390x844 under the DE header, and 44px targets (home-3, 20, 23, 25). The `pillar-open` gate and the headshot are named as pre-build items.
SITE-10: PASS: pillars and chips open in place, Esc keeps or returns focus, no rating reaches the HTML, reduced motion is tested, and the three states plus the unchanged `/capabilities` are captured.
SITE-11: PASS: the tabs follow the ARIA pattern, chips use `aria-pressed`, See all work carries the filter, story links and empty galleries are covered, and See the work moves focus. SITE-8's logic is cited, not re-proven.
SITE-12: PASS: covers the lower sections, the whole-page order, the keyboard walk and the full capture. The name scan now reads from `docs/_legacy/pending/cho-ventures-naming/`, which exists (last run's Should-fix 2 is fixed).
SITE-13: PASS, with one Should-fix: Q3 with Warden and Mason. It covers all five `notes-*` states, the bot rules, a listed address answered like a new one, a migration that touches only its own table, and a database test that fails rather than skips. C3 runs under Playwright, which doesn't load SITE-1's `server-only` stub (Should-fix 2).
SITE-14: PASS: every `/work` view, focus that stays put, described repeated links and the gallery opener are covered. The name path is fixed, and the dependency on gated SITE-11 is gone (last run's Should-fixes 2 and 4 are fixed).
SITE-15: PASS: order, absent blocks, one primary, Escape, meta and the 390 rules are covered over every published study, and C2 compares Dawson's span with home's and `/about`'s.
SITE-16: PASS: the four What I built formats chosen by `builtFormat`, the lightbox focus trap and return, honest image counts, no autoplay with reduced motion on or off, and the captures. The D-SITE-196 re-export is a named pre-build item.
SITE-17: PASS: section order, Experience read from `content/about.ts`, unique link names, dates on their own line at 390, and the forbidden-content scan, now with its name source given (last run's Should-fix 2 is fixed). The headshot is a manual check, as about-16 says.
SITE-18: PASS: Tools, the four testimonials in full with no tabs, the pending card kept out of production, one primary button, no Cal.com link, the event, the anchor landing (manual, per about-6) and both captures.
SITE-19: PASS: the 308 with the query kept, five role rows and three building rows, the price line once, note and call links, the event, the open FAQ and the capture. The prices are checked at launch (D-SITE-203).
SITE-20: PASS: Q3 with Warden. A recording transport proves the ops address is the only recipient and the sender is reply-to. It covers the bot rules, caps, sending, offline and sent states, the sentinel checks, and both events.
SITE-21: PASS: all 140 combinations are checked against a table written from D-SITE-166's text, plus the chips, focus on the first invalid field, no call button and the sentinels. `fit.ts`'s `server-only` import now loads under SITE-1's loader.
SITE-22: PASS: POST only, re-runs the fit, takes the target from `BOOKING_URL`, sends tampered input back to `/book` with a 303, answers GET with 405, and runs the sentinel checks on the wire.
SITE-23: PASS: the prefill, the hidden screening answers, the `/websites` line whatever the budget and start, no call anywhere, sent staying on `/book`, the render time carried over, and the captures. Its out-of-scope `/websites` page belongs to a ticket that doesn't exist (Blocking 1).

## Findings

I read the brief, the five `technical/` files (there is no single `technical.md`), the overview, decisions-14, home.md's open lines, all 23 contracts, and the last pre-flight. Since that run, four of its five Should-fixes are fixed: `server-only` in SITE-1, the name path in SITE-12, 14 and 17, and the SITE-14 dependency. Its epic-level Blocking is not fixed.

### Blocking

**1. Wave 4 is still not cut, but D-SITE-222 says "Every ticket is cut now".**
- The brief agrees: "All tickets are cut before any build". No decision after D-SITE-238 amends either line: I checked decisions-14, `docs/decisions/` and `specs/_status.md`. The only ticket folders are SITE-001 to SITE-023.
- These have no ticket:
  - `/websites`, with the `/websites/coded` redirect and the platform golden file.
  - `/capabilities`.
  - The intake restyle.
  - The legal restyle (`/privacy`, `/websites/privacy`, `/websites/terms`). The brief puts it in scope, but no wave in `verdict.md` owns it.
- Work that current contracts hand to tickets that don't exist: SITE-2 (the redirect), SITE-5 (the golden file), SITE-6 (the `/websites` close), SITE-7 (Phoenix's row), SITE-10 (`/capabilities`), SITE-23 (`/websites`), and SITE-3's deferred check, which needs `/capabilities`.
- **Why it blocks:** SITE-5 changes the `main` of `/websites/platform` in this cycle. D-SITE-230 says the golden file proves that page's body, and that file lives only in a ticket that hasn't been cut.
- **Fix, either:**
  - cut the wave-4 tickets and give the legal restyle an owner; or
  - Taylor amends D-SITE-222 on the record to allow cutting wave by wave, and SITE-5 takes the golden file (from `main`, before its change, with the footer left out).
- **Owner:** Taylor, at the Tickets gate. This is an epic-level gap, so no ticket's line above changes because of it.

### Should-fix

1. **No later page proves the skip link's target.**
   - SITE-5 proves `main#main` only on the pages that exist when it runs.
   - These pages carry no criterion that `main` has `id="main"` and that the skip link moves focus into it:
     - the new routes: `/work` (SITE-14), `/work-with-me` (SITE-19), `/contact` (SITE-20) and `/book` (SITE-21);
     - the rewritten pages: home (SITE-9), the case study (SITE-15) and `/about` (SITE-17).
   - SITE-12 C6 walks home's tab order through the skip link but never activates it.
   - axe's skip-link rule is best-practice at moderate impact, so the "serious or critical" checks won't catch a missing target.
   - **Fix:** add one line to each page's existing axe or keyboard criterion.
   - **Owner:** SITE-9, 14, 15, 17, 19, 20, 21.
2. **SITE-13 C3 runs under Playwright, which doesn't use SITE-1's loader.**
   - SITE-1's `server-only` stub covers `yarn test` only.
   - If `server/services/note-signups.ts` carries the marker, C3 fails to load (`scripts/seed-example-sites.ts:250-253` records the failure).
   - **Fix:** SITE-13 maps `server-only` for that spec, or keeps the marker out of the store module with a reason. Never delete the marker just to get the test passing.
   - **Owner:** SITE-13.

### Consider

1. **Launch checks for leftover `[draft]` and bracketed text cover only home, `/work` and `/work-with-me`.**
   - `/about`, the case study, `/book` and `/contact` also ship that text.
   - C-SITE-services-24 covers `/book` and `/contact` too, but no ticket checks them.
2. **home.md line 70 still lists D-SITE-42 as [NEEDS DECISION],** but D-SITE-231 and 238 settled it. Fix this stale line when home.md is promoted.
3. **SITE-15 checks "no project link" (case-study-13) only on Everbook.** The family office's card (Bruno) and Agora's card (Yogesh) aren't asserted.
4. **SITE-9:** the `consent` state has a geometry test but no capture.
5. **SITE-19 rewrites SITE-2's `routes.spec.ts` assertion.** It's declared and harmless below Q3, but SITE-2's proof won't re-run green.
6. **SITE-8 C2** is missing a separator between its two `chipsForTab` lists.

### Checks a person makes after the build

1. **Before the build:**
   - Draw the `pillar-open` crop (D-SITE-184). It blocks SITE-9 to 13.
   - Put the graded headshot on file (D-SITE-172).
   - Re-export the `no-testimonial` captures (D-SITE-196).
   - Taylor approves the migration on the database the local tier borrows from staging (SITE-13).
2. **Before SITE-22's tests:** check Cal.com's prefill parameter names against its docs. Then book one call from a preview and confirm it carries `source=site-screening`.
3. **At launch:**
   - `check:build-output` passes on a `VERCEL_ENV=production` build.
   - `/work` and `/work-with-me` hold no brackets, and both prices show.
   - The two `/privacy` statements are in place (D-SITE-229).
   - The `/about#tools` and `/about#testimonials` landings work (SITE-18 C5).

VERDICT: FAIL
