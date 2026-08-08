import type { CaseStudy } from "./types";

export const familyOfficePlatform = {
  slug: "family-office-platform",
  index: "01",
  title: "Multi-Entity Family Office Platform",
  meta: "Platform · CRM",
  tagline:
    "Unified five separately built business systems into one monorepo and database — an operational HQ with a custom CRM, plus the booking and sales engine for the group's retreat centre.",
  roleLabel: "Fractional CTO",
  role: "Fractional CTO (via Agora Network Technologies)",
  period: "2026",
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
  constraint:
    "The client was a family office operating five business entities — a retreat center, a foundation, an events operation, a personal brand, and the headquarters tying them together — across ten separate digital systems, each with its own database and no connection to the others. The same person could book a retreat, join a membership, and sit in a deal pipeline as three unrelated records. I was brought in to redirect an internal build effort that was accumulating technical debt, under a mandate that everything be custom and owned — nothing rented from a SaaS vendor. The compounding difficulty: the team building on this platform after me would be largely non-engineers working through Claude Code. Whatever I built had to survive its own owners' AI-assisted development. And the active build window was six weeks.",
  built: [
    "The first two weeks were archaeological: extracting, cleaning, and reconciling ten legacy databases — each with its own idea of what a contact, a booking, or a deal was — into one unified Prisma/Supabase data layer of 200+ models, with row-level security across 150+ tables and a dedicated import system with verification and reconciliation pipelines so nothing was lost or duplicated. Unifying the data came before fixing anything else; the technical debt in the legacy code was real, but none of it mattered more than getting every entity onto the same source of truth.",
    "On that foundation I shipped five production applications in a Turborepo monorepo, sharing one database, one login, and one design system: an internal operations hub with a full CRM — contacts, companies, pipelines, deal tracking, Gmail sync, automation triggers, AI-drafted follow-ups, and the data import hub — with the core CRM stood up in four very long days when scope expanded mid-engagement; a retreat booking and membership platform; a membership portal with subscription billing; a content-managed personal brand site; and an operations dashboard for the events business. Staging environments mirror production across all of them.",
    "The handoff was a product in itself: a full operator documentation suite — role-scoped SOPs, escalation matrices, walkthrough videos — written for the non-technical staff running the systems daily, deliberately structured so any doc can be pasted into an AI assistant as a source of truth. Alongside it, engineering conventions, schema standards, and contributor guides that let the client's team keep shipping through Claude Code inside the monorepo without architectural drift.",
  ],
  decisions: [
    {
      decision:
        "Unify the data first, and let the technical debt stand. Two of six weeks went to migration and reconciliation before any visible feature shipped, and legacy code kept running in the interim.",
      alternative:
        "Rebuild app by app, migrating each one's data as I went — visible progress from week one — or start by cleaning up the debt I was brought in to address.",
      why: "With ten databases, every feature built before unification would have been built on a fragmented picture and rebuilt after. The debt was survivable; the fragmentation wasn't. The cost was real: a third of the engagement produced nothing a stakeholder could click, one application was still mid-migration at phase close, and I accepted shipping on top of imperfect legacy code rather than pausing to gut it.",
    },
    {
      decision: "Build both payment processors, fully working, behind a toggle.",
      alternative:
        "Pick one and win the argument. The client wanted to stay on their existing processor for retreat bookings; my analysis said switch.",
      why: "I could have argued it in a memo, but the client deciding with evidence beats the client deferring to authority — so I built the booking flow complete on both Stripe and Square, toggleable, and advised the split I believed in: Stripe for bookings, their existing processor kept for on-site purchases. The cost is permanent: double the integration surface — two webhook systems, two catalog syncs — maintained so that a business decision could be made by demonstration instead of persuasion.",
    },
    {
      decision:
        "Govern AI-assisted development instead of gatekeeping it. The client's team members — non-engineers — keep building in the monorepo through Claude Code, contained by written conventions, schema standards, and implementation SOPs.",
      alternative: "Route all changes through an engineer, or hand off a frozen system.",
      why: "This client was never going to staff an engineering team, and a platform only an engineer can touch is a platform that stops evolving at handoff. So the deliverable included the guardrails themselves — conventions the AI is pointed at, standards that keep output on-architecture, docs written to be machine-readable context. The accepted risk is obvious: non-engineers shipping code, with process rather than personnel as the safety layer. I'd rather own that risk explicitly than pretend the client wouldn't do it anyway.",
    },
  ],
  broke:
    "Phase 1 closed at 224 logged hours against an original estimate of 122–196. Some of that was scope — the legacy migrations grew from shared work to entirely mine, and a membership platform was added mid-engagement — but the estimate itself was also wrong, and that part is on me: I leaned on AI-assisted estimation when building the proposal and should have applied my own decade of experience on top of it. Software takes what it takes; the industry rule of thumb — take your estimate and add a third — exists for a reason. I put the overrun and the full hours log in front of the client in writing at close. The lesson wasn't new, but it re-earned its place: the estimate is mine to own, especially when a machine helped me make it.",
  outcome:
    "Six weeks of active development: ten legacy systems unified into one database, five production applications live on a shared platform, one CRM replacing scattered spreadsheets and siloed tools, and a documentation suite that lets a non-technical team operate and extend the system. The engagement concluded at Phase 1 delivery with a full handoff — the platform, the docs, and the governance for whoever builds next.",
  media: [],
} satisfies CaseStudy;
