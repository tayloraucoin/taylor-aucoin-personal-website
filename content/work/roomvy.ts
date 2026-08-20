import type { CaseStudy } from "./types";
import roomvy1 from "@/public/work/roomvy/roomvy-1.webp";
import roomvy2 from "@/public/work/roomvy/roomvy-2.webp";

export const roomvy = {
  slug: "roomvy",
  title: "Roomvy",
  meta: "Booking flow · Client app",
  tagline:
    "The entire client-facing booking frontend, built solo: an Airbnb-style room-block flow for conferences and tournaments, with zero issues reported in production.",
  metaDescription:
    "Senior frontend build: the participant-facing booking client for event room blocks. Map discovery, multi-room checkout, card holds. Shipped solo, zero issues.",
  roleLabel: "Senior Frontend Engineer",
  role: "Senior frontend engineer (Pathfinder Studios)",
  period: "2023",
  engagementType: "Maps to · Contract",
  stack: [
    "Next.js",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "Apollo GraphQL",
    "Valtio",
  ],
  atAGlance: [
    {
      label: "Engagement",
      value: "Senior frontend engineer at a small agency, brought in explicitly for velocity",
    },
    {
      label: "Starting point",
      value:
        "An existing codebase, conventions, and design language (none of them mine), and no QA function",
    },
    {
      label: "Delivered",
      value:
        "The full participant-facing booking client, built solo: discovery to checkout to post-booking",
    },
    {
      label: "Core system",
      value:
        "Event-scoped group booking — map discovery, multi-room checkout, hold blocks, self-service support",
    },
    {
      label: "Payment",
      value: "A two-phase commit against a custom card API, with no drop-in payment SDK",
    },
    {
      label: "Quality",
      value: "Zero issues reported against the application",
    },
  ],
  brief: {
    intro:
      "Roomvy rethinks event housing: the room blocks negotiated between event organizers, housing companies, and hotels, traditionally run on spreadsheets and lost email threads. I built the participant-facing side, the application where attendees of a tournament or conference actually book into an event's contracted inventory. The hard part wasn't the architecture; it was the entry.",
    groups: [
      {
        header: "EXISTING CONDITIONS",
        bullets: [
          "A small agency scraping the project together, with a disorganized team, no QA function, and no oversight",
          "The codebase, conventions, and design language already existed, and weren't mine",
          "A product with group DNA: attendees book by team, rooms come from contracted blocks tied to one event, and policies are contractual per hotel per event",
          "I was brought in for one thing: velocity",
        ],
      },
      {
        header: "THE ASK",
        bullets: [
          "Build the attendee-facing booking application end to end, solo",
          "Render the agency's design specs pixel-accurate, on their stack and their conventions",
          "Absorb their standards and ship autonomously — the oversight I'd normally expect didn't exist to be given",
          "Get the product across the finish line",
        ],
      },
    ],
  },
  process: {
    intro:
      "Dropped into someone else's project, the sequence was: absorb, then ship. Learn their conventions cold, take the design specs as law, and run the entire client — implementation, integration, and my own verification — as a one-person unit inside a team that couldn't provide the scaffolding.",
    sections: [
      {
        header: "Onboarding & absorption",
        intro: "The first job was becoming fluent in a codebase and design language I didn't write.",
        bullets: [
          "Learned the agency's existing conventions and patterns before contributing — including the ones I'd never have chosen",
          "Took the design specs as the contract: pixel-accurate execution, no reinterpretation",
          "Scoped my own work throughout — no PM, no tech lead, no ticket flow to inherit",
        ],
      },
      {
        header: "Discovery & search",
        intro:
          "Event-scoped from the first pixel: every session starts at an event URL and stays inside that event's inventory, branding, and policies.",
        bullets: [
          "Split-pane search: hotel list beside a live map, with a mobile toggle between them",
          "Filters for amenities and room types, with drive-time-to-venue sorting. For event travel, proximity matters as much as price",
          "Filter and sort implemented as a client-side engine over nightly inventory data",
          "Search state persisted across navigation, so filters survive the whole journey",
        ],
      },
      {
        header: "Group checkout",
        intro:
          "One page, not a wizard: team identity, guest details per room, payment, travel protection, and policy review in a single scroll with a sticky summary.",
        bullets: [
          "No cart and no login. The \"cart\" is a server-side draft reservation held by a cookie, so an anonymous attendee can leave and return without losing progress",
          "Live roster editing: adding or removing a room or guest fires real API mutations immediately, keeping the draft in sync with the backend as the form is filled",
          "Team, group, and location fields relabel themselves per event: one checkout that adapts its vocabulary to each event type",
          "Policy text authored with template placeholders and interpolated from contract data at render time — non-engineers keep it accurate without code changes",
          "Custom availability math layering hold blocks over contracted inventory",
        ],
      },
      {
        header: "Payments",
        intro: "A bespoke integration, not a drop-in.",
        bullets: [
          "Custom card-collection form with full validation, posting directly to an internal card API keyed by the reservation",
          "Two-phase commit: attach the payment method first, finalize the reservation second — card handling isolated from booking logic",
          "Submission gated twice: schema validation for the inputs, and a separate business-rule gate for whether the booking is allowed to submit at all",
        ],
      },
      {
        header: "Hold blocks",
        intro: "The parallel path that makes it group software: reserve the rooms before you know the roster.",
        bullets: [
          "A team lead holds inventory against an event and gets a shareable link with a countdown to release",
          "Teammates self-book into the hold through the same checkout",
          "A rooming-list view gives organizers the full picture — contacts, inventory, reservations",
        ],
      },
      {
        header: "Post-booking",
        intro: "Self-service support with no account required.",
        bullets: [
          "Cancel, modify dates and guests, or resend a confirmation — verified by email plus confirmation number",
          "FAQ and support contact flows built into the event shell",
        ],
      },
      {
        header: "Quality",
        intro: "With no QA function on the team, I was the QA function.",
        bullets: [
          "My own verification pass on everything before it left my hands, as the release gate",
          "Sole, clean accountability for the result",
        ],
      },
    ],
  },
  decisions: [
    {
      chip: "ONBOARDING & ABSORPTION",
      decision:
        "Adopt their conventions wholesale, including the ones I'd never have chosen.",
      alternative:
        "Do what a senior engineer dropped into a disorganized project usually does — push to restructure, impose better patterns, fix the organization around the code.",
      why: "I was hired to finish a project, not to reform an agency, and every convention argument would have cost days against the one thing I was actually there for. The cost was living inside patterns that weren't mine and leaving the disorganization standing behind me. Scope discipline is also knowing which job you were hired for.",
    },
    {
      chip: "GROUP CHECKOUT",
      decision:
        "Keep the draft on the server, and let the checkout edit it live. There is no cart — every roster change is a real mutation against a draft reservation the backend owns.",
      alternative:
        "A client-side cart submitted at the end — less chatty, simpler to build, and how most booking flows work.",
      why: "A multi-room group booking is too much entered progress to lose, and it's exactly the kind of state that drifts when the client owns it. With the server as the single owner of the draft, an anonymous user can close the tab and come back, and the UI can never disagree with the backend about what's being booked. The cost is a chattier interface, where every add and remove is a network call. I accepted that in exchange for state that can't drift.",
    },
    {
      chip: "QUALITY",
      decision: "Be my own QA function.",
      alternative:
        "Ship and let the client's review catch what it caught — the de facto standard on a team with no QA process.",
      why: "With no QA function, defects would surface in front of the agency's client instead of in front of me. So I paid the velocity tax myself: my own verification pass on everything before it left my hands, as the release gate. On a role justified by speed that cost is real — every hour QA-ing my own work was an hour not building. It bought sole, clean accountability for the result.",
    },
  ],
  built: {
    intro:
      "The full participant-facing booking application, built solo from the agency's design specs on their existing stack: implementation, GraphQL integration, and my own QA, end to end. The deliverables:",
    cards: [
      {
        label: "DISCOVERY & SEARCH",
        body: "Split-pane map and list search over event inventory, with amenity and room-type filters, drive-time-to-venue sorting, and persisted filter state.",
      },
      {
        label: "GROUP CHECKOUT",
        body: "A single-scroll, multi-room checkout with live roster editing against a server-side draft, event-adaptive team and group identity, and contract-driven policy content.",
      },
      {
        label: "PAYMENT INTEGRATION",
        body: "A custom card-collection form and two-phase commit against an internal card API: payment method attached first, reservation finalized second.",
      },
      {
        label: "HOLD BLOCKS",
        body: "Inventory holds before rosters exist: shareable countdown links, self-booking into the hold, and a rooming-list view for organizers.",
      },
      {
        label: "POST-BOOKING TOOLS",
        body: "Cancel, modify, and resend-confirmation flows verified by email and confirmation number. No account, no login.",
      },
      {
        label: "AVAILABILITY & PRICING",
        body: "Client-side availability math layering holds over contracted room blocks, with nightly sell-rate pricing and a travel-protection upsell.",
      },
    ],
  },
  outcome: {
    intro:
      "Delivered, with zero issues reported against the application. The engagement was structured for me to elevate into the tech-lead role on the next project; the agency's pipeline dried up before a next project existed, and the role ended there.",
    bullets: [
      "The complete booking client shipped solo — discovery, checkout, holds, and support",
      "Pixel-accurate to the design specs, on the agency's stack and conventions",
      "Zero reported defects, with self-managed QA as the only release gate",
      "A checkout architecture where the server owns the truth and the UI cannot drift",
    ],
  },
  // Unlabelled: two captures with a shared design credit need no cluster header.
  // Left full width rather than paired 2-up, which would put the identical
  // credit caption twice side by side.
  media: [
    {
      items: [
        {
          src: roomvy1,
          alt: "Roomvy participant booking flow — reservation interface",
          caption:
            "Design direction by Nick Kidd (Pathfinder Studios); I built the application.",
        },
        {
          src: roomvy2,
          alt: "Roomvy participant booking flow — event housing reservation",
          caption:
            "Design direction by Nick Kidd (Pathfinder Studios); I built the application.",
        },
      ],
    },
  ],
} satisfies CaseStudy;
