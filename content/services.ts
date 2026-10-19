/**
 * /services page content. Typed TS, no CMS — same pattern as content/work.
 *
 * Copy here follows the v3 sprint tickets (docs/_legacy/tickets/v3-contract-sales/).
 * It is decided direction, not final prose — Taylor gives it the read-aloud
 * pass in QA-06. Keep the register plain, specific, a little dry.
 */

export type Offer = {
  /** Mono card tag, e.g. "01 / Contract". */
  tag: string;
  title: string;
  /** Mono duration/cadence line. */
  cadence: string;
  /** "Best for" — one sentence, the buyer recognizing themselves. */
  bestFor: string;
  /** What's included — 3 short bullets. */
  includes: string[];
  /** The flagship offer gets a marker on the card. */
  flagship?: boolean;
};

export const offers: Offer[] = [
  {
    tag: "01 / Contract",
    title: "Contract senior/staff engineer",
    cadence: "3–12 months · embedded",
    bestFor: "Teams that need senior throughput now.",
    includes: [
      "Embed with your team, on your stack and conventions",
      "Ship production features end to end",
      "Raise the bar in review and specs",
    ],
  },
  {
    tag: "02 / 0→1 Build",
    title: "Fixed-scope 0→1 build",
    cadence: "8–16 weeks · fixed scope, fixed timeline",
    bestFor: "Founders who need a real product, not a prototype.",
    includes: [
      "Idea to shipped product, with architecture, schema, and infrastructure included",
      "Built solo, with weekly written updates",
      "Documentation and conventions the next engineer inherits",
    ],
    flagship: true,
  },
  {
    tag: "03 / Fractional",
    title: "Fractional CTO / technical partner",
    cadence: "1–2 days a week · retainer",
    bestFor: "Non-technical founders and scaling teams.",
    includes: [
      "Architecture and technical strategy",
      "Hiring, code review, and standards",
      "AI-native process — conventions that let a team build safely",
    ],
  },
];

/** SVC-04 — soft anchor. Build-project totals, not rates. */
export const priceAnchor =
  "Most engagements land between $15K and $75K CAD. Fixed scope where it makes sense, with no hourly surprises.";

/** SVC-05 — problem statements in the client's voice, tagged to an offer. */
export const problems: Array<{ quote: string; offer: string }> = [
  { quote: "We have a product idea and no one to build it.", offer: "0→1 build" },
  {
    quote: "Our roadmap is stalling; we need senior throughput for two quarters.",
    offer: "Contract",
  },
  {
    quote: "We're shipping AI features and the codebase is drifting.",
    offer: "Fractional CTO",
  },
  {
    quote: "A contractor left mid-build and we need someone to own it.",
    offer: "Contract",
  },
  {
    quote: "We're non-technical and can't tell if our devs are making good calls.",
    offer: "Fractional CTO",
  },
  {
    quote: "We need to move fast without the code becoming a liability.",
    offer: "Any of the three",
  },
];

/** SVC-06 — process quality as proof. Lead renders as gold mono; body as text. */
export const howIWork: Array<{ lead: string; body: string }> = [
  {
    lead: "Typed end to end",
    body: "Postgres to the pixel, contracts the compiler enforces.",
  },
  {
    lead: "Tutorial-grade specs",
    body: "Every layer of a feature mapped before it's built.",
  },
  {
    lead: "Preview environments",
    body: "You see the work as it lands, not at the end.",
  },
  {
    lead: "AI-native development",
    body: "Layered convention files that hold generated code to senior quality.",
  },
  {
    lead: "Weekly written updates",
    body: "Decisions, tradeoffs, and what ships next.",
  },
];

/** SVC-07 — three lines. */
export const whatImNot: string[] = [
  "Not a dev shop that upsells hours.",
  "Not a consultant who delivers a deck and disappears.",
  "Not a body you have to manage.",
];

/** SVC-08 — three steps. */
export const steps: Array<{ title: string; body: string }> = [
  { title: "A 30-minute call", body: "What you're building, where it's stuck, whether I'm the right fit." },
  { title: "A scoped proposal", body: "Within 48 hours: scope, timeline, price, start date." },
  { title: "A start date", body: "Work begins. Weekly written updates from week one." },
];

