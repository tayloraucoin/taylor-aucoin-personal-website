---
id: SITE-16
size: small
objective: "a hirer reading What I built sees each study's screens in the format set for it, band, gallery, rows with screens after, or rows with a screen paired under its surface, and opens any screen full size in the lightbox and comes back to where they were"
slice_type: "four render paths over one typed field plus a shared gallery and an existing lightbox; risks a study drawn in the wrong format, a tile with no name, an All n images count that disagrees with the lightbox, and focus lost on close"
non_negotiables:
  - "builtFormat decides the render, never the media count at runtime (D-SITE-91, 193): Everbook and Agora gallery, Conscious Connections band, Roomvy rows-after, the family office rows-paired, Calculate rows with no screens"
  - "The gallery is one StoryGallery in components/work/, shared with SITE-11, with a size for the case study's 207x130 thumbs (D-SITE-92); never a second gallery and never a carousel (D-SITE-39)"
  - "Every tile, thumb and All n images opens the existing MediaLightbox, unchanged in behaviour (D-SITE-82, 182)"
  - "Each tile and thumb is a button named by its visible caption; n in All n images is the number of items the lightbox steps through"
  - "The recording never autoplays; with reduced motion, hover transitions are 0ms"
devs_call: "Component names for the four formats under app/work/[slug]/_components/, how StoryGallery takes the case-study size, the format fixtures in _fixtures.ts, and test file names"
waiver: "One surface, the case study, split for the token cap: case-study.md holds the States rows, case-study-build.md the layout, access and criteria"
cites:
  - "specs/web/epics/SITE-public-site-redesign/ux/public/case-study.md"
  - "specs/web/epics/SITE-public-site-redesign/ux/public/case-study-build.md"
  - "D-SITE-82"
  - "D-SITE-91"
  - "D-SITE-193"
  - "D-SITE-196"
  - "C-SITE-case-study-2"
  - "C-SITE-case-study-8"
  - "C-SITE-case-study-9"
  - "C-SITE-case-study-11"
truth_files: "none: no living UX file exists yet; the epic's surfaces promote when it ships"
qa: Q1
reviewers: []
focus: []
operator_review: false
planned_paths:
  - "app/work/[slug]/_components/**"
  - "app/work/[slug]/_fixtures.ts"
  - "app/work/[slug]/page.tsx"
  - "components/work/StoryGallery.tsx"
  - "components/work/CaseMedia.tsx"
  - "components/work/MediaRail.tsx"
  - "components/work/VideoFigure.tsx"
  - "components/work/Section.tsx"
  - "tests/**"
depends_on: [ SITE-15 ]
out_of_scope:
  - "The rest of the case study, its order, absent blocks, close, Escape outside the lightbox and the other States keys (C-SITE-case-study-1 to 7, 10, 12 to 15): SITE-15"
  - "MediaLightbox's own behaviour and its home use: SITE-11; the family office's further artifacts and Calculate's captures (D-SITE-232): content edits by Taylor"
  - "The no-testimonial re-export from Paper (D-SITE-196): a Design thread, before this build starts"
