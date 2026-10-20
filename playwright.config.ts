import { defineConfig, devices } from "@playwright/test";

/**
 * Browser tests and captures, against the agent's production server on :4310.
 *
 * `start:agent` serves `.next-build`, so build first. Builds share that folder:
 * run them one at a time, and never `yarn build` (it rewrites the `.next` that
 * Taylor's own dev server on :3000 reads).
 *
 *   yarn build:agent                                    SITE-1, SITE-2 specs, captures
 *   NEXT_PUBLIC_GA_ID=G-TEST000000 yarn build:agent     SITE-3's spec
 *   VERCEL_ENV=production yarn build:agent              yarn check:build-output
 *
 * No retries: a flaky test is a defect, quarantined with an owner in its ticket.
 * Every spec imports `test` from `tests/e2e/fixtures.ts`, which answers Google
 * hosts with a local 204. Outside `yarn verify`; each ticket names its command.
 */
const BASE_URL = "http://localhost:4310";

export default defineConfig({
  testDir: "tests/e2e",
  retries: 0,
  forbidOnly: true,
  reporter: "list",
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "yarn start:agent",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
