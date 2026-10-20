/**
 * Capability card grid content (GRID-02/03). Card titles are problems, not
 * technologies — tech goes in the subtitle.
 *
 * `proof` links a card to the work where it was done; its presence IS the
 * provenance distinction — cards without it carry approach only, and nothing
 * on the page ever says "haven't done this." Articles slot into the same
 * mechanism later. `keywords` feed the filter input only (never rendered):
 * include the tech and problem words a visitor would actually type.
 *
 * Order is deliberate: the first two rows are the sixty-second window, so the
 * flagship offer (0→1), the AI cards, and commerce lead. Proof-less cards sit
 * in the lower half, interleaved by category rather than clustered.
 */

export type CapabilityProof = {
  label: string;
  /** Absent → renders as a non-link label (work not yet published/linkable). */
  href?: string;
  external?: boolean;
};

/** Chip order in the filter row. Every card carries 1–2 of these. */
export const CATEGORIES = [
  "Commerce",
  "AI",
  "Data",
  "Design",
  "Delivery",
  "Quality",
  "Process",
] as const;

export type Category = (typeof CATEGORIES)[number];

/**
 * The discipline tabs on /capabilities, in build order (D-SITE-146). "All"
 * is the page's own default, never stored. A capability may sit in two.
 */
export const CAPABILITY_TABS = [
  "product-design",
  "engineering",
  "ai-data",
  "leading-delivery",
] as const;

export type CapabilityTab = (typeof CAPABILITY_TABS)[number];

export type Capability = {
  slug: string;
  /** Toggle-tag filter groups (see CATEGORIES). */
  tags: Category[];
  /**
   * The /capabilities tabs it shows under. First filled from `tags`
   * (D-SITE-234): Design → product-design; Commerce, Quality → engineering;
   * AI, Data → ai-data; Delivery, Process → leading-delivery. Taylor
   * reassigns them by hand.
   */
  tabs: CapabilityTab[];
  title: string;
  /** Mono tech subtitle, items separated by " · ". */
  tech: string;
  /**
   * Dialog body, 2–3 sentences: what the capability is and why a hirer
   * should care. No case-study names; those live in `proof`.
   */
  approach: string;
  /** Where this was done. Case-study routes or external links. */
  proof?: CapabilityProof[];
  /** "Usually shows up as" — one of the three offers. */
  offer: string;
  /** Filter-matching only. Lowercase. */
  keywords: string[];
  /**
   * The short name on home's capability chip (D-SITE-46), as drawn on the
   * Paper Home and Capabilities pages. Absent → no chip.
   */
  chip?: string;
  /**
   * Taylor's comfort, which orders the chips and is never rendered or sent
   * to the client (D-SITE-65). Synthetic until he supplies his own: these
   * reproduce the drawn order.
   */
  comfort?: number;
};

const BCIT_ISSP_URL =
  "https://www.bcit.ca/computing-academic-studies/industry-sponsored-student-projects/";

