---
target: specs/web/ux/public/websites-platform.md
status: draft
promoted:
---

# Platform websites — public

Intent refreshed 2026-10-16 (D-SITE-112). Decisions are `D-SITE-n` in `overview.md`.

## Status: legacy, out of this epic

`/websites/platform` stays as it is today: no canvas, no restyle, no new criteria. It is reached by direct URL only; nothing on the site links to it (D-SITE-109). It keeps its own start, the platform intake (D-SITE-13), and the Clean Coast case (verified `CleanCoastCase.tsx`, `content/websites-clean-coast.ts`).

## Entry and exit

- **Entry:** direct URL only. The chooser that led here retires (D-SITE-111).
- **Exit:** the platform intake (verified `StartCta.tsx` defaults to `intakeRoutes.start`); `/websites/terms` and `/websites/privacy`.

## Open decisions

- No header call button here (D-SITE-23), as today.
- [NEEDS DECISION] whether the page is restyled to the new brand later, in its own ticket.
