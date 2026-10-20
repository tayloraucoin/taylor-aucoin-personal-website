import type { Testimonial } from "@/content/testimonials";
import { FIXTURE_SENTINEL } from "@/lib/page-state";

/** About's States (about.md): `?state=` outside production only. */
export const ABOUT_STATES = ["pending-testimonial"] as const;

/**
 * The pending card's synthetic entry (D-SITE-12, D-SITE-199): never a real
 * person's words. A real unapproved entry never renders on /about.
 */
export const pendingFixture: Testimonial = {
  slug: "fixture-pending",
  name: "Alex Example",
  title: "Software Developer, Example Co.",
  relationship: "led",
  relationshipLine: "[Synthetic relationship line]",
  quote: "[Synthetic]",
  full: [
    "[Synthetic] A placeholder paragraph, so the pending card can be seen at real density.",
    "[Synthetic] A second placeholder paragraph.",
  ],
  project: {
    label: "[Synthetic project]",
    href: `https://${FIXTURE_SENTINEL}`,
  },
  approved: false,
};
