# As-built — MIG-2

## Shipped against the contract

- C1: `.github/workflows/verify.yml` runs `yarn verify`, whose `build:agent` passed in a clean checkout with no `.env` file and no tier variables (2026-10-15). The only output about them is next.config.ts's warning that `SUPABASE_URL` did not resolve. Every tier variable is wired as an optional secret: an unset secret arrives empty and `buildIntakeEnvForNextConfig` skips it.
- C2: a step runs `yarn next typegen` before `yarn verify`. In a clean checkout, `yarn typecheck` failed with 33 TS2307 errors (image imports under `content/`) because `next-env.d.ts` is gitignored and only Next writes it. After `next typegen` it passes.
- C3: handed to Taylor (below).

## Deviations

- [ASSUMPTION] `next-env.d.ts` is produced by a workflow step, not by committing the file or reordering `verify`. `package.json` and `.gitignore` stay as the migration left them, and the ticket stays one file.
- A second planned path, `tooling/refs-pending.json`. On a fresh clone, `check-refs` failed: `.claude/settings.local.json` is git-ignored, so it is absent in CI, and two docs name it. The file now has a `machine-local, git-ignored` entry for it, the place `check-refs` keeps machine-local paths. With that entry the whole chain passed in a clean checkout.
- [ASSUMPTION] `actions/checkout@v5` and `actions/setup-node@v5` by major tag, with no dependency cache. `permissions: contents: read`, a 30-minute timeout, and concurrency that cancels a superseded run on the same ref.
- The build needs no secret, so the secrets Taylor adds are optional. What they buy is a CI build configured like a local one: the remote image host and the canonical names inlined into the server bundle. These are the repository secrets the workflow names. CI runs at tier `local` (`APP_ENVIRONMENT` unset), which borrows the STAGING set:
  - Supabase: `SUPABASE_STAGING_URL`, `SUPABASE_STAGING_PUBLIC_BUCKET`, `SUPABASE_STAGING_INTAKE_BUCKET`, `SUPABASE_STAGING_ANON_KEY`, `SUPABASE_STAGING_SERVICE_ROLE_KEY`
  - Database: `DATABASE_STAGING_URL`, `DIRECT_STAGING_DATABASE_URL`
  - Stripe: `STRIPE_STAGING_PUBLISHABLE_KEY`, `STRIPE_STAGING_SECRET_KEY`, and `STRIPE_STAGING_PRICE_` + `DEPOSIT`, `BALANCE`, `CHANGES_STANDARD`, `CHANGES_SMALL`, `EXTRA_PAGE`, `BOOKING_SETUP`, `GBP_CLEAN`, `LOGO`, `CARE_PLAN`
  - Left out on purpose: `STRIPE_LOCAL_WEBHOOK_SECRET` (minted per `stripe listen` session) and `NEXT_PUBLIC_SITE_URL_LOCAL` (defaults to localhost).

## Not verified

- C3: no workflow has run on GitHub. The clean-checkout runs above ran on macOS, Node 22.22.2, with this machine's Yarn cache, not on `ubuntu-latest`.

## Next

Taylor pushes the branch and opens a pull request to main. When the first run is green, he turns on branch protection requiring `verify`, and adds the secrets only if he wants CI's build to match his own.
