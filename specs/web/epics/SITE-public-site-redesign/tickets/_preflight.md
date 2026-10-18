# Pre-flight — SITE

> Written by `yarn review:run vigil SITE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: f376ffd0172b190db37168fa54255d56c60d3476
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-18T04:10:25Z
- tokens_input: 24
- tokens_cache_read: 848589
- tokens_cache_write: 100444
- tokens_output: 10313
- seconds: 100.4

## Verdicts

- SITE-1: PASS (contract 0bcd185797f7)
- SITE-2: PASS (contract ab84ebb51ab6)
- SITE-3: PASS (contract a162d62739c7)
- SITE-4: PASS (contract 03f78bfa0a18)
- SITE-5: PASS (contract 4f87289ea4da)
- SITE-6: PASS (contract cbafe8d93988)
- SITE-7: PASS (contract ee886f6c8f25)
- SITE-8: PASS (contract efddd2a7eed5)
- SITE-9: PASS (contract 342337906184)
- SITE-10: PASS (contract bfcc45969062)
- SITE-11: PASS (contract 785f82e34f16)
- SITE-12: PASS (contract ad878244d4c6)
- SITE-13: PASS (contract 3328f409c2d3)
- SITE-14: PASS (contract 26a80ee9ab7c)
- SITE-15: FAIL (contract 812503879664)

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

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

I'm writing up the gate result now; checks are done.

SITE-1: PASS. All six criteria are named tests over real failure paths (axe on a seeded violation, the capture exiting on the wrong status, the build-output check on an empty directory). Google hosts are answered locally, the three builds are listed, and `depends_on: []` fits a first ticket.
SITE-2: PASS. All seven criteria are testable, including the 308 and the carried query read from the real `Location`, the 404 for unknown and unpublished slugs, and the capture. The waiver covers its three surfaces, and it owns C-SITE-about-5 and C-SITE-case-study-7.
SITE-3: PASS. It is Q3 with Warden as a manual criterion (D-SITE-227). The criteria read real collect requests for `q` in `dl` and `dr`, cover the ask, declined, GPC and withdrawn states, and prove the test route 404s in production.
SITE-4: PASS. The current-item and surface rules are pure functions with unit tests. The header layout, the hidden call button at 390 and on `/websites`, the dark default and `book_call_click` are e2e tests, and C7 is a capture. Paths and dependencies (SITE-2, SITE-3) fit.
SITE-5: PASS. One footer, one `main#main`, the skip link actually moving focus, the absence on intake, legal and admin paths, and the import guard are each tested across all ten pages. The `/websites/platform` golden file is handed to wave 4 with its reason.
SITE-6: PASS. All three forms of the close are proven on a test route that 404s in production. The event, "no email or mailto" and the 390 layout are tested. Placing the close on each page is correctly left to the page tickets.
SITE-7: PASS. Every new field, the six rows, the slug guard and the newest-first order have unit tests, and the typecheck is a `check`. Values are copied, never improved, and the brackets stay.
SITE-8: PASS. The module is pure with injected data. C1 to C6 cover the fallbacks, chips, group order, the empty-tab and empty-chip rules, the `/work` URLs and the en dash, which proves C-SITE-work-index-4 and 9 for SITE-14.
SITE-9: PASS. The hero, the one primary, the event, the proof bar as a ledger, the consent banner at 390x844, the 390 targets and the capture trace to C-SITE-home-3, 20, 23 and 25. The `pillar-open` start gate and the graded headshot are named as pre-build items.
SITE-10: PASS. Disclosure and focus, no rating in the DOM, reduced motion, 390 targets and the `pillar-open`, `capabilities-open` and `capabilities-all` captures are covered. C8 now proves `/capabilities` is unchanged against main, which closes the last run's Should-fix.
SITE-11: PASS. Tabs, chips, the See all work links, story links, the lightbox and its empty-gallery case, See the work's focus and the three `selected-work-*` captures are covered. The derivation logic is cited to SITE-8, not proven again.
SITE-12: PASS. It covers the three lower sections, the whole-page order, the name scan, the keyboard walk and the full capture, and the production bracket check is a deferred manual item. The `RootField` note now agrees with C4.
SITE-13: PASS. It is Q3 with Warden and Mason as criteria. All five `notes-*` states, the bot rules and the migration's limits are tested. C8 now stores a row and asserts it exists before the repeat submit, and C3 has its own command that fails, never skips, without a database. Both close the last run's Should-fixes.
SITE-14: PASS. Every state `/work` draws is covered. The keyboard order and the 2px ring in both themes are now in C2. The derivation rules and the header call are cited to SITE-8 and SITE-4.
SITE-15: FAIL. Four parts of its surface still have no owner: C-SITE-case-study-8 and 9, the four `format-*` states and the `no-testimonial` capture. They are handed to "the case-study formats ticket, cut first in the next authoring thread", and that ticket does not exist. Format rendering and the lightbox's Escape and focus-return path are covered by no ticket.

