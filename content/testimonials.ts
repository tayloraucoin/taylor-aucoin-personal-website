/**
 * Testimonials (TST-01) — shared by the home strip, the services proof strip,
 * and /testimonials. Source: LinkedIn recommendations, text VERBATIM.
 *
 * PUBLISH GATE: every entry ships `approved: false` until the person confirms
 * (PRE-01 asks are out). Components render pending entries only while
 * SHOW_PENDING_TESTIMONIALS is true in lib/config.ts — that flag must be
 * false before deploy (QA-08). Flip `approved` per person as replies land,
 * and replace wording with whatever they revised.
 *
 * `quote` is the extracted lead — it must be a CONTIGUOUS verbatim span of
 * `full`. No splicing sentences together that the person didn't write.
 */

import { SHOW_PENDING_TESTIMONIALS } from "@/lib/config";

export type TestimonialRelationship = "worked-for" | "led";

export type Testimonial = {
  slug: string;
  name: string;
  /** Current title · company, from their LinkedIn header. */
  title: string;
  /** Tab assignment: people Taylor worked for vs engineers Taylor led. */
  relationship: TestimonialRelationship;
  /** Mono context line, e.g. "Managed Taylor directly · October 2025". */
  relationshipLine: string;
  /** Extracted lead quote — contiguous verbatim span of `full`. */
  quote: string;
  /** Full recommendation, verbatim, split into paragraphs. */
  full: string[];
  /** The work it connects to. Case-study route where one exists. */
  project?: { label: string; href?: string };
  /** Avatar image path in `public/`. Absent → initials placeholder renders. */
  avatar?: string;
  /** For reports: what they worked on under Taylor. */
  workedOn?: string;
  /** True only after the person explicitly confirms publication. */
  approved: boolean;
};

/** What renders: approved always; pending only while the preview flag is on. */
export const visibleTestimonials = () =>
  testimonials.filter(
    (t) => t.approved || SHOW_PENDING_TESTIMONIALS,
  );

export const testimonials: Testimonial[] = [
  {
    slug: "dawson-whitfield",
    name: "Dawson Whitfield",
    title: "Co-founder of Looka · Founder, Everbook",
    relationship: "worked-for",
    relationshipLine: "Managed Taylor directly at Pine Studio · 2025",
    quote:
      "Taylor is a phenomenal engineer. During his time at Pine Studio, he took rough concepts and turned them into full products.",
    full: [
      "Taylor is a phenomenal engineer. During his time at Pine Studio, he took rough concepts and turned them into full products. He owned the project scope, technical architecture, and development through to launch. He was a pleasure to work with, always reliable, sharp, and dedicated to building great product. I highly recommend him.",
    ],
    project: { label: "Everbook", href: "/work/everbook" },
    approved: false,
  },
  {
    slug: "vaughn-richards",
    name: "Vaughn Richards",
    title: "Product development, engineering and IT, FYBR Inc.",
    relationship: "worked-for",
    relationshipLine: "Managed Taylor directly · September 2017",
    quote:
      "Adaptable and a quick study. Taylor came into our fast-paced and constantly changing environment and hit the ground running.",
    full: [
      "Adaptable and a quick study. Taylor came into our fast-paced and constantly changing environment and hit the ground running. He was responsible for all technical design and execution aspects of a software development project that I managed and completed it with aplomb. This project was wide, varied and changing and required a broad base of developer skills. Technical ability aside, his success and positive impact was due in large part to his adaptability, team mentality and ability (and desire) to learn quickly.",
      "He's an “ok” table tennis player too.",
      "Happy to provide a reference anytime.",
    ],
    project: { label: "FYBR · first development job" },
    approved: false,
  },
  {
    slug: "yogesh-verma",
    name: "Yogesh Verma",
    title: "Senior Software Engineer",
    relationship: "led",
    relationshipLine:
      "Reported to Taylor directly · BCIT ISSP, two terms · 2021",
    quote:
      "Taylor's ability to wear different hats (client, project manager and senior engineer) while excelling at each of them was remarkable.",
    full: [
      "Taylor is a detail-oriented and proficient engineer, with great potential for project management. I worked with Taylor for two terms as a part of BCIT's ISSP program. Taylor's ability to wear different hats (client, project manager and senior engineer) while excelling at each of them was remarkable.",
      "As a client: he provided a very in-depth explanation of the product's story and value proposition. His thorough research and vast market knowledge helped the team quickly understanding the product's impact.",
      "As a project manager: he ensured that the requirements were well-communicated before starting the development work. His ability to break down a complex task into small, well-elaborated action items is impeccable and a joy to work with.",
      "As a senior engineer: Taylor's well-informed opinions reduced confusion, helped accelerate the development process while ensuring the highest standards for the codebase. His code review suggestions helped in significantly improving my frontend skills, especially React, Redux and JavaScript.",
      "I believe Taylor will be a great addition to any team looking for a Senior Frontend Engineer, with an additional focus on project management.",
    ],
    project: { label: "Agora V1 · BCIT ISSP", href: "/work/agora" },
    workedOn: "Stripe checkout (v1) and analytics on Agora, under Taylor's specs and code review",
    approved: false,
  },
  {
    slug: "micheal-ozdoba",
    name: "Micheal Ozdoba",
    title: "Software Developer, SAP",
    relationship: "led",
    relationshipLine:
      "Reported to Taylor directly · BCIT ISSP, two terms · 2021",
    quote:
      "From the beginning, Taylor was someone you could count on to provide broad-level instruction at amazing depth.",
    full: [
      "I was able to work with Taylor for two terms as part of my BCIT ISSP program. Taylor acted as our technical client / senior developer. His efficiency and work-ethic left a lasting impression.",
      "Taylor's management ability and his dedication to efficiency is outstanding and impressive.",
      "There are many examples to draw from to credit Taylor's management ability. From the beginning, Taylor was someone you could count on to provide broad-level instruction at amazing depth. Taylor's JIRA ticket-management and feature elaborations provided immense detail for every development-task. Taylor's one-on-one's provided valuable mentorship advice & great resources for self-development. His time-tracking habits and general advice was beyond helpful. I was continually impressed with his ability to provide amazing guidance.",
      "Taylor's skillset is a great addition to any team looking for a senior engineer.",
    ],
    project: { label: "Agora V1 · BCIT ISSP", href: "/work/agora" },
    workedOn:
      "Cart and TaxJar tax integration on Agora, against Taylor's ticketed specs · one-on-one mentorship",
    approved: false,
  },
];
