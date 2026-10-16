# Pre-flight — SITE

> Written by `yarn review:run vigil SITE` (the Tickets gate). Never edit it: `contract:init` starts a ticket only on its PASS line, and only while the contract's hash still matches.

- head: 42efbb99d6b90a7807d20a0ebc47732e6c6145a9
- runner: claude 2.1.295 (Claude Code) (agent vigil; tools Read,Grep,Glob)
- model: claude-opus-5-5
- at: 2026-10-16T22:31:09Z
- tokens_input: 30
- tokens_cache_read: 912336
- tokens_cache_write: 85531
- tokens_output: 17287
- seconds: 178.6

## Verdicts

- SITE-1: PASS (contract e6098365cc52)
- SITE-2: PASS (contract 85ff1276ee45)
- SITE-3: PASS (contract 5ddbd32e853b)

## Prompt

Venue: Claude Code, headless, started by `yarn review:run vigil SITE`. You have Read, Grep, Glob only: you cannot edit or run anything.

You are vigil, running the Tickets gate's pre-flight for epic SITE in fresh context. Judge only from the files.

Read the brief (specs/web/epics/SITE-public-site-redesign/brief.md), the approved UX proposals under specs/web/epics/SITE-public-site-redesign/ux/, specs/web/epics/SITE-public-site-redesign/technical.md if it exists, and each drafted contract:
- SITE-1: specs/web/epics/SITE-public-site-redesign/tickets/SITE-001-test-harness/contract.md
- SITE-2: specs/web/epics/SITE-public-site-redesign/tickets/SITE-002-routes-and-not-found/contract.md
- SITE-3: specs/web/epics/SITE-public-site-redesign/tickets/SITE-003-analytics-seam/contract.md

For each contract, check: every criterion is testable and names the right evidence type; it cites one surface and the criterion IDs it builds; every state and unhappy path of that surface is covered by this or another ticket; planned paths and depends_on are plausible; nothing is out of the epic's appetite.

Write one line per ticket, exactly in this form, then your findings:
SITE-1: PASS or FAIL, with the reason
SITE-2: PASS or FAIL, with the reason
SITE-3: PASS or FAIL, with the reason

Your last line must be exactly one of:
VERDICT: PASS
VERDICT: FAIL

## Review

SITE-1: PASS. Every criterion is a named test with the right evidence type. The last pre-flight's blocker is fixed: `--expect 404` makes the not-found state capturable, and C4 checks both outcomes. C6 now proves the loader can import `content/work`, which SITE-2 and SITE-3 rely on.
SITE-2: PASS. All seven criteria are testable and use the right evidence type. The waiver covers the three surfaces, and C7 now names the capture command that depends on SITE-1's 404 support. `resolveStudy` takes both its inputs as arguments, so the unpublished case gets a unit test.
SITE-3: PASS. Both earlier blockers are fixed. `app/test-harness/analytics/page.tsx` calls the real `track()` and 404s in production (C8 proves that). C4 now covers the case where the browser's own referrer holds `q`. All Should-fix items from last time are closed. Two new Should-fix items are below; neither weakens a criterion.

## Findings

I read the brief, the `ux/public/` proposals (there is no single `technical.md`; I read `technical/verdict.md` and `test-shape.md`), `decisions-14.md`, the three contracts, the last `_preflight.md`, and the code these tickets touch. That code was `package.json`, `next.config.ts`, `lib/routes.ts`, `lib/env.ts`, `lib/config.ts`, `middleware.ts`, `content/work/index.ts`, `app/work/[slug]/page.tsx` and `components/analytics/*`. I couldn't run anything, so everything below comes from reading the files.

### Epic level

- **Blocking (carried over, still open): only three of the epic's tickets are cut.**
  - **What the rules say:** D-SITE-222 says "Every ticket is cut now". The brief says "All tickets are cut before any build."
  - **What's on file:** `specs/_status.md` lists only SITE-1, SITE-2 and SITE-3. Nothing in `changelog.md` or `decisions-14.md` changes the rule.
  - **What I couldn't check:** these contracts hand work to tickets that don't exist yet:
    - C-SITE-about-6 goes to the /about ticket.
    - The `/services` redirect goes to Work with me.
    - Every `book_call_click` caller goes to the chrome ticket and the /book ticket.
  - So I can't confirm that every state and unhappy path is covered by "this or another ticket".
  - **Why it blocks:** a PASS in this file lets `contract:init` start SITE-3 (it is Q3), which would break a ruling Taylor made.
  - **To clear it:** cut the rest of the tickets (Reeve, in the next authoring thread), or have Taylor amend D-SITE-222 on the record to allow cutting wave by wave. Either one changes this verdict. The three contracts themselves need no change for it.

