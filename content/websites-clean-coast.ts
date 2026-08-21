import type { StaticImageData } from "next/image";
import type { LabelledRow } from "@/content/websites";

import desktopHome from "@/public/websites/clean-coast/desktop-home.jpg";
import desktopServices from "@/public/websites/clean-coast/desktop-services.jpg";
import mobileHome from "@/public/websites/clean-coast/mobile-home.jpg";
import mobileServices from "@/public/websites/clean-coast/mobile-services.jpg";

/**
 * Clean Coast Detailing — the case study on `/websites`.
 *
 * Its own file rather than a block inside `content/websites.ts`, because when
 * a second case study lands the page swaps one section for a two-up grid
 * (brief §6) and the shape below is what gets duplicated. One file per case is
 * the seam that makes that a copy rather than a refactor.
 *
 * TWO GATES, and they are separate booleans because they are separate facts.
 * See docs/websites/WEBSITES-PAGE-SPEC.md §8. Modelling them apart is what
 * makes the dangerous state — a live link to an unfixed site — unrepresentable,
 * since the link only renders inside the section.
 */

/**
 * A colour in the client's system, rendered as a swatch plus its hex as real
 * text beside it.
 *
 * `hex` is a hardcoded literal and that is correct here. DESIGN-SYSTEM.md's
 * "nothing hardcodes a hex" governs *this site's* theming; these are a client's
 * brand colours rendered as the subject of a case study. They are data, they
 * are quarantined in this file, and no component reads a theme colour from it.
 */
export type BrandColor = {
  name: string;
  hex: string;
  role: string;
};

export type ColorRamp = {
  name: string;
  /** 100 → 800, in order. The brand step is called out by `brandStep`. */
  steps: string[];
  /** Index into `steps` that is the brand colour. Ticked in gold. */
  brandStep: number;
};

/**
 * One capture in the gallery. Static imports, so Next reads the intrinsic
 * dimensions at build time and the layout box is reserved before the image
 * loads — CLS is structurally impossible. See the `next/image` + `width:auto`
 * trap in CLAUDE.md: every shot here is sized by its container with `w-full`,
 * never `w-auto`, which is the case that is immune to it.
 */
export type Shot = {
  src: StaticImageData;
  alt: string;
  caption: string;
  device: "desktop" | "phone";
};

export type CleanCoast = {
  /**
   * Gate 1 — does the section render at all.
   *
   * Still gated on Liam giving WRITTEN permission to use the build as a case
   * study. Ask for a testimonial in the same message, while he's happy: a real
   * quote from a real named client is the one testimonial on this page that
   * has to be genuine, and there is currently none.
   */
  published: boolean;
  business: string;
  what: string;
  /**
   * Gate 2 — does the live link render.
   *
   * The P0 items that kept this `null` are fixed: the fabricated testimonials
   * and their AI headshots are gone entirely, the phone number is real, and
   * the prices are the real ones. Verified against the live site 2026-08-19.
   *
   * Points at the custom domain. Until DNS lands, the build is also reachable
   * at clean-coast-detailing-y7rmr243.durable.site — do not publish that one,
   * a platform subdomain in a case study undercuts "you own your domain".
   */
  liveUrl: string | null;
  intro: string;
  brandColors: BrandColor[];
  ramps: ColorRamp[];
  rampNote: string;
  built: LabelledRow[];
  outcome: string;
  /** Optional enrichment. The section closes cleanly without any of it. */
  logo: string | null;
  shots: Shot[];
  /** `null` until Liam gives a real quote. Never fabricated, never placeholder. */
  testimonial: { quote: string; attribution: string } | null;
};

export const cleanCoast: CleanCoast = {
  published: true,
  liveUrl: "https://cleancoast.ca",

  business: "Clean Coast Detailing",
  what: "Fully mobile vehicle detailing, Metro Vancouver. Owner-operated, and the van brings its own water and power. That's the whole pitch, and it was nowhere online.",

  intro:
    "Liam had a logo, a phone full of before-and-afters, and no website. The two colours in that badge are the entire brand system below: pulled out, built into two eight-step ramps with a neutral scale and semantic states, paired with a type stack, and written up as a brand guide before a single page existed.",

  brandColors: [
    { name: "Coast Navy", hex: "#022A5B", role: "Primary · headers, buttons, headlines" },
    { name: "Wave Blue", hex: "#2396D7", role: "Accent · CTAs, links, highlights" },
    { name: "Salt White", hex: "#F8F8F8", role: "Canvas · matches the logo background" },
    { name: "Harbour Slate", hex: "#5B6B7C", role: "Neutral · secondary text, borders" },
  ],

  ramps: [
    {
      name: "Coast Navy",
      steps: [
        "#E6EEF7",
        "#C2D4E9",
        "#8FAFD3",
        "#4A6FA5",
        "#022A5B",
        "#02234C",
        "#011B3B",
        "#01122A",
      ],
      brandStep: 4,
    },
    {
      name: "Wave Blue",
      steps: [
        "#E5F3FB",
        "#BDE0F4",
        "#84C6EB",
        "#50ADE2",
        "#2396D7",
        "#1D7AAF",
        "#165F88",
        "#104360",
      ],
      brandStep: 4,
    },
  ],

  rampNote:
    "100 → 800. The brand colour sits at 500; everything above and below it is derived, so a hover state or a disabled control is a step on a scale rather than a fresh decision.",

  built: [
    {
      label: "Five pages",
      body: "Home, services and pricing, service area, about, contact. Each one written from his answers rather than dropped into a template.",
    },
    {
      label: "Prices published",
      body: "$149 interior, $149 exterior, $249 for both. People comparison-shop mobile detailing on their phone, and a hidden price is a closed tab.",
    },
    {
      label: "Built for the driveway",
      body: "Tap-to-call above the fold on every page, a booking button that follows you down the screen, and a contact form that lands in his inbox.",
    },
    {
      label: "Found locally",
      body: "Google Business Profile linked, and a service-area page written as much for Google as for a customer.",
    },
    {
      label: "A brand guide he owns",
      body: "The colour system, the type stack, the voice, and the do/don't list, handed over as a document.",
    },
    {
      label: "AI employees",
      body: "Role briefs built from the same answers, so his copywriter knows his prices and his service area without being told twice.",
    },
    {
      label: "A command centre",
      body: "One Notion document covering how to run every part of the site, how to use each AI role, and what extended help looks like.",
    },
  ],

  outcome:
    "Built in a day from the questionnaire and the brand guide. Liam owns the domain, the hosting account, and the guide.",

  logo: null,

  shots: [
    {
      src: mobileHome,
      alt: "Clean Coast Detailing home page on a phone: logo, Book now button, and the headline Detailing that comes to you.",
      caption: "Home · phone",
      device: "phone",
    },
    {
      src: mobileServices,
      alt: "Clean Coast Detailing services page on a phone, showing flat pricing.",
      caption: "Services · phone",
      device: "phone",
    },
    {
      src: desktopHome,
      alt: "Clean Coast Detailing home page on a desktop browser.",
      caption: "Home · desktop",
      device: "desktop",
    },
    {
      src: desktopServices,
      alt: "Clean Coast Detailing services and pricing page on a desktop browser.",
      caption: "Services and pricing · desktop",
      device: "desktop",
    },
  ],

  testimonial: null,
};
