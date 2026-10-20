---
target: specs/web/ux/public/work-index-build.md
status: approved
promoted:
---

# Work index — build

Part of `work-index.md`. From the locked captures in `captures/work-index/`.

## Layout and components

Content 1080 wide at 1440 (180 to 1260); 24px gutters at 390. Type: Display 76 · 17 · Small 15 · Meta 13 (D-SITE-106); a row holds three sizes (D-SITE-173). Colour by kit role tokens only (`--color-*` in `app/globals.css`); gold is never text on light.

1. **Header:** home's chrome reused (D-SITE-2): wordmark, Work marked current with the 2px mark underline and `aria-current` (the header's current-page mark, `/about` proposal), About, Work with me, Contact (D-SITE-130), the ghost call button to `/book` (D-SITE-32, 165), the theme toggle. At 390: home's two-row 390 header, no call button (D-SITE-31).
2. **Opening:** "Work" at Display, the intro line under it at Body 17 (D-SITE-106). No eyebrow (A-07).
3. **Controls row:** home's discipline tabs (text tabs, 2px mark underline on the selected one) left; home's type filter chips (selected: raised surface, strong border, mark-coloured check; unselected: hairline) right, on the same row, at 1440. At 390 the tabs fit one row, 16 apart (D-SITE-149), and the chips wrap below them. The tab strip's hairline opens the list; the first group has no top rule (D-SITE-106 A1).
4. **List:** Plumb proposal **the type group** (label 17 semibold in a 200 column at 1440, stacked above its rows at 390, a full-width hairline between groups, hidden when one chip is selected) holding Plumb proposal **the work row** (title 17 over a tagline at Small 15 in a 440 column · meta column 170 with role over period · a right-aligned link stack; stacked at 390 with role · period on one meta line, tagline, then links). Hairline between rows inside a group, title-column width.
5. **Link stack:** a row whose data names a case-study slug: "Read the decision story" (D-SITE-175). A row without one: Plumb proposal **the no-story link stack** (gallery opener, then the live link). A kit row whose product has a study leads with the story link, then gallery, then live link (D-SITE-106 R2). At 1440 the stack is right-aligned, one per line; at 390 the links sit inline, wrapping, left-aligned.
6. **Close:** Plumb proposal **the capabilities footer line** (home's tab-footer line reused: full-width hairline, starts at the content edge, D-SITE-106 A2), linking `/capabilities`.
7. **Footer:** home's footer in sentence case at meta size, with Contact for Email (D-SITE-130).

Lightbox: `MediaLightbox.tsx` unchanged (D-SITE-99). Primary action: the story link; no filled button on the page. No marks, counts, row numbers, hover sweep or arrow (D-SITE-8, 102, 103); no row hover, links and chips take home's hover rule. Filtering swaps rows instantly (A-14).

## Access

- **Landmarks and headings:** `header`, `main`, `footer`. h1 "Work"; each type group label an h2; each row title an h3. With one chip selected the group label stays as a visually hidden h2, so the outline holds (D-SITE-191).
- **Tabs and chips** are links that write `?tab=` / `?type=` (D-SITE-190), each set in a `nav` with its own accessible name (`work-index-words.md`, D-SITE-190). The selected one has `aria-current="true"`; the check glyph is `aria-hidden`. Not an ARIA tablist: each is a navigation.
- **Focus order:** header (wordmark, Work, About, Work with me, Contact, call button at 1440, theme toggle) → tabs → chips → each row's links in visual order → capabilities line → footer. After a change, focus stays on the control used and the page does not scroll. No live region: no count to announce (D-SITE-8); the control announces its state.
- **Repeated names:** each "Read the decision story", gallery opener and live link has `aria-describedby` on its row's title, so the visible label stays the name (WCAG 2.5.3) and the row is heard.
- **Gallery opener** is a `button` styled as a text link, opening the lightbox on the row's first image; Escape and Close return focus to it. **Live links** open in a new tab, `rel="noopener noreferrer"` (as `CaseLinks.tsx`).
- **Focus ring:** 2px solid mark, offset 2px, on every control (kit §1 law 4).
- **Contrast:** text pairs are kit-verified. The unselected chip's hairline edge is decorative (1.41:1 dark); its label identifies it. The selected chip has the check and strong border, never colour alone.
- **Targets at 390:** chips (about 30px drawn), tabs and inline row links get a 44px hit area by padding, without changing the drawn size; the 8px chip gap keeps neighbours apart.
- **Reduced motion:** every transition is 0ms (D-SITE-178).

## Instrumentation

- The header's "Book a 30-minute call" (1440 only) fires `book_call_click` {surface: `work-index`, placement: `header`} (D-SITE-176), the funnel above SITE-M1, which counts the fit screen's click to Cal.com.
- No other event. Tab and chip changes alter only the query string, which `PageViews.tsx` does not re-fire on; `tab` stays in `page_location` (D-SITE-179).
- Never in a payload: the family office's name, or any client name beyond a published row title.

## Criteria

| ID | When | Then | Evidence |
| --- | --- | --- | --- |
| C-SITE-work-index-1 | `/work` with no parameters | Product engineering selected, All selected, six rows grouped Full-time (Everbook, Roomvy, Calculate by QxMD), Contract, Business, Passion projects, then the capabilities line | capture |
| C-SITE-work-index-2 | Each tab is selected | Product engineering shows All + 4 chips; Branding & UI All + Business, Passion projects, Own brand; Websites none | test |
| C-SITE-work-index-3 | A tab or chip is activated, then the page reloads | The URL holds `?tab=` / `?type=` and the same view returns | test |
| C-SITE-work-index-4 | `?tab=` or `?type=` holds an unknown value, or `type=featured` | The view falls back to the default tab or to All, with no error | test |
| C-SITE-work-index-5 | One chip is selected | No visible group label; rows keep the title column; an h2 for the type remains in the outline | capture |
| C-SITE-work-index-6 | "Read the decision story" is activated | `/work/[slug]` opens full page at the top, same tab | test |
| C-SITE-work-index-7 | A gallery opener is activated, then Escape | The lightbox opens on the row's first image; focus returns to the opener | test |
| C-SITE-work-index-8 | Branding & UI tab | Agora and Conscious Connections, whose data names a slug, lead with the story link, then gallery, then live link; the Taylor Aucoin kit, with none, shows gallery and live link only | capture |
| C-SITE-work-index-9 | A case study is set unpublished in `WORK_PUBLISHED` | Its row is gone, a chip left with no rows is gone, and a tab left empty is hidden | test |
| C-SITE-work-index-10 | Any row, both widths | Meta reads role over period at 1440 and "role · period" on one line at 390; no mark, count or row number shows | capture |
| C-SITE-work-index-11 | Keyboard only, both themes | Focus follows the Access order, each stop shows the 2px mark ring, and a tab or chip change leaves focus on that control | manual |
| C-SITE-work-index-12 | Axe on every drawn state | No violations; selected tab and chip expose `aria-current`; each repeated link is described by its row title | test |
| C-SITE-work-index-13 | 390 wide | Every tab, chip and row link has a hit area at least 44px tall | check |
| C-SITE-work-index-14 | The header call button at 1440 is activated | It goes to `/book` and fires `book_call_click` with placement `header`; at 390 the header has no call button | test |
| C-SITE-work-index-15 | `prefers-reduced-motion: reduce`, and any filter change | Rows swap with no animation in every mode; every transition computes to 0ms | test |
| C-SITE-work-index-16 | The built page source and content | The family office's client name appears nowhere | check |
| C-SITE-work-index-17 | Each drawn state in light and dark | It matches its capture; a first visit opens dark | capture |
