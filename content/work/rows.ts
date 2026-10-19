/**
 * Website and branding rows for `/work`, home's Websites and Branding tabs,
 * and `/websites`' examples. Product engineering rows come from the case
 * studies, so they are not repeated here.
 *
 * Copy is Taylor's: every bracketed or [draft] value is a placeholder he has
 * not written (D-SITE-185). Galleries hold only files on disk, so the boards
 * and sites without captures yet carry an empty array.
 */

import { cleanCoast } from "@/content/websites-clean-coast";
import type { MediaItem, WorkRow } from "./types";

const cleanCoastGallery: MediaItem[] = cleanCoast.shots.map((shot) => ({
  src: shot.src,
  alt: shot.alt,
  caption: shot.caption,
  size: shot.device === "phone" ? "narrow" : "full",
}));

export const workRows: WorkRow[] = [
  {
    id: "agora-kit",
    discipline: "branding",
    type: "business",
    title: "Agora",
    tagline: "[Taylor writes: one line on the kit]",
    role: "Brand kit and components",
    period: "[year]",
    sortDate: "2026-01",
    caseStudySlug: "agora",
    liveUrl: "https://agora.art",
    gallery: [],
    published: true,
    beats: {
      problem: "[Taylor writes: what the brand had to feel like]",
      decided: "[Taylor writes: the defining brand decision]",
      happened: "[Taylor writes: the kit, the components, where they are used]",
    },
  },
  {
    id: "conscious-connections-kit",
    discipline: "branding",
    type: "passion",
    title: "Conscious Connections",
    tagline: "[Taylor writes: one line on the kit]",
    role: "Brand kit and components",
    period: "[year]",
    sortDate: "2026-10",
    caseStudySlug: "conscious-connections",
    liveUrl: "https://consciousconnections.app/",
    gallery: [],
    published: true,
    beats: {
      problem: "[Taylor writes: what the brand had to feel like]",
      decided: "[Taylor writes: the defining brand decision]",
      happened: "[Taylor writes: the kit, the components, where they are used]",
    },
  },
  {
    id: "taylor-aucoin-kit",
    discipline: "branding",
    type: "own-brand",
    title: "Taylor Aucoin",
    tagline: "[Taylor writes: one line on the kit]",
    role: "Kit, tokens, components",
    period: "2026",
    sortDate: "2026-10",
    liveUrl: "https://tayloraucoin.com",
    gallery: [],
    published: true,
    beats: {
      problem:
        "[Draft] A site whose copy read machine-written, selling a positioning I had outgrown.",
      decided:
        "[Draft] Carbon carries everything and one accent is spent only on details.",
      happened:
        "[Draft] A kit, tokens and a component set in one Paper file, mirrored token for token in the site's code.",
    },
  },
  {
    id: "kryshan-randel",
    discipline: "websites",
    type: "client",
    title: "Kryshan Randel",
    tagline: "[Taylor writes: one line on the site]",
    role: "Coded website, brand kit",
    period: "[year]",
    sortDate: "2026-01",
    gallery: [],
    published: true,
    beats: {
      problem: "[Taylor writes: where the client started]",
      decided: "[Taylor writes: the one decision that shaped the site]",
      happened: "[Taylor writes: live, owned, and what changed for the client]",
    },
  },
  {
    id: "holistica",
    discipline: "websites",
    type: "client",
    title: "Holistica",
    tagline: "[Taylor writes: one line on the site]",
    role: "Coded website",
    period: "[year]",
    sortDate: "2026-01",
    gallery: [],
    published: false,
    beats: {
      problem: "[Taylor writes: where the client started]",
      decided: "[Taylor writes: the one decision that shaped the site]",
      happened:
        "[Lands when the site ships; until then this slot shows the next finished case]",
    },
  },
  {
    id: "clean-coast-detailing",
    discipline: "websites",
    type: "client",
    title: "Clean Coast Detailing",
    tagline: "[Taylor writes: one line on the site]",
    role: "Website and brand guide",
    period: "[year]",
    sortDate: "2026-01",
    liveUrl: cleanCoast.liveUrl ?? undefined,
    gallery: cleanCoastGallery,
    published: false,
    beats: {
      problem:
        "[Draft, from /websites copy] Fully mobile vehicle detailing with a logo, a phone full of before-and-afters, and no website.",
      decided:
        "[Draft, from /websites copy] The two colours in the badge became the whole brand system: two eight-step ramps, a neutral scale and a type stack, written up before a single page existed.",
      happened:
        "[Taylor writes: live date, what the owner can now change himself]",
    },
  },
];
