/**
 * Home's copy (home-words.md), as Taylor wrote it on the canvas. Bracketed
 * values and `[draft]` marks are his placeholders: they stay through the
 * build and launch waits on them (D-SITE-185). Never improve a line here.
 */

export const homeHero = {
  label: "Product engineer",
  name: "Taylor Aucoin",
  headline: "The whole product, thought through.",
  lede: "Product Engineer, building software for over a decade. I shape the problem, ship it, and set it up to be measured, with my judgment over the AI.",
  ghost: "See the work",
} as const;

/** The proof bar: a ledger in type, a fact over a meta line (D-SITE-48). */
export const proofBar: readonly { fact: string; meta: string }[] = [
  { fact: "Since 2016", meta: "building software" },
  { fact: "[12] products", meta: "zero to one, and counting" },
  {
    fact: "[23] cohorts taught",
    meta: "BCIT ISSP · VFS · a design cohort · virtual interns",
  },
  {
    fact: "Four seats [draft]",
    meta: "founder · founding engineer · product designer · fractional CTO",
  },
];
