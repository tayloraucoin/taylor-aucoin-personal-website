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

export type Capability = {
  slug: string;
  /** Toggle-tag filter groups (see CATEGORIES). */
  tags: Category[];
  title: string;
  /** Mono tech subtitle, items separated by " · ". */
  tech: string;
  /** Dialog body — 2–3 sentences, grounded in the case studies. */
  approach: string;
  /** Where this was done. Case-study routes or external links. */
  proof?: CapabilityProof[];
  /** "Usually shows up as" — one of the three offers. */
  offer: string;
  /** Filter-matching only. Lowercase. */
  keywords: string[];
};

const BCIT_ISSP_URL =
  "https://www.bcit.ca/computing-academic-studies/industry-sponsored-student-projects/";

export const capabilities: Capability[] = [
  {
    slug: "zero-to-one",
    tags: ["Delivery"],
    title: "Turn a spec into a shipped product, solo",
    tech: "0→1 delivery",
    approach:
      "Twelve products taken from zero to one. Everbook went from light product notes to a production MVP in six months, solo: architecture, schema, and infrastructure included. Conscious Connections went from first commit to beta in a summer of spare cycles.",
    proof: [
      { label: "Everbook", href: "/work/everbook" },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
      { label: "Roomvy", href: "/work/roomvy" },
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
    tags: ["AI"],
    title: "Ship AI features that don't rot your codebase",
    tech: "LLM orchestration · evals · structured output",
    approach:
      "AI features held to the same conventions as the rest of the codebase: typed boundaries around model calls, schema-validated structured output, and golden-set eval harnesses written before the prompts they grade. Realtime voice AI shipped in production on Everbook; Conscious Connections runs six eval suites, with the safety evals gating on recall across three consecutive runs.",
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
    ],
  },
  {
    slug: "payments",
    tags: ["Commerce"],
    title: "Payments, tax, and refunds that survive real orders",
    tech: "Stripe · subscriptions · webhooks",
    approach:
      "Checkout built from scratch twice: cart, tax, refunds, and shipping on Agora; two payment processors and three print providers behind one commerce layer on Everbook. Subscriptions, entitlements, and an affiliate program with commission clawbacks on Conscious Connections. Webhooks are the only writer of orders.",
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
    tags: ["Data"],
    title: "Data and state architecture that survives feature growth",
    tech: "typed end-to-end · schema design · RLS",
    approach:
      "Full database ERDs designed before the first migration: the family office platform's 200+ models with row-level security across 150+ tables, and deny-by-default RLS on every Conscious Connections table, declared through per-table policy factories. Typed contracts from Postgres to the pixel.",
    proof: [
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
    tags: ["Data"],
    title: "Consolidate several half-built systems into one",
    tech: "monorepo · shared schema · migrations",
    approach:
      "Ten legacy databases across five business entities became one monorepo, one database, one login. Migration and reconciliation came first, visible features second, and the legacy code kept running while the ground moved under it.",
    proof: [{ label: "Family Office Platform", href: "/work/family-office-platform" }],
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
    tags: ["AI", "Process"],
    title: "Turn AI coding agents into a disciplined engineering team",
    tech: "Cursor · Claude Code · convention systems · role prompts",
    approach:
      "My daily workflow, systematized: Cursor and Claude Code held to layered convention files, locked architecture contracts, and a cast of thirty-plus written roles (staff engineer, QA, security, behavioral scientist), each injected into the thread that needs it. Specs are executable tickets with kickoff and completion protocols; decisions and deviations land in append-only logs. An unwritten convention doesn't exist.",
    proof: [
      { label: "Conscious Connections", href: "/work/conscious-connections" },
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
    tags: ["Commerce"],
    title: "Booking, inventory, and accommodation flows",
    tech: "allocation · availability · edge cases",
    approach:
      "Roomvy's event-scoped group booking (allocated hotel inventory, hold blocks, multi-room checkout) and the retreat booking engine on the family office platform. Zero issues reported against the Roomvy client.",
    proof: [
      { label: "Roomvy", href: "/work/roomvy" },
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
    tags: ["Data", "AI"],
    title: "Search and discovery that actually finds things",
    tech: "Elasticsearch · ranking · recommendations",
    approach:
      "Agora's discovery engine: Elasticsearch search, an ML recommender, and ranking tuned against real behavior, with business signals folded into relevance.",
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
    tags: ["AI", "Quality"],
    title: "Build AI products that carry a duty of care",
    tech: "safety classifiers · tiered response · fail-open design",
    approach:
      "Conscious Connections reads two partners' raw accounts of a fight, so every submission is screened for intimate-partner-violence signals: a dedicated classifier reads the raw text in parallel, responses are tiered and private, and the crisis tier is templated so it works during a total model outage. Flag records carry no text and no person-level labels, and no failure in the AI stack can take the safety floor down with it.",
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
    tags: ["Data"],
    title: "Realtime sync that survives bad networks",
    tech: "Supabase Realtime · presence · offline outbox",
    approach:
      "Two partners in one live session, kept in sync over Supabase Realtime with presence — and an outbox that queues writes with idempotency keys when the network drops, then reconciles on reconnect. Built so a missed event costs a refetch, never a lost message.",
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
    tags: ["Quality"],
    title: "Make a slow app fast",
    tech: "rendering performance · caching · Lighthouse",
    approach:
      "Agora's v2 website is the reference: a catalog-heavy storefront kept fast through server components, caching strategy, and bundle discipline.",
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
    tags: ["AI"],
    title: "Realtime voice and audio interfaces",
    tech: "streaming AI · latency budgets",
    approach:
      "Everbook's AI interviewer: browser to model in realtime, with the paranoid teardown code that keeps microphones and audio contexts honest across devices.",
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
    tags: ["Delivery"],
    title: "Add senior velocity to an existing codebase",
    tech: "your stack · your conventions",
    approach:
      "Roomvy: dropped into an agency's existing codebase, conventions, and design language (none of them mine) and shipped the entire booking client solo, with zero issues reported in production.",
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
    tags: ["Quality"],
    title: "Correctness under pressure",
    tech: "defect prevention · clinical-grade care",
    approach:
      "Clinical calculators where the implementation must match the formula exactly, every time: zero bugs reported through Medscape or production across my tenure. The same discipline shipped Roomvy's booking client with zero reported issues.",
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
    tags: ["Process"],
    title: "Write the spec everyone else can build from",
    tech: "specification · decision records",
    approach:
      "Tutorial-grade tickets that map every layer of a feature before it's built — writing a spec that precise is coding the feature through another person, or an AI agent. The family office handoff shipped with role-scoped SOPs and contributor guides an AI-assisted team still builds from; Conscious Connections runs on slice specs with kickoff and completion protocols.",
    proof: [
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
    tags: ["Design"],
    title: "Design the interface, not just build it",
    tech: "product design · UX · UI",
    approach:
      "I design the interfaces I ship: Everbook's author dashboard and book previews, the family office CRM, Agora's storefront, and all of Conscious Connections. Design and engineering in one head means nothing gets lost between the mock and the build.",
    proof: [
      { label: "Everbook", href: "/work/everbook" },
      { label: "Conscious Connections", href: "/work/conscious-connections" },
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
    tags: ["Delivery"],
    title: "Run with loose guidelines, deliver a finished product",
    tech: "minimal direction · full ownership",
    approach:
      "Everbook started as light Notion notes and a market reference; the family office asked for one platform where ten systems stood. Both times the input was a direction rather than a spec, and the output was a shipped product.",
    proof: [
      { label: "Everbook", href: "/work/everbook" },
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
    tags: ["Process"],
    title: "Lead and level up a junior team",
    tech: "mentorship · code review · standards",
    approach:
      "Fourteen cohorts through BCIT's industry-sponsored projects program: at peak, four concurrent teams and over twenty juniors shipping checkout systems, search, and recommendation engines. The scoping that made that possible was mine.",
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
    tags: ["Data", "AI"],
    title: "Turn a raw catalog into structured, trustworthy metadata",
    tech: "LLM pipelines · ML classification · data quality",
    approach:
      "Agora's catalog came from independent sellers whose titles and descriptions couldn't be trusted; keyword rules failed on tags as basic as gender fit. The answer was a full enrichment pipeline: LLM extraction and ML classification feeding the recommender.",
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
    tags: ["Quality"],
    title: "Tests that earn deploy confidence",
    tech: "unit · integration · CI",
    approach:
      "Unit and integration coverage where it pays — Agora's checkout and tax logic, Calculate's clinical formulas, the code where a wrong answer is expensive. Tests are the deploy gate.",
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
    tags: ["Design"],
    title: "Animation and interaction craft",
    tech: "Motion · CSS · canvas",
    approach:
      "The moving gradient borders, the cursor-aware background field, and the overlay choreography on this site are mine, as is the gradient work on the Conscious Connections marketing site. Ambient motion lives in CSS, orchestration in JS, and everything honors prefers-reduced-motion.",
    proof: [
      { label: "This site" },
      {
        label: "consciousconnections.app",
        href: "https://consciousconnections.app/",
        external: true,
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
    tags: ["Design"],
    title: "Build the component kit your team ships from",
    tech: "Storybook · design systems · shared UI",
    approach:
      "Component libraries in Storybook across the family office platform, Everbook, and Agora: shared UI that keeps five apps looking like one product, so the next engineer composes instead of reinventing.",
    proof: [
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
    title: "A React Native app that shares its logic with the web",
    tech: "React Native · Expo · monorepo",
    approach:
      "One monorepo, one set of business logic, two surfaces. The Conscious Connections codebase is already structured for it: ten standing mobile-readiness rules govern today's web work, enforced by lint boundaries in CI, so the mobile app becomes a move rather than a rewrite.",
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
    tags: ["Design"],
    title: "Take a company through a formal branding process",
    tech: "brand pillars · identity · brand guide",
    approach:
      "A full branding sequence, run in order: brand pillars, mood board, colors, typography, logo, layouts and spacing, UI design, and the brand guide that holds it together — run end to end for Agora. The output is a system a team can apply without me.",
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
    tags: ["Data"],
    title: "Data scraping and lead pipelines",
    tech: "scraping · processing · human-in-the-loop",
    approach:
      "For Agora: an organic list of Instagram profiles ran through Phantombuster, into a custom Node.js processor that scored leads, through a human review stage (the kind AI tooling now replaces), and back out as CSVs synced into the product's admin. A complete acquisition pipeline, tooling included.",
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
    tags: ["Process"],
    title: "Scope the build and sequence the roadmap",
    tech: "scoping · sequencing · build plans",
    approach:
      "Deciding what gets built, and in what order: the family office engagement was sequenced data-first even though it meant weeks without visible features. Specs come after; this is the layer above them.",
    proof: [
      { label: "Family Office Platform", href: "/work/family-office-platform" },
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
