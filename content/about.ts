/**
 * /about content (ABT-01). Assembled from Taylor's own answers — nothing
 * invented. Rewritten 2026-08 from Taylor's own draft, blended for register;
 * he gives it the read-aloud pass like everything else.
 *
 * Explicit exclusions (Taylor's call): no "constantly building new
 * businesses" framing — founder history reads as depth of ownership, never
 * as a parallel commitment. Hometown never named — "BC" only. Off-hours
 * list is exactly what he allowed.
 */

export const story: string[] = [
  "Some people ease into their life's work. Mine hit like lightning. I was on a semester off from a bio-medical degree when one question struck me — how would you build the perfect system? — and my mind went off to the races. For weeks I couldn't think about much else. I'd found a passion, and a capacity, I didn't know I had. Within a year I'd left the path to medicine to build software instead.",
  "That was over a decade ago. I trained in coding, UX design, and digital marketing, and I've been building ever since: for employers, for my own ventures, and for things I simply wanted to exist.",
  "I love the creative challenge — using what I'm good at to bring a project into the world. Zero-to-one is the work I've done my whole career, and now it's the work I sell.",
];

/** Mono metadata line under the About title. Chip-free by design: the quiet
 *  mono register is the house idiom for facts, and chips here mean stack tags. */
export const locationLine = "From BC · Vancouver for ten years";

/** Rendered in the hairline-row idiom (gold mono lead · body). */
export const howIThink: Array<{ lead: string; body: string }> = [
  {
    lead: "Systems, biologically",
    body: "Every part of a system has to be interconnected with intention. I think of code three-dimensionally — like a phylogenetic tree in how it executes and references, state and cached queries firing like synapses. Health is holistic: you watch the whole organism, not the one nerve. Bio-med trained the visualization; software is the same discipline on concrete, logical matter.",
  },
  {
    lead: "The weeds are the work",
    body: "Planning, organizing, architecting — designing a system or a feature from the data and design level up is where I lose track of time.",
  },
  {
    lead: "Builder's output",
    body: "The feedback I've gotten more than once: I perform much higher than I test. I'm a builder — hyperfocus, plus enough shipped products to know what matters and how to get it done.",
  },
];

/** "Off the clock" — two short paragraphs, replacing the old single-block
 *  Vancouver paragraph that read oddly wide on the page. */
export const offTheClock: string[] = [
  "I grew up next to a forest in BC; Vancouver has been home for ten years, with seasons spent somewhere tropical along the way — Mexico, Costa Rica, Thailand, Bali.",
  "Balance is what keeps the work good. For me that's time on the land, gatherings with conscious people, cooking colorful food, hard exercise, and learning from people further down the road than me.",
];

/** The sentence to remember. Near-verbatim from Taylor. */
export const closingLine =
  "I'm a systems designer, and I emotionally invest in the company's success. If I dedicate my energy to you, you get what my mind has to offer.";

/** Teaching's paragraph: the old Mentorship row's body, moved (D-SITE-67). */
export const teachingParagraph =
  "Five years and fourteen cohorts at BCIT — it started as a way to get velocity behind a project and became something I loved: a young team of scrappy engineers shipping real systems. AI has changed what juniors need, but the experience sharpened how I manage, and the relationships stay.";

export type ExperienceGroup =
  "Full-time" | "Contract and fractional" | "My own products" | "Programmes";

/**
 * The Experience rows (D-SITE-197): about-only roles and years, never read
 * from `content/work`. Years take an en dash. Brackets are Taylor's to fill.
 * `slug` links the row to its case study; `anchor` links to a section here.
 */
export type ExperienceEntry = {
  group: ExperienceGroup;
  name: string;
  role: string;
  years: string;
  slug?: string;
  anchor?: "teaching";
};

export const experience: ExperienceEntry[] = [
  {
    group: "Full-time",
    name: "Everbook",
    role: "Founding engineer, at Pine Studio",
    years: "2024 – 2025",
    slug: "everbook",
  },
  {
    group: "Full-time",
    name: "Roomvy",
    role: "Senior frontend engineer, at Pathfinder Studios",
    years: "2023",
    slug: "roomvy",
  },
  {
    group: "Full-time",
    name: "Calculate by QxMD",
    role: "Frontend software engineer, a WebMD/Medscape company",
    years: "2019 – 2021",
    slug: "calculate-qxmd",
  },
  {
    group: "Full-time",
    name: "FYBR Inc. [Taylor confirms]",
    role: "Developer, first development job",
    years: "2017",
  },
  {
    group: "Contract and fractional",
    name: "Future of Cities",
    role: "Fractional CTO",
    years: "2026",
    slug: "family-office-platform",
  },
  {
    group: "My own products",
    name: "Conscious Connections",
    role: "Founder, engineer, designer",
    years: "2026 – present",
    slug: "conscious-connections",
  },
  {
    group: "My own products",
    name: "Agora",
    role: "Founder, engineer",
    years: "2021 – 2026",
    slug: "agora",
  },
  {
    group: "Programmes",
    name: "BCIT ISSP",
    role: "Technical client and senior engineer, Agora's teams",
    years: "[years]",
    anchor: "teaching",
  },
  {
    group: "Programmes",
    name: "FLUI design hackathon",
    role: "[role, Taylor confirms]",
    years: "[year]",
  },
  {
    group: "Programmes",
    name: "League of Innovators",
    role: "[role, Taylor confirms]",
    years: "[year]",
  },
];

/** The teaching ledger, by programme. Counts are Taylor's to confirm. */
export const teachingCount = "[23] cohorts [Taylor confirms]";
export const teachingLedger: Array<{ name: string; line: string }> = [
  {
    name: "BCIT ISSP",
    line: "Industry Sponsored Student Projects · [n] cohorts",
  },
  { name: "VFS", line: "Vancouver Film School · [n] cohorts" },
  { name: "A design cohort", line: "[programme name] · [n] cohort" },
  { name: "Virtual interns", line: "[programme name] · [n] cohorts" },
];

export const education: Array<{ name: string; role: string; years: string }> = [
  {
    name: "Lighthouse Labs",
    role: "Web development [programme, Taylor confirms]",
    years: "2016",
  },
  { name: "[School]", role: "UX design", years: "[year]" },
  { name: "[School]", role: "Digital marketing", years: "[year]" },
  {
    name: "[University]",
    role: "Bio-medical degree, a semester off and then software",
    years: "[years]",
  },
];
