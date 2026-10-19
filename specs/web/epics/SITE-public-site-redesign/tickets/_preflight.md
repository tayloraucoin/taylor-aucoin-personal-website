# Pre-flight — SITE

> Written by `yarn review:run vigil SITE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 11693c6efd734cb501e810c845ecc6b73113da9c
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-19T04:04:47Z
- tokens_input: 42
- tokens_cache_read: 2536013
- tokens_cache_write: 227633
- tokens_output: 19375
- seconds: 229.7

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
- SITE-29: PASS (contract f200df013ac4)
- SITE-30: PASS (contract 1eaf7ea69a13)
- SITE-31: PASS (contract 16a75c6703a0)

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
- SITE-30: specs/web/epics/SITE-public-site-redesign/tickets/SITE-030-intake-coded-taste-and-import/contract.md
- SITE-31: specs/web/epics/SITE-public-site-redesign/tickets/SITE-031-legal-restyle/contract.md

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
SITE-30: PASS or FAIL, with the reason
SITE-31: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

SITE-1: PASS. Every proof is built to fail when it should: tests are named after their criteria so an empty run can't pass, the axe helper is tested against a planted violation, the capture script fails on the wrong status, and the build-output check fails on an empty folder. The `@/` loader is proven by C6.
SITE-2: PASS. The two 308s are tested with and without a query, and the `/services` and `/websites` answers are pinned at 200 until their own tickets. Unknown paths and slugs answer 404. `resolveStudy` is tested on injected data, so the unpublished case needs no content edit. The waiver gives its reason.
SITE-3: PASS. Q3 with Warden. The tests read real collect requests for `q` in `dl` and `dr`. They cover the ask, declined, GPC and withdrawn states and the unmeasured paths. The test route answers 404 in production, and the SITE-M1 definition is checked.
SITE-4: PASS. The current-item and call-surface rules are unit-tested. The browser tests cover the hidden call button, the event's closed fields and the dark default. Small gap: C3 asserts `aria-current` at 1440 only (Consider 1).
SITE-5: PASS. It checks one footer outside one `main#main` on ten pages, a skip link that really moves focus (`activeElement`), no chrome on intake, legal and admin, and an import guard. The golden-file handoff to SITE-24 is stated.
SITE-6: PASS. All three close forms are tested on a route that answers 404 in production. The tests cover the event, no email address or mailto, one primary per form, and the 390 rows and target sizes.
SITE-7: PASS. Unit tests cover the shape of every new field, the six rows and their slug guard, aiSat on Conscious Connections only (D-SITE-233), the formats and newest-first order, plus a typecheck.
SITE-8: PASS. A pure module over injected data. It proves work-index-4 and 9 (fallbacks, empty chips and tabs, group order, `workHref`). C2's wording is still loose (Consider 2).
SITE-9: PASS. One hero primary with its event, the proof bar as a ledger, the banner at 390x844 through the real regime table, 44px targets. The `pillar-open` gate and the headshot are named as pre-build items.
SITE-10: PASS. Pillars and chips open in place, focus is kept or returned on Esc, no rating reaches the HTML, reduced motion is tested, and `/capabilities` is proven unchanged by a before-and-after capture.
SITE-11: PASS. ARIA tabs with arrow keys, `aria-pressed` chips, and See all work carrying the filter. Story links show only for published slugs, empty galleries render no frame, and See the work moves focus. SITE-8's logic is cited, not re-proven.
SITE-12: PASS. The three lower sections, the whole-page order, the forbidden-name scan, the keyboard walk and the full capture. The leftover-bracket check is honestly deferred to launch.
SITE-13: PASS. Q3 with Warden and Mason. All five `notes-*` states are covered, and the bot rules are tested. A listed address gets the same page text, focus, announcement and response body as a new one. The migration test checks for one table only. The database test fails rather than skips.
SITE-14: PASS. Every `/work` view is covered. Tabs and chips are links that keep focus and scroll, and the same view returns on reload. Repeated links are described by their row, and the gallery opener is proven on a fixture. The launch bracket check is deferred because the page renders per request.
SITE-15: PASS. Block order, absent blocks leaving no trace, one primary with its event, Escape, the meta descriptions and the 390 rules, on every published study. D-SITE-233 overrides the AI block still shown in the captures.
SITE-16: PASS. `builtFormat` picks the render, the lightbox traps focus and returns it, the All n images count must match the lightbox, and nothing autoplays. It still gives two times for the D-SITE-196 re-export (Should-fix 2).
SITE-17: PASS. Section order, Experience read from `content/about.ts` (D-SITE-197), link names unique by row, dates on their own line at 390, the forbidden-content scan, and the headshot as a manual pre-build check.
SITE-18: PASS. Core tools only, four full testimonials with no tabs, the pending card kept out of production, one primary, no Cal.com link, the event, the anchor landing (manual, as about-6 asks) and both captures.
SITE-19: PASS. The 308 keeps the query. It covers five roles and three building rows, the price line shown once, one primary per view, both events and the open FAQ. The two prices are a deferred launch check (D-SITE-203).
SITE-20: PASS. Q3 with Warden. A recording transport proves Taylor's ops address is the only recipient and the sender is only reply-to. Tests cover the caps, the bot rules, sending, offline, sent, the mailto in every form state, sentinel values on the wire, and both events.
SITE-21: PASS. Q3 with Warden. All 140 combinations are checked against a table written from D-SITE-166's text, not from the code. It also covers native-radio chips, focus on the first invalid field, no call button or current nav item on `/book`, the URL staying `/book`, and the sentinel checks.
SITE-22: PASS. Q3 with Warden. POST only. The handler re-validates and re-runs the fit, and the redirect target comes from `BOOKING_URL`, never from input. Tampered input gets a 303 to `/book` and GET gets a 405. The sentinels are checked against a stubbed Cal.com host.
SITE-23: PASS. Q3 with Warden. It covers the prefill, the hidden screening answers, the `/websites` line whatever the budget, and no call offered anywhere, including after sending. The note's two-second bot timer runs from when the screening form rendered.
SITE-24: PASS. An exact-path 308 that keeps the query. The intake start, resume and cookie paths are pinned to what `main` builds, and the chooser is deleted. The golden file comes from `main` with the footer removed, and a test proves it catches a one-word change. Small gap: C6 can pass on nothing (Consider 4).
SITE-25: PASS. The dollar-amount scan is limited to literals and JSX text. It covers one label per destination, the published-row rule, the FAQ, the event, and the golden file re-run after each change to a shared component.
SITE-26: PASS. It covers the tablist pattern, `replaceState`, the unknown-tab fallback, the proof links, the first `tabs` fill and the close. It hands two criteria to a ticket that never cites them (Should-fix 3).
SITE-27: PASS. Typing filters the chips, `q` lives in the URL with no history entry and survives tab changes, the count is announced once after typing settles, clearing returns focus to the field, and reduced motion is 0s. The sentinel check reads real collect requests. Motion timing is manual, as capabilities-11 asks.
SITE-28: PASS. A token scan that tests itself on a fixture, the save line announced once, `aria-current` on the resume list, one main and one h1 per screen, no chrome or Google request, and a harness that answers 404 in production. But C2 can pass on nothing (Should-fix 1).
SITE-29: PASS. The email alert and its invalid border, one primary on pay and none on done, Eyebrow deleted, one main and one h1 per screen. The same C2 gap as SITE-28, and here without even the matcher's own self-test (Should-fix 1).
SITE-30: PASS. Covers the import dialog's focus hold (intake-coded-8), the taste gallery's trap and focus return, and the scan over both intake trees with GradientRing gone. Its commit check fails when no commit carries its prefix, so it cannot pass on nothing.
SITE-31: PASS. Tokens only, as the brief scopes it. A golden text file pins every string, title and description, and a test proves it catches a one-word change. The token scan now tests itself on a fixture. The commit check covers the legal and analytics paths, and the look is Taylor's manual check.