### SITE-1, test harness

- **Should-fix: the Playwright setup doesn't say which build the specs run against, and it doesn't block Google.**
  - **The problem:**
    - SITE-3's C3 to C6 need a build with a fake `NEXT_PUBLIC_GA_ID`. Next fixes that value at build time (`lib/config.ts:202`).
    - With no geo headers, the consent regime falls back to `"unrestricted"` (`jurisdictions.ts:142`). So on that build, every page in every spec, including SITE-1's harness and captures and SITE-2's routes, loads real gtag.js and sends collect requests to Google.
    - SITE-3 promises "Tests never send a hit to Google", but only SITE-3's own spec intercepts those requests.
  - **Fix:** route every Google host to a local 204 for every spec, either in `playwright.config.ts` or a shared fixture. Also name the build steps for e2e runs: the plain build, the fake-ID build, and the `VERCEL_ENV=production` build for the output check. On the production build the test route 404s, so SITE-3's C4 needs the plain or fake-ID build first.
  - **Owner:** SITE-1, with SITE-3 naming its build.
- **Consider:** C5 is proven only on temp fixtures. Running `check:build-output` on a real production build, and seeing it scan at least one HTML file, is still a person's check. List it under Operator checks.

### SITE-2, routes and not found

- **Consider (unchanged from last time):** overview A5 asks a contract to cite each surface's main file. This one cites `case-study-build.md` and `about-build.md`, not `case-study.md` and `about.md`.
- **Consider:** C5 says "no dialog element". The consent banner has `role="dialog"` (`ConsentBanner.tsx:51`). Say whether C5 means a `<dialog>` element or any `role="dialog"`. Otherwise a run where the banner shows will be read the wrong way.

### SITE-3, analytics seam (Q3)

- **Should-fix: the gotcha names a way to reach the ask state that doesn't work on the test server.**
  - **The problem:** it says "The geo spoof in `lib/config.ts` reaches the ask state". But `middleware.ts:73` reads `DEV_GEO_OVERRIDE` only when `isDev()` is true, and `yarn start:agent` runs in production mode. The middleware also rewrites the regime cookie on every request, so planting the cookie doesn't work either.
  - **What happens:** the test fails loudly rather than passing by mistake, because the tag loads and C5 sees a Google request. But it invites a builder to edit `lib/config.ts` (not a planned path) or loosen the `isDev()` check.
  - **Fix:** reach the ask state by sending the `x-vercel-ip-country: DE` request header from Playwright. That runs the real regime table.
  - **Owner:** SITE-3.
- **Should-fix: no named build carries the fake ID.** Covered under SITE-1 above. `planned_paths` holds neither `package.json` nor `playwright.config.ts`, so the Build notes should give the exact build command.
- **Consider:** the objective says GA receives "only the three named events", but the GA4 property's enhanced measurement (scroll, outbound clicks, history-change page views) can't be tested with a fake ID. Add to Taylor's deferred check: confirm in GA4 admin that history-event page views and site search are off.
- **Consider (carried):** `cites` still leaves out D-SITE-179 and M-INT-10, though both are non-negotiables. `/test-harness/analytics` is a route string that `lib/routes.ts` doesn't list.

QA levels match D-SITE-227. Every `depends_on` and planned path is plausible against the code, and nothing is outside the appetite or wave 1 in `verdict.md`.

### Checks for a person after the build

1. SITE-3: on a preview with the real ID, go to `/capabilities?q=sentinel`, open a case study in a new tab, then press the call button. No `g/collect` request should hold `sentinel`, in `dl`, `dr` or the body.
2. SITE-2: on a preview, `curl -I '/stack?x=1'` should return 308 with `Location: /about?x=1#tools`.
3. SITE-1: on a `VERCEL_ENV=production` build, `check:build-output` should pass, scan at least one HTML file, and `/test-harness/analytics` should answer 404.

VERDICT: FAIL
