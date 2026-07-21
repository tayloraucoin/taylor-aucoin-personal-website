import type { CaseStudy } from "./types";

export const roomvy = {
  slug: "roomvy",
  index: "04",
  title: "Roomvy",
  meta: "Event housing · Agency",
  role: "Senior frontend engineer (Pathfinder Studios)",
  period: "2023",
  stack: [
    "Next.js",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "Apollo GraphQL",
  ],
  constraint:
    "Roomvy rethinks event housing — the room blocks negotiated between event organizers, housing companies, and hotels, traditionally run on spreadsheets and lost email threads. I built the participant-facing side: the application where attendees actually book into an event's room block. The hard part wasn't the architecture — it was the entry. A small agency was scraping the project together and brought me in explicitly for velocity, to get the product across a finish line. The codebase, conventions, and design language already existed and weren't mine; the team was disorganized; there was no QA function and no oversight. The job was to be dropped in, absorb their standards, and ship — autonomously.",
  built: [
    "The full participant-facing booking application, built solo from the agency's design specs: event and reservation flows rendered pixel-accurate to the designs, on their existing stack and their conventions. I owned the repo end to end — implementation, integration against the GraphQL API, and my own QA, since nobody else was going to do it. Self-managed throughout: I scoped my own work, verified my own output, and delivered without needing the oversight the team didn't have to give.",
  ],
  decisions: [
    {
      decision:
        "Adopt their conventions wholesale, including the ones I'd never have chosen.",
      alternative:
        "Do what a senior engineer dropped into a disorganized project usually does — push to restructure, impose better patterns, fix the organization around the code.",
      why: "I was hired to finish a project, not to reform an agency, and every convention argument would have cost days against the one thing I was actually there for. The cost was living inside patterns that weren't mine and leaving the disorganization standing behind me. Scope discipline is also knowing which job you were hired for.",
    },
    {
      decision: "Be my own QA function.",
      alternative:
        "Ship and let the client's review catch what it caught — the de facto standard on a team with no QA process.",
      why: "With no QA function, defects would surface in front of the agency's client, not in front of me. So I paid the velocity tax myself: my own verification pass on everything before it left my hands, as the release gate. The cost is real on a role justified by speed — every hour QA-ing my own work was an hour not building. It bought sole, clean accountability for the result.",
    },
  ],
  outcome:
    "Delivered, with zero issues reported against the application. The engagement was structured for me to elevate into the tech-lead role on the next project; the agency's pipeline dried up before a next project existed, and the role ended there.",
  media: [
    {
      src: "/work/roomvy/roomvy-1.webp",
      alt: "Roomvy participant booking flow — reservation interface",
      caption:
        "Design direction by Nick Kidd (Pathfinder Studios); I built the application.",
    },
    {
      src: "/work/roomvy/roomvy-2.webp",
      alt: "Roomvy participant booking flow — event housing reservation",
      caption:
        "Design direction by Nick Kidd (Pathfinder Studios); I built the application.",
    },
  ],
} satisfies CaseStudy;
