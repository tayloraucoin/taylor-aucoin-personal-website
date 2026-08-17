import type { CaseStudy } from "./types";

export const everbook = {
  slug: "everbook",
  title: "Everbook",
  meta: "Realtime voice AI · Print engine",
  tagline:
    "An AI voice interview that becomes a typeset, press-ready hardcover — the interview engine, print pipeline, and commerce platform behind it, built solo from first commit through a relaunch.",
  metaDescription:
    "Founding engineer build: an AI voice interview that becomes a press-ready hardcover. MVP in six months, then a relaunch adding realtime voice and commerce.",
  roleLabel: "Founding Engineer",
  role: "Founding engineer, CTO-track",
  period: "2024 — 2025",
  stack: [
    "Next.js",
    "TypeScript",
    "Prisma",
    "PostgreSQL",
    "Tailwind",
    "Stripe",
    "OpenAI Realtime",
    "Whisper",
    "Puppeteer",
    "S3",
    "Vercel",
    "Lulu",
  ],
  atAGlance: [
    {
      label: "Engagement",
      value:
        "Founding engineer, CTO-track — fourteen months from first commit to relaunch",
    },
    {
      label: "Starting point",
      value:
        "A greenfield concept: light product notes, a market reference, and no code",
    },
    {
      label: "Delivered",
      value:
        "MVP to production in six months, then a relaunch adding realtime AI voice interviews and full commerce",
    },
    {
      label: "Core system",
      value:
        "An AI interview that becomes a typeset, press-ready hardcover — voice to print, end to end",
    },
    {
      label: "Commerce",
      value: "Two checkout systems, three print providers, webhook-driven orders",
    },
    {
      label: "Stability",
      value:
        "A clean, stable schema and over 99% production stability across the engagement",
    },
  ],
  brief: {
    intro:
      "Everbook is an AI-assisted storytelling product that helps families capture and print their life stories — founded by the creator of Looka, with the conviction that AI could carry memoir creation from a spoken conversation all the way to a printed book. I was the first engineer hired to build it.",
    groups: [
      {
        header: "EXISTING CONDITIONS",
        bullets: [
          "A product vision living in light Notion descriptions, with an existing market product named as the reference point",
          "No codebase, no schema, no infrastructure — greenfield",
          "A solo build to start, with additional developers expected to join later",
          "A product whose output is physical: every software decision ends at a printing press",
        ],
      },
      {
        header: "THE ASK",
        bullets: [
          "Build the platform end to end — architecture, schema, and deployment pipelines included",
          "Get an MVP to production fast, then evolve it without destabilizing what shipped",
          "Put AI at the center: narrative intelligence, voice interviews, automated book design",
          "Operate with full ownership and minimal direction across every product layer",
        ],
      },
    ],
  },
  process: {
    intro:
      "I digested everything that existed, scoped the entire build upfront as an ordered plan, got it approved, and executed it linearly. It went to plan — the value of specifying before building is that the building becomes the easy part.",
    sections: [
      {
        header: "Onboarding & scoping",
        intro: "The first job was turning a vision into a sequence.",
        bullets: [
          "Digested the founder's product material and the reference product's full user journey",
          "Scoped everything that would be built, in order, and got the plan approved before writing code",
          "Executed the plan linearly — MVP first, relaunch systems second, each layer stable before the next",
        ],
      },
      {
        header: "Voice interview system",
        intro:
          "A live spoken conversation with an AI interviewer, recorded, transcribed, and turned into a story chapter.",
        bullets: [
          "Browser connects by WebRTC directly to OpenAI's Realtime API — the server only mints a short-lived, scoped credential",
          "Dual parallel recorders: a combined mix of the storyteller and the AI voice for playback, and an audio-only track chunked turn-by-turn into Whisper for transcription",
          "Voice-activity detection tuned with a deliberately long silence threshold, so reflective and elderly storytellers aren't cut off mid-thought",
          "The interview ends itself: when the AI judges the story arc complete it speaks a set phrase — the app detects it in the transcript, and a spoken \"yes\" advances the flow with no button press",
          "Persistent storyteller memories carried between sessions, so each interview knows the person it's talking to",
        ],
      },
      {
        header: "Book generation engine",
        intro:
          "The deepest system in the product: AI-generated text becomes perfectly typeset pages, measured — not estimated.",
        bullets: [
          "Content is rendered in a hidden iframe with the book's real fonts and measured element by element against true print dimensions — trim, bleed, gutter margins that widen with page count",
          "Paragraphs that overflow are split word by word against actual rendered layout, to the exact word where the page breaks",
          "Print conventions encoded as logic: chapters open on the right-hand page, chapter images sit on the left, blank pages inserted to keep the spread math true",
          "Two-pass table of contents — built rough to learn its own length, then rebuilt with final page numbers",
          "Editing one chapter re-paginates only that chapter, cascading downstream only when its page count changes",
        ],
      },
      {
        header: "Commerce & checkout",
        intro: "Two checkout systems over shared payment, tax, and shipping infrastructure.",
        bullets: [
          "Carts for both authenticated and anonymous buyers, reconciled on login",
          "A universal single-page checkout with Apple Pay and Google Pay, and a dedicated multi-step wizard for the Life Story product — gift flows included",
          "One server-side pricing orchestrator as the source of truth: cart, discounts, credits, and exact tax computed together, never trusted from the client",
          "The payment intent is patched live as address, shipping, and discounts change — totals update on screen without remounting the payment UI",
        ],
      },
      {
        header: "Print fulfillment",
        intro: "From confirmed order to a hardcover at the door, across three print providers.",
        bullets: [
          "Each page rendered to its own PDF by headless Chrome and merged — one page at a time, for reliability at scale",
          "Cover mathematics computed to the printer's spec: spine width from page count, board thickness, wrap area",
          "Every interior file validated with the printer before ordering, with the confirmed print SKU taken from the validator rather than assumed",
          "A cron pipeline that waits for every page to exist, pads short books to the binding minimum, submits the order, and retries instead of failing",
          "Provider webhooks, signature-verified, driving a distinct customer email at every lifecycle stage through to tracked shipping",
          "Shipping quotes fanned out across all three providers and normalized into one picker, cheapest option auto-selected",
        ],
      },
      {
        header: "Conventions & team growth",
        intro: "Built solo, documented for the team that followed.",
        bullets: [
          "Engineering conventions, API standards, and onboarding documentation authored as developers joined",
          "Code review process established — every merge reviewed against the conventions",
          "Schema kept clean and stable through the full arc from MVP to relaunch",
        ],
      },
    ],
  },
  decisions: [
    {
      chip: "COMMERCE",
      decision:
        "The webhook is the single writer of truth for orders. The checkout UI only gets Stripe to a confirmed payment — it never creates the order.",
      alternative:
        "Let the client create the order after payment confirms — simpler, faster to build, and how most first versions do it.",
      why: "A closed tab or a dropped connection mid-confirmation must never leave a customer charged with no order. So order creation lives in one server-side transaction, reconstructed entirely from payment metadata — users provisioned, projects activated, line items built, print jobs fired, receipt sent. The cost is a race the UI has to absorb: the success page can load before the order exists, so it polls, treating \"not found\" as \"not yet\" rather than as an error.",
    },
    {
      chip: "BOOK GENERATION",
      decision:
        "Measure with the browser instead of modelling the text. The pagination engine renders real content in real fonts and reads the layout — down to the word.",
      alternative:
        "Estimate text height with font metrics and formulas — the standard approach, and dramatically less machinery.",
      why: "The content is rich text: headers, inline images, bold, italic, strikethrough, lists, pull quotes — across multiple fonts, where every font changes the math, and where the browser preview and the print PDF follow different rules. A formula approximates; print does not forgive approximation. Trusting the browser's own layout engine as the measuring instrument made 100% correctness reachable — found edge case by edge case, until the math held everywhere. The cost is complexity and speed: an off-screen rendering pipeline where a formula would have been one function.",
    },
    {
      chip: "VOICE",
      decision:
        "Wire the browser straight to the model. The realtime voice session is a direct WebRTC connection from the client to OpenAI — the server never touches the audio.",
      alternative:
        "Proxy the audio through the application server — the comfortable pattern, with everything observable in one place.",
      why: "Conversation lives or dies on latency, and a relay adds a hop to every spoken turn. The server's only role is minting a short-lived credential scoped to the session; the audio flows peer to peer. The cost is that the hard problems move into the browser — mixed-stream recording, turn-by-turn transcription capture, and teardown across every device and browser quirk — running client-side against an API that had only just shipped.",
    },
  ],
  built: {
    intro:
      "One platform from first commit: an AI interview system, a typesetting engine, a commerce stack, and a print pipeline — with the conventions and documentation for the team that grew around it. The deliverables:",
    cards: [
      {
        label: "VOICE INTERVIEW ENGINE",
        body: "Realtime speech-to-speech interviews over direct WebRTC, with dual-stream recording, turn-by-turn transcription, tuned voice-activity detection, and cross-session storyteller memory.",
      },
      {
        label: "BOOK PAGINATION ENGINE",
        body: "Browser-measured typesetting to true print dimensions — word-level page breaks, verso/recto rules, gutter math by page count, and a two-pass table of contents.",
      },
      {
        label: "PRINT PIPELINE",
        body: "Per-page PDF rendering merged to press-ready files, cover and spine mathematics to printer spec, pre-flight validation, a retrying order pipeline, and lifecycle emails driven by signed webhooks.",
      },
      {
        label: "COMMERCE PLATFORM",
        body: "Dual carts, two checkout systems, express wallets, and a single server-side pricing orchestrator covering discounts, credits, and exact tax.",
      },
      {
        label: "FULFILLMENT & SHIPPING",
        body: "Three print providers normalized into one shipping experience — quotes fanned out in parallel, quirks handled per provider, cheapest option as the default.",
      },
      {
        label: "CONVENTIONS & DOCUMENTATION",
        body: "Engineering conventions, API standards, onboarding docs, and a review process — written as the team grew from one.",
      },
    ],
  },
  broke: {
    intro:
      "The systems that fought back were the ones touching the physical world and the browser's edges — and each one left permanent engineering behind it.",
    categories: [
      {
        chip: "BROWSER STATE",
        body: "Leaked microphone access and zombie audio contexts surfaced across browsers and devices — recordings that outlived their sessions. The answer was aggressive, paranoid teardown: every track stopped, every audio context force-closed and probed to verify it, every stray media element scrubbed. That code exists because the polite version failed in the field.",
      },
      {
        chip: "ORDER RACE",
        body: "Making the webhook the only writer of orders created a window where a paying customer lands on the success page before their order exists. The fix was to make waiting a designed state — polling that treats absence as pending, with staged progress messaging — instead of an error a customer ever sees.",
      },
      {
        chip: "PAGINATION EDGE CASES",
        body: "The page math did not arrive perfect. Fonts, markdown elements, and print-versus-preview differences produced a long tail of layout breaks — including a word overflowing a line by exactly the width of a trailing space. Each was found, reproduced, and closed until the engine held at 100%. Iterative, unglamorous, finished.",
      },
    ],
  },
  outcome: {
    intro:
      "Fourteen months from first commit: MVP to production in six, then a relaunch that made the product what it set out to be — a spoken conversation that arrives as a printed book. The role ended in October 2025 in a company-wide layoff following a strategic pivot to marketing operations.",
    bullets: [
      "Realtime AI voice interviews live in production, browser to model",
      "A typesetting engine at full correctness across fonts, elements, and print rules",
      "Two checkout systems and three print providers behind one commerce layer",
      "Over 99% production stability with negligible regressions",
      "Conventions and documentation that let the team scale beyond its first engineer",
    ],
  },
  media: [
    {
      src: "/work/everbook/everbook-ecom-home.png",
      alt: "Multi-category storefront home — memoir plus additional product lines",
    },
    {
      src: "/work/everbook/everbook-life-story-ecom.png",
      alt: "Life Story product page — desktop",
    },
    {
      src: "/work/everbook/everbook-life-story-ecom-cont.png",
      alt: "Life Story marketing page — storytelling mode selection",
    },
    {
      src: "/work/everbook/everbook-life-story-ecom-mobile.png",
      alt: "Life Story product page — mobile",
      size: "narrow",
    },
    {
      src: "/work/everbook/everbook-life-story-dashboard.png",
      alt: "Life Story author dashboard — prompts, stories, and book settings",
    },
    {
      src: "/work/everbook/everbook-life-story-cover-preview.png",
      alt: "Cover preview — spine width computed from page count",
    },
    {
      src: "/work/everbook/everbook-life-story-pages-preview.png",
      alt: "Paginated book preview — interior spread at print dimensions",
    },
    {
      src: "/work/everbook/everbook-life-story-interview-opening.png",
      alt: "Life Story interview — prompt screen with write, audio, video, and AI interview capture modes",
    },
  ],
  links: [
    { label: "Site", href: "https://www.everbook.com/" },
    { label: "Life story", href: "https://www.everbook.com/ca/product/life-story" },
  ],
} satisfies CaseStudy;
