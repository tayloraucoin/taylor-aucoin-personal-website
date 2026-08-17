import type { CaseStudy } from "./types";

export const calculateQxmd = {
  slug: "calculate-qxmd",
  title: "Calculate by QxMD",
  meta: "Healthtech · Clinical tools",
  tagline:
    "Clinical calculators used by physicians at the point of care, including the version embedded in Medscape.",
  metaDescription:
    "Frontend engineer at QxMD: rebuilt clinical calculators used by physicians at the point of care in Next.js, shipped inside Medscape. Zero production bugs.",
  roleLabel: "Frontend Software Engineer",
  role: "Frontend software engineer",
  period: "2019 — 2021",
  engagementType: "Maps to · Contract",
  stack: [
    "React",
    "Next.js",
    "TypeScript",
    "Redux",
    "styled-components",
    "Cypress",
  ],
  atAGlance: [
    {
      label: "Engagement",
      value:
        "Frontend software engineer at QxMD, a WebMD/Medscape company — two years, nine months",
    },
    {
      label: "Starting point",
      value:
        "One of the largest medical calculator services in the world, running on an aging legacy web app",
    },
    {
      label: "Delivered",
      value:
        "A ground-up Next.js rebuild — shipped first as an embed inside Medscape, then as the full application on qxmd.com",
    },
    {
      label: "Core system",
      value:
        "Physician-authored clinical calculators where the implementation must match the formula exactly, every time",
    },
    {
      label: "Compatibility",
      value:
        "Built for essentially every browser and device in the world — including the ancient ones in hospitals",
    },
    {
      label: "Quality",
      value:
        "Zero bugs reported through Medscape or production, from launch through the end of tenure",
    },
  ],
  brief: {
    intro:
      "Calculate is a clinical calculator suite — risk scores, dosing, decision tools — used by physicians at the point of care. The formulas were authored and validated by doctors; my job was to guarantee the implementation matched them exactly, every time, because the gap between \"mostly correct\" and \"correct\" is a patient-care decision.",
    groups: [
      {
        header: "EXISTING CONDITIONS",
        bullets: [
          "An aging legacy web app behind one of the largest medical calculator services in the world",
          "The first deliverable ran inside Medscape by WebMD — someone else's front door, in front of clinicians, where a shipped bug isn't quietly patched, it's a partner incident",
          "Medical software doesn't get to choose its clients: hospital environments run old machines, and clinicians reach for whatever device is closest",
          "Medscape's licensing on its existing third-party calculators was expiring — replacing them with an owned product was part of the value the acquisition was meant to unlock",
        ],
      },
      {
        header: "THE ASK",
        bullets: [
          "Rebuild the product ground-up into a modern React/Next.js application, pixel-accurate to the design specs",
          "Implement the physician-authored calculation logic exactly — no gap between formula and code",
          "Ship the Medscape embed first, then the full application",
          "Hold stability at a medical bar, not a web bar",
        ],
      },
    ],
  },
  process: {
    intro:
      "The engineering culture matched the domain: every line formally reviewed, testing far past requirement, and a compatibility bar most teams never see. The project's shape changed midway — and the sequence below is the build as it actually ran.",
    sections: [
      {
        header: "Onboarding & Learn",
        intro: "I joined onto QxMD's Learn product before Calculate existed as a project.",
        bullets: [
          "Owned and extended the Learn frontend — my proving ground in the codebase and the review culture",
          "Active in Agile sprints and design meetings from the start",
        ],
      },
      {
        header: "The rebuild",
        intro: "Calculate-next: the legacy app rebuilt from zero, to a pixel-accurate spec.",
        bullets: [
          "Translated design specifications into a pixel-perfect, functionally accurate product",
          "Reusable React components and utility modules, each carrying its own unit tests",
          "The physician-authored formulas implemented as the contract — the code's job was fidelity, not interpretation",
        ],
      },
      {
        header: "Testing strategy",
        intro: "Coverage far past what the project required, because the failure mode isn't a bug report.",
        bullets: [
          "Unit and integration tests across the calculation logic and shared components",
          "Cypress end-to-end coverage over the product's real flows",
          "The standard: all of the calculators working all of the time — \"works in the demo\" doesn't exist in medicine",
        ],
      },
      {
        header: "Compatibility",
        intro: "Built for the devices hospitals actually have, not the ones analytics dashboards show.",
        bullets: [
          "Legacy browser and device support long past a 2020 baseline — polyfills, constrained features, and device-by-device verification",
          "A tight loop with a dedicated QA agent through launch, working the flagged-issue list until the matrix was actually clean — not just modern-browser clean",
        ],
      },
      {
        header: "The Medscape embed",
        intro:
          "The first deliverable, carrying roughly half the calculator library into WebMD's clinical reference platform.",
        bullets: [
          "Shipped into a partner's platform, where stability is a contractual matter, not an internal one",
          "My teammate absorbed the integration into Medscape's legacy systems — the brutal half of the project — while I carried the build",
        ],
      },
      {
        header: "Review culture",
        intro: "Every line of code formally reviewed.",
        bullets: [
          "I built, he reviewed — nothing merged without consensus",
          "Two people, full coverage: one constructing, one interrogating",
        ],
      },
      {
        header: "After delivery: the Read blueprint",
        intro: "The last month before leaving.",
        bullets: [
          "A formal rebuild blueprint for Read, QxMD's research-paper product — reverse-engineered from a legacy PHP application originally contained in fewer than five files",
        ],
      },
    ],
  },
  decisions: [
    {
      chip: "TESTING STRATEGY",
      decision:
        "Test coverage far past what the project required — unit and integration tests across the calculators, plus end-to-end coverage, targeting all of them working all of the time.",
      alternative:
        "Standard coverage on the risky paths, and lean on the review process and QA cycle to catch the rest — the normal calculus for a frontend rebuild.",
      why: "These are medical calculators. A rendering bug is cosmetic; a calculation bug is a wrong number in front of a physician. The cost was real velocity — writing and maintaining that suite was a large share of the build — and I accepted it because the failure mode isn't a bug report, it's harm. It also meant the Medscape deliverable went out with confidence instead of hope.",
    },
    {
      chip: "COMPATIBILITY",
      decision:
        "Build to run on essentially every browser and device, including legacy ones long past what a 2020 product would normally support.",
      alternative:
        "A modern-browser baseline — the standard call that year, and the one that makes development dramatically easier.",
      why: "Clinical environments run old machines, and clinicians pull up a calculator on whatever device is in reach. Dropping legacy support would have been invisible in our analytics and very visible in a hospital. The cost: a constrained feature set, polyfills, and a QA matrix several times the size of the product's — device-by-device compatibility work most teams never see.",
    },
    {
      chip: "THE REBUILD",
      decision: "Take the whole build when the project inverted.",
      alternative:
        "Hold the planned split — two engineers sharing the application — while the Medscape integration consumed my teammate anyway.",
      why: "The integration into Medscape's legacy systems turned out to be its own brutal project, and it swallowed the engineer who was meant to co-build the app. Splitting his focus would have made both halves slow. So the roles inverted: he took the integration trench and became the reviewer; I built the application entire. The cost was concentration — every implementation risk landed on one person, with the review culture as the counterweight. What it bought was a coherent codebase from a single hand, delivered on time into a partner platform — and the company saved the licensing replacement it was counting on.",
    },
  ],
  built: {
    intro:
      "I owned the Calculate-next codebase end to end — the rebuild, the tests, the compatibility work, and the embed that carried it into Medscape. The deliverables:",
    cards: [
      {
        label: "CALCULATE-NEXT",
        body: "The ground-up React/Next.js rebuild of the legacy application — pixel-accurate to spec, with the physician-authored calculation logic implemented exactly.",
      },
      {
        label: "MEDSCAPE EMBED",
        body: "Roughly half the calculator library running live inside WebMD's clinical reference platform — the first deliverable, into someone else's front door.",
      },
      {
        label: "TEST SUITE",
        body: "Unit and integration tests across calculation logic and components, plus Cypress end-to-end coverage — the layer that made zero-defect delivery a system rather than a hope.",
      },
      {
        label: "COMPATIBILITY LAYER",
        body: "Legacy browser and device support with a QA-verified matrix — built for the hardware clinical environments actually run.",
      },
      {
        label: "COMPONENT LIBRARY",
        body: "Reusable React components and utility modules, unit-tested, carrying the design system through the whole product.",
      },
      {
        label: "THE READ BLUEPRINT",
        body: "A formal, month-long rebuild blueprint for QxMD's research-paper product — the architecture handed over before I left.",
      },
    ],
  },
  outcome: {
    intro:
      "Zero bugs reported through either Medscape or production for my entire tenure, from launch through December 2021. The app ran live in clinical environments via qxmd.com and inside Medscape's reference platform — and it retired an expiring dependency: Medscape had been licensing third-party calculators, and Calculate replaced them with a product the company owned. The company paid a discretionary bonus on delivery for pulling the project through — the kind of outcome measure you can't put in a dashboard, but it's the one I got.",
    bullets: [
      "Zero reported defects across both platforms, launch through December 2021",
      "Live at the point of care — qxmd.com and Medscape's reference platform",
      "Expiring third-party calculator licensing replaced with an owned product",
      "A formal rebuild blueprint for Read delivered before departure",
    ],
  },
  media: [],
  links: [{ label: "Site", href: "https://qxmd.com/calculate" }],
} satisfies CaseStudy;
