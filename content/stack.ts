/**
 * The full stack taxonomy, rendered at /stack (full page) and as the overlay
 * opened from the "Full stack →" link on the home page.
 *
 * The curated one-line version on the home page is CORE_STACK in `lib/config.ts`
 * — this file is the complete inventory. Items are Taylor's words; edit freely,
 * the layout adapts.
 */
/** Items flagged `core` render bold on /stack — they are the CORE_STACK curation. */
export type StackItem = string | { name: string; core: true };

export type StackCategory = {
  label: string;
  items: readonly StackItem[];
};

export const stack: readonly StackCategory[] = [
  {
    label: "Languages",
    items: [
      { name: "TypeScript", core: true },
      "JavaScript",
      "Python",
      "SQL",
      "HTML5",
      "CSS3",
      "Bash",
    ],
  },
  {
    label: "Frameworks & libraries",
    items: [
      { name: "React", core: true },
      { name: "Next.js", core: true },
      { name: "Node.js", core: true },
      "React Native",
      { name: "tRPC", core: true },
      { name: "Drizzle ORM", core: true },
      "Prisma",
      { name: "TanStack / React Query", core: true },
      { name: "Zustand", core: true },
      "Redux",
      "Apollo GraphQL",
      { name: "Zod", core: true },
      { name: "TailwindCSS", core: true },
      { name: "shadcn/ui (Radix)", core: true },
      "styled-components",
      "Material-UI",
      "FastAPI",
      "Puppeteer",
      "TensorFlow / Keras",
      "Mapbox GL",
    ],
  },
  {
    label: "Tooling",
    items: [
      { name: "Cursor", core: true },
      { name: "Claude Code", core: true },
      { name: "Turborepo", core: true },
      { name: "Git", core: true },
      { name: "Linear (project management)", core: true },
      {
        name: "agent-orchestrated development (role-prompted agents, slice specs, append-only decision logs)",
        core: true,
      },
      {
        name: "engineering conventions and schema standards as artifacts",
        core: true,
      },
      "Cypress",
      "Jest/Enzyme unit testing",
      "ClickUp",
      "Agile / sprint facilitation",
      "code review to consensus",
    ],
  },
  {
    label: "Databases & content",
    items: [
      { name: "PostgreSQL", core: true },
      { name: "Supabase", core: true },
      "pgvector",
      { name: "Prisma/Drizzle schema design", core: true },
      "Elasticsearch with business-signal reranking",
      {
        name: "Sanity (GROQ, Portable Text, custom Studio schemas)",
        core: true,
      },
      "S3 object storage",
      "migration and reconciliation pipelines across legacy systems",
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "Vercel", core: true },
      "AWS (S3, SQS, Lambda, EC2)",
      "NGINX",
      "staging environments mirroring production",
      "CI/CD",
      "monorepo architecture",
      "cost governance and budget instrumentation for unattended pipelines",
    ],
  },
  {
    label: "Commerce & integrations",
    items: [
      { name: "Stripe", core: true },
      "Stripe Connect",
      "Square",
      "subscription and multi-currency checkout",
      "TaxJar",
      "2Ship",
      "Canada Post and USPS",
      "Etsy API",
      "Shopify API and OAuth",
      "Lulu print API",
      { name: "Resend", core: true },
      "Gmail sync",
      "web push",
    ],
  },
  {
    label: "AI engineering",
    items: [
      { name: "Claude API", core: true },
      { name: "OpenAI API", core: true },
      { name: "OpenAI Realtime API", core: true },
      "Whisper",
      "custom Keras recommender",
      "multi-phase enrichment pipelines with schema-validated structured output",
      "safety classifiers with tiered response protocols",
    ],
  },
  {
    label: "AI concepts",
    items: [
      { name: "AI-assisted development governance", core: true },
      { name: "multi-agent workflows", core: true },
      "embeddings",
      "vector search",
      "semantic similarity",
      "cold-start personalization",
      "prompt caching",
      "per-prompt data contracts",
      "guardrails enforced in code",
      "fail-open safety design",
      "token accounting and per-run budgets",
      "job queues with phase checkpointing and backoff",
    ],
  },
] as const;
