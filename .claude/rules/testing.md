---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "**/playwright.config.*"
---

# Tests and captures

- Tests assert behavior a user or caller can observe, never implementation details.
- Playwright captures run at 390, 834 and 1440 wide, light and dark, with reduced motion, for every `?state=` value. The critic scores only what was captured; an uncaptured state is UNVERIFIED (canon C-R01). No capture harness exists here yet, so every `capture` criterion is UNVERIFIED.
- Fixtures are seeded and realistic; never real customer data.
- Run tests and Playwright through `yarn` (`yarn playwright …`), never `npx`.
- Every contract criterion names its evidence type: `test` for logic, data, money and auth; `check` for lint, types, boundaries and tokens; `capture` for UI, through `?state=`; `manual` for a human check, with a reason, reported as not verified. UI criteria default to `capture`.
- Weakening a test (deleting one, `.skip`, `.only`, fewer assertions) needs a "Test changes" line in the ticket's `as-built.md`.
