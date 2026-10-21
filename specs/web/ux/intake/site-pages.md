---
target: specs/web/ux/intake/site-pages.md
status: approved
promoted: 2026-10-20
---

# Site pages and their brain dumps — intake step 8

How the showcase intake's site step asks which pages the site has, and what goes on each one. Written by WEB-22, the first living file for this step. The rest of step 8 is not described here yet.

## Job

The client says which pages they imagine, then says what belongs on each page in their own words, up to the pages they have bought. Done means Taylor can design every page in the sitemap from the client's words, not only Home.

## Layout and components

In order, top to bottom. Every block is built from existing pieces (`ChoiceAnswer`, `Field`, `CustomPages`, `LongAnswer`, `HomeShortlist`). The step's own Continue stays the only primary action.

1. **Pages you're imagining** (`pages`): a checklist from the pack, with Home locked on. It is never capped (2026-09-03). The note under it shows `n/allowance`, where typed pages count and blank rows do not.
2. **Any other pages** (`pagesCustom`): typed rows. Adding a row selects it, and the X removes it.
3. **Home's box** (`homeBrainDump`), with the shortlist (`homeMedia`, `homeVideos`) under it. It is always box one.
4. **A box per page after Home**, in sitemap order: ticked pages in the checklist's order (not the order they were ticked), then each named typed page in row order. A ticked value the current pack does not list still counts and sorts after the listed ones. Boxes stop at the allowance: `INCLUDED_PAGES` (5) plus `paidExtraPages`, Home included.
5. **What the extra pages are for** (`extraPagesPlan`): shown when the total passes the allowance, and in document mode.

## Stored names

Option values never change and are never renamed.

| Box              | Key                                       | Shape                               |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| Home             | `homeBrainDump`                           | text                                |
| A checklist page | `<value>BrainDump`, e.g. `aboutBrainDump` | text, one key per value in any pack |
| A typed page     | `pagesCustomBrainDump[i]`                 | list, by position in `pagesCustom`  |

- A rename keeps the row's position, so its note stays. Removing a row removes its note in the same save, so every row below keeps its own. `site-page-notes.ts` owns these edits.
- A notes list shorter than the rows (saved before WEB-22) reads as blanks.
- Unticking a page or removing its row never deletes the note. The box hides, and the note stays stored.

## Packs

Venture's list, and the venture-place overlay built from it, has About (`about`) right after Home. Other packs are unchanged. The box label uses the pack's own name for the page, so a place venture's `offering` reads "The model".

## States

Reachable at `/test-harness/intake?state=<key>` (404 in production).

| State     | Key               | What shows                                                                         | What the person can do |
| --------- | ----------------- | ---------------------------------------------------------------------------------- | ---------------------- |
| home only | `pages-home-only` | Home's box and the shortlist; no other page box                                    | tick, type, write      |
| some      | `pages-some`      | ticked Contact, About, Team: boxes in the checklist's order (About, Team, Contact) | write                  |
| typed     | `pages-typed`     | place venture: "The model", then two typed pages with their notes                  | rename, remove, write  |
| over      | `pages-over`      | 7/5: Home and four boxes; the last two typed pages get none; the extra pages box   | tick more, write       |
| bought    | `pages-bought`    | the same seven with two bought: 7/7, every page has a box, no extra pages box      | write                  |

## Words

Every new string is `[COPY — pending Taylor]`, in `PAGE_BOX` (`step-site.tsx`) and `PAGE_NAMES` (`site-page-notes.ts`):

- Box label: "{page}: what goes on it".
- Help: "However it comes out. What this page is for, what someone should find there, and anything that must not be on it."
- Document labels: "What each page should hold", and "Notes for pages no longer in their sitemap".

## Import

A page box is pre-filled only when a source explicitly plans that page, quoted. It is critical, the same rule as `homeBrainDump`. It is offered only to kinds whose packs list that page. A typed page is never imported.

## Document

- Every page's brain dump prints in one block, "What each page should hold", where Home's line used to be: Home first, then sitemap order, each under the page's name.
- A note for a page no longer in the sitemap (unticked, removed, or imported for a page never ticked) prints after it under "Notes for pages no longer in their sitemap".
- The page boxes after Home are not in Not answered or the review tally. Home's box is, as before.

## Access

Every box has a visible `<label>` bound by id, with its help linked through `Field`. A typed page's box id is `f-pagesCustomBrainDump-<i>`. No reveal animation, no live region.

## Criteria

| ID         | When                                               | Then                                                         | Evidence |
| ---------- | -------------------------------------------------- | ------------------------------------------------------------ | -------- |
| C-WEB-22-1 | a checklist page is ticked                         | its box stores under `<value>BrainDump`                      | test     |
| C-WEB-22-2 | the sitemap passes the allowance                   | boxes stop at 5 plus pages bought; the extra pages box shows | test     |
| C-WEB-22-3 | a typed page is renamed or one above it is removed | its note stays with it                                       | test     |
