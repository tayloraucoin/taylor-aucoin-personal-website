import { offers } from "@/content/services";

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

/** The notes signup (home-words.md, Notes signup). */
export const notes = {
  heading: "Notes",
  line: "[Draft] How I build with AI: what I let it do, what I check, and why.",
  label: "Email",
  placeholder: "you@company.com",
  hint: "Used only for the notes. Unsubscribe from any email.",
  button: "Get the notes",
  sending: "Sending",
  retry: "Try again",
  done: (address: string) => `[Draft] Signed up. Notes will go to ${address}.`,
  error:
    "[Draft] It didn't send. Check your connection and try again; your address is still here.",
  invalid:
    "[Draft] That address needs an ending, like .com or .ca. Nothing was sent.",
} as const;

/**
 * The consent wording's version, stored with every signup. Bump it whenever
 * `notes.hint` changes.
 */
export const NOTES_CONSENT_VERSION = "2026-10-19";

/** How I work (home-words.md): the steps as drawn, and the AI block (D-SITE-58). */
export const howIWork = {
  heading: "How I work",
  steps: ["Scope", "Build", "Ship", "Measure", "Iterate"],
  /** Taylor's lists; synthetic placeholders until then. */
  ai: [
    {
      label: "What I give it",
      items: [
        "[Taylor's list. Synthetic placeholder: a written spec, the codebase's conventions, a role for each job.]",
      ],
    },
    {
      label: "What I let AI do",
      items: [
        "[Taylor's list. Synthetic placeholder: first drafts of a component, test scaffolds.]",
      ],
    },
    {
      label: "What I check",
      items: [
        "[Taylor's list. Synthetic placeholder: the data model, every money path.]",
      ],
    },
  ],
} as const;

/**
 * Home's testimonials (D-SITE-56): all four, in order. Dawson's and Bruno's
 * cards use other contiguous spans of their recommendations than their
 * stories do, as drawn; the others use their lead quote.
 */
export const homeTestimonials = {
  heading: "Testimonials",
  readAll: "Read them in full [draft]",
  cards: [
    {
      slug: "dawson-whitfield",
      span: "He owned the project scope, technical architecture, and development through to launch.",
    },
    {
      slug: "bruno",
      span: "Beyond technical execution, Taylor provided vital strategic clarity to our internal team.",
    },
    { slug: "vaughn-richards" },
    { slug: "yogesh-verma" },
  ],
} as const;

/**
 * Work with me's role rows (D-SITE-57): a role, how it is engaged, who it
 * suits. The best-for lines come from `content/services.ts` where present.
 */
export const workWithMe = {
  heading: "Work with me",
  link: "Work with me",
  websitesLine: "[Draft] Need a website you own?",
  websitesLink: "Websites",
  rows: [
    {
      role: "Product engineer",
      terms: "Full-time · contract · fractional",
      bestFor: offers[0].bestFor,
    },
    {
      role: "Product designer",
      terms: "Full-time · contract · fractional",
      bestFor: "[Taylor's to write]",
    },
    {
      role: "Systems consultant",
      terms: "Scoped engagement",
      bestFor: "System design, before the build. [draft]",
    },
    {
      role: "Fractional CTO",
      terms: "Retainer, 1–2 days a week",
      bestFor: offers[2].bestFor,
    },
    {
      role: "0→1 build",
      terms: "Fixed scope, 8–16 weeks",
      bestFor: offers[1].bestFor,
    },
  ],
} as const;
