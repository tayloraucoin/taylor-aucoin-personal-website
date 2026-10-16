---
target: specs/web/ux/public/case-study.md
status: approved
promoted:
design:
  file: Taylor Aucoin (Paper)
  page: Case study (process and state crops on "Case study · iterations", D-SITE-77, D-SITE-96)
  artboards: "Case study: Base · <desktop|mobile> · <dark|light> (Conscious Connections); <study> · desktop · dark. Iterations: case-study / <state> / <1440|390> / <dark|light> · <study> · <crop>"
  captures: "captures/case-study/<state>-<width>[-dark][-2].png"
  locked: 2026-10-15 (D-SITE-97)
---

# Case study — public

Intent pass, amended by the Design stage (D-SITE-77 to 96), filled by the handoff pass. Decisions are `D-SITE-n` in the decision logs. On the canvas (D-SITE-17). One template serves all six studies; each is drawn full for copy review (D-SITE-90).

Parts: `case-study-build.md` (Layout and components, Access, Instrumentation, Criteria) and `case-study-words.md` (Words).

## Job

Inside one story, the hirer sees what the product is, what was at stake, what Taylor built and how, then what he decided and what happened. Then they book a call. Done for them: they could retell one decision and why it was made. Order (D-SITE-79, D-SITE-96): opening with the facts ledger and lead artifact; At a glance (role, period, engagement, the atAGlance rows, stack, links); The brief; What I built, as gallery, screens band or surface rows per study (D-SITE-91), holding the screens (D-SITE-82); Process; three to five decisions, an artifact only where it shows the decision (D-SITE-80); What broke; Outcome; where AI sat, only when it did; a testimonial, only when one exists; book a call.

## Entry and exit

- **Entry:**
  - A home story, full page at the top (D-SITE-3).
  - A `/work` row.
  - A capability card's proof (D-SITE-141).
  - A testimonial's project link on `/about`.
  - A pasted link, often from a recruiter. Its preview text is `metaDescription` (verified `content/work/types.ts`).
- **Exit:** booking, through the screening step at `/book` (D-SITE-126, 165); the header's "Contact" to `/contact` (D-SITE-130); the study's live links where they exist (Conscious Connections, Agora; verified); back to `/work` ("All work").

## States

Content decides the state; `?state=<key>` forces the fixture named in the row (C-P08). Captures are `captures/case-study/`; each row has four: `<key>-1440-dark.png`, `-1440.png`, `-390-dark.png`, `-390.png`.

| State            | Key              | What shows                                                                                                                          | Canvas                                                                                                                                  |
| ---------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Default          | `default`        | Every block present. Everbook's tail: Outcome, Where AI sat, Testimonial, close                                                     | `default-*` (crop, D-SITE-83)                                                                                                           |
| No gallery       | `no-gallery`     | Renders as `no-artifacts` now that the gallery lives in What I built (D-SITE-82)                                                    | N/A: same render as `no-artifacts`                                                                                                      |
| No testimonial   | `no-testimonial` | The testimonial block is gone; the call follows the last block. Conscious Connections, the full page                                | `no-testimonial-1440[-dark]`; at 390 two parts split at Decisions, `-390[-dark].png` then `-390[-dark]-2.png` (D-SITE-88). Lacks At a glance (D-SITE-96): re-export due before build (D-SITE-196) |
| No AI            | `no-ai`          | "Where AI sat" is gone. Fixture: Everbook minus AI; Roomvy is the real case                                                         | `no-ai-*` (crop)                                                                                                                        |
| Bare             | `bare`           | All optional blocks gone. Calculate's tail (D-SITE-5)                                                                               | `bare-*` (crop)                                                                                                                         |
| No artifacts     | `no-artifacts`   | No lead artifact, no screens, no "All n images"; What I built in rows, text only. Calculate's head (D-SITE-21)                      | `no-artifacts-*` (crop)                                                                                                                 |
| Band format      | `format-band`    | What I built as the screens band, then the two-column surface list and "All n images". Conscious Connections, kept as a band (D-SITE-193) | What I built region of `no-testimonial-*` (no own crop)                                                                                 |
| Rows format      | `format-rows`    | What I built as surface rows, then unlabelled screens in two framed panels with a meta credit line. Roomvy (D-SITE-81)               | `format-rows-*` (crop)                                                                                                                  |
| Gallery format   | `format-gallery` | What I built as home's gallery, then the surface list. Everbook, over 5 screens (D-SITE-91)                                         | `format-gallery-*` (crop)                                                                                                               |
| Paired format    | `format-paired`  | Surface rows, a screen under the row it shows. The family office (D-SITE-91)                                                        | `format-paired-*` (crop)                                                                                                                |
| Not found        | `not-found`      | A mistyped or unpublished slug (`WORK_PUBLISHED`): one line and a way to `/work`. Shared by the whole site (D-SITE-19)              | `not-found-*` (viewport)                                                                                                                |
| Loading, offline | —                | N/A (D-SITE-18)                                                                                                                     | N/A: server-rendered, no client fetch                                                                                                   |
| Empty            | —                | `bare` is the floor; a study without decisions is not published                                                                     | N/A: never published                                                                                                                    |
| Partial          | —                | The optional-block keys above (D-SITE-18)                                                                                           | See those rows                                                                                                                          |
| Success          | —                | N/A: a reading page                                                                                                                 | N/A: nothing to complete                                                                                                                |

Testimonials on file: Everbook (Dawson), the family office (Bruno), Agora (Yogesh Verma; D-SITE-6, 94). Verified in `content/testimonials.ts`.

## Primary action

Book a 30-minute call, with the same label as home's (A-17), to `/book` (D-SITE-165): the close's filled button, the only primary on the page; the header's ghost button at 1440 goes to the same place.

## Open decisions

- [NEEDS DECISION] Which studies carry "Where AI sat". The content type has no field for it yet (verified `types.ts`). Default: Taylor marks each study when writing the block, and absence means `no-ai` (D-SITE-85).
- [NEEDS DECISION] Where the family office's further artifacts and Calculate's coming captures live (D-SITE-78).
- [PROPOSED] A per-study content field for the What I built format (gallery, band, rows-after, rows-paired) and, for paired rows, which surface each screen belongs to (D-SITE-91).
- [PROPOSED] A per-study `facts` field for the facts ledger's four cells (D-SITE-194).
- Conscious Connections keeps the band (D-SITE-193); build check: the band's "All 5 images" against D-SITE-91's count of 6 media items.
- `PageDismiss` retires (D-SITE-195).
- The close's "Not ready to book?" offers "Send a note" to `/contact` in place of the email address (D-SITE-174).
- Re-export the base's `no-testimonial` captures (eight files, 390 two-part split) from Paper in a Design thread before the build ticket; an export, no canvas edit (D-SITE-196). Until then Paper's "Case study" page is the reference for At a glance.
- Carried for Taylor's rewrite (D-SITE-89, decisions-5 flags): one closing line per study or shared; Everbook's live links (D-SITE-86); Calculate's link [verify]; Agora's type label [verify] (D-SITE-93).
