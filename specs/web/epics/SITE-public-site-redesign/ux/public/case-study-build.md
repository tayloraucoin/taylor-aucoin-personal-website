---
target: specs/web/ux/public/case-study-build.md
status: approved
promoted:
---

# Case study — build

Part of `case-study.md` (frontmatter, Job, States, Open decisions). Words in `case-study-words.md`.

## Layout and components

Grid: 1080 at 1440 (180 to 1260), 342 at 390; prose caps at 65ch. "Ledger row": label column 240, 32 gap, 640 body; stacked at 390. Sections about 96 apart at 1440, 48 at 390 (D-SITE-87). Type: h1 Display; section heads Heading 2 (24 at 390); row titles Heading 4; Body 17 (16 at 390); intros and captions Meta 13 or Small 15 (D-SITE-88, 89). Tokens: `--ground`, `--surface` (panels, card), `--hairline`, `--mark` (underlines, current-page bar), `--muted`, `--border-strong` (bullet), `--fill`/`--on-fill` (the one primary).

1. **Header** (shared, built elsewhere): wordmark · Work (current: `--mark` bar, `aria-current`) · About · Work with me · Contact (D-SITE-130) · ghost "Book a 30-minute call" to `/book` · theme toggle. 390: home's two-row header, no call button (D-SITE-87).
2. **Opening:** "All work" link to `/work`; meta line; h1; tagline at Lede; the **facts ledger** (Plumb: four cells between hairlines, each a Heading 4 fact over a meta line, the last a live link; stacked at 390); the **lead artifact frame** (Plumb: one full-width screen, hairline, meta caption; none without screens, D-SITE-86).
3. **At a glance** (D-SITE-96; Paper "Case study" base, absent from captures): Heading 2, meta line (role · period · engagement type), ledger rows (uppercase label · value), Stack middot-joined, Links with a meta status line.
4. **The brief:** intro; two groups (508 each, 64 gap), each a Heading 4 over hairline-separated items.
5. **What I built**, one of four formats by study (D-SITE-81, 91, 92): **screens band** (captioned phone tiles on a `--surface` panel, two per row at 390; recording poster with a square play mark), then the **two-column surface list** and "All n images"; **gallery** (lead screen, 207x130 thumbs, "All n images" tile), then the surface list; **surface rows** with screens after them and a meta credit; **paired surface row** (a screen on a surface panel under its row). All Plumb. "All n images" opens `MediaLightbox.tsx`.
6. **Process:** intro, then **process step rows** (Plumb: Heading 4 and muted intro in the 240 column, bullets in the body; the 4px square bullet).
7. **Decisions:** **decision ledger rows** (Plumb: label · decision at Heading 4 · "Instead of" and "Why" beats), with the optional in-body artifact panel and Meta caption (D-SITE-80).
8. **What broke:** intro, ledger rows, an optional closing paragraph.
9. **Outcome:** paragraph in `--text`, bullets, the live link last (D-SITE-86).
10. **Where AI sat** (only when present): home's three-list block (D-SITE-58, 85), three columns at 1440, stacked at 390.
11. **Testimonial** (only when present): the **case-study testimonial card** (Plumb, D-SITE-84).
12. **Close** (shared with `/about`, D-SITE-74): hairline, closing line, meta availability, the filled "Book a 30-minute call" to `/book` (the one primary), "Résumé (PDF)", "Not ready to book?" with "Send a note" to `/contact` (D-SITE-174). 390: the last wraps under.
13. **Footer** (shared): domain left, links right, Contact per D-SITE-130; wraps at 390.
14. **Not found:** the **not-found block** (Plumb) between header and footer, as `app/not-found.tsx` (D-SITE-19).

Retire: `CaseOverlay.tsx` and the `@modal` slot (D-SITE-3); `PageDismiss` (D-SITE-195).

## Access

