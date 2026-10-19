import type { CaseStudy } from "@/content/work";

/**
 * The case study's States (case-study.md), seeded for `?state=` outside
 * production only (`readPageState`). Each key strips blocks from the study
 * on show; `no-testimonial`'s hiding happens in the page.
 */
export const CASE_STATES = [
  "no-ai",
  "bare",
  "no-artifacts",
  "no-gallery",
  "no-testimonial",
  "format-band",
  "format-rows",
  "format-gallery",
  "format-paired",
] as const;

export type CaseState = (typeof CASE_STATES)[number];

export function applyCaseState(
  c: CaseStudy,
  state: CaseState | "default",
): { study: CaseStudy; testimonial: boolean } {
  switch (state) {
    case "no-ai":
      return { study: { ...c, aiSat: undefined }, testimonial: true };
    case "no-testimonial":
      return { study: c, testimonial: false };
    // The gallery lives in What I built now, so no-gallery draws no-artifacts.
    case "no-artifacts":
    case "no-gallery":
      return { study: { ...c, media: [] }, testimonial: true };
    case "bare":
      return {
        study: { ...c, media: [], aiSat: undefined },
        testimonial: false,
      };
    // A format key draws the current study's What I built in that format.
    case "format-band":
      return { study: { ...c, builtFormat: "band" }, testimonial: true };
    case "format-rows":
      return { study: { ...c, builtFormat: "rows-after" }, testimonial: true };
    case "format-gallery":
      return { study: { ...c, builtFormat: "gallery" }, testimonial: true };
    case "format-paired":
      return { study: { ...c, builtFormat: "rows-paired" }, testimonial: true };
    default:
      return { study: c, testimonial: true };
  }
}
