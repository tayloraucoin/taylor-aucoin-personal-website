import type { CaseStudy } from "./types";

export const calculateQxmd = {
  slug: "calculate-qxmd",
  index: "06",
  title: "Calculate by QxMD",
  meta: "Healthtech · Clinical tools",
  tagline:
    "Clinical calculators used by physicians at the point of care, including the version embedded in Medscape.",
  roleLabel: "Frontend Engineer",
  role: "Frontend software engineer",
  period: "2019 — 2021",
  stack: [
    "React",
    "Next.js",
    "TypeScript",
    "Redux",
    "styled-components",
    "Cypress",
  ],
  constraint:
    "Calculate is a clinical calculator suite — risk scores, dosing, decision tools — used by physicians at the point of care. The formulas were authored and validated by doctors; my job was to guarantee the implementation matched them exactly, every time, because the gap between \"mostly correct\" and \"correct\" is a patient-care decision. The project was a ground-up rebuild of an aging web app into Next.js for one of the largest medical calculator services in the world, and the first deliverable raised the stakes: an embedded version running inside Medscape by WebMD — someone else's front door, in front of clinicians, where a shipped bug isn't quietly patched, it's a partner incident. And medical software doesn't get to choose its clients: it has to work on essentially every browser and device in the world, including the ancient ones in hospitals.",
  built: [
    "I owned the Calculate-next codebase: the rebuild of the legacy web app into a modern React/Next.js application, translating design specs into a pixel-accurate product while implementing the physician-authored calculation logic. The Medscape embed shipped first, carrying roughly half the calculator library into WebMD's clinical reference platform; the full application followed on qxmd.com.",
    'The engineering culture matched the domain. Every line of code was formally reviewed by a teammate — I built, he reviewed, nothing merged without consensus. On top of that I went past the required scope on testing: unit and integration tests across the calculation logic and reusable components, plus Cypress end-to-end coverage, because "works in the demo" isn\'t a standard you can accept for a medical calculator. Through launch I ran a tight loop with a dedicated QA agent, working through flagged issues across the long tail of browsers and devices until the compatibility matrix was actually clean, not just modern-browser clean.',
    "Around the core project: I maintained and extended the Learn frontend when I first joined, and after delivering Calculate I spent a month producing the formal rebuild blueprint for Read, QxMD's research-paper product, before leaving the company.",
  ],
  decisions: [
    {
      decision:
        "Test coverage far past what the project required — unit and integration tests across the calculators, plus end-to-end coverage, targeting all of them working all of the time.",
      alternative:
        "Standard coverage on the risky paths, and lean on the review process and QA cycle to catch the rest — the normal calculus for a frontend rebuild.",
      why: "These are medical calculators. A rendering bug is cosmetic; a calculation bug is a wrong number in front of a physician. The cost was real velocity — writing and maintaining that suite was a large share of the build — and I accepted it because the failure mode isn't a bug report, it's harm. It also meant the Medscape deliverable went out with confidence instead of hope.",
    },
    {
      decision:
        "Build to run on essentially every browser and device, including legacy ones long past what a 2020 product would normally support.",
      alternative:
        "A modern-browser baseline — the standard call that year, and the one that makes development dramatically easier.",
      why: "Clinical environments run old machines, and clinicians pull up a calculator on whatever device is in reach. Dropping legacy support would have been invisible in our analytics and very visible in a hospital. The cost: a constrained feature set, polyfills, and a QA matrix several times the size of the product's — device-by-device compatibility work most teams never see.",
    },
  ],
  outcome:
    "Zero bugs reported through either Medscape or production for my entire tenure, from launch through December 2021. The app ran live in clinical environments via qxmd.com and inside Medscape's reference platform. The company paid a discretionary bonus on delivery for pulling the project through — the kind of outcome measure you can't put in a dashboard, but it's the one I got.",
  media: [],
  links: [{ label: "Site", href: "https://qxmd.com/calculate" }],
} satisfies CaseStudy;
