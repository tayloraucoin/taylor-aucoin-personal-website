import type { CaseStudy } from "./types";

export const agora = {
  slug: "agora",
  title: "Agora",
  meta: "Recommender · Enrichment · Search",
  tagline:
    "A full marketplace commerce build — cart, checkout, tax, refunds, shipping — that later became a cross-marketplace discovery engine for independent sellers.",
  roleLabel: "Founder, Engineer",
  role: "Founder, engineer",
  period: "2021 — 2026",
  stack: [
    "Next.js",
    "TypeScript",
    "Prisma",
    "PostgreSQL",
    "pgvector",
    "Elasticsearch",
    "TensorFlow/Keras",
    "OpenAI",
    "Etsy + Shopify APIs",
    "Stripe",
  ],
  atAGlance: [
    {
      label: "Engagement",
      value: "Technical founder — five years, three versions, three fresh codebases",
    },
    {
      label: "Starting point",
      value:
        "Festival fashion scattered across Etsy, Shopify, and Instagram, with no central place to discover it",
    },
    {
      label: "Delivered",
      value:
        "A full marketplace with owned checkout, a subscription directory, and a personalized discovery engine",
    },
    {
      label: "Core system",
      value:
        "An AI data spine: LLM enrichment of an untrusted catalog feeding a custom ML recommender",
    },
    {
      label: "Teams led",
      value:
        "BCIT cohorts across five years, an SFU co-op, and a virtual intern — building around an architecture I owned",
    },
    {
      label: "Ending",
      value:
        "Backlogged deliberately in March 2026 — the numbers didn't work; the judgment did",
    },
  ],
  brief: {
    intro:
      "Agora set out to centralize festival fashion — a market of independent artists scattered across platforms — and became three products under one name over five years, each version a fresh answer to what the business should be. The hard part was that both halves of \"personalized discovery\" were starved.",
    groups: [
      {
        header: "EXISTING CONDITIONS",
        bullets: [
          "Independent sellers spread across Etsy, Shopify, and Instagram, with discovery happening by accident",
          "Cold start on the user side: a taste model to train with almost no users — the recommender had to work before meaningful interaction data existed",
          "Garbage in on the catalog side: ingested products don't carry the attributes a fashion recommender needs — even mens versus womens fit wasn't derivable from titles and descriptions",
          "Built nights and weekends, solo at the architecture level, while the business model corrected twice underneath me",
        ],
      },
      {
        header: "THE BET",
        bullets: [
          "A discovery layer over the scattered market, personalized to individual taste",
          "Rebuild around what the market rewards, even when that means abandoning working code",
          "Junior teams as a force multiplier — cohorts building and shipping around systems I architected",
          "Every business correction becomes an engineering decision: which code deserves to survive",
        ],
      },
    ],
  },
  process: {
    intro:
      "Three versions, each a fresh codebase, each a correction read from the market. The through-line: I owned the architecture, the data model, and the hardest systems; increasingly, teams I directed built and shipped around them.",
    sections: [
      {
        header: "Version 1 · Marketplace (2021–2023)",
        intro: "The full-commerce version: own the transaction, split the money, ship the goods.",
        bullets: [
          "Wrote ~95% of the codebase while directing a cross-functional team of up to twelve — conventions, Agile sprints, and reviews as the operating system",
          "Multi-vendor checkout splitting one cart across sellers: Stripe Connect transfers per shop, live carrier rates, tax snapshots persisted for audit",
          "Soft inventory holds so limited stock couldn't oversell mid-checkout",
          "JWT-to-Postgres-role authorization — access control enforced at the database layer",
          "A ~90-spec Cypress suite over checkout and listing creation — testing discipline aimed at the riskiest flows",
        ],
      },
      {
        header: "Version 2 · Artist directory (2023–2024)",
        intro: "Strip the transaction, sell the map: a freemium directory of curated artists, personalized by a style-guide quiz.",
        bullets: [
          "A three-step style quiz with guest persistence and merge-on-signup — the directory re-sorts itself around your profile",
          "A claim-your-profile flow seeding artist pages before artists signed up, fed by scheduled Instagram sync",
          "Etsy and Shopify CSV import with format normalization, plus a 3,000-line keyword taxonomy engine auto-categorizing listings",
          "The full subscription lifecycle on Stripe — billing portal, churn survey, and an affiliate program paying automated Connect transfers",
          "The market read came fast: the flow wasn't enjoyable enough to pay for — and Instagram's API was shut down entirely months after I'd already pivoted toward hosting real products",
        ],
      },
      {
        header: "Version 3 · Catalog ingestion",
        intro:
          "The discovery engine starts with other people's data — synced, normalized, and never trusted.",
        bullets: [
          "Etsy sync under a budgeted rate limit with atomic seller claiming (webhooks don't exist there; polling is the only option)",
          "A registered Shopify app: OAuth, Admin API product sync, and order webhooks for attribution",
          "Awin affiliate links with hash-based change detection, and live FX conversion for non-USD pricing",
          "One normalization layer mapping Etsy, Shopify, and scraped shapes into a single catalog model",
        ],
      },
      {
        header: "Version 3 · Enrichment pipeline",
        intro:
          "Every product runs through a multi-phase OpenAI pipeline — vision passes for quality, style, and audience; text passes for materials — ending in an embedding stored in pgvector.",
        bullets: [
          "A checkpointed job state machine that resumes mid-job across serverless timeouts instead of restarting",
          "Atomic job claiming in Postgres — no external queue service, no double processing",
          "Per-call token and cost auditing, built after catching usage under-reporting that hid ~71% of spend",
          "Per-run budgets, exponential backoff, heartbeat-based stale-job recovery, and an admin kill switch",
          "A 674-tag taxonomy across 25 categories, held static for prompt caching",
        ],
      },
      {
        header: "Version 3 · Search",
        intro:
          "Elasticsearch with business-signal reranking — relevance as a product decision, not a default.",
        bullets: [
          "Tiered field boosting, phrase-match bonuses, and auto-detected filter-term boosting",
          "Quality, freshness, popularity, and seller-trust signals folded into ranking",
          "Validated against real-world query cases, including a 48-case spell-correction regression suite",
          "Vector similarity over pgvector as a separate similar-products path",
        ],
      },
      {
        header: "Version 3 · Recommender & feeds",
        intro: "A custom Keras hybrid model at the core, and three product surfaces serving it.",
        bullets: [
          "Learned user and product embeddings concatenated with engineered interaction features; negative sampling to manufacture training signal; a styleguide preference vector weighted heavily for cold start",
          "Hourly incremental retrains with embedding weight transfer, served from FastAPI with micro-batched inference and hot-reloading artifacts",
          "Swipe: session-aware re-ranking with exploration slots, undo, and Postgres as the single source of swipe truth",
          "Discovery: a day-frozen collage feed mixing personalized, trending, and exploratory buckets with visual-appeal weighting",
          "Trending: 24-hour velocity scoring over weighted interaction signals, in global and personalized modes",
          "Every surface degrades gracefully — the app never hard-depends on the recommender being up",
        ],
      },
      {
        header: "Leading the teams",
        intro:
          "I owned the architecture, the core model, and the pipelines; the teams built and shipped around them.",
        bullets: [
          "BCIT ISSP cohorts across five years — at peak, four concurrent teams — delivering the checkout backbone, Elasticsearch integration, seller infrastructure, and three iterations of the recommender",
          "Rav, an SFU co-op from the original BCIT group, four months full-time on the recommender — onboarded and handed off with full system documentation and per-component walkthroughs",
          "Daksh, an intern through the virtual interns program, finalizing the recommender under my supervision — swipe, discovery, and trending shipped as reviewed PRs against written epics",
          "My role each term: scoping, ERD and wireframe reviews, sprint planning, code review, and the tickets that make junior delivery possible",
        ],
      },
    ],
  },
  decisions: [
    {
      chip: "THE THREE VERSIONS",
      decision: "Throw the codebase away twice instead of migrating it.",
      alternative: "Refactor the existing app toward each new business model.",
      why: "V1's data model was built around owning the transaction; v2's around a directory. Neither could honestly express what v3 needed, and migrating would have meant dragging dead assumptions into a new thesis. The cost was severe and I knew it: v1 was ~95% my own code, built with a team of twelve, and I re-implemented working features from zero — twice. What I bought was a schema that fit the actual business each time instead of a franken-model that fit none of them.",
    },
    {
      chip: "VERSION 3",
      decision:
        "Give up owning checkout. V3 sends users to the seller's own shop, with affiliate links where they exist; Stripe bills subscriptions, not transactions.",
      alternative:
        "Keep the marketplace transaction I already had working in v1 — checkout, tax, shipping, the whole thing.",
      why: "Owning the transaction meant owning payments, fulfillment disputes, and seller onboarding, which is an operations company, and I was one person building a discovery product. The cost is the obvious one: I walked away from transaction revenue I'd already built the rails for, and repositioned around traffic I monetize far more weakly.",
    },
    {
      chip: "ENRICHMENT PIPELINE",
      decision:
        "LLM enrichment for critical attributes, over keywords or manual curation.",
      alternative:
        "Keyword association off titles and descriptions (tried — see below), classical NLP, or curating by hand.",
      why: "The recommender and every filter depend on attributes like body fit being actually true, and keywords couldn't deliver that. Manual curation doesn't scale to a marketplace catalog when you're one person. The cost: ~$0.23 and several minutes of pipeline time per product across a large catalog, plus owning cost governance — budgets, token accounting, an admin kill switch — for a pipeline that spends real money unattended. The keyword signals survive only as demoted hints fed into the vision model.",
    },
    {
      chip: "LEADING THE TEAMS",
      decision:
        "Build the ML program through junior teams I directed, rather than alone or not at all.",
      alternative:
        "Build the recommender myself on nights I didn't have, contract it out, or defer ML until the business earned it.",
      why: "The architecture, the model core, and the pipelines stayed mine; the build capacity came from BCIT cohorts, an SFU co-op, and an intern working from scoped epics, reviewed PRs, and written handoffs. The cost is that supervision is real work — tutorial-grade tickets, reviews, and documentation on top of a founder's hours — and iteration runs at the speed of academic terms. What it bought was an ML system a solo founder had no hours to build, and five years of evidence for something I now know cold: juniors ship when the work is scoped right.",
    },
  ],
  built: {
    intro:
      "Agora was three products under one name, each a fresh codebase — a marketplace with owned checkout, a subscription directory, and the discovery engine this case study is really about. The deliverables:",
    cards: [
      {
        label: "V1 MARKETPLACE",
        body: "Multi-vendor commerce end to end: Stripe Connect payout splitting, live carrier rates, tax automation, soft inventory holds, and a vendor operations dashboard — ~95% of the code mine, built with a team of twelve.",
      },
      {
        label: "V2 DIRECTORY",
        body: "A freemium artist directory with a personalizing style quiz, claim-your-profile onboarding, CSV import with a keyword taxonomy engine, and an affiliate program on automated Connect transfers.",
      },
      {
        label: "ENRICHMENT PIPELINE",
        body: "A checkpointed, atomically-claimed OpenAI job system classifying the catalog into 25+ structured attribute families with real cost governance.",
        link: {
          label: "Read the design overview",
          href: "https://app.notion.com/p/OpenAI-Product-Enrichment-Pipeline-Design-Overview-2fcee584d2ee80149ff7fb0198a7b0ea",
        },
      },
      {
        label: "CATALOG INGESTION",
        body: "Etsy, Shopify, and affiliate-link ingestion under budgeted rate limits, normalized into one catalog model — built for data that can't be trusted on arrival.",
      },
      {
        label: "SEARCH",
        body: "An Elasticsearch relevance stack with business-signal reranking and a spell-correction regression suite, plus pgvector similarity for related products.",
      },
      {
        label: "RECOMMENDER & FEEDS",
        body: "A hybrid Keras model with weight-transfer retraining, served realtime — powering swipe, a daily discovery collage, and a trending feed, each with graceful fallback.",
      },
    ],
  },
  broke: {
    intro:
      "Five years of a correcting business model breaks things in every layer — code, plans, and founder assumptions.",
    categories: [
      {
        chip: "METADATA",
        body: "The original plan was that critical tags like gender fit would come from keyword association. It didn't work — titles and descriptions from independent sellers just don't encode it reliably, and a fashion recommender that can't tell mens from womens is broken in a way users feel immediately. That failure forced the entire enrichment pipeline: an ML system I never planned to build, existing because the metadata I inherited couldn't be trusted. The lesson stuck: in a catalog product, the data you ingest is the real bottleneck, and you can't keyword your way out of it.",
      },
      {
        chip: "FOUNDER LENS",
        body: "Version 1 was built like a developer, not an entrepreneur: two years of production-grade engineering — checkout, tax, shipping, a twelve-person team — pointed at a business model I hadn't validated. The code was excellent; the bet underneath it went unexamined until the market examined it for me. Versions 2 and 3 exist because I learned to read the market first and build second.",
      },
      {
        chip: "RETRY STORM",
        body: "An Etsy sync incident overran the API budget by 8–13×. The cause wasn't concurrency — it was the failure path: sellers whose sync failed partway through never had their last-synced timestamp advanced, so the once-a-minute cron re-claimed and re-charged them on every run until the underlying failure was fixed. Root-causing it meant reasoning about side effects on the unhappy path, and the budget guards that exist now came out of it.",
      },
    ],
  },
  outcome: {
    intro:
      "The numbers didn't work. After five years and three versions, the engagement and revenue didn't justify continuing — so in March 2026 I backlogged the product deliberately rather than letting it decay. V3 remains the model I believe in, shelved until the economics change, kept as the passion project it became. What the project actually produced:",
    bullets: [
      "Three full builds of the same idea against a correcting business model",
      "A trained personalization model and a production enrichment pipeline with real cost governance",
      "A search stack, an ingestion layer, and three recommendation surfaces — much of it shipped through teams I led",
      "And the part I weigh most: the judgment to recognize a working system attached to a business that wasn't, and to stop",
    ],
  },
  media: [
    {
      src: "/work/agora/open-ai-pipeline.png",
      alt: "Architecture diagram of the OpenAI enrichment pipeline — cron producer, Postgres job queue, phased gpt-5-mini and embedding calls",
      caption:
        "The enrichment pipeline — the ML system the metadata problem forced me to build.",
    },
  ],
  links: [
    { label: "V3", href: "https://agora.art", status: "live" },
    { label: "V2 site", href: "https://v2-website.agora.art/", status: "archived" },
    {
      label: "V2 app",
      href: "https://app.agora.art/",
      status: "archived",
      note: "API shut down",
    },
    { label: "V1", status: "deprecated", note: "fully deprecated" },
  ],
} satisfies CaseStudy;
