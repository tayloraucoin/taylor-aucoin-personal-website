/**
 * A brain dump per page the client plans on step 8 (WEB-22).
 *
 * Home always had one, `homeBrainDump`, and every other page arrived as a name
 * with no idea what goes on it. Now each page in the sitemap gets its own box,
 * up to what the client has bought, so Taylor designs every page from their
 * words rather than only the first one.
 *
 * **Stored by option value, never by label** (Taylor, 2026-10-20). A checklist
 * page's box is `<value>BrainDump`, the shape `homeBrainDump` already had, so
 * each one is a plain text answer the import, the labels and the document
 * already know how to read. The label is the pack's to change ("The offering"
 * reads "The model" for a place venture) and the value never changes, which
 * is why the value is the key.
 *
 * A typed page has no value to key by. Its box is the matching position in
 * `pagesCustomBrainDump`, a list kept in step with `pagesCustom`: a rename
 * keeps the position, and removing a row removes its note in the same save,
 * so every row below keeps its own (`custom-pages.tsx`).
 *
 * No imports, on purpose: the site schema reads the value list from here, and
 * the schema module sits under everything else in `lib/intake/`.
 */

/** Home's box, kept under its PORT-19 name. Box one, always. */
export const HOME_PAGE = "home";
export const HOME_BRAIN_DUMP = "homeBrainDump";

/** A typed page's notes, by position in `pagesCustom`. */
export const CUSTOM_BRAIN_DUMPS = "pagesCustomBrainDump";

/**
 * Every checklist page value across every pack and overlay, but Home.
 *
 * Typed rather than derived because the schema imports it, and the packs live
 * in a copy module the schema should not reach into. The unit suite asserts it
 * equals the union of every pack's `pages`, so a page added to a pack without
 * a key here fails `yarn test`, not a client's save.
 */
export const PAGE_BRAIN_DUMP_VALUES = [
  "about",
  "apply",
  "booking",
  "contact",
  "events",
  "faq",
  "legal",
  "offering",
  "place",
  "press",
  "pricing",
  "reel",
  "reviews",
  "serviceArea",
  "services",
  "speaking",
  "stays",
  "teaching",
  "team",
  "testimonials",
  "vision",
  "work",
  "writing",
] as const;

export type PageBrainDumpValue = (typeof PAGE_BRAIN_DUMP_VALUES)[number];

/**
 * A page's plain name, by option value, for labels and the import's
 * descriptions.
 *
 * Not the pack's label, which varies by kind and sub-type; this is the plain
 * name a label can be built from. Typed against the value list, so a page
 * added there without a name here is a type error. [COPY — pending Taylor]
 */
export const PAGE_NAMES: Record<PageBrainDumpValue, string> = {
  about: "About",
  apply: "Apply",
  booking: "Booking",
  contact: "Contact",
  events: "Events",
  faq: "FAQ",
  legal: "Legal",
  offering: "Offering",
  place: "Place",
  press: "Press",
  pricing: "Pricing",
  reel: "Reel",
  reviews: "Reviews",
  serviceArea: "Service area",
  services: "Services",
  speaking: "Speaking",
  stays: "Stays",
  teaching: "Teaching",
  team: "Team",
  testimonials: "Testimonials",
  vision: "Vision",
  work: "Work",
  writing: "Writing",
};

/** The stored key for a checklist page's box. Home's is `homeBrainDump`. */
export function pageBrainDumpKey(value: string): string {
  return `${value}BrainDump`;
}

/** Every checklist page's stored key, Home's included, for the readers. */
export const PAGE_BRAIN_DUMP_KEYS: readonly string[] = [
  HOME_BRAIN_DUMP,
  ...PAGE_BRAIN_DUMP_VALUES.map(pageBrainDumpKey),
];

/**
 * The boxes past Home, which the client-facing lists do not count: Not
 * answered and the review tally (`output.ts`). Home's box still counts.
 */