## Findings

I read the brief, the build and States tables for home, the case study and `/work`, `decisions-14.md`, the 15 contracts, `specs/_status.md` and the decisions changelog. There is no single `technical.md`; it is split under `technical/`, and I read the parts these contracts cite. I couldn't run anything, so every finding comes from reading the files.

There is a pre-flight on file from 2026-10-18 (`_preflight.md`). Its timestamp is after today's date, which is odd. I judged these contracts on their own and used it only to check which earlier findings are now closed.

### Blocking issues for the epic

**1. Not every ticket in the epic has been cut, and D-SITE-222 is still in force.**
- **What the rules say:** D-SITE-222 says "Every ticket is cut now." The brief says "All tickets are cut before any build."
- **What's on file:** `specs/_status.md` lists only SITE-1 to SITE-15. Neither the changelog nor `decisions-14.md` amends D-SITE-222.
- **Tickets that are named as owners in these contracts but not cut:**
  - `/about`: C-SITE-about-6 and 17.
  - Work with me with `/book` and `/contact`: the `/services` redirect, `screening_outcome`, `contact_note_sent`, and the page every call button lands on. D-SITE-227 makes this Q3.
  - The case-study formats ticket.
  - Wave 4: `/websites`, `/capabilities` and the intake restyle.
- **Why it blocks:** nobody can check that every state and unhappy path of `/book` and `/contact` is covered until those contracts exist. Those are the Q3 surfaces that handle personal data and that SITE-M1 counts.
- **To clear it:** cut the remaining tickets, or have Taylor amend D-SITE-222 on the record to allow cutting wave by wave. The 14 passing contracts need no change either way.
- **Owner:** Taylor, at the Tickets gate.

**2. SITE-15's formats have no owner.**
- **What's uncovered:** C-SITE-case-study-8 (each format renders) and 9 (the lightbox opens at the item, traps focus, closes on Escape and returns focus). The capture criterion C-SITE-case-study-2, which SITE-15 cites, is also only partly covered: `format-band`, `format-rows`, `format-gallery`, `format-paired` and `no-testimonial` belong to no ticket.
- **To clear it:** cut the formats ticket. It would depend on SITE-15, own C-SITE-case-study-8 and 9 and those five captures, and list D-SITE-196's `no-testimonial` re-export as a pre-build item. The other option is to fold all of that into SITE-15.
- **Owner:** whoever authors the tickets.

### Should-fix

- **SITE-15 doesn't depend on SITE-5.** SITE-5 changes `app/work/[slug]/page.tsx` (it sets `main`'s id), and SITE-15 rewrites the same file. SITE-15 depends on SITE-6, SITE-7 and, through SITE-6, on SITE-4 and SITE-2, but never on SITE-5. Its C6 axe pass also assumes the skip link and the single main are in place. The wave order covers this in practice; adding SITE-5 to `depends_on` makes it explicit.

### Consider

- **SITE-3:** `cites` leaves out D-SITE-179 and M-INT-10, though both are among its non-negotiables.
- **SITE-4:** its criteria name C-SITE-about-3, case-study-6 and websites-coded-2, but `cites` lists only home-4 and home-20. Add them so the page tickets' "cite SITE-4" lines resolve.
- **SITE-7:** C1's "only the fourth with an href" could read as requiring one. The family office has no live link, so say the fourth may carry one.
- **SITE-11:** C4 proves the kit has no story link. It does not prove the other half of C-SITE-home-11: that Agora and Conscious Connections on Branding & UI do have one.
- **SITE-14:** C-SITE-work-index-14 is cited to SITE-4, but SITE-4's e2e test (C5) presses the call on `/about` and the case study only. The `work-index` surface is proven by the unit test (C2) alone.
- **SITE-15:** C1 lists the h2s ending at "Where AI sat, then the close" and says Conscious Connections has no Testimonial h2. Say whether the testimonial carries an h2, so C1 and C2 agree on the outline.

### Things a person checks after the build

1. **SITE-13:** on the local tier, once Taylor has approved the migration, submit one address twice in different case, more than two seconds apart. Expect one row and identical page output.
2. **SITE-12 C8:** at launch, run `check:build-output` on a `VERCEL_ENV=production` build. It should scan home's HTML and pass.
3. **SITE-3:** on a preview with the real GA ID, open `/capabilities?q=sentinel` and press the call button. No `g/collect` request should contain "sentinel". Also confirm in GA4 admin that history-based page views and site search are off.
4. **SITE-1:** `check:build-output` on a real `VERCEL_ENV=production` build scans at least one HTML file and passes.

VERDICT: FAIL