criteria:
  - id: C1
    statement: "/work/everbook and /work/agora render What I built as a gallery (lead screen, captioned thumbs, an All n images tile, then the two-column surface list); /work/conscious-connections as the band (captioned tiles on a surface panel, the surface list, All n images); /work/roomvy as surface rows then its screens in framed panels with a meta credit line; /work/family-office-platform as rows with its diagram under Unified data layer only; /work/calculate-qxmd as rows with no image, tile or All n images (C-SITE-case-study-8)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study-formats.spec.ts"
  - id: C2
    statement: "On each study with screens, activating the second tile or thumb opens the lightbox on that item and All n images opens it on the first; focus moves into the dialog and stays there on Tab; Escape closes it and focus returns to the control that opened it (C-SITE-case-study-9)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study-formats.spec.ts"
  - id: C3
    statement: "Every tile and thumb is a button whose accessible name is its visible caption; on every study, the n in All n images equals the number of items the lightbox steps through, Conscious Connections included"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study-formats.spec.ts"
  - id: C4
    statement: "At 390 the gallery's thumbs sit two per row, What I built causes no horizontal scroll and All n images is at least 44px tall; with reduced motion on and off no video plays without a press; axe reports no serious or critical violation on each format (C-SITE-case-study-11)"
    evidence: test
    command: "yarn test:e2e tests/e2e/case-study-formats.spec.ts"
  - id: C5
    statement: "format-rows, format-gallery and format-paired by ?state= match captures/case-study/ at 390 and 1440, dark and light; format-band matches the What I built region of the no-testimonial captures; Conscious Connections' full page matches the re-exported no-testimonial captures, both parts at 390 (C-SITE-case-study-2)"
    evidence: capture
    path: "specs/web/epics/SITE-public-site-redesign/tickets/SITE-016-case-study-formats/evidence/states/"
---

# Contract — SITE-16 case-study-formats

## Build notes

Wave 3, after SITE-15 (the page and its text-only `WhatIBuilt`). Whichever of SITE-11 and SITE-16 builds first creates `StoryGallery`, the other reuses it; never both at once, so this ticket does not wait on home's `pillar-open` gate.

- **Pre-build:** D-SITE-196, the eight `no-testimonial` files re-exported from Paper with At a glance. Until they land, C5's full-page half cannot be recorded; start the build, record C5 last.
- **Approach:** `WhatIBuilt` switches on `study.builtFormat` and renders one of four leaves: `BuiltGallery` (StoryGallery, then the surface list), `BuiltBand` (tiles on `--surface`, two per row at 390, the recording as a poster with the square play mark), `BuiltRowsAfter` (ledger rows, then the screens in two framed panels and a meta credit), `BuiltRowsPaired` (a card's `screen` on a surface panel under its row). Rows with no media draw no panel. One `MediaLightbox` per page, fed the study's media in order, opened at an index.
- **Decisions that apply:** D-SITE-91: "A study with more than 5 screens takes the gallery." D-SITE-92: "The gallery's five tiles split 1080 with 11.25 gaps; at 390, thumbs go two per row and surfaces stack." D-SITE-193: "`format-band`… kept for Conscious Connections, captured in the What I built region of the `no-testimonial` captures."
- **Words:** case-study-words.md: the `built` intro, surface names and bodies, tile captions from each study's `media`, "All n images" with n counted; lightbox names stay as `MediaLightbox.tsx` has them.
- **Interfaces:** the four leaves; `StoryGallery` gains a size option, home's 160x104 the default; `format-band`, `format-rows`, `format-gallery`, `format-paired` join the page's States list, each rendering that study's What I built (Conscious Connections, Roomvy, Everbook, the family office) through `_fixtures.ts`.
- **Per path:** the leaves and `WhatIBuilt`; the fixtures; the States list in `page.tsx`; `StoryGallery`'s size; delete `CaseMedia.tsx`, `MediaRail.tsx` and `Section.tsx` once nothing imports them, and `VideoFigure.tsx` unless the band's poster reuses it; `tests/e2e/case-study-formats.spec.ts`.
- **Gotchas:** Conscious Connections has 6 media items while the canvas says "All 5 images": C3 makes the count honest; tell Taylor which item is the extra at the look. Agora's 21 items carry generation labels in their alt only. The family office stays unnamed on the page. `content/work` images must not enter a client leaf's import graph: pass plain props. Map the kit's token names through `.claude/rules/house-design.md`. Captures: `yarn capture --route /work/everbook --keys format-band,format-rows,format-gallery,format-paired --out <evidence dir>`, then `yarn capture --route /work/conscious-connections --keys default --out <evidence dir>`.
- **Model:** Sonnet 5.5 at medium, minimum and recommended. Choosing down risks a lightbox that drops focus on close.
