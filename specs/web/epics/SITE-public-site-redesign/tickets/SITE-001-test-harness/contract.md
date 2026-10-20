---
id: SITE-1
size: small
objective: "every later SITE ticket can prove its browser criteria: Playwright and axe run against the agent server, a capture script shoots every ?state= key, and yarn test runs every unit file"
slice_type: "test infrastructure; risks a harness that passes on nothing (a runner that finds no tests, an axe helper that never fails, a check that scans no files)"
non_negotiables:
  - "@playwright/test (Chromium only) and @axe-core/playwright are exact-pinned dev dependencies, @playwright/test at the same version as the existing playwright devDependency, each with its tech-stack.md row (D-SITE-228)"
  - "Browser tests run against yarn build:agent and yarn start:agent on :4310; nothing reaches port 3000 or .next"
  - "No retries in the Playwright config: flake is a defect, quarantined with an owner in its ticket"
  - "Playwright stays outside yarn verify; each ticket names its Playwright command as a criterion script"
  - "readPageState returns default on a production deployment without awaiting searchParams, so production pages prerender static and no fixture renders there"
  - "process.env is read only in lib/env.ts (ts.md): the production test is a helper there"
  - "Fixtures are synthetic and recognisably fake; never a real person's words"
devs_call: "Config layout, file names under tests/, how the web server is started and reused, the capture script's flags, and the unit glob"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/decisions-14.md"
  - "D-SITE-228"
truth_files: "none: test tooling changes nothing a visitor sees"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "package.json"
  - "yarn.lock"
  - "playwright.config.ts"
  - "tests/**"
  - "scripts/capture-states.ts"
  - "scripts/check-build-output.ts"
  - "lib/page-state.ts"
  - "lib/env.ts"
  - "docs/engineering/tech-stack.md"
  - ".gitignore"
depends_on: []
out_of_scope:
  - "Any page's ?state= keys or fixtures: each page ticket registers its own"
  - "Playwright in CI and in yarn verify: a later ticket decides the CI cost (technical/test-shape.md)"
  - "The unit runner question (node:test or Vitest): MIG-5's; this ticket keeps node:test"
  - "Firefox and WebKit"
criteria:
  - id: C1
    statement: "yarn test runs tests/unit/page-state.test.ts beside the smoke file: readPageState returns a listed key, returns default for an unlisted one, and returns default when isProductionDeployment() is true without reading searchParams (a Promise that throws if awaited)"
    evidence: test
    command: "yarn test"
  - id: C2
    statement: "A Playwright spec against :4310 loads / and runs axe; the shared axe helper fails on a seeded serious violation (page.setContent) and passes a clean page"
    evidence: test
    command: "yarn test:e2e tests/e2e/harness.spec.ts"
  - id: C3
    statement: "@playwright/test and @axe-core/playwright are exact pins in devDependencies, and @playwright/test equals the playwright pin"
    evidence: test
    command: "yarn test"
  - id: C4
    statement: "The capture script run on / with key default writes default-390.png, default-834.png, default-1440.png, their -dark twins and default-390-reduced.png, all non-empty; with --expect 404 on /no-such-page it writes the same set; when the first response's status differs from --expect (default 200) it exits non-zero and writes nothing"
    evidence: test
    command: "yarn test:e2e tests/e2e/capture.spec.ts"
  - id: C6
    statement: "yarn test loads a unit file that imports content/work through the @/ alias, with its png and webp imports stubbed, and finds the published studies; a unit file importing a server-only module loads"
    evidence: test
    command: "yarn test"
  - id: C5
    statement: "The build-output check fails when a prerendered HTML file holds a fixture sentinel, the draft mark or a bracketed ASSUMPTION, PROPOSED or FILL placeholder, fails when its directory holds no HTML file at all, and passes a clean directory (proven on temp fixtures)"
    evidence: test
    command: "yarn test"
---

# Contract — SITE-1 test-harness

## Build notes

Wave 1, first: every other SITE ticket's browser criteria run through this. Read `technical/test-shape.md` (the risk table and its rules) first.