export const replyLine = "I reply within one business day.";

/** SVC-10 — five questions. */
export const faq: Array<{ q: string; a: string }> = [
  {
    q: "How do engagements start?",
    a: "With a 30-minute call. If it's a fit, you get a scoped proposal within 48 hours: scope, timeline, price, start date. No pitch either way.",
  },
  {
    q: "Contract or fractional — which do I need?",
    a: "Contract is embedded: I join your team for three to twelve months and ship production features. Fractional is one or two days a week on retainer, covering architecture, technical strategy, hiring, and review. If you're not sure, the call sorts it out quickly.",
  },
  {
    q: "Where do you work from?",
    a: "Vancouver, Canada (PST). Remote, with full overlap of North American working hours.",
  },
  {
    q: "How does pricing work?",
    a: "Fixed scope where it makes sense: a price tied to deliverables rather than hours. Contract engagements bill monthly. Most land between $15K and $75K CAD.",
  },
  {
    q: "Are you available now?",
    a: "Yes. Taking up to two engagements, or the right full-time role.",
  },
];

/** Hero availability line. The gold "Available now" prefix renders separately. */
export const availability =
  "Taking up to two engagements, or the right full-time role.";

/** SVC-11 — closing. */
export const closing =
  "A 30-minute call, no pitch. We'll figure out if I'm the right fit.";

/** SVC-09 — two-line bio beside the photo. Taylor owns the final wording. */
export const bio =
  "Senior product engineer and technical founder: twelve products taken from zero to one across healthtech, AI platforms, commerce, and booking. Remote from Vancouver.";

/**
 * /work-with-me roles (D-SITE-57): seats of one job, never a menu (D-SITE-125).
 * Terms are home's; best-for and includes come from `offers` where drawn.
 * Brackets are Taylor's slots and stay as written.
 */
export type Role = {
  name: string;
  terms: string;
  bestFor: string;
  includes: string[];
};

export const roles: Role[] = [
  {
    name: "Product engineer",
    terms: "Full-time · contract · fractional",
    bestFor: offers[0].bestFor,
    includes: offers[0].includes,
  },
  {
    name: "Product designer",
    terms: "Full-time · contract · fractional",
    bestFor: "[Taylor's line]",
    includes: ["[Taylor's copy: what the seat covers]"],
  },
  {
    name: "Systems consultant",
    terms: "Scoped engagement",
    bestFor: "System design, before the build. [draft]",
    includes: ["[Taylor's copy: what the engagement delivers]"],
  },
  {
    name: "Fractional CTO",
    terms: "Retainer, 1–2 days a week",
    bestFor: offers[2].bestFor,
    includes: offers[2].includes,
  },
  {
    name: "0→1 build",
    terms: "Fixed scope, 8–16 weeks",
    bestFor: offers[1].bestFor,
    includes: offers[1].includes,
  },
];

/** The smaller group below the roles (D-SITE-128). Prices: Taylor's (D-SITE-203). */
export type BuildingRow = {
  name: string;
  price: string;
  line: string;
  /** The proof link, over "Send a note". The conventions install has none. */
  proof?: { label: string; href: string };
};

export const building: BuildingRow[] = [
  {
    name: "Coded website",
    price: "$2,000 CAD + GST",
    line: "Websites for creative work. 3 days to your first look.",
    proof: { label: "Websites", href: "/websites" },
  },
  {
    name: "Branding",
    price: "$750",
    line: "[Taylor's line]",
    proof: { label: "Branding & UI", href: "/work?tab=branding" },
  },
  {
    name: "Conventions install [draft]",
    price: "Contact for a quote",
    line: "[Taylor's line]",
  },
];

export const workWithMeWords = {
  eyebrowSuffix: "Contract & fractional",
  sub: "[Taylor's copy: the seat scales with the team. Senior implementer or staff on a large team, head of product or CTO on a small one, fractional where it fits.]",
  note: "Send a note [draft]",
  close:
    "[Taylor's copy: a closing line that leads with a note, then the call]",
};
