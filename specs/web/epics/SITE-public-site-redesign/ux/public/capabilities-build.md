---
target: specs/web/ux/public/capabilities-build.md
status: approved
promoted:
---

# Capabilities — build handoff

Part of `capabilities.md`. Exact values come from Paper computed styles.

## Layout and components

Column `--container-page` 1080 at 1440; 24px gutters at 390.

1. **Header:** the locked header, Work marked current (About's proposal), gaining "Contact" after Work with me (D-SITE-130); the call button stays.
2. **Opening:** h1 at Display (76 at 1440, 48 in two lines at 390), the locked pages' page-top lamplight glow (D-SITE-143), then Taylor's framing line at Body 17 in `text2`, about 620 wide (D-SITE-146).
3. **Controls (D-SITE-148):** the filter field (Plumb proposal: the filter field) with its muted meta label 8px above; 360 wide at 1440, full width at 390, 44 tall. 24px under it, `/work`'s text tabs (Plumb proposal: the discipline tabs, reused): five tabs, 32 gap at 1440, 16 at 390 as a sideways-scrolling strip with the selected tab kept in view, a hairline under the strip, selected in `text` over a 2px mark bar, the rest `muted`, all at 500.
4. **Chips:** home's capability chip (Plumb proposal, home round 3), wrapping with a 12px gap, 64px under the controls at 1440 and 32 at 390 (D-SITE-149). Comfort order, never shown (D-SITE-65, 142).
5. **Open card:** home's open chip card in place of its chip, 24px from the chips above and below (D-SITE-149): surface fill, strong border, 3px radius, padding 24 · 28 · 28, 20 gap. Head: title at Heading 4 over the tech line in Fragment Mono 14 `muted`; the toggle (chip name at meta and a 12px minus) top right at 1440, above the title at 390. Then the approach at Body 17 `text2`, max 640; a hairline; the proof line at Small 15 (Plumb proposal: the open chip's proof line with several proofs; D-SITE-145).
6. **No match:** the no-match block (Plumb proposal): a Body 17 line, then two text links at Small 15, 24 apart, padded to 44px targets at 390.
7. **Close:** the `/about` close block reused (closing line at Heading 3, primary button, "Not ready to book?" with "Send a note" to `/contact`, D-SITE-174), above a hairline; then the locked footer with "Contact" for "Email" (D-SITE-130).

**Chip states:** focus-visible is the kit's 2px mark ring offset 2px (kit §1). [ASSUMPTION: Plumb confirms; no existing rule] rest, a strong border; hover and pressed (motion board step 1), the border in `text`, colour only (A-04). Open is the card.

**Behaviour:** the filter matches title, tech, approach, offer and keywords within the selected tab; switching tabs keeps the query (D-SITE-148 supersedes the motion board here). `q` and `tab` live in the URL by `replaceState` [ASSUMPTION]. The open card is not in the URL. An open card closes when its chip leaves the list (motion board; D-SITE-205).

**Motion:** as D-SITE-147 (amended by 148) and `motion-1440-dark.png`: one `motion/react` layout transition on the chip list, transform only, never an animated height; open 200ms, close 160ms, switch one 200ms with scroll held under the pointer; keyboard and filter 0ms (A-15, A-14); pointer tab change a 120ms cross-fade; hover never animates. Reduced motion: every transition 0ms, the open fade and tab cross-fade included (D-SITE-178).

## Access

