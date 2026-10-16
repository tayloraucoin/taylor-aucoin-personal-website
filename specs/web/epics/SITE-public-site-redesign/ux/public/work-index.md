---
target: specs/web/ux/public/work-index.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: Work (process on "Work · iterations", D-SITE-105)
  artboards: "work / <default|websites|branding|filtered (?type=contract)> / <1440|390> / <dark|light>; all but default are region crops"
  captures: "captures/work-index/<default|websites|branding|filtered>-<width>[-dark].png"
  locked: 2026-10-16 (D-SITE-108)
---

# Work index — public

Intent pass, refreshed 2026-10-16 after home's lock (D-SITE-98 to 104), then the Design stage (D-SITE-105 to 108); handoff pass 2026-10-16. Decisions are `D-SITE-n` in the decision logs. A new route with no version one, on the canvas (D-SITE-17). It replaces today's home Selected work list (`SelectedWork.tsx`) and the work overlay (D-SITE-3, D-SITE-103).

Parts: layout, access, instrumentation and criteria in `work-index-build.md`; every string in `work-index-words.md`.

## Job

A hirer who wants more than home showed sees every piece of work in one discipline, sorted by how it was engaged, and opens one. Done for them: they know which shape of engagement each project was and have picked the story to read.

## Entry and exit

- **Entry:** the header's Work item (D-SITE-2); "See all work" from any of home's three tabs, carrying its tab and chip (D-SITE-51, D-SITE-101); Work with me's branding proof at `?tab=branding` (D-SITE-122); a `/capabilities` proof that is only a website or kit, at `?tab=websites` or `?tab=branding` (D-SITE-141; D-SITE-192); a direct or shared link.
- **Exit:** a row with a case study opens `/work/[slug]` full page, at the top (D-SITE-3); a kit row whose product has a study leads with its story link (D-SITE-106). A row without one opens its gallery in the lightbox, with its live link in the row (D-SITE-99). One line after the list goes to `/capabilities` (D-SITE-102). The header's call button goes to `/book` (D-SITE-165).

## Organisation (D-SITE-100)

- **Tabs:** Product engineering (default) · Websites · Branding & UI, the same as home.
- **Type chips:** All, then only the types that tab carries, shown only when it carries two or more (D-SITE-54). Product engineering: Full-time, Contract, Business, Passion projects. Branding & UI: Business, Passion projects, Own brand. Websites (all Client): no chips.
- **Under All:** a label column groups rows by type (Full-time, Contract, Business, Passion projects, Client, Own brand), with no counts (D-SITE-8). One chip selected hides the label (D-SITE-106 A3).
- **Rows:** title, its tagline, meta as role · period, the type carried by the label column (D-SITE-106). No marks (D-SITE-102). Within a group, newest first, as drawn (D-SITE-188).
- **URL:** `?tab=` and `?type=`; Featured from home maps to All; an unknown value falls back to All (D-SITE-101).

Rows by tab, in canvas order (product engineering verified `content/work/*.ts`; websites and branding from the Paper Home page, D-SITE-98, to live in one typed content file, D-SITE-188):

- Product engineering: Everbook, Roomvy, Calculate by QxMD (Full-time); the family office, unnamed (Contract); Agora (Business); Conscious Connections (Passion projects).
- Websites: Clean Coast Detailing [NEEDS DECISION] (D-SITE-42), Kryshan Randel [NEEDS DECISION] (D-SITE-42), Holistica (Client).
- Branding & UI: Agora (Business), Conscious Connections (Passion projects), Taylor Aucoin (Own brand).

## States (D-SITE-104)

Each drawn state is reached by its URL (`?tab=`, `?type=`), which is its `?state=` (C-P08). Captures sit in `captures/work-index/`; each row has `-1440`, `-390` and the `-dark` pair.

| State            | Key        | What shows                                                                                                                                  | Canvas                                       |
| ---------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Default          | `default`  | Product engineering tab, All chip, six rows grouped by type, then the `/capabilities` line                                                  | `default-1440.png`, `-390`, `-1440-dark`, `-390-dark` |
| Websites tab     | `websites` | `?tab=websites`: three Client rows, no chips; each row shows its gallery opener and live link                                               | `websites-1440.png`, `-390`, `-1440-dark`, `-390-dark` (crop) |
| Branding tab     | `branding` | `?tab=branding`: three rows with chips; under All, grouped Business, Passion projects, Own brand                                            | `branding-1440.png`, `-390`, `-1440-dark`, `-390-dark` (crop) |
| Filtered         | `filtered` | `?type=contract`: the Contract chip selected, no group label, the family office                                                            | `filtered-1440.png`, `-390`, `-1440-dark`, `-390-dark` (crop) |
| Empty            | —          | N/A: a tab whose rows are all unpublished (`WORK_PUBLISHED`) is hidden, and chips come from the rows, so no chip shows nothing              | N/A: unreachable                             |
| Unknown param    | —          | N/A: falls back to All, with no layout of its own                                                                                           | N/A: renders as `default`                    |
| Lightbox open    | —          | N/A: the existing `MediaLightbox.tsx`                                                                                                       | N/A: existing component                      |
| Loading, offline | —          | N/A (D-SITE-18)                                                                                                                             | N/A: server-rendered                         |
| Error, success   | —          | N/A: a static route, navigation only                                                                                                        | N/A: no submit                               |

Light and dark for every drawn state; the site opens dark (D-SITE-61). No row hover; links and chips take home's hover rule (Taylor, handoff rulings); focus follows the kit's ring (`work-index-build.md`).

## Primary action

Open a case study ("Read the decision story").

## Open decisions

- [NEEDS DECISION] Clean Coast on the site (D-SITE-42). Drawn, marked; deleting the row is the whole change.
- [NEEDS DECISION] Kryshan Randel: client permission and artifacts (D-SITE-42). Holistica appears when it ships.
- Website and branding rows live in one typed content file read by `/work`, home's two tabs and `/websites`' examples; case studies gain a type field (D-SITE-188).
- A kit row shows "Read the decision story" only when its data names a case-study slug; the Taylor Aucoin kit has none yet (D-SITE-175, closes D-SITE-107's follow-up).
- Canvas row strings win on `/work` only (D-SITE-189).
- The family office keeps its unnamed label until the client confirms in writing (brief; settled).
- Chrome follows the site-wide changes at build, no redraw: header gains Contact, footer Email becomes Contact (D-SITE-130); `/services` links become `/work-with-me` (D-SITE-164).
