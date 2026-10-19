import { offers, roles } from "@/content/services";

/**
 * Home's copy (home-words.md), as Taylor wrote it on the canvas. The marks
 * and placeholders were cleared in feedback round 1 (2026-10-19, D-SITE-185);
 * Taylor's own pass on the words is still to come.
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
  // Built from the first commit to something people used or tested; see
  // feedback/2026-10-19/copy-review.md for the rule and the count.
  { fact: "13 products", meta: "zero to one, and counting" },
  {
    fact: "22 cohorts taught",
    meta: "BCIT ISSP · VFS · FLUI · SFU co-op · virtual intern",
  },
  {
    fact: "Five roles",
    meta: "product engineer · product designer · systems consultant · fractional CTO · 0→1 build",
  },
];

/**
 * The pillars (D-SITE-44): a title, the line shown closed, and the row that
 * opens in place. Pillar 2's founder line lives in its open row (D-SITE-53).
 */
export const pillars: readonly { title: string; line: string; open: string }[] =
  [
    {
      title: "Systems, end to end",
      line: "I fit the system to the problem in front of me, then own it from the database to the last pixel.",
      open: "Future of Cities had ten databases that didn't talk to each other, so the first two weeks went to one data layer and nothing anyone could see. Everbook's interview had to feel live. There the browser talks straight to the model, and the server never touches the audio. The stack changes with the problem. What stays the same is ownership: I can explain every layer, and the people after me can run it.",
    },
    {
      title: "Judgment, not tickets",
      line: "A feature starts as a UX problem and has to end as a business outcome.",
      open: "I've been the founder and the first engineer, so I build like both.",
    },
    {
      title: "Conventions that compound",
      line: "I learn your codebase's conventions down pat, or level them up with an AI build system your team keeps using.",
      open: "Roomvy ran on an agency's stack and conventions, none of them mine, and I shipped the whole booking client inside them. At Everbook I wrote the conventions, API standards and review process as engineers joined. Future of Cities got the same, written for people building with Claude Code, and they've kept extending the platform without engineering staff.",
    },
    {
      title: "Fast and precise",
      line: "Founders, leads and clients keep saying the same thing: fast, and it holds up in production.",
      open: "When the Future of Cities scope grew mid-engagement, the CRM was live in four days. Calculate shipped to physicians inside Medscape, and no one reported a bug from launch to the day I left. Most of the speed comes from mapping the build before I start. Anything where a wrong answer costs someone gets tested well past what the ticket asks.",
    },
  ];

/** Problems I take on (home-words.md). */
export const problems = {
  heading: "Problems I take on",
  line: "Open one for the approach and where it was done.",
  doneAt: "Done at {proof}.",
  showAll: "Show all 25",
  showFewer: "Show fewer",
  search: "Search every capability",
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
  beatMissing: "Still being written.",
  readStory: "Read the decision story",
  seeAll: "See all work",
  seeAllFullTime: "See all full-time work",
  websitesLink: "How a coded website works",
  brandingLink: "Branding, on Work with me",
  galleryAll: { images: "All {n} images", boards: "All {n} boards" },
  /** The filter's live count. */
  liveCount: "{n} shown",
} as const;

/** The notes signup (home-words.md, Notes signup). */
export const notes = {
  heading: "Notes",
  line: "How I build with AI: what I let it do, what I check, and why.",
  label: "Email",
  placeholder: "you@company.com",
  hint: "Used only for the notes. Unsubscribe from any email.",
  button: "Get the notes",
  sending: "Sending",
  retry: "Try again",
  done: (address: string) => `Signed up. Notes will go to ${address}.`,
  error:
    "It didn't send. Check your connection and try again; your address is still here.",
  invalid: "That address needs an ending, like .com or .ca. Nothing was sent.",
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
  ai: [
    {
      label: "What I give it",
      items: [
        "A spec for the slice, written before any code",
        "The project's conventions, as files it reads first",
        "One job at a time: builder, reviewer or QA",
      ],
    },
    {
      label: "What I let AI do",
      items: [
        "The first draft of a component, a migration or a test",
        "A second review, in a fresh context",
      ],
    },
    {
      label: "What I check",
      items: [
        "The data model, line by line",
        "Every path that moves money",
        "Anything that touches auth or private data",
        "That the result does what the spec asked",
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
  readAll: "Read them in full",
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
  websitesLine: "Need a website you own?",
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
      bestFor: roles[1].bestFor,
    },
    {
      role: "Systems consultant",
      terms: "Scoped engagement",
      bestFor: roles[2].bestFor,
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
