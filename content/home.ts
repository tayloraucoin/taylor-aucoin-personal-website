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

/**
 * The pillars (D-SITE-44): a title, the line shown closed, and the row that
 * opens in place. Pillar 2's founder line lives in its open row (D-SITE-53);
 * the other open rows are Taylor's to write.
 */
export const pillars: readonly { title: string; line: string; open: string }[] =
  [
    {
      title: "Systems, end to end",
      line: "Turborepo monorepos, typed contracts from Postgres to the pixel, and infrastructure a team of one can actually operate.",
      open: "[Taylor's to write]",
    },
    {
      title: "Judgment, not tickets",
      line: "A feature starts as a UX problem and has to end as a business outcome.",
      open: "I've been the founder and the first engineer, so I build like both.",
    },
    {
      title: "Conventions that compound",
      line: "I learn your codebase's conventions down pat, or level them up with an AI build system your team keeps using. [draft]",
      open: "[Taylor's to write]",
    },
    {
      title: "Fast and precise",
      line: "Founders, leads and clients keep saying the same thing: fast, and it holds up in production. [draft]",
      open: "[Taylor's to write]",
    },
  ];

/** Problems I take on (home-words.md). */
export const problems = {
  heading: "Problems I take on",
  line: "Open one for the approach and where it was done. [draft]",
  doneAt: "Done at {proof}, usually on contract. [draft]",
  showAll: "Show all 25",
  showFewer: "Show fewer",
  search: "Search every capability [draft]",
} as const;

/**
 * Selected work (home-words.md): the curated Featured set per tab, by work
 * entry id (D-SITE-51, 238), and each tab's footer links.
 */
export const selectedWork = {
  heading: "Selected work",
  tabs: {
    product: "Product engineering",
    websites: "Websites",
    branding: "Branding & UI",
  },
  featured: {
    product: ["conscious-connections", "everbook", "family-office-platform"],
    websites: ["kryshan-randel"],
    branding: ["taylor-aucoin-kit", "conscious-connections-kit", "agora-kit"],
  },
  chips: {
    featured: "Featured",
    "full-time": "Full-time",
    contract: "Contract",
    business: "Business",
    passion: "Passion projects",
    client: "Client",
    "own-brand": "Own brand",
  },
  /** The type on a story's meta line. */
  typeLabels: {
    "full-time": "Full-time",
    contract: "Contract",
    business: "Business",
    passion: "Passion project",
    client: "Client",
    "own-brand": "Own brand",
  },
  beats: { problem: "Problem", decided: "Decided", happened: "Happened" },
  beatMissing: "[Taylor's to write]",
  readStory: "Read the decision story",
  seeAll: "See all work",
  seeAllFullTime: "See all full-time work [draft]",
  websitesLink: "[Draft] How a coded website works",
  brandingLink: "[Draft] Branding, on Work with me",
  galleryAll: { images: "All {n} images", boards: "All {n} boards" },
  /** The filter's live count; the wording is Taylor's to write. */
  liveCount: "[Taylor's to write] {n}",
} as const;
