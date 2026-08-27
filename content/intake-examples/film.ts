import type { ExampleSite } from "./types";

/**
 * ⚠ STUB SET — NOT REAL SITES. Taylor curates and captures these.
 *
 * Six placeholders so the gallery, the favourites toggle, and the drag-rank
 * can be built and verified against a real list rather than a mock. Every
 * entry below is invented scaffolding: the names are not real studios, the
 * URLs go nowhere real, and the captures are generated placeholder frames.
 * **Nothing here may ship to a client.**
 *
 * Replacing this file is content work, not code work: keep the shape, swap the
 * contents. Nothing in the step reads anything but `ExampleSite`.
 *
 * Curation guidance (from the intake handoff, decision 7): 12–24 sites per
 * discipline, chosen to span axes deliberately — dark/light, video-first vs
 * grid-first, animated vs still, personality-forward vs work-only. The
 * favourites pattern only triangulates a style vector if the set actually
 * spreads across it; twenty beautiful dark sites teach us nothing except that
 * the person likes what we already showed them.
 *
 * Captures: the first is the site's opening view at a consistent aspect ratio
 * (16:10 recommended), then two or three more scrolling inside the card. Real
 * intrinsic pixel dimensions are required — see `types.ts`.
 */
export const FILM_EXAMPLES: readonly ExampleSite[] = [
  {
    key: "stub-film-1",
    name: "Placeholder — dark, video-first",
    url: "https://example.test/stub-film-1",
    captures: [
      {
        src: "/intake-examples/stub-1.svg",
        width: 1600,
        height: 1000,
        alt: "Placeholder capture for a stub example site",
      },
    ],
  },
  {
    key: "stub-film-2",
    name: "Placeholder — light, grid-first",
    url: "https://example.test/stub-film-2",
    captures: [
      {
        src: "/intake-examples/stub-2.svg",
        width: 1600,
        height: 1000,
        alt: "Placeholder capture for a stub example site",
      },
    ],
  },
  {
    key: "stub-film-3",
    name: "Placeholder — still, work-only",
    url: "https://example.test/stub-film-3",
    captures: [
      {
        src: "/intake-examples/stub-3.svg",
        width: 1600,
        height: 1000,
        alt: "Placeholder capture for a stub example site",
      },
    ],
  },
  {
    key: "stub-film-4",
    name: "Placeholder — animated, personality-forward",
    url: "https://example.test/stub-film-4",
    captures: [
      {
        src: "/intake-examples/stub-4.svg",
        width: 1600,
        height: 1000,
        alt: "Placeholder capture for a stub example site",
      },
    ],
  },
  {
    key: "stub-film-5",
    name: "Placeholder — dense, editorial",
    url: "https://example.test/stub-film-5",
    captures: [
      {
        src: "/intake-examples/stub-5.svg",
        width: 1600,
        height: 1000,
        alt: "Placeholder capture for a stub example site",
      },
    ],
  },
  {
    key: "stub-film-6",
    name: "Placeholder — sparse, one thing at a time",
    url: "https://example.test/stub-film-6",
    captures: [
      {
        src: "/intake-examples/stub-6.svg",
        width: 1600,
        height: 1000,
        alt: "Placeholder capture for a stub example site",
      },
    ],
  },
];
