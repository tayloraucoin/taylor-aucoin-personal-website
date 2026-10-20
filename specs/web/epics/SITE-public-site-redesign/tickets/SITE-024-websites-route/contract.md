---
id: SITE-24
size: small
objective: "/websites serves the coded website page and old /websites/coded links land there for good, while the intake, its cookie and every resume link stay where they are and /websites/platform's body is pinned by a golden file"
slice_type: "a route move at the platform boundary plus a regression pin; risks a redirect that swallows the intake tree, answers 307 or drops the query, a resume link or cookie path that moves under a client mid-form, and a legacy page that drifts unseen"
non_negotiables:
  - "/websites/coded → /websites is permanent (Next answers 308), carries the query and matches that exact path only; /websites/coded/intake and everything under it answer as on main (D-SITE-111, 160, 215)"
  - "websiteRoutes.coded becomes /websites; SHOWCASE_INTAKE_PREFIX is written as the literal /websites/coded/intake with a comment naming D-SITE-160, so every showcaseIntakeRoutes path, cookie path, emailed link and admin link builds exactly as on main"
  - "/websites renders today's coded page moved as is: same content, metadata, noindex and social card; its restyle is SITE-25's"
  - "The chooser retires: TrackDoors.tsx, TrackPicker.tsx, content/websites-chooser.ts and app/websites/coded/page.tsx are deleted with no import left (Taylor was asked before cutting)"
  - "The golden file is /websites/platform's main inner HTML taken from main, before the fork, with the footer element removed (SITE-5 moves it out, D-SITE-230); normalised for build noise only, never class names or text"
  - "No file under server/, _actions/, lib/intake/ or lib/extras/ changes"
devs_call: "How the golden HTML is normalised (hashed asset names, build ids, React ids), the golden file's path under tests/, and test file names"
waiver: "One route change spanning two surfaces: websites.md holds the redirect, the chooser's retirement and the platform criterion; intake-coded-build.md holds C-SITE-intake-coded-5, the intake route's criterion; decisions-14.md holds D-SITE-230"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/websites.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/intake-coded-build.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-111"
  - "D-SITE-112"
  - "D-SITE-160"
  - "D-SITE-215"
  - "D-SITE-230"
  - "C-SITE-websites-1"
  - "C-SITE-websites-2"
  - "C-SITE-websites-3"
  - "C-SITE-websites-4"
  - "C-SITE-websites-5"
  - "C-SITE-intake-coded-5"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "next.config.ts"
  - "lib/routes.ts"
  - "app/websites/page.tsx"
  - "app/websites/coded/page.tsx"
  - "components/websites/TrackDoors.tsx"
  - "components/websites/TrackPicker.tsx"
  - "content/websites-chooser.ts"
  - "tests/**"
depends_on: [ SITE-2, SITE-5 ]
out_of_scope:
  - "The coded page's restyle, its example rows, close, event and CodedCase's retirement: SITE-25"
  - "The intake restyle: the intake tickets; the header's hidden call button on /websites: proven by SITE-4 (hidesCallButton); cite, never re-prove"
  - "Home's Websites tab and Work with me's coded offer linking to /websites: SITE-11 and SITE-19 use siteRoutes.websites"
criteria:
  - id: C1
    statement: "GET /websites/coded and /websites/coded?x=1 answer 308 with Location /websites and /websites?x=1; GET /websites answers 200 with the coded page's hero h1, robots noindex and none of the chooser's door or picker text (C-SITE-websites-1)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites-route.spec.ts"
  - id: C2
    statement: "GET /websites/coded/intake answers 200 with the start page and no Location header, and GET /websites/coded/intake/<synthetic token> answers with the same status and h1 as on main; neither redirects (C-SITE-websites-2, C-SITE-intake-coded-5)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites-route.spec.ts"
  - id: C3
    statement: "websiteRoutes.coded is /websites, and showcaseIntakeRoutes' start, cookiePath, entry, step, done, review and add-ons paths for a fixed token equal the strings they build on main, each under /websites/coded/intake"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "TrackDoors.tsx, TrackPicker.tsx, content/websites-chooser.ts and app/websites/coded/page.tsx do not exist, and no href or string literal (comments excluded) in a file under app/, components/ or content/ outside the intake trees holds /websites/coded except as /websites/coded/intake (C-SITE-websites-3, 4)"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "GET /websites/platform answers 200, and its main element's inner HTML, normalised, equals the golden file; changing one word of its hero copy makes the test fail (C-SITE-websites-5, D-SITE-230)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites-platform-golden.spec.ts"
  - id: C6
    statement: "No page among /, /work, /about, /work-with-me, /websites and /capabilities links to /websites/platform (C-SITE-websites-5)"
    evidence: test
    command: "yarn test:e2e tests/e2e/websites-route.spec.ts"
  - id: C7
    statement: "Types pass with the chooser gone"
    evidence: check
    command: "yarn typecheck"
---

# Contract — SITE-24 websites-route

## Build notes

Wave 4, first. After SITE-2 (`redirects()` and the routes spec) and SITE-5 (the footer out of `main`). SITE-25 builds on this.

- **Approach:** add the redirect beside SITE-2's (`permanent: true`, source `/websites/coded` exactly, no `:path*`). Move `app/websites/coded/page.tsx` to `app/websites/page.tsx` unchanged but for its imports, over the chooser; delete the chooser's three files. In `lib/routes.ts` set `coded: "/websites"`, drop `chooser`, and write the showcase prefix as the literal.
- **Decisions that apply:** D-SITE-111: `/websites` serves the coded page; `/websites/coded` redirects there. D-SITE-215: 308, exact path only. D-SITE-160: the intake stays at `/websites/coded/intake`. D-SITE-112: `/websites/platform` is untouched legacy. D-SITE-230: it takes the new header and footer; D-SITE-209 binds its body, "proven by a golden file".
- **Interfaces:** `websiteRoutes = { platform, coded }` with `coded` at `/websites`; the redirect; `tests/golden/websites-platform.main.html` (or the builder's path).
- **Per path:** `next.config.ts`: one more redirect. `lib/routes.ts`: as above, with D-SITE-160's comment. `app/websites/page.tsx`: today's coded page. The three chooser files and `app/websites/coded/page.tsx`: deleted. `tests/e2e/websites-route.spec.ts`, `websites-platform-golden.spec.ts`, `tests/unit/website-routes.test.ts`.
- **The golden file:** take it from `main` before changing anything: a scratch `git worktree` of `main`, its own `build:agent` and `start:agent` (its own dist dir, a port outside 3000–3010, stopped after), `main`'s inner HTML of `/websites/platform`, the footer element removed. Head the file with `main`'s commit. Then confirm the branch head, before this ticket's change, renders the same; if not, stop and tell Taylor what differs.
- **Gotchas:** SITE-2's C2 asserts `/websites/coded` answers 200: rewrite that one line of `routes.spec.ts` to the 308, declared here (harmless below Q3). Assert the real `Location` with `maxRedirects: 0`. A carried query must survive. Read C2's main-side answers before the change. C5's sensitivity line is a test that edits a copy of the golden HTML, never the page. The intake keeps every file, cookie and link: grep `websiteRoutes.coded` and `/websites/coded` before and after.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a `:path*` redirect that swallows the intake, or a golden file taken from the branch instead of `main`.
