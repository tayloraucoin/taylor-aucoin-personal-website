import type { StaticImageData } from "next/image";
import type { LabelledRow } from "@/content/websites";

/**
 * The coded track's case study slot. EMPTY ON PURPOSE, AND IT RENDERS NOTHING
 * TODAY.
 *
 * The page ships without a case study because the first client's site does not
 * exist yet. The structure is here so that filling it is a content edit rather
 * than a build, and so nobody reaches for a placeholder in the meantime. The
 * section either has its content or does not exist: no "coming soon", no
 * skeleton, no sample. That law is inherited from the platform page and it is
 * the reason an empty state on this site reads as hospitality rather than as an
 * apology.
 *
 * TWO GATES, and they are separate booleans because they are separate facts:
 * `published` is "the site exists and the client agreed we may show it", and
 * `liveUrl` is "there is a real address worth sending someone to". Modelling
 * them apart makes the dangerous state unrepresentable, because the link only
 * ever renders inside the published section.
 *
 * Every media field below is INDEPENDENTLY absent-able, same law as the
 * platform page's case study and the `/work` template. With no shots and no
 * testimonial, the prose carries the section unaided.
 *
 * TO PUBLISH: fill the fields, set `published: true`, and make sure
 * `testimonial` holds a real quote or stays null. The one testimonial on this
 * page is the only one on it, so it has to be genuine.
 */

export type Shot = {
  src: StaticImageData;
  alt: string;
  caption: string;
  device: "desktop" | "phone";
};

export type CodedCase = {
  /** Master gate. False until the client's site is live AND they have agreed. */
  published: boolean;
  /** Client or project name, as it should appear. */
  client: string;
  /** What they do, in one line. */
  what: string;
  /** The setup: what they had, what the build had to solve. */
  intro: string;
  /** What got built, as numbered rows. */
  built: LabelledRow[];
  /** Two or three lines on what changed. */
  outcome: string;
  /** Null until there is a real address. Never a staging link. */
  liveUrl: string | null;
  /** Null until a real human says a real thing. Never written on their behalf. */
  testimonial: { quote: string; attribution: string } | null;
  /** Empty until captures exist. Phones first: this audience is holding one. */
  shots: Shot[];
};

export const codedCase: CodedCase = {
  published: false,
  client: "",
  what: "",
  intro: "",
  built: [],
  outcome: "",
  liveUrl: null,
  testimonial: null,
  shots: [],
};