- **Landmarks and headings:** banner (header `nav`), `main`, contentinfo. One h1; each open card's title is an h2 [ASSUMPTION]. Chips are a `ul`.
- **Keyboard path:** skip link → header → filter → clear (when shown) → tabs (one tab stop; arrows and Home/End move and select, as `/work`'s tabs) → chips in reading order → inside an open card, its toggle then its proof links → no-match links → close block → footer.
- **Names:** filter by its visible label (`for`), placeholder as hint only (A-16); clear × named "Clear the filter [draft]"; the tablist named [Taylor's to write]; each tab by its label with `aria-selected`; each chip a disclosure button named by its chip name with `aria-expanded` and `aria-controls`; in the card that same button is the toggle (DOM-first, placed by CSS; D-SITE-206), so focus never moves on open; proof links by their names, external ones say so (words file).
- **Announced:** a polite status region gives the result count after typing settles (about 500ms) or a tab change, and the no-match line [string Taylor's to write].
- **Focus on change:** open keeps focus on the toggle; close by toggle or Esc returns it to the chip; "Clear the filter" sends it to the field; a card closed by the filter leaves focus in the field.
- **Contrast:** no failing pair seen. Muted on surface passes in both themes; field and chip borders (carbon-500) are about 3.9:1 on dark and 4.7:1 on light, to confirm by computed style. Proof names differ by weight and underline, not colour alone.
- **Targets at 390:** chips about 40 tall; clear × a 44 hit area inside the 44 field (32 drawn); no-match links padded to 44.

## Instrumentation

- `book_call_click` on the close's call: `{ surface: "capabilities", placement: "close" }` (D-SITE-176). A sent note fires `contact_note_sent` on `/contact`.
- Never in a payload or a URL GA sees: the filter query or any typed text (D-SITE-176). `q` is stripped from `page_location` before any page view, `tab` kept (D-SITE-179).

## Criteria

| ID                     | When                                     | Then                                                                                                     | Evidence |
| --- | --- | --- | --- |
| C-SITE-capabilities-1  | `/capabilities` loads                    | 25 chips show, all closed, All selected, filter empty; the 3 hidden capabilities are absent               | test     |
| C-SITE-capabilities-2  | `?tab=ai-data` loads                      | Only that tab's chips show; at 390 the selected tab is fully in view                                     | test     |
| C-SITE-capabilities-3  | `realtime` is typed                       | Exactly AI features, Realtime sync, Realtime voice show; `?q=realtime` is in the URL                      | test     |
| C-SITE-capabilities-4  | A tab is chosen with a query set          | The query stays and re-filters within the tab; typing never changes the tab                              | test     |
| C-SITE-capabilities-5  | An unknown `?tab=` or blank `?q=` loads   | The page renders as default                                                                              | test     |
| C-SITE-capabilities-6  | `kubernetes` is typed                     | The no-match line and both links show; "Clear the filter" empties the field, restores the chips, focuses the field | test |
| C-SITE-capabilities-7  | A chip is pressed                         | It opens in place with `aria-expanded="true"`, focus stays on it; any other open card closes             | test     |
| C-SITE-capabilities-8  | Esc or the toggle on an open card         | It closes and focus returns to its chip                                                                  | test     |
| C-SITE-capabilities-9  | A proof name is followed                  | It opens the href D-SITE-141 names; no shown chip lacks a proof                                          | test     |
| C-SITE-capabilities-10 | A card with several proofs renders        | Each name is `text` at 500 with a mark underline, and never breaks from its comma                        | check    |
| C-SITE-capabilities-11 | A chip opens by pointer, then by keyboard | Pointer: transform-only, 200ms open, 160ms close, no height animation; keyboard: 0ms                     | manual   |
| C-SITE-capabilities-12 | Typing in the filter                      | The list changes with no transition                                                                      | test     |
| C-SITE-capabilities-13 | `prefers-reduced-motion: reduce`          | Every transition is 0ms (D-SITE-178) | test |
| C-SITE-capabilities-14 | Any "Book a 30-minute call" is pressed    | It opens `/book` and fires `book_call_click` with `surface: "capabilities"` | test |
| C-SITE-capabilities-15 | Any analytics call fires                  | No payload or `page_location` holds `q` or the filter text | test |
| C-SITE-capabilities-16 | A screen reader filters                   | The field is named by its visible label; the result count is announced politely                          | test     |
| C-SITE-capabilities-17 | 390 width                                 | Clear ×, "Clear the filter" and "Send a note" each have a 44px target                                  | check    |
| C-SITE-capabilities-18 | Each state row at 1440 and 390, both themes | It matches its locked capture, plus "Contact" in header and footer             | capture  |
| C-SITE-capabilities-19 | Lint                                       | Every font size is a kit §3 token                                                                       | check    |
| C-SITE-capabilities-20 | Either "Send a note" is pressed | It opens `/contact`; no other label or email address for that intent | test |
