---
target: specs/web/ux/public/websites.md
status: approved
promoted:
---

# `/websites` — public

Intent refreshed 2026-10-16 (D-SITE-111); handoff pass 2026-10-16. Decisions are `D-SITE-n` in `overview.md`.

## What this route is now

`/websites` serves the coded website page. Its surface is `websites-coded.md`, which holds the job, states, layout and criteria; this file records only the route change.

- `/websites/coded` redirects to `/websites` with a 308 (D-SITE-111, D-SITE-215). The redirect matches that exact path only; `/websites/coded/intake` and everything under it stay where they are (D-SITE-160). The query string carries through.
- `lib/routes.ts` builds the intake prefix from `websiteRoutes.coded`, so the page route and the intake prefix are split at build: the page constant moves to `/websites`, the intake prefix stays `/websites/coded/intake` (D-SITE-160).
- The chooser retires: both doors (`TrackDoors.tsx`), the "Not sure which one?" picker (`TrackPicker.tsx`) with its profession list and three verdicts, and the phone fallback line (verified `content/websites-chooser.ts`). Taylor was asked before cutting.
- `/websites/platform` is untouched legacy, reached by direct URL only (D-SITE-112).

## Entry and exit

- **Entry:** home's Websites tab link; the coded website offer on Work with me (D-SITE-109, now pointing at `/websites`; Work with me is at `/work-with-me`, D-SITE-164); old `/websites/coded` links by redirect.
- **Exit:** as `websites-coded.md`.

## States

| State    | Key | What shows                                     | Canvas |
| -------- | --- | ---------------------------------------------- | ------ |
| Redirect | —   | N/A: `/websites/coded` answers with a redirect | N/A: no page renders |

## Criteria

| ID                | When                                         | Then                                                                                                               | Evidence |
| ----------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- |
| C-SITE-websites-1 | GET `/websites/coded` and `/websites/coded?x=1` | 308 to `/websites` and `/websites?x=1`                                                                           | test     |
| C-SITE-websites-2 | GET `/websites/coded/intake` and a resume path under it | No redirect; the intake answers as before and its cookie path is unchanged (D-SITE-160)                   | test     |
| C-SITE-websites-3 | The build lands                              | `TrackDoors.tsx`, `TrackPicker.tsx`, `content/websites-chooser.ts` and `app/websites/coded/page.tsx` are gone, with no imports left | check    |
| C-SITE-websites-4 | The site's links                             | No link outside the intake points at `/websites/coded`; home's tab and the Work with me offer point at `/websites` | check    |
| C-SITE-websites-5 | GET `/websites/platform`                     | Renders as before, linked from nowhere on the site (D-SITE-112)                                                    | test     |

## Open decisions

- None open. The redirect is 308 permanent, exact path only (D-SITE-215; closes the [ASSUMPTION]).