## Findings

I read the brief, the overview, every approved UX surface the contracts cite (home, work index, case study, about, services, coded websites, capabilities, coded intake) with their build and criteria parts, all five files in `technical/` (there is no single `technical.md`), and all 31 contracts. I also read last run's `_preflight.md` but judged each contract on the files alone. I checked `lib/config.ts`: `isWorkPublished` returns true unless a slug is set to `false`. So SITE-8's "every tab visible on real content" holds, and SITE-2 is right that no slug is unpublished today.

### Blocking

None.

### Should-fix

**1. The money and saves boundary check in SITE-28 C2 and SITE-29 C2 can pass on nothing.** Third time this has been raised; I've moved it up from Consider.
- **The problem:** both criteria only look at commits whose subject starts with the ticket's prefix. If the builder forgets the prefix, the check runs on no commits and goes green.
- **Why it matters:** this check is the only proof for C-SITE-intake-coded-12, that payments, Stripe sessions and autosave are untouched. SITE-1's own slice line names "a check that scans no files" as the failure this epic refuses, and SITE-30 and SITE-31 already require at least one matching commit.
- **Fix:** add "and at least one commit since the merge-base has a subject starting SITE-28:" (or SITE-29:) to each C2. It is one line each in the shared boundary test.
- **Owner:** SITE-28, SITE-29.

