import type { CaseStudy } from "./types";

export const consciousConnections = {
  slug: "conscious-connections",
  index: "02",
  title: "Conscious Connections",
  meta: "AI · Next.js · Supabase",
  tagline:
    "A communication and coaching tool for couples, with AI-mediated conflict translation and a safety layer that screens for intimate-partner-violence signals.",
  roleLabel: "Founder, Engineer",
  role: "Founder, engineer, designer",
  period: "2026 — present",
  stack: ["Next.js", "TypeScript", "tRPC", "DrizzleORM", "Supabase", "Stripe"],
  constraint:
    "Conscious Connections is a communication and coaching tool for couples — deliberately not therapy, because I don't want the liability or the responsibility of clinical care. But that positioning doesn't remove the duty of care. It removes my tools for it. The product reads two partners' raw accounts of a fight, and it has to catch intimate-partner-violence and coercive-control signals in that text and route them correctly — without diagnosing, without adjudicating who's right, and without ever blocking the moment a couple is actually in. I'm one person carrying that safety floor alongside product, design, the AI pipeline, and billing. The safety layer is the one place a solo builder can't cut corners, so the whole system is designed around not letting me.",
  built: [
    "The first tool is Conflict Resolution. Each partner privately brain-dumps their side of a fight from their own device, and an AI coach translates each side to the other. It never speaks as itself, never diagnoses, and intervenes at only three explicit moments. The design is deliberately anti-dopamine: no streaks, no gamification, no dark patterns.",
    "What's running in the beta: two-partner onboarding with a five-layer discovery interview, AI insight extraction, and collaborative review over realtime sync; a persistent relationship profile with consent tiers; the full session engine — private brain-dumps, streaming perspective translation, private coaching, a pattern-interrupt for when someone's stuck, and requests that become tracked agreements; a safety classifier running in parallel on raw text with a tiered response protocol; plus billing, web-push, voice dictation, an affiliate system, and an admin CMS. The guardrails — translate, never ghostwrite; no diagnosis; mediation only — are enforced in code. The coaching content itself is still going through a relationship-science pass before launch.",
    "The part that doesn't show up in a screenshot is how it got built. I run the repo like a small team — except the team is a roster of role-prompted AI agents: an architect, a PM, a designer, a QA reviewer, a copywriter, each with a formal role prompt and a defined lane. I write one-ticket-per-agent-thread slice specs with a definition of done, the agents do most of the implementation in their lane, and I hold the architecture and review everything against append-only decision logs and a spec-precedence hierarchy so conflicting docs have a defined winner. That scaffolding — not typing speed — is what lets one person ship a product of this depth to a high standard.",
  ],
  decisions: [
    {
      decision: "Fail-open safety.",
      alternative:
        "Gate every message on a passing safety check (block-and-refer).",
      why: "Safety is a floor, not a gate — the tool should never lock up on a couple mid-crisis. The cost is false-negative risk in the window where the classifier is down. The classifier is also recall-biased: I accept flagging ordinary hot-but-coachable anger to avoid missing real abuse.",
    },
    {
      decision:
        "Profile data reaches the AI as per-prompt preparations, not a full-profile dump. Each prompt declares exactly which relationship-profile values it needs, and gets only those.",
      alternative:
        'One canonical profile context block injected into every prompt. Simpler, and every prompt automatically "knows everything."',
      why: "Every new prompt now requires an explicit decision about its data contract — that's real overhead, and if I don't think to give a prompt something, it doesn't have it. What I get back: each prompt receives exactly the information it needs and nothing else. No context bloat, no degraded outputs from irrelevant history, and a couple's private material never leaks into a prompt that has no business seeing it.",
    },
    {
      decision: "Drizzle over Prisma, exact-pinned at the repo root.",
      alternative: "Prisma, the default choice for this stack.",
      why: "tRPC plus Drizzle gives one typed contract from schema to client, which a future mobile app consumes for free. The pin exists because the codebase is built AI-assisted, and a pre-1.0 ORM drifting under an LLM that emits stale syntax was a real failure mode, not a hypothetical. The cost: I'm on a pre-1.0 ORM and can't casually bump it.",
    },
  ],
  outcome:
    "The marketing site is live; the toolkit is in closed beta, launching end of summer. From first commit to working beta in ~8 weeks. Revenue comes after launch — I'm one person, so I'm finishing the product before pushing anyone past the beta. That's not a philosophy, it's just proper product development. The build system above is what keeps it from owning my calendar.",
  media: [],
  links: [{ label: "Site", href: "https://consciousconnections.app/" }],
} satisfies CaseStudy;
