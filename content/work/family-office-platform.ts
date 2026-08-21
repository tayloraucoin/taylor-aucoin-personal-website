import type { CaseStudy } from "./types";

export const familyOfficePlatform = {
  slug: "family-office-platform",
  title: "Multi-Entity Family Office Platform",
  meta: "Platform · CRM",
  tagline:
    "Unified five separately built business systems into one monorepo and database: an operational HQ with a custom CRM, plus the booking and sales engine for the group's retreat centre.",
  metaDescription:
    "Fractional CTO build: ten legacy databases across five business entities unified into one monorepo and one login. Five production apps in six weeks.",
  roleLabel: "Fractional CTO",
  role: "Fractional CTO",
  period: "2026",
  engagementType: "Fractional CTO engagement",
  stack: [
    "Next.js",
    "TypeScript",
    "Turborepo",
    "Prisma",
    "Supabase",
    "PostgreSQL",
    "Stripe",
    "Square",
    "Resend",
    "Vercel",
  ],
  atAGlance: [
    {
      label: "Engagement",
      value: "Six weeks active development, fractional CTO",
    },
    {
      label: "Starting point",
      value:
        "Ten disconnected legacy databases across five business entities",
    },
    {
      label: "Delivered",
      value:
        "Five production applications on one monorepo, one database, one login",
    },
    {
      label: "Core system",
      value:
        "Custom CRM replacing scattered spreadsheets and siloed tools",
    },
    {
      label: "Booking & subscription systems",
      value:
        "End-to-end booking and subscription payments for the retreat centre and the education platform, delivered to a fixed event deadline",
    },
    {
      label: "Handoff",
      value:
        "Operator documentation and AI-development governance for a non-engineering team",
    },
  ],
  brief: {
    intro:
      "The client was a family office operating five business entities — a retreat center, a foundation, an events operation, a personal brand, and the headquarters tying them together.",
    groups: [
      {
        header: "EXISTING CONDITIONS",
        bullets: [
          "Ten separate digital systems, each with its own database and no connection to the others",
          "The same person could book a retreat, join a membership, and sit in a deal pipeline as three unrelated records",
          "An internal build effort already underway and accumulating technical debt",
          "The team building on the platform after me would be largely non-engineers working through Claude Code",
        ],
      },
      {
        header: "THE ASK",
        bullets: [
          "Centralize the ecosystem into one shared database schema, with the infrastructure layer to make every entity interconnected",
          "Everything custom and owned — nothing rented from a SaaS vendor",
          "A platform that can keep building autonomously with AI, held to written conventions so future technical debt stays contained",
          "Bring the shared document system — years of Google Drive growth with no conventions — into proper order",
          "An active build window of six weeks against multiple large deliverables, including the legacy migrations, the booking engine, membership subscriptions, and the CRM",
        ],
      },
    ],
  },
  process: {
    intro:
      "I came in as an assessor before a builder, and the assessment produced the sequencing that shaped the whole engagement: data before features, foundations before debt cleanup, even knowing it meant weeks without visible progress.",
    sections: [
      {
        header: "Onboarding & scoping",
        intro:
          "The first job was evaluating the existing build and setting the order of work.",
        bullets: [
          "Audited the existing codebase and defined carry-forward criteria: what survived, what didn't",
          "Sequenced the engagement: unify the data first, features second, debt cleanup where it blocked the path",
          "Scoped and estimated Phase 1, with scope changes surfaced and agreed in writing as they happened",
        ],
      },
      {
        header: "Infrastructure",
        intro:
          "One platform for five entities, built to be operated by a team of one, or none.",
        bullets: [
          "Turborepo monorepo: one database, one login, one design system across every application",
          "Staging environments mirroring production across all five apps",
          "Deployed on Vercel with Supabase/PostgreSQL as the shared data layer",
        ],
      },
      {
        header: "Legacy migration & schema",
        intro:
          "The first two weeks were archaeological: extracting, cleaning, and reconciling ten legacy databases, each with its own idea of what a contact, a booking, or a deal was.",
        bullets: [
          "Unified data layer of 200+ Prisma models over Supabase/PostgreSQL",
          "Row-level security across 150+ tables",
          "Dedicated import system with verification and reconciliation pipelines so nothing was lost or duplicated",
          "Legacy systems kept running in the interim — migration without downtime",
        ],
      },
      {
        header: "Booking engine",
        intro:
          "The retreat center's booking and sales flow, built to let a contested processor decision be made with evidence.",
        bullets: [
          "Retreat booking and membership platform, end to end",
          "Booking flow complete on both Stripe and Square, switchable behind a toggle",
          "Advised the split: Stripe for bookings, the existing processor kept for on-site purchases",
        ],
      },
      {
        header: "Membership subscriptions",
        intro: "Added mid-engagement when scope expanded.",
        bullets: [
          "Membership portal with subscription billing",
          "Membership state unified with the same contact records as bookings and deals",
        ],
      },
      {
        header: "CRM",
        intro:
          "The operational core. The CRM was added mid-engagement with the delivery deadline already fixed — which left four very long days to build it, so that's what it took.",
        bullets: [
          "Contacts, companies, pipelines, and deal tracking across all five entities",
          "Gmail sync, automation triggers, and AI-drafted follow-ups",
          "Data import hub feeding the unified layer",
        ],
      },
      {
        header: "Notion migration",
        intro:
          "A side task that became a deliverable: the team's Google Drive had grown for years without conventions, and finding anything was tribal knowledge.",
        bullets: [
          "Advised and pitched the move to Notion as the operational workspace",
          "Designed the full folder schema and naming conventions from the actual contents of the Drive",
          "Wrote the migration SOP as a Claude-assisted workflow the team could run without me",
        ],
      },
      {
        header: "Handoff",
        intro:
          "The handoff was a product in itself, written for the non-technical staff running the systems daily.",
        bullets: [
          "Role-scoped SOPs, escalation matrices, and walkthrough videos, structured so any doc can be pasted into an AI assistant as source of truth",
          "Engineering conventions, schema standards, and contributor guides that keep Claude Code output on-architecture",
          "Full hours log and overrun presented to the client in writing at close",
        ],
      },
    ],
  },
  built: {
    intro:
      "Five production applications in a Turborepo monorepo, sharing one database, one login, and one design system — with staging environments mirroring production across all of them. The deliverables:",
    cards: [
      {
        label: "UNIFIED DATA LAYER",
        body: "200+ Prisma/Supabase models with row-level security across 150+ tables, and an import system with verification and reconciliation pipelines.",
      },
      {
        label: "OPERATIONS HUB & CRM",
        body: "Contacts, companies, pipelines, deal tracking, Gmail sync, automation triggers, AI-drafted follow-ups, and the data import hub. The core CRM was added mid-engagement against a deadline that didn't move, and built in four days.",
      },
      {
        label: "RETREAT BOOKING PLATFORM",
        body: "Booking and membership for the retreat center, with the full booking flow working on both Stripe and Square behind a toggle.",
      },
      {
        label: "MEMBERSHIP PORTALS",
        body: "Subscription billing on the shared contact records.",
      },
      {
        label: "NOTION WORKSPACE",
        body:
          "A designed folder schema, naming conventions, and a Claude-assisted migration SOP — moving the team from an unstructured Google Drive to Notion as the operational workspace.",
      },
      {
        label: "DOCUMENTATION SUITE",
        body: "Role-scoped SOPs, escalation matrices, walkthrough videos — plus conventions, schema standards, and contributor guides for AI-assisted development.",
      },
    ],
  },
  decisions: [
    {
      chip: "LEGACY MIGRATION & SCHEMA",
      decision:
        "Unify the data first, and let the technical debt stand. Two of six weeks went to migration and reconciliation before any visible feature shipped, and legacy code kept running in the interim.",
      alternative:
        "Rebuild app by app, migrating each one's data as I went — visible progress from week one — or start by cleaning up the debt I was brought in to address.",
      why: "With ten databases, every feature built before unification would have been built on a fragmented picture and rebuilt after. The debt was survivable; the fragmentation wasn't. The cost: a third of the engagement produced nothing a stakeholder could click, one application was still mid-migration at phase close, and I accepted shipping on top of imperfect legacy code rather than pausing to gut it.",
    },
    {
      chip: "BOOKING ENGINE",
      decision: "Build both payment processors, fully working, behind a toggle.",
      alternative:
        "Pick one and win the argument. The client wanted to stay on their existing processor for retreat bookings; my analysis said switch.",
      why: "I could have argued it in a memo, but the client deciding with evidence beats the client deferring to authority. So I built the booking flow complete on both Stripe and Square, toggleable, and advised the split I believed in: Stripe for bookings, the existing processor for on-site purchases. The cost is permanent — double the integration surface (two webhook systems, two catalog syncs), kept so a business decision could be made by demonstration.",
    },
    {
      chip: "HANDOFF",
      decision:
        "Govern AI-assisted development instead of gatekeeping it. The client's team members — non-engineers — keep building in the monorepo through Claude Code, contained by written conventions, schema standards, and implementation SOPs.",
      alternative: "Route all changes through an engineer, or hand off a frozen system.",
      why: "This client was never going to staff an engineering team, and a platform only an engineer can touch is a platform that stops evolving at handoff. So the deliverable included the guardrails themselves: conventions the AI is pointed at, standards that keep output on-architecture, docs written to be machine-readable context. The accepted risk is obvious — non-engineers shipping code, with process rather than personnel as the safety layer. I'd rather own that risk explicitly than pretend the client wouldn't do it anyway.",
    },
  ],
  broke: {
    intro:
      "Phase 1 closed at 224 logged hours against an original estimate of 122–196.",
    categories: [
      {
        chip: "PROJECT SCOPE",
        body: "The legacy migrations grew from shared work to entirely mine, and a membership platform was added mid-engagement.",
      },
      {
        chip: "ESTIMATION",
        body: "The estimate itself was also wrong, and that part is on me: I leaned on AI-assisted estimation when building the proposal and should have applied my own decade of experience on top of it. Software takes what it takes; the old rule of thumb (take your estimate and add a third) exists for a reason.",
      },
      {
        chip: "CLIENT COMMS",
        body: "I put the overrun and the full hours log in front of the client in writing at close.",
      },
    ],
    closing:
      "The lesson wasn't new, but it re-earned its place: the estimate is mine to own, especially when a machine helped me make it.",
  },
  outcome: {
    intro:
      "Six weeks of active development, concluded at Phase 1 delivery with a full handoff: the platform, the docs, and the governance for whoever builds next.",
    bullets: [
      "Ten legacy systems unified into one database",
      "Five production applications live on a shared platform",
      "One CRM replacing scattered spreadsheets and siloed tools",
      "A documentation suite that lets a non-technical team operate and extend the system",
    ],
  },
  media: [],
} satisfies CaseStudy;