- **Approach:** add the two packages; a `playwright.config.ts` (Chromium project, base URL `http://localhost:4310`, `webServer` running `yarn start:agent` with `reuseExistingServer`, retries 0); a shared axe helper; the capture script; the page-state reader with its env helper; the build-output check. Widen `yarn test` to `tests/unit/**/*.test.ts` plus the smoke file. The Tickets gate stubbed `test:e2e` (`playwright test`) and `capture` (`node --import tsx scripts/capture-states.ts`) in `package.json` so criteria could cite them; this ticket makes them real and adds `check:build-output`.
- **Decisions that apply:** D-SITE-228: "The first ticket adds `@playwright/test` (Chromium) and `@axe-core/playwright`, exact-pinned dev dependencies with their `tech-stack.md` rows, and a capture script over every `?state=` key." `?state=` (data-contract.md): "`readPageState(searchParams, keys)` returns the requested key when it is in that page's States table, else `default`. On a production deployment (`VERCEL_ENV === "production"`) it returns `default` without awaiting `searchParams`." Canon C-P08: every reachable state of a new surface is reachable by `?state=`.
- **Interfaces:** `isProductionDeployment(): boolean` in `lib/env.ts` (reads `VERCEL_ENV`, not a secret; nothing else in `env.ts` changes). `readPageState<K>(searchParams, keys: readonly K[]): Promise<K | "default">` in `lib/page-state.ts`. `expectNoSeriousA11y(page)` in `tests/e2e/axe.ts`. `yarn capture --route <path> --keys <a,b> --out <dir> [--expect <status>]`. `yarn check:build-output [--dir <path>]`, default `.next-build/server/app`.
- **Per path:** `package.json`: two devDependencies, three scripts, `test` widened. `playwright.config.ts`: as above. `tests/e2e/harness.spec.ts`, `tests/e2e/capture.spec.ts` (spawns the script, writes to a temp dir): C2, C4. `tests/unit/page-state.test.ts`, `deps.test.ts`, `build-output.test.ts`, `content.test.ts`: C1, C3, C5, C6. `tests/loader.mjs`: the alias and asset stub. `scripts/capture-states.ts`: `colorScheme` and `prefers-reduced-motion` set per shot; theme through the `ta-theme` localStorage key; first response's status not `--expect` (default 200) → exit 1, so `not-found` (HTTP 404) is capturable. `scripts/check-build-output.ts`: C5. `lib/page-state.ts`, `lib/env.ts`: the reader and its helper. `docs/engineering/tech-stack.md`: the `@playwright/test` row says 1.63.0 under `apps/web` (toolkit default); correct it to this repo's root and the pinned version; add the axe row. `.gitignore`: `tests/.captures/`, `test-results/`, `playwright-report/`.
- **Gotchas:** `playwright` 1.62.1 is already a devDependency for `capture:example`; a mismatched `@playwright/test` downloads a second browser. `yarn playwright install chromium` needs the network: run it unsandboxed once. The build-output check is meaningful only on a build where pages prerender: run it after `VERCEL_ENV=production yarn build:agent` (`VERCEL_ENV` selects no credentials here; verified `lib/config/env`), since in an ordinary build a page awaiting `searchParams` is dynamic and writes no HTML. `node --test` resolves neither `@/` nor the static `.png`/`.webp` imports in `content/work/*.ts` (as `agora.ts`): the `test` script must register a loader (`tests/loader.mjs`, via `--import`) that resolves `@/` through tsx, stubs image imports and maps `server-only` to an empty module (absent here, and it throws under plain Node: `scripts/seed-example-sites.ts`); SITE-2 and SITE-3 unit-test modules that import `content/work`, so relative paths are not an option. Name tests after their criterion (`C1 …`): a runner that finds nothing must not pass. `start:agent` serves `.next-build`, so specs need `yarn build:agent` first; never `yarn build`. `searchParams` is a Promise in Next 15. The site defaults dark, so a light shot sets `ta-theme=light` before load.
- **Google in tests:** with no geo headers the regime falls back to unrestricted, so on a build with a GA ID every page loads gtag.js. A shared fixture (`tests/e2e/fixtures.ts`, every spec imports `test` from it) answers every Google host with a local 204; a spec opts into real gtag.js by name (SITE-3). No spec ever sends a hit to Google.
- **Builds, one at a time (they share `.next-build`):** plain `yarn build:agent` for SITE-1 and SITE-2 specs and captures; `NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent` for SITE-3's spec; `VERCEL_ENV=production yarn build:agent` for `check:build-output`. Write the three in the config's header comment.
- **Operator check (deferred):** `check:build-output` on a real `VERCEL_ENV=production` build scans at least one HTML file and passes.
- **Flag:** `lib/env.ts` is on Warden's map row (`**/env.ts`). The change is one non-secret read; Q1 stands unless Taylor raises it.
- **Model:** Opus 5.5 at medium, minimum and recommended. Choosing down risks a harness whose failure paths are never proven.