export const PAGE_BOX_KEYS: ReadonlySet<string> = new Set([
  ...PAGE_BRAIN_DUMP_VALUES.map(pageBrainDumpKey),
  CUSTOM_BRAIN_DUMPS,
]);

/** One page in the sitemap the client described. */
export type SitemapPage =
  | {
      source: "listed";
      /** The option value: what is stored, and never changes. */
      value: string;
      /** What the client reads; the pack's, so it may differ by sub-type. */
      label: string;
      /** Where its brain dump is stored. */
      key: string;
    }
  | {
      source: "typed";
      /** Its position in `pagesCustom`, and in `pagesCustomBrainDump`. */
      index: number;
      /** What they typed, trimmed. */
      label: string;
    };

/**
 * The sitemap, in the order Taylor reads it: the checklist's order, then each
 * typed page in its row order.
 *
 * `pages` is stored in the order things were ticked, which is nobody's idea of
 * a sitemap, so the pack's list sets the order. A ticked value the current
 * pack does not list (a sub-type changed after ticking) still counts, as the
 * running total counts it, and sorts after the listed ones. A blank typed row
 * is not a page: the total skips it, and so does this.
 */
export function sitemapPages(input: {
  ticked: readonly string[];
  checklist: readonly { value: string; label: string }[];
  typed: readonly string[];
}): SitemapPage[] {
  const ticked = new Set(input.ticked);
  const listed = new Set(input.checklist.map((option) => option.value));

  const fromList = input.checklist
    .filter((option) => ticked.has(option.value))
    .map((option) => ({ value: option.value, label: option.label }));
  const unlisted = input.ticked
    .filter(
      (value, index, all) => !listed.has(value) && all.indexOf(value) === index,
    )
    .map((value) => ({ value, label: value }));

  const typed: SitemapPage[] = input.typed.flatMap((name, index) =>
    name.trim().length > 0
      ? [{ source: "typed" as const, index, label: name.trim() }]
      : [],
  );

  return [
    ...[...fromList, ...unlisted].map(({ value, label }): SitemapPage => ({
      source: "listed",
      value,
      label,
      key: value === HOME_PAGE ? HOME_BRAIN_DUMP : pageBrainDumpKey(value),
    })),
    ...typed,
  ];
}

/**
 * The pages that get a box: the sitemap, cut at the allowance.
 *
 * The allowance is the five included plus pages bought at checkout, and typed
 * pages count toward it exactly as they count toward the running total. Pages
 * past it get no box; the step's "What the extra pages are for" is where those
 * get described, and the checklist itself stays uncapped (Taylor, 2026-09-03).
 */
export function boxedPages(
  sitemap: readonly SitemapPage[],
  allowance: number,
): SitemapPage[] {
  return sitemap.slice(0, Math.max(0, allowance));
}

/**
 * The typed pages and their notes, changed together (WEB-22).
 *
 * `pagesCustom` and `pagesCustomBrainDump` are two lists read by position, so
 * every edit to the first is made to the second in the same breath. A rename
 * keeps the position and so the note; a removal takes the note with the row,
 * which is what keeps every row below it with its own. A notes list shorter
 * than the pages (any engagement from before WEB-22) is read as blanks.
 */
export type TypedPages = { pages: string[]; notes: string[] };

function aligned(pages: readonly string[], notes: readonly string[]): string[] {
  return pages.map((_, index) => notes[index] ?? "");
}

export function addTypedPage(
  pages: readonly string[],
  notes: readonly string[],
): TypedPages {
  return { pages: [...pages, ""], notes: [...aligned(pages, notes), ""] };
}

export function renameTypedPage(
  pages: readonly string[],
  notes: readonly string[],
  index: number,
  name: string,
): TypedPages {
  const next = [...pages];
  next[index] = name;
  return { pages: next, notes: aligned(pages, notes) };
}

export function removeTypedPage(
  pages: readonly string[],
  notes: readonly string[],
  index: number,
): TypedPages {
  return {
    pages: pages.filter((_, i) => i !== index),
    notes: aligned(pages, notes).filter((_, i) => i !== index),
  };
}