**2. SITE-16 still gives two times for the D-SITE-196 re-export.**
- Its out-of-scope line says the re-export happens "before this build starts". Its pre-build note says "start the build, record C5 last".
- D-SITE-196 says "before the case-study build ticket". Both are rung-5 spec, so the contract cannot quietly loosen it.
- **Fix:** pick one, or have Taylor log a D-SITE line that reads "before C5 is recorded".
- **Owner:** SITE-16.

**3. No ticket builds C-SITE-capabilities-7 and 8.**
- SITE-26 and SITE-27 both hand them to "SITE-10's shared component". SITE-10 does not cite them, and its C3 proves open, Esc and focus return only on home, where there is no tablist and no filter feeding the list.
- **Fix:** add to SITE-26 C3: pressing a second chip closes the first, and Esc returns focus to the chip. Then SITE-26 cites both IDs.
- **Owner:** SITE-26.

### Consider

1. **Home and header evidence (carried).**
   - SITE-9 C4 proves C-SITE-home-25 with a test, where the spec asks for a capture. No ticket compares against the `consent-*` captures. The consent state is reached by a request header, not `?state=`, which departs from home.md's "every state reachable by `?state=`".
   - No ticket cites C-SITE-home-2, though SITE-4 C6 tests it.
   - SITE-4 C3 asserts `aria-current` at 1440 only. C-SITE-about-3 and SITE-4's own non-negotiable say both widths.
2. **SITE-8 C2 wording (carried).** The two `chipsForTab` lists run together with no separator, and the criterion calls `chipsForTab(product)` while the interface takes `entries`.
3. **SITE-23** adds three `?state=` keys but doesn't plan `app/book/page.tsx`. That's fine if the States list lives in `_fixtures.ts`, as SITE-21 implies; otherwise add the path.
4. **SITE-24 C6** checks `/work-with-me`, but SITE-24 doesn't depend on SITE-19. Built before SITE-19, that page is a 404 and the check passes on nothing. Add the dependency, or drop that path from C6.
5. **SITE-13 C3** writes to the database the local tier borrows from staging, so this branch's migration has to be applied there before the code merges. Mason should note the schema drift at review.
6. **SITE-23's carried render time (carried).** A scripted client clears the two-second bot check after one slow screening. This is within D-SITE-224; Warden should note it at review.

### Checks a person makes

1. **Before the build:**
   - the `pillar-open` crop and its line (D-SITE-184), which blocks every home ticket
   - the graded headshot (D-SITE-172)
   - the `no-testimonial` re-export (D-SITE-196)
   - approval to migrate the database the local tier borrows from staging
2. **Before SITE-22's tests:** check Cal.com's prefill parameter names against its docs.
3. **At launch:**
   - `check:build-output` passes on a `VERCEL_ENV=production` build
   - no bracketed or `[draft]` text remains, and both building prices show
   - the two `/privacy` statements are in place (D-SITE-229)
   - the `/about#tools` and `/about#testimonials` landings work
   - Taylor's look at the three legal pages (SITE-31 C6)

VERDICT: PASS
