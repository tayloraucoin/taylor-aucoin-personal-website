# As-built — WEB-22

## Shipped against the contract

- C1: `lib/intake/site-page-notes.ts` holds the 23 non-home page values, and the site schema spreads one text key, `<value>BrainDump`, per value. `homeBrainDump` is kept. `pagesCustomBrainDump` is a list. A unit test asserts the list equals the union of every pack's pages, overlays included.
- C2: `sitemapPages` sorts by the pack's checklist, not tick order: Home first, then named typed pages by row. A value the pack doesn't list sorts after the listed ones. A blank row is skipped.
- C3: `boxedPages` cuts the sitemap at `INCLUDED_PAGES + paidExtraPages`. The step renders those boxes after Home's block and its shortlist.
- C4: harness `pages-over` shows 7/5, Home plus four boxes, and the extra pages box. `pages-bought` shows 7/7 with every page boxed. FAQ can still be ticked past the limit.
- C5: `CustomPages` edits go through `addTypedPage`, `renameTypedPage` and `removeTypedPage`, which change both lists in one pass. The step defers the flush a tick so both writes land before the save.
- C6: venture lists `about` right after `home`, and the place overlay inherits it. Every other pack's values are asserted unchanged.
- C7: each page key gets a critical, explicit-plan-only description, gated by `packsListPage` to kinds whose packs list it. `pagesCustomBrainDump` is not a text field, so it never enters the inventory.
- C8: `withPageBrainDumps` in `output.ts` prints "What each page should hold" where Home's line was, then "Notes for pages no longer in their sitemap". No page key prints on its own line.
- C9: 35 shots in `evidence/states/`: five keys at 390, 834 and 1440, light and dark, plus 390 with reduced motion.
- C10: deferred to Taylor.

## Deviations

- Home's brain dump now prints inside the page block, under "Home", not on its own labelled line. The prompt asked for each brain dump under its page's name, Home's included.
- "What the extra pages are for" moved from before Home's box to after the last page box. The builder's call, since it describes the pages that got no box.
- The page boxes after Home stay out of Not answered (the done screen's call agenda) and the review tally. Home's box still counts. Judgment: twenty empty boxes would bury the questions that matter, and the tally would swing with each tick.
- A note written by the import for a page never ticked prints in the dropped block. The block's label says "no longer in their sitemap" to cover that case.
- [ASSUMPTION] A typed page is never imported. A blank typed row gets no box.

## Test changes

- `tests/unit/intake-venture-inventory.test.ts` (VEN-1): its oracle copies the rules the Not-answered list and the tally follow. It gained one filter, `PAGE_BOX_KEYS` on step 8, beside its existing retired-taste filter. No assertion was removed or loosened.

## Not verified

- C9: `yarn contract:record` names the folder as the evidence path and then fails reading it (EISDIR), so the capture is not recorded. The captures exist; the tool needs a fix.
- C10: Taylor's look, deferred.
- Three VEN-3 e2e tests in `tests/e2e/intake-venture.spec.ts` fail on their own locators (`name: "No"` also matches "Not sure"; `.check()` times out on the sr-only radios). They touch no WEB-22 code, and I didn't re-prove them.

## Next

Taylor walks the five harness states and says "harden WEB-22" in a new thread. Vigil reviews against the two focus items.
