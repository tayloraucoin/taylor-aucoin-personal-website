---
target: specs/web/ux/public/capabilities.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: Capabilities (process on "Capabilities · iterations", D-SITE-110)
  artboards: "capabilities / <default|tab (?tab=ai-data)|filtered (?q=realtime)|filter-empty (?q=kubernetes)|card-open|card-open, four proofs> / <1440|390> / <dark|light>; all but default are region crops; plus capabilities / motion (spec board, 1440 dark)"
  captures: "captures/capabilities/<default|tab|filtered|filter-empty|card-open|card-open-four-proofs>-<width>[-dark].png; motion-1440-dark.png"
  locked: 2026-10-16 (D-SITE-150)
---

# Capabilities — public

Intent pass refreshed 2026-10-16 (D-SITE-140 to 150); handoff pass 2026-10-16. Decisions are `D-SITE-n` in the decision logs. Today's `/capabilities` (`CapabilityGrid.tsx`) is the version one.

**Parts:** layout, access, instrumentation and criteria in `capabilities-build.md`; every string in `capabilities-words.md`.

## Job

The hirer who wants the whole list finds a problem they have, and opens the work that proves Taylor solved it. Done for them: they are reading the proof, not the list. Hearth's condition: every chip links to its proof, and the page never reads as "I do everything" (brief, Constraints; D-SITE-15).

## Entry and exit

- **Entry:** `/work`'s last line (D-SITE-102); home's chip block link "Search every capability [draft]" (Gloss to reword: Assay read "every" as leaning toward a menu); a direct or shared link, with `?q=` and `?tab=` (D-SITE-144, 146).
- **Exit:** an open chip's proof opens `/work/[slug]` (D-SITE-3); proof that is only a website or brand kit opens its `/work` tab, external proof stays external (D-SITE-141); the closing call's "Book a 30-minute call" opens `/book` (D-SITE-126, 165); the no-match line's "Send a note" and the close's "Send a note" open `/contact` (D-SITE-174); header and footer "Contact" open `/contact` (D-SITE-130).

## States (D-SITE-144, 146)

`?state=` keys; captures are in `captures/capabilities/`, each at `-1440`, `-390`, and `-dark` beside light.

| State                   | Key                     | What shows                                                                                                                                  | Canvas                                       |
| ----------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Default                 | `default`               | Filter empty, All selected, 25 chips, all closed                                                                                            | `default-1440-dark.png` (+ 390, light)       |
| Tab                     | `tab`                   | `?tab=ai-data`: AI & data selected, its 10 chips; at 390 the strip scrolled to keep it in view                                              | `tab-1440-dark.png` (+ 390, light)           |
| Filtered                | `filtered`              | `?q=realtime`: AI features, Realtime sync, Realtime voice (the filter reads past chip names); the field shows × at 32px                     | `filtered-1440-dark.png` (+ 390, light)      |
| No match                | `filter-empty`          | `?q=kubernetes` [synthetic]: "Nothing by that name.", then "Clear the filter [draft]" and "Send a note" (was "Ask me anyway", D-SITE-174), 24px apart                       | `filter-empty-1440-dark.png` (+ 390, light)  |
| Chip open               | `card-open`             | Search and discovery open in place, one proof (Agora); the other chips stay put, the card 24px from them (D-SITE-149)                       | `card-open-1440-dark.png` (+ 390, light)     |
| Chip open, four proofs  | `card-open-four-proofs` | Interface design open: four proofs in one sentence, each name kept with its comma, wrapping at 390 (D-SITE-204) | `card-open-four-proofs-1440-dark.png` (+ 390, light) |
| Motion                  | —                       | Open, close, switch, keyboard, filter and tab (D-SITE-147, amended by 148 and 178)                                                   | `motion-1440-dark.png`                       |
| Loading, offline        | —                       | N/A (D-SITE-18)                                                                                                                             | N/A: server-rendered, no client fetch        |
| Error, partial, success | —                       | N/A                                                                                                                                         | N/A: static route; the filter runs locally over content on file |
| Unknown or blank `?q=`  | —                       | N/A: a blank query is default; any other query is filtered or no match. An unknown `?tab=` falls back to All (D-SITE-101's rule)            | N/A: covered by `default` and `filter-empty` |

Chip hover, focus and pressed are component states, not page states: `capabilities-build.md`, Layout.

## Primary action

Open the work a chip proves: the proof names in an open card are the strongest text on it (D-SITE-145). The page's one primary-styled button is the closing call.

## Open decisions

- A hidden chip comes back as a content edit when work or an article proves it (D-SITE-15).
- [PROPOSED] Proof hrefs to change in `content/capabilities.ts` at build (D-SITE-141): "This site" → `/work?tab=branding`; consciousconnections.app → `/work/conscious-connections`, which has a case study.
- [PROPOSED] A `tabs` field per capability, first filled from today's tags (Design → Product & design; Commerce, Quality → Engineering; AI, Data → AI & data; Delivery, Process → Leading delivery: 4, 6, 10 and 7 chips), then Taylor reassigns, aiming for Engineering as the largest tab so AI & data does not read as the headline (Hearth, Assay round 3).
- [PROPOSED] A short chip name field in `content/capabilities.ts` (the 25 names are drawn only; verified, no such field today), and a sentence-case proof name where the canvas changed it ("the family office platform"; file: "Family Office Platform").
- Settled in the handoff pass: the no-match link and the close's fallback are both "Send a note" → `/contact`, one label for one intent (D-SITE-174); the open card's five type sizes are the logged exception to the per-story cap (D-SITE-173); reduced motion is 0ms everywhere (D-SITE-178); `q` is stripped from `page_location` (D-SITE-179); event names per D-SITE-176.
- Fragment Mono on the open chip's tech line is kept (Taylor, home ruling).
