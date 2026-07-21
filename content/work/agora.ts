import type { CaseStudy } from "./types";

export const agora = {
  slug: "agora",
  index: "05",
  title: "Agora",
  meta: "Recommender · Enrichment · Search",
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
  constraint:
    "Agora is a festival fashion discovery engine, and the hard part was that both halves of \"personalized discovery\" were starved. Cold start on the user side: I was training a taste model with almost no users, so the recommender had to work before meaningful interaction data existed. Garbage in on the catalog side: products ingested from Etsy and Shopify don't carry the attributes a fashion recommender needs — even something as basic as mens versus womens fit wasn't derivable from titles and descriptions. And all of it was built nights and weekends over five years, solo at the architecture level, while the business model itself corrected twice underneath me. Each correction meant deciding whether working code I'd written was worth keeping.",
  built: [
    "Agora was three products under one name, each a fresh codebase. V1 was a full marketplace with owned checkout — Stripe Connect, tax automation, shipping — where I wrote ~95% of the code while directing a cross-functional team of up to twelve. V2 stripped down to a subscription artist directory. V3, the version this case study is really about, repositioned as a discovery engine: users explore styles across marketplaces and click through to the seller's own shop.",
    "V3's spine is the enrichment pipeline. Third-party catalog data comes in untrustworthy, so every product runs through a multi-phase OpenAI pipeline — vision passes for quality, style, and audience, text passes for materials, ending in an embedding stored in pgvector — validated against a Zod schema, against a taxonomy of 674 tags across 25 categories held static for prompt caching. It runs as an incremental Postgres job queue with phase checkpointing, exponential-backoff retries, and per-run budgets, at a documented ~$0.23 per product — including an audit where I caught the provider's dashboard under-reporting token usage and instrumented true per-call accounting to trust my own cost model. Search is Elasticsearch with business-signal reranking (browse behavior, recency, availability, image quality, seller trust), with vector similarity as a separate similar-products path.",
    "The recommender is a custom Keras model: learned user and product embeddings concatenated with engineered interaction features into an MLP, trained on clickstream plus a curated styleguide preference vector weighted heavily to cover cold start, with negative sampling to manufacture training signal. It serves realtime from a separate FastAPI service with micro-batched predictions, hourly incremental retrains with embedding-weight transfer, and a fallback path if the service is down. Much of the recommender, Elasticsearch, and Shopify integration work was built through BCIT co-op cohorts I scoped and directed across multiple terms, and Rav as a full-time co-op in Fall 2025 — I owned the architecture, the core model, and the pipelines; students built and shipped around them.",
  ],
  decisions: [
    {
      decision: "Throw the codebase away twice instead of migrating it.",
      alternative: "Refactor the existing app toward each new business model.",
      why: "V1's data model was built around owning the transaction; v2's around a directory. Neither could honestly express what v3 needed, and migrating would have meant dragging dead assumptions into a new thesis. The cost was severe and I knew it: v1 was ~95% my own code, built with a team of twelve, and I re-implemented working features from zero — twice. What I bought was a schema that fit the actual business each time instead of a franken-model that fit none of them.",
    },
    {
      decision:
        "Give up owning checkout. V3 sends users to the seller's own shop, with affiliate links where they exist; Stripe bills subscriptions, not transactions.",
      alternative:
        "Keep the marketplace transaction I already had working in v1 — checkout, tax, shipping, the whole thing.",
      why: "Owning the transaction meant owning payments, fulfillment disputes, and seller onboarding, which is an operations company, and I was one person building a discovery product. The cost is the obvious one: I walked away from transaction revenue I'd already built the rails for, and repositioned around traffic I monetize far more weakly.",
    },
    {
      decision:
        "LLM enrichment for critical attributes, over keywords or manual curation.",
      alternative:
        "Keyword association off titles and descriptions (tried — see below), classical NLP, or curating by hand.",
      why: "The recommender and every filter depend on attributes like body fit being actually true, and keywords couldn't deliver that. Manual curation doesn't scale to a marketplace catalog when you're one person. The cost: ~$0.23 and several minutes of pipeline time per product across a large catalog, plus owning cost governance — budgets, token accounting, an admin kill switch — for a pipeline that spends real money unattended. The keyword signals survive only as demoted hints fed into the vision model.",
    },
  ],
  broke:
    "The original plan was that critical tags like gender fit would come from keyword association. It didn't work — titles and descriptions from independent sellers just don't encode it reliably, and a fashion recommender that can't tell mens from womens is broken in a way users feel immediately. That failure forced the entire enrichment pipeline: an ML system I never planned to build, existing because the metadata I inherited couldn't be trusted. The lesson stuck: in a catalog product, the data you ingest is the real bottleneck, and you can't keyword your way out of it.",
  outcome:
    "The numbers didn't work. After five years and three versions, the engagement and revenue didn't justify continuing, and in March 2026 I deprecated the product deliberately rather than letting it decay. What the project actually produced: three full builds of the same idea against a correcting business model, a trained personalization model, a production enrichment pipeline with real cost governance, and — the part I weigh most — the judgment to recognize a working system attached to a business that wasn't, and to stop.",
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