export const capabilities: Capability[] = [
  {
    slug: "zero-to-one",
    chip: "0→1 builds",
    comfort: 9.8,
    tags: ["Delivery"],
    tabs: ["leading-delivery"],
    title: "Turn a spec into a shipped product, solo",
    tech: "0→1 delivery",
    approach:
      "I take a product from an idea or a rough spec to something live, and I carry every layer myself: architecture, schema, interface, infrastructure. You get one accountable person instead of a team to assemble, and a codebase with its conventions written down, so the next engineer can pick it up. Everbook went from product notes to a production MVP in six months, solo.",
    proof: [
      { label: "Everbook", href: "/work/everbook" },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
      { label: "Roomvy", href: "/work/roomvy" },
      { label: "Calculate by QxMD", href: "/work/calculate-qxmd" },
    ],
    offer: "Fixed-scope 0→1 build",
    keywords: [
      "mvp",
      "greenfield",
      "founding",
      "zero to one",
      "prototype",
      "launch",
      "startup",
      "idea",
      "build",
    ],
  },
  {
    slug: "ai-features",
    chip: "AI features",
    comfort: 9.5,
    tags: ["AI"],
    tabs: ["ai-data"],
    title: "Ship AI features that don't rot your codebase",
    tech: "LLM orchestration · evals · structured output",
    approach:
      "I build AI features to the same standard as the rest of the code. Model calls sit behind typed boundaries, output is checked against a schema, and the evals get written before the prompts they grade. That's what keeps the AI part from becoming the part of the codebase nobody wants to touch. Conscious Connections runs six eval suites, and the safety evals gate on recall across three runs in a row.",
    proof: [
      { label: "Everbook", href: "/work/everbook" },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
    ],
    offer: "Fractional CTO",
    keywords: [
      "llm",
      "openai",
      "claude",
      "anthropic",
      "agents",
      "rag",
      "evals",
      "prompts",
      "machine learning",
      "ai",
      "copilot",
      "chatbot",
      "structured output",
      "realtime",
    ],
  },
  {
    slug: "payments",
    chip: "Payments and tax",
    comfort: 8.0,
    tags: ["Commerce"],
    tabs: ["engineering"],
    title: "Payments, tax, and refunds that survive real orders",
    tech: "Stripe · subscriptions · webhooks",
    approach:
      "Checkout, tax, refunds, subscriptions, and the webhooks that tie them together. A bug here costs real money or a real customer. So webhooks are the only thing that writes an order, and every path that moves money is tested. Everbook runs two payment processors and three print providers behind one commerce layer.",
    proof: [
      { label: "Agora", href: "/work/agora" },
      { label: "Everbook", href: "/work/everbook" },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
    ],
    offer: "Contract",
    keywords: [
      "stripe",
      "square",
      "checkout",
      "tax",
      "refunds",
      "billing",
      "subscriptions",
      "ecommerce",
      "commerce",
      "payments",
      "orders",
      "shopify",
      "affiliate",
      "entitlements",
    ],
  },
  {
    slug: "data-architecture",
    chip: "Data and state architecture",
    comfort: 9.2,
    tags: ["Data"],
    tabs: ["ai-data"],
    title: "Data and state architecture that survives feature growth",
    tech: "typed end-to-end · schema design · RLS",
    approach:
      "I design the data model before the first migration: the entities, who can see what, and how the types carry from Postgres up to the screen. A good model is why the twentieth feature is as easy to add as the second. The Future of Cities platform has 200+ models, with row-level security across 150+ tables.",
    proof: [
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
      { label: "Everbook", href: "/work/everbook" },
    ],
    offer: "Fixed-scope 0→1 build",
    keywords: [
      "schema",
      "database",
      "postgres",
      "prisma",
      "drizzle",
      "state",
      "architecture",
      "typescript",
      "types",
      "supabase",
      "erd",
      "data model",
      "rls",
      "row-level security",
    ],
  },
  {
    slug: "consolidate",
    chip: "System consolidation",
    comfort: 6.8,
    tags: ["Data"],
    tabs: ["ai-data"],
    title: "Consolidate several half-built systems into one",
    tech: "monorepo · shared schema · migrations",
    approach:
      "When a business runs on several systems that don't talk to each other, I fold them into one codebase and one database, with one login. Migration comes first, even when that means weeks with nothing new to show, and the old systems keep running until the new one can carry them. Ten legacy databases across five business entities became one.",
    proof: [
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
    ],
    offer: "Fractional CTO",
    keywords: [
      "monorepo",
      "migration",
      "legacy",
      "refactor",
      "turborepo",
      "consolidation",
      "technical debt",
      "rewrite",
      "integration",
    ],
  },
  {
    slug: "ai-native-process",
    chip: "AI engineering process",
    comfort: 7.7,
    tags: ["AI", "Process"],
    tabs: ["ai-data", "leading-delivery"],
    title: "Turn AI coding agents into a disciplined engineering team",
    tech: "Cursor · Claude Code · convention systems · role prompts",
    approach:
      "I run AI coding agents the way a lead runs a team: written conventions, a role for each job, specs to build against and a log of every decision. Their output holds to the same standard as mine, and the process keeps working after I hand it over. The cast is thirty-plus written roles, each injected into the thread that needs it.",
    proof: [
      { label: "Conscious Connections", href: "/work/conscious-connections" },
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
    ],
    offer: "Fractional CTO",
    keywords: [
      "cursor",
      "claude code",
      "agents",
      "conventions",
      "roles",
      "ai workflow",
      "ai-native",
      "process",
      "documentation",
      "prompts",
      "agentic",
      "governance",
      "multi-agent",
    ],
  },
  {
    slug: "booking-inventory",
    chip: "Booking and inventory",
    comfort: 6.5,
    tags: ["Commerce"],
    tabs: ["engineering"],
    title: "Booking, inventory, and accommodation flows",
    tech: "allocation · availability · edge cases",
    approach:
      "Room blocks, holds, availability and group checkout. Booking breaks at the edges (two people after the last room, a hold that expires mid-payment), so I design for those cases before the easy path. Zero issues reported against the Roomvy client.",
    proof: [
      { label: "Roomvy", href: "/work/roomvy" },
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
    ],
    offer: "Contract",
    keywords: [
      "booking",
      "inventory",
      "reservations",
      "availability",
      "allocation",
      "calendar",
      "hotel",
      "scheduling",
      "events",
      "accommodation",
      "hotel booking",
      "retreat",
      "room blocks",
    ],
  },
  {
    slug: "search-discovery",
    chip: "Search and discovery",
    comfort: 8.3,
    tags: ["Data", "AI"],
    tabs: ["ai-data"],
    title: "Search and discovery that actually finds things",
    tech: "Elasticsearch · ranking · recommendations",
    approach:
      "Search that returns what people meant, and recommendations that learn from what they actually do. I tune relevance against real behaviour and fold in the signals the business cares about, so results serve the shopper and the catalogue at once.",
    proof: [{ label: "Agora", href: "/work/agora" }],
    offer: "Contract",
    keywords: [
      "elasticsearch",
      "search",
      "recommendations",
      "recommender",
      "ranking",
      "discovery",
      "pgvector",
      "embeddings",
      "relevance",
    ],
  },
  {
    slug: "ai-duty-of-care",
    chip: "AI with a duty of care",
    comfort: 5.0,
    tags: ["AI", "Quality"],
    tabs: ["engineering", "ai-data"],
    title: "Build AI products that carry a duty of care",
    tech: "safety classifiers · tiered response · fail-open design",
    approach:
      "Some AI products meet people at a hard moment. For those I build safety as its own system: a classifier running beside the main model, private tiered responses, and a crisis path that still works if every model is down. If your product touches health or relationships, this is the part users and regulators will judge you on. Flag records carry no text and no person-level labels.",
    proof: [
      { label: "Conscious Connections", href: "/work/conscious-connections" },
    ],
    offer: "Fixed-scope 0→1 build",
    keywords: [
      "safety",
      "trust and safety",
      "classifier",
      "moderation",
      "crisis",
      "guardrails",
      "compliance",
      "duty of care",
      "risk",
      "abuse",
    ],
  },
  {
    slug: "realtime-sync",
    chip: "Realtime sync",
    comfort: 6.2,
    tags: ["Data"],
    tabs: ["ai-data"],
    title: "Realtime sync that survives bad networks",
    tech: "Supabase Realtime · presence · offline outbox",
    approach:
      "Live, shared sessions that hold up on a bad connection. Writes queue while the network is down and reconcile when it comes back, so a dropped signal costs a refetch and nobody loses what they typed. Queued writes carry idempotency keys.",
    proof: [
      { label: "Conscious Connections", href: "/work/conscious-connections" },
    ],
    offer: "Contract",
    keywords: [
      "realtime",
      "websockets",
      "sync",
      "presence",
      "collaboration",
      "multiplayer",
      "offline",
      "live updates",
      "supabase",
    ],
  },
  {
    slug: "performance",
    chip: "Rendering performance",
    comfort: 7.1,
    tags: ["Quality"],
    tabs: ["engineering"],
    title: "Make a slow app fast",
    tech: "rendering performance · caching · Lighthouse",
    approach:
      "Slow pages lose people. I bring load times down with server rendering and a caching plan that fits how the data changes, and I keep the bundle small, even on catalogue pages with thousands of products.",
    proof: [{ label: "Agora v2", href: "/work/agora" }],
    offer: "Contract",
    keywords: [
      "performance",
      "lighthouse",
      "caching",
      "cdn",
      "core web vitals",
      "optimization",
      "slow",
      "speed",
      "react",
      "nextjs",
    ],
  },
  {
    slug: "realtime-voice",
    chip: "Realtime voice",
    comfort: 4.7,
    tags: ["AI"],
    tabs: ["ai-data"],
    title: "Realtime voice and audio interfaces",
    tech: "streaming AI · latency budgets",
    approach:
      "Voice interfaces where the browser talks to the model in real time. Most of the work is the unglamorous part: latency budgets, and teardown code that releases the microphone cleanly on every device, including someone's old phone.",
    proof: [{ label: "Everbook", href: "/work/everbook" }],
    offer: "Fixed-scope 0→1 build",
    keywords: [
      "voice",
      "audio",
      "realtime",
      "streaming",
      "webrtc",
      "whisper",
      "speech",
      "microphone",
      "transcription",
    ],
  },
  {
    slug: "velocity",
    chip: "Senior velocity",
    comfort: 4.4,
    tags: ["Delivery"],
    tabs: ["leading-delivery"],
    title: "Add senior velocity to an existing codebase",
    tech: "your stack · your conventions",
    approach:
      "I join an existing codebase and ship inside its conventions, its design language and its review process, without asking you to adopt mine. You get senior output in the first weeks, and the code reads like your team wrote it. Roomvy's booking client shipped solo with zero issues reported in production.",
    proof: [{ label: "Roomvy", href: "/work/roomvy" }],
    offer: "Contract",
    keywords: [
      "velocity",
      "ramp up",
      "existing codebase",
      "onboarding",
      "embed",
      "agency",
      "throughput",
      "mid-project",
    ],
  },
  {
    slug: "correctness",
    chip: "Correctness",
    comfort: 7.4,
    tags: ["Quality"],
    tabs: ["engineering"],
    title: "Correctness under pressure",
    tech: "defect prevention · clinical-grade care",
    approach:
      "For code where a wrong answer hurts someone, I test past what the ticket asks: unit and integration tests on every calculation, end-to-end coverage on the flows that matter. You get releases you don't have to hold your breath for. Zero bugs reported through Medscape or production across my tenure on Calculate.",
    proof: [
      { label: "Calculate by QxMD", href: "/work/calculate-qxmd" },
      { label: "Roomvy", href: "/work/roomvy" },
    ],
    offer: "Contract",
    keywords: [
      "quality",
      "testing",
      "defects",
      "bugs",
      "reliability",
      "healthtech",
      "clinical",
      "qa",
      "compliance",
    ],
  },
  {
    slug: "specification",
    chip: "Specification",
    comfort: 8.9,
    tags: ["Process"],
    tabs: ["leading-delivery"],
    title: "Write the spec everyone else can build from",
    tech: "specification · decision records",
    approach:
      "I write specs detailed enough that another engineer, or an AI agent, can build the feature without coming back to ask. Every layer is mapped before the code starts. It's how a small team ships like a bigger one, and how the work outlives my time on it. Conscious Connections runs on slice specs with kickoff and completion protocols.",
    proof: [
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
    ],
    offer: "Fractional CTO",
    keywords: [
      "specification",
      "documentation",
      "decision records",
      "sops",
      "process",
      "writing",
      "tickets",
      "planning",
      "requirements",
    ],
  },
  {
    slug: "interface-design",
    chip: "Interface design",
    comfort: 8.6,
    tags: ["Design"],
    tabs: ["product-design"],
    title: "Design the interface, not just build it",
    tech: "product design · UX · UI",
    approach:
      "I design the interfaces I build, from the flow down to the last state of each screen. With design and engineering in one head, nothing gets lost between the mockup and the code, and you aren't paying two people to argue about it. That covers Everbook's author dashboard, the Future of Cities CRM, Agora's storefront and all of Conscious Connections.",
    proof: [
      { label: "Everbook", href: "/work/everbook" },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
      { label: "Agora", href: "/work/agora" },
    ],
    offer: "Fixed-scope 0→1 build",
    keywords: [
      "design",
      "ui",
      "ux",
      "figma",
      "interface",
      "product design",
      "mockups",
      "prototyping",
    ],
  },
  {
    slug: "ambiguity",
    chip: "Loose briefs, finished product",
    comfort: 4.1,
    tags: ["Delivery"],
    tabs: ["leading-delivery"],
    title: "Run with loose guidelines, deliver a finished product",
    tech: "minimal direction · full ownership",
    approach:
      "Give me a direction and a market reference and I'll come back with a shipped product. I fill the gaps with decisions, write them down and check them with you, so you aren't stuck writing the spec yourself. Everbook started as light Notion notes and a market reference.",
    proof: [
      { label: "Everbook", href: "/work/everbook" },
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
    ],
    offer: "Fixed-scope 0→1 build",
    keywords: [
      "ambiguity",
      "ownership",
      "autonomy",
      "loose",
      "vague",
      "direction",
      "self-directed",
      "trust",
    ],
  },
  {
    slug: "junior-team",
    chip: "Leading junior teams",
    comfort: 3.2,
    tags: ["Process"],
    tabs: ["leading-delivery"],
    title: "Lead and level up a junior team",
    tech: "mentorship · code review · standards",
    approach:
      "I lead junior developers to production-grade work: scoping it so they can succeed, reviewing every pull request, and teaching the standards as we go. At peak I ran four teams at once, over twenty developers. Fourteen cohorts through BCIT's industry-sponsored projects program.",
    proof: [{ label: "BCIT ISSP", href: BCIT_ISSP_URL, external: true }],
    offer: "Fractional CTO",
    keywords: [
      "mentorship",
      "leadership",
      "team",
      "review",
      "standards",
      "hiring",
      "junior",
      "training",
      "management",
    ],
  },
  {
    slug: "metadata-enrichment",
    chip: "Metadata enrichment",
    comfort: 3.8,
    tags: ["Data", "AI"],
    tabs: ["ai-data"],
    title: "Turn a raw catalog into structured, trustworthy metadata",
    tech: "LLM pipelines · ML classification · data quality",
    approach:
      "When a catalogue's titles and descriptions can't be trusted, I build the pipeline that fixes them: LLM extraction and ML classification that tag every product against a schema. Clean metadata is what search and recommendations stand on. Keyword rules had failed on tags as basic as gender fit.",
    proof: [{ label: "Agora", href: "/work/agora" }],
    offer: "Contract",
    keywords: [
      "metadata",
      "enrichment",
      "catalog",
      "classification",
      "tagging",
      "data quality",
      "pipeline",
      "etl",
      "llm",
    ],
  },
  {
    slug: "qa-testing",
    chip: "Testing",
    comfort: 5.9,
    tags: ["Quality"],
    tabs: ["engineering"],
    title: "Tests that earn deploy confidence",
    tech: "unit · integration · CI",
    approach:
      "I put tests where a wrong answer is expensive (money, or a clinical number) and make them the gate for every deploy. That's what lets you ship often without a manual check each time. Covered: Agora's checkout and tax logic, Calculate's clinical formulas.",
    proof: [
      { label: "Agora", href: "/work/agora" },
      { label: "Calculate by QxMD", href: "/work/calculate-qxmd" },
    ],
    offer: "Contract",
    keywords: [
      "testing",
      "unit tests",
      "integration tests",
      "jest",
      "coverage",
      "ci",
      "qa",
      "automation",
    ],
  },
  {
    slug: "animation-craft",
    chip: "Animation and interaction",
    comfort: 3.5,
    tags: ["Design"],
    tabs: ["product-design"],
    title: "Animation and interaction craft",
    tech: "Motion · CSS · canvas",
    approach:
      "Motion that makes an interface feel considered, like borders that move and a background that answers the cursor. Ambient motion lives in CSS and orchestration in JavaScript, and all of it respects reduced-motion settings.",
    proof: [
      { label: "This site", href: "/work?tab=branding" },
      {
        label: "consciousconnections.app",
        href: "/work/conscious-connections",
      },
    ],
    offer: "Contract",
    keywords: [
      "animation",
      "animations",
      "motion",
      "transitions",
      "interaction",
      "micro-interactions",
      "framer motion",
      "canvas",
      "polish",
    ],
  },
  {
    slug: "component-kit",
    chip: "Component kits",
    comfort: 5.6,
    tags: ["Design"],
    tabs: ["product-design"],
    title: "Build the component kit your team ships from",
    tech: "Storybook · design systems · shared UI",
    approach:
      "A shared component library, documented in Storybook, that several apps build from. Your next engineer composes screens from parts that already exist, and every app still looks like one product. On the Future of Cities platform it keeps five apps looking like one product.",
    proof: [
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
      { label: "Everbook", href: "/work/everbook" },
      { label: "Agora", href: "/work/agora" },
    ],
    offer: "Contract",
    keywords: [
      "storybook",
      "components",
      "design system",
      "ui kit",
      "component library",
      "shared ui",
    ],
  },
  {
    slug: "ab-testing",
    tags: ["Data", "Process"],
    tabs: ["ai-data", "leading-delivery"],
    title: "A/B testing and conversion analytics",
    tech: "experiments · funnels · event instrumentation",
    approach:
      "Event instrumentation, funnel analysis, and experiment flags wired into the product rather than bolted on. Conversion data changes what gets built next, so the instrumentation has to be trustworthy first.",
    offer: "Contract",
    keywords: [
      "ab testing",
      "a/b",
      "experiments",
      "analytics",
      "conversion",
      "funnel",
      "ga4",
      "metrics",
      "instrumentation",
    ],
  },
  {
    slug: "read-replicas",
    tags: ["Data"],
    tabs: ["ai-data"],
    title: "Cut global response times with read replicas",
    tech: "Postgres replicas · edge routing · cache strategy",
    approach:
      "Serve reads from a replica near the user and route writes home. The work is in the details: replica lag handled explicitly, cache invalidation that respects the topology, and a data layer that knows which queries tolerate staleness.",
    offer: "Contract",
    keywords: [
      "read replica",
      "replication",
      "latency",
      "global",
      "edge",
      "scaling",
      "performance",
      "distributed",
    ],
  },
  {
    slug: "react-native-monorepo",
    tags: ["Delivery"],
    tabs: ["leading-delivery"],
    title: "A React Native app that shares its logic with the web",
    tech: "React Native · Expo · monorepo",
    approach:
      "One monorepo, one set of business logic, two surfaces. I set up web codebases so the mobile app is a move rather than a rewrite, with lint rules in CI that keep the shared logic free of anything web-only. Ten standing mobile-readiness rules govern the Conscious Connections web work today.",
    offer: "Fixed-scope 0→1 build",
    keywords: [
      "react native",
      "mobile",
      "ios",
      "android",
      "expo",
      "app",
      "monorepo",
      "shared logic",
    ],
  },
  {
    slug: "branding",
    chip: "Branding",
    comfort: 2.9,
    tags: ["Design"],
    tabs: ["product-design"],
    title: "Take a company through a formal branding process",
    tech: "brand pillars · identity · brand guide",
    approach:
      "A formal branding process, run in order: pillars, mood board, colour, type, logo, layouts, and the guide that holds it together. What you end up with is a system your team can apply without me.",
    proof: [{ label: "Agora", href: "/work/agora" }],
    offer: "Fractional CTO",
    keywords: [
      "brand",
      "branding",
      "logo",
      "identity",
      "typography",
      "colors",
      "mood board",
      "brand guide",
      "visual identity",
    ],
  },
  {
    slug: "data-pipelines",
    chip: "Data pipelines",
    comfort: 2.6,
    tags: ["Data"],
    tabs: ["ai-data"],
    title: "Data scraping and lead pipelines",
    tech: "scraping · processing · human-in-the-loop",
    approach:
      "I build acquisition pipelines end to end: collection, a processor that scores each lead, a human review step, and a clean import into your admin. You get a list your team can act on, and the tooling to run it again. For Agora: Instagram profiles through Phantombuster and a custom Node.js processor, out as CSVs synced into the admin.",
    proof: [{ label: "Agora", href: "/work/agora" }],
    offer: "Contract",
    keywords: [
      "scraping",
      "phantombuster",
      "leads",
      "instagram",
      "csv",
      "pipeline",
      "automation",
      "data processing",
      "growth",
    ],
  },
  {
    slug: "roadmapping",
    chip: "Scoping and roadmaps",
    comfort: 5.3,
    tags: ["Process"],
    tabs: ["leading-delivery"],
    title: "Scope the build and sequence the roadmap",
    tech: "scoping · sequencing · build plans",
    approach:
      "Deciding what gets built, and in what order, before anyone writes a spec. Sometimes the right first month has nothing visible to show because the data has to be sound first, and I'll make that case to you plainly. The Future of Cities engagement went data-first, with weeks before anything visible.",
    proof: [
      {
        label: "the Future of Cities platform",
        href: "/work/future-of-cities",
      },
      { label: "Everbook", href: "/work/everbook" },
      { label: "Agora", href: "/work/agora" },
    ],
    offer: "Fractional CTO",
    keywords: [
      "roadmap",
      "scoping",
      "planning",
      "sequencing",
      "prioritization",
      "estimation",
      "build plan",
      "milestones",
    ],
  },
];
