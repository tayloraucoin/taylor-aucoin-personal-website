import type { CaseStudy } from "./types";

/**
 * All claims verified against the Conscious Connections repo's docs and
 * decision logs (docs/specs/conflict-resolution/, docs/architecture/,
 * docs/developer-guides/) as of 2026-08-17. Framing rule (CC-01 + about.ts
 * exclusion): this is a passion project built between client engagements —
 * lead with architecture and the AI system, never traction. No usage or
 * revenue claims.
 */
export const consciousConnections = {
  slug: "conscious-connections",
  title: "Conscious Connections",
  meta: "AI mediation · Safety systems",
  tagline:
    "A communication and coaching tool for couples, with AI-mediated conflict translation and a safety layer that screens for intimate-partner-violence signals. My own product, built between engagements.",
  metaDescription:
    "Founder build: an AI mediation tool for couples — a compress-then-reason AI pipeline, a parallel safety classifier, and deny-by-default Postgres RLS.",
  roleLabel: "Founder, Engineer",
  role: "Founder, engineer, designer",
  period: "2026 — present",
  engagementType: "Maps to · 0→1 Build",
  mediaPreview: true,
  stack: [
    "Next.js",
    "TypeScript",
    "Turborepo",
    "tRPC",
    "Zod",
    "Drizzle",
    "PostgreSQL",
    "Supabase",
    "Claude API",
    "Stripe",
    "Vercel",
  ],
  atAGlance: [
    {
      label: "Engagement",
      value: "My own product, built between client engagements",
    },
    {
      label: "Product",
      value:
        "A communication and coaching tool for couples: an AI coach that translates each partner's side of a conflict to the other",
    },
    {
      label: "AI system",
      value:
        "A compress-then-reason pipeline (Haiku distills, Sonnet coaches) with a safety classifier reading raw text in parallel",
    },
    {
      label: "Safety floor",
      value:
        "Queue-first screening for intimate-partner-violence signals: fail-open, tiered, and content-free by construction",
    },
    {
      label: "Data boundary",
      value:
        "Deny-by-default row-level security on every table, enforced per-request through a transaction-scoped bridge",
    },
    {
      label: "Method",
      value:
        "Solo, with a roster of thirty-plus role-prompted AI agents held to specs and append-only decision logs",
    },
  ],
  brief: {
    intro:
      "Conscious Connections is my own product: a communication and coaching tool for couples, where an AI coach translates each partner's side of a fight to the other. It's the thing I build between client engagements, and it's on this site for what it demonstrates: the architecture, the safety engineering, and the build method. Client work comes first; this is where the spare cycles go.",
    groups: [
      {
        header: "THE PRODUCT",
        bullets: [
          "Each partner privately brain-dumps their side of a conflict; the coach translates each side to the other — delivered as \"[Name] is saying…\", never in the AI's own voice",
          "The coach speaks at exactly three invoked moments — Get Perspective, I'm Stuck, and an explicit request. It never interjects on its own",
          "Deliberately a coaching tool, not therapy: it never diagnoses and never adjudicates who's right",
          "No streaks, no gamification, no engagement bait. The session itself is never paywalled; conversion happens in the calm",
        ],
      },
      {
        header: "THE DUTY OF CARE",
        bullets: [
          "The product reads two partners' raw accounts of a fight: some of the most vulnerable text a person will ever type into software",
          "It has to notice intimate-partner-violence and coercive-control signals in that text and respond correctly, without diagnosing and without ever locking up on a couple mid-crisis",
          "One person carries that floor alongside product, design, the AI pipeline, and billing, so the system is designed not to depend on me being careful",
        ],
      },
    ],
  },
  process: {
    intro:
      "First commit was May 2026. The build runs like a small team's, except the team is a roster of role-prompted AI agents and I'm the only human in it. Roughly in the order it went:",
    sections: [
      {
        header: "The operating system",
        intro: "Before the product could be deep, the method had to be.",
        bullets: [
          "Thirty-plus written roles across six departments (staff engineer, AI systems architect, QA, security, therapist-consultant, regulatory counsel), each with a defined lane, injected into the thread that needs it",
          "Work moves as slice specs: one ticket per agent thread, with acceptance criteria and a completion protocol",
          "Two append-only logs are part of the source of truth: every architectural choice and every deviation from spec, recorded with its date and its tradeoffs",
          "A written precedence hierarchy decides which document wins when docs disagree, so conflicting instructions get a defined answer instead of a silent coin flip",
          "Every schema migration is generated, then human-reviewed before apply; ninety-one so far",
        ],
      },
      {
        header: "Foundation",
        intro:
          "A Turborepo monorepo: two live Next.js apps, twelve shared packages, and a hard rule about what lives where.",
        bullets: [
          "Apps are composition only; capability lives in packages. The placement question is literally \"who imports this?\"",
          "One typed contract from schema to client: Drizzle → tRPC → TanStack Query, validated with the same Zod schemas on both sides",
          "Row-level security enabled deny-by-default on every table, with policy factories so each table's access intent is declared rather than improvised",
          "Every request runs through a transaction-scoped RLS bridge that sets the user's identity as Postgres session variables, so the database, not the service code, enforces who sees what",
          "A mobile-readiness watchlist binds current web work: ten standing rules that keep today's decisions from welding in tomorrow's mobile cost",
        ],
      },
      {
        header: "Onboarding and the living profile",
        intro:
          "A couple's first hour: a structured discovery interview that becomes a persistent relationship profile.",
        bullets: [
          "Two-partner onboarding on one shared device: a pass-the-device flow with per-member resume, so each partner answers privately",
          "The partner without an account yet is an \"empty seat\": a real database row with a first name and no login, claimed later from their own device",
          "Five discovery layers (strengths, story, patterns, attachment, values) on one headless form engine with autosave",
          "AI insight extraction turns the interview into structured insights the couple reviews together, with per-member approvals, versioning, and realtime sync",
          "Consent tiers on every insight are derived server-side from the insight's category; the model is structurally unable to set trust-gate levels",
        ],
      },
      {
        header: "The session engine",
        intro:
          "The core loop: a live conflict-resolution session between two partners, with the coach in the middle.",
        bullets: [
          "Brain-dumps stay private to their author; partners meet each other's content through the coach's translation, never the raw text",
          "Get Perspective streams the translation live; a resilience ladder retries silently, degrades from Sonnet to Haiku, and posts a durable fallback card. The degraded prompt still carries every guardrail",
          "Coach Privately is a walled channel: its context loader cannot see the partner's private material, because that material is absent by construction",
          "A pattern interrupt for when someone's stuck; requests that become tracked agreements; a mutual-consent close ceremony with a private per-person check-in",
          "Timeouts queue partner messages instead of dropping them, enforced on both the server read path and the realtime broadcast",
        ],
      },
      {
        header: "The safety floor",
        intro:
          "The system a solo builder can least afford to get wrong, so it's built so nothing can bypass it and no failure can disable it.",
        bullets: [
          "Every user-authored submission is queued durably for classification before the attempt: a crash re-scans rather than loses",
          "A dedicated classifier reads the raw text in parallel, never the compressed version and never as a side job of the coaching model",
          "Recall-biased by design: flagging hot-but-coachable anger is an accepted cost of not missing real abuse, and a suite of authored fixture cases holds that boundary through prompt changes",
          "Responses are tiered and private: resources and grounding language reach the person who needs them in a channel their partner cannot see, and the shared session is never visibly interrupted",
          "Flag records carry references, tiers, and categories (no text, no model narrative, no person-level labels), and no client-facing code path can read them",
        ],
      },
      {
        header: "Context economics",
        intro:
          "Long sessions broke the naive context pipeline. The fix is the most interesting AI engineering in the product.",
        bullets: [
          "The original background compression lane was quadratic: every new message re-compressed the entire transcript, roughly 560k compression tokens over a 300-message session",
          "Replaced with incremental checkpoints: append-only summaries over ~40-message spans, each message compressed exactly once",
          "A raw recent tail always arrives verbatim: the coaching grammar depends on someone's exact recent words, so the newest stretch is never paraphrased",
          "Checkpoints cover only shared-visibility messages, so the private-channel wall holds under summarization too",
          "Golden-set eval harnesses are written before their prompts and tracked as open gates until they run; until then a prompt's behavior counts as designed, not measured",
        ],
      },
    ],
  },
  decisions: [
    {
      chip: "SAFETY",
      decision:
        "The safety floor fails open, and nothing can bypass it. Every submission path routes through one classification module, and a dead classifier blocks nothing.",
      alternative:
        "Gate every message on a passing safety check — block-and-refer, the conservative-sounding default.",
      why: "Safety here is a floor, not a gate: the one thing this tool must never do is lock up on a couple mid-crisis. So classification dispatches after the message persists, queues durably so a crash re-scans rather than loses, and biases toward recall. Flagging ordinary hot anger is an accepted cost of not missing coercive control. The discipline is structural: the bypass invariant lives in one module, the flag table accepts only service-role access, and no failure anywhere in the AI stack can take the floor down with it.",
    },
    {
      chip: "PRIVACY",
      decision:
        "Privacy is enforced by structure, not instruction. Each AI touchpoint has its own context loader declaring exactly what it may see; the partner's private material is absent from the private coach's context, not filtered out of it.",
      alternative:
        "One shared context builder for every prompt, with prompt-level rules about what the model must not reveal.",
      why: "A prompt instruction is a request; an absent row is a fact. The design earned its keep when incremental summarization was proposed: one per-session summary would have quietly folded both partners' private brain-dumps into an artifact the private coach then reads — a privacy breach by summarization. Because the wall is structural, design review caught it before a line shipped, and checkpoints now cover only messages both partners have already seen. The cost: every touchpoint needs its own loader, and a prompt can't use what nobody thought to give it.",
    },
    {
      chip: "CONTEXT",
      decision:
        "Chunked, append-only transcript checkpoints with a raw recent tail: each message summarized exactly once, the newest words always delivered verbatim.",
      alternative:
        "Keep the simple version: re-compress the full transcript in the background, or maintain one rolling summary that re-summarizes itself.",
      why: "The simple version was quadratic (a 300-message session burned roughly 560k compression tokens re-summarizing text that was already summarized), and a rolling summary compounds its own lossiness with every pass. Append-only chunks put a floor under cost and a ceiling on prompt size even on the worst day. The tail is non-negotiable: the coaching style depends on a person's exact recent words, so the last stretch of conversation never arrives paraphrased.",
    },
    {
      chip: "DATA",
      decision:
        "Row-level security on every table, deny-by-default, enforced per-request through a transaction-scoped bridge that tells Postgres who is asking.",
      alternative:
        "Authorization in the service layer only — simpler, faster, and what most single-team codebases actually do.",
      why: "In this product a data leak between partners isn't a bug, it's a betrayal. And in an AI-assisted codebase the enforcement point can't be \"every generated query remembers to filter.\" The bridge sets the user's id and role as Postgres session variables inside a transaction, and per-table policy factories make each table's access intent a declared, reviewable artifact. Service-role paths exist, but they're explicit, and the most sensitive tables accept nothing else. The cost is ceremony on every query path, plus a bootstrap dance where a couple has to be created before its own policies would allow it.",
    },
    {
      chip: "TOOLING",
      decision:
        "The ORM is exact-pinned at the repo root, with its syntax contract written down as a locked document.",
      alternative: "Float on caret ranges like every other dependency.",
      why: "The codebase is built AI-assisted, and a pre-1.0 ORM drifting under a model that emits last year's syntax is a failure mode I'd already met. The pin plus a written syntax contract means every agent thread writes against one known API. The cost: upgrades are deliberate events with human review.",
    },
  ],
  built: {
    intro:
      "A relationship product's full surface, and the operating system that built it. Live in the codebase today:",
    cards: [
      {
        label: "ONBOARDING & LIVING PROFILE",
        body: "A five-layer discovery interview on a pass-the-device flow, AI insight extraction with collaborative review over realtime sync, and a persistent couple profile with server-derived consent tiers.",
      },
      {
        label: "SESSION ENGINE",
        body: "Private brain-dumps, streaming perspective translation, a walled private-coaching channel with threads and drafting tools, a pattern interrupt, requests that become tracked agreements, and a mutual-consent close ceremony.",
      },
      {
        label: "SAFETY FLOOR",
        body: "Queue-first classification of every submission's raw text, tiered private responses with region-appropriate crisis resources, and content-free flag records no client code path can read.",
      },
      {
        label: "AI PIPELINE",
        body: "Haiku-compress → Sonnet-reason model routing, incremental transcript checkpoints, per-touchpoint context loaders, a retry-and-degrade resilience ladder, prompt observability, and golden-set eval harnesses.",
      },
      {
        label: "PLATFORM",
        body: "A Turborepo with twelve shared packages, one typed contract from Drizzle schema to client, deny-by-default RLS with a per-request bridge, Supabase realtime sync, PWA web push, Stripe billing, an affiliate program, and an admin CMS.",
      },
      {
        label: "THE BUILD SYSTEM",
        body: "Thirty-plus role-prompted agents across six departments, slice specs with completion protocols, append-only decision and deviation logs, a documented precedence hierarchy, and human review on all ninety-one migrations.",
      },
    ],
  },
  broke: {
    intro:
      "A solo codebase doesn't get adversarial review for free, so the process manufactures it. These are the failures worth keeping, each caught by a layer built to catch it.",
    categories: [
      {
        chip: "QUADRATIC COMPRESSION",
        body: "The first background compression lane re-read and re-compressed the entire transcript on every message, and the reasoning prompt then received both the compressed context and the full raw transcript — compression was adding tokens instead of replacing any. Surfaced in a cost-and-latency review once long chat threads became normal; replaced with incremental checkpoints.",
      },
      {
        chip: "THE WALL, ALMOST",
        body: "The first checkpoint proposal summarized the whole session, which would have folded both partners' private brain-dumps into an artifact the private coach reads. A privacy breach by summarization, caught in design review before a line shipped. Checkpoints now cover only what both partners have already seen.",
      },
      {
        chip: "PROMPT VS SCHEMA",
        body: "The compression prompt's own binding law said never drop a need or a repair bid, and the output schema had no fields for either — the model produced them and validation threw them away. The quiet drift between prompt and contract that only a code-verified prompt inventory surfaces; found in exactly that audit, then reconciled.",
      },
    ],
    closing:
      "The staff-engineer review role earns its seat the same way: its pass over the private-threads slice found two blocking defects (a tab bounce that dropped someone into the wrong conversation, and a drawer-wide soft-lock), both fixed before the slice closed. The roster is where a solo builder's code review comes from.",
  },
  outcome: {
    intro:
      "What stands, a summer of spare cycles in: a beta-stage product whose safety and privacy architecture would be credible from a much larger team, and the operating system that made it possible from one chair. The marketing site is live; the toolkit is in beta ahead of launch.",
    bullets: [
      "The full toolkit arc — onboarding, living profile, session engine, safety floor, billing — built, reviewed, and logged",
      "A safety floor that fails open, stores no text, and can't be bypassed by construction",
      "Privacy enforced structurally at three layers: database RLS, per-touchpoint context loaders, and the private-channel wall",
      "Ninety-one human-reviewed migrations and two append-only decision logs: the codebase remembers why it's shaped this way",
      "The same build method I bring to client engagements, demonstrated at full depth on my own product",
    ],
  },
  media: [],
  links: [
    {
      label: "Site",
      href: "https://consciousconnections.app/",
      status: "live",
    },
  ],
} satisfies CaseStudy;