- **Landmarks:** header `banner` with a `nav` named "Main" (D-SITE-236); one `main`; footer `contentinfo` with its own named `nav`. A skip link to `main` first in the tab order [ASSUMPTION: none exists today; verified `SiteChrome.tsx`].
- **Headings:** h1 the title; h2 each section head; h3 brief groups, surface names, process steps, decision statements, What broke titles. Decision and beat labels are text; the close line is a paragraph. Not found: its line is the h1.
- **Focus order:** DOM order: skip link, header, "All work", ledger link, At a glance links, What I built tiles then "All n images", any in-body artifact, Outcome link, close (call, Résumé, "Send a note"), footer.
- **Names:** each tile and thumb is a button named by its visible caption; "All n images" by its text; lightbox controls keep their names (Previous image, Next image, Close, Play video; dialog named by the item's alt; verified `MediaLightbox.tsx`). [ASSUMPTION: live links open in the same tab.]
- **Lightbox:** focus moves in on open, is trapped, returns to the opener on close; Escape closes; arrows step (existing). With `PageDismiss` gone, Escape does nothing outside it.
- **Announced:** nothing changes in place; no live regions. Not found is HTTP 404.
- **Contrast:** kit §2 pairs all pass; eye-check `--mark` underlines on dark `--ground` (kit rule 8); Meta 13 `--muted` captions pass (9.0, 8.19). No gold text on light.
- **Reduced motion:** hover transitions collapse to 0ms; the recording never autoplays.
- **Touch at 390:** text links ("All work", ledger link, Outcome link, "All n images", Résumé, the not-ready link, footer links) padded to 44px tall; theme toggle 44x44; thumbs at two per row exceed 44.

## Instrumentation

Analytics are GA4, consent-gated, page views only today (verified `components/analytics/`). Proposed, defined at Technical:

- `book_call_click` (D-SITE-176) on both "Book a 30-minute call" buttons: `{ surface: "case-study", placement: "header" | "close", slug }`. It is the funnel above SITE-M1, which counts the fit screen's click to Cal.com on `/book`.
- `screening_outcome` and `contact_note_sent` fire on `/book` and `/contact`, not here.
- Never in a payload or a URL GA sees: a name, an email address, anything typed, a query string (D-SITE-179).

## Criteria

| ID                  | When                                    | Then                                                                                                                        | Evidence |
| ------------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------- |
| C-SITE-case-study-1 | Any published slug loads                | Blocks render in the D-SITE-79/96 order, At a glance after the opening                                                      | capture  |
| C-SITE-case-study-2 | Each `?state=` key in the States table  | The page matches its captures at 390 and 1440, light and dark                                                               | capture  |
| C-SITE-case-study-3 | An optional block has no content        | It leaves no heading, rule or gap (D-SITE-5)                                                                                 | test     |
| C-SITE-case-study-4 | Either booking button is clicked        | It navigates to `/book` with the label "Book a 30-minute call"                                                              | test     |
| C-SITE-case-study-5 | The page renders                        | Exactly one filled primary button exists                                                                                   | check    |
| C-SITE-case-study-6 | A booking button is clicked, consent on | `book_call_click` fires once with `surface`, `placement`, `slug` and no other field                                           | test     |
| C-SITE-case-study-7 | An unknown or unpublished slug          | HTTP 404 and the not-found block with a link to `/work`                                                                     | test     |
| C-SITE-case-study-8 | A study's format is set                 | What I built renders that format (band, gallery, rows-after, rows-paired)                                                   | test     |
| C-SITE-case-study-9 | "All n images" or a tile is activated   | The lightbox opens at that item, traps focus, closes on Escape and returns focus to the opener                              | test     |
| C-SITE-case-study-10 | The page is checked                    | One h1, no skipped heading level, named landmarks, every control named                                                       | check    |
| C-SITE-case-study-11 | At 390                                  | No horizontal scroll; every link and button target is at least 44px tall                                                    | capture  |
| C-SITE-case-study-12 | A link is pasted into Slack or email    | The preview shows `metaDescription`, 160 characters or fewer                                                                 | test     |
| C-SITE-case-study-13 | A testimonial shows                     | It has no project link and its span differs from home's and `/about`'s (D-SITE-84)                                          | test     |
| C-SITE-case-study-14 | Escape is pressed outside the lightbox | The page stays put (no `PageDismiss`)                                                                                        | test     |
| C-SITE-case-study-15 | The close renders                        | "Not ready to book?" offers "Send a note" to `/contact`; no email address in the close                                       | test     |
