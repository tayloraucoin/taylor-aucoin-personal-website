/**
 * Website and branding rows for `/work`, home's Websites and Branding tabs,
 * and `/websites`' examples. Product engineering rows come from the case
 * studies, so they are not repeated here.
 *
 * The placeholders were written in feedback round 1 (2026-10-19, D-SITE-185);
 * Taylor's own pass is still to come. Galleries hold only files on disk, so
 * the boards and sites without captures yet carry an empty array.
 */

import { cleanCoast } from "@/content/websites-clean-coast";
import agoraBrandCover from "@/public/images/branding/agora-brand-cover.jpg";
import agoraBrandLogo from "@/public/images/branding/agora-brand-logo.jpg";
import ccBrandCover from "@/public/images/branding/conscious-connections-brand-cover.jpg";
import ccBrandLockup from "@/public/images/branding/conscious-connections-brand-lockup.jpg";
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
    tagline:
      "The festival-fashion brand, rebuilt around one line: the art you wear matches the art you are.",
    role: "Brand kit and components",
    period: "2020–2026",
    sortDate: "2026-01",
    caseStudySlug: "agora",
    gallery: [
      {
        src: agoraBrandCover,
        alt: "Agora brand kit cover: the AGORA wordmark in plum on a pale ground with two four-point stars, the line 'The art you wear matches the art you are.' and three pairings: embodied but not staged, kindred but not a clique, mythic but not make-believe.",
        caption: "Brand kit cover, from the Paper file",
      },
      {
        src: agoraBrandLogo,
        alt: "Agora brand kit logo page: the wordmark and its variants on the light ground.",
        caption: "Logo, from the Paper file",
      },
    ],
    published: true,
    beats: {
      problem:
        "Agora's look had grown version by version for five years. The brand had to feel like the people who wear the art, and a little mythic.",
      decided:
        "Each pillar got a guard rail beside it, so mythic could never slide into make-believe.",
      happened:
        "The kit lives in Paper for now: the wordmark and its variants, the palette, type and components. The site hasn't moved to it yet.",
    },
  },
  {
    id: "conscious-connections-kit",
    discipline: "branding",
    type: "passion",
    title: "Conscious Connections",
    tagline:
      "Deep wine, cream and gold, held together by one line: depth earns the play.",
    role: "Brand kit and components",
    period: "2025–2026",
    sortDate: "2026-10",
    caseStudySlug: "conscious-connections",
    gallery: [
      {
        src: ccBrandCover,
        alt: "Conscious Connections brand identity cover: the headline 'Depth earns the play.' in cream and gold serif on a deep wine ground, with the heart-flame mark and the lockup above it.",
        caption: "Brand identity cover, from the Paper file",
      },
      {
        src: ccBrandLockup,
        alt: "Conscious Connections brand portfolio page on the lockup and the heart-flame mark.",
        caption: "Lockup and mark, from the Paper file",
      },
    ],
    published: true,
    beats: {
      problem:
        "Couples open it after a fight. The brand had to feel safe enough to be honest in and still leave room for some play.",
      decided:
        "Depth leads. The ground is a deep wine with cream and gold serif type, and the lighter moments come after it.",
      happened:
        "The identity, the lockup and the heart-flame mark live in Paper for now. The live marketing site came before them.",
    },
  },
  {
    id: "taylor-aucoin-kit",
    discipline: "branding",
    type: "own-brand",
    title: "Taylor Aucoin",
    tagline:
      "This site's own kit: Carbon, Gold, Patina and Lamplight, in one Paper file.",
    role: "Kit, tokens, components",
    period: "2026",
    sortDate: "2026-10",
    liveUrl: "https://tayloraucoin.com",
    gallery: [],
    published: true,
    beats: {
      problem:
        "A site whose copy read machine-written, selling a positioning I had outgrown.",
      decided:
        "Carbon carries everything and one accent is spent only on details.",
      happened:
        "A kit, tokens and a component set in one Paper file, mirrored token for token in the site's code.",
    },
  },
  {
    id: "kryshan-randel",
    discipline: "websites",
    type: "client",
    title: "Kryshan Randel",
    tagline:
      "A portfolio site and brand kit for a filmmaker who directs, shoots, edits and teaches.",
    role: "Coded website, brand kit",
    period: "2026",
    sortDate: "2026-01",
    gallery: [],
    published: true,
    beats: {
      problem:
        "A filmmaker with four kinds of work and no site of his own that showed them together.",
      decided:
        "Brand first. The full branding process ran before any page was built, so the site came out of his pillars.",
      happened:
        "Live in 2026, in real code he owns, with a guide for changing it himself.",
    },
  },
  {
    id: "holistica",
    discipline: "websites",
    type: "client",
    title: "Holistica",
    tagline: "A coded website for Phoenix, in the build now.",
    role: "Coded website",
    period: "2026",
    sortDate: "2026-01",
    gallery: [],
    published: false,
    beats: {
      problem: "Phoenix's site is still being built.",
      decided: "The story gets written once it's live.",
      happened: "Not live yet.",
    },
  },
  {
    id: "clean-coast-detailing",
    discipline: "websites",
    type: "client",
    title: "Clean Coast Detailing",
    tagline:
      "A site and brand guide for a mobile detailer who started with a logo and a phone full of photos.",
    role: "Website and brand guide",
    period: "2026",
    sortDate: "2026-01",
    liveUrl: cleanCoast.liveUrl ?? undefined,
    gallery: cleanCoastGallery,
    published: false,
    beats: {
      problem:
        "Fully mobile vehicle detailing with a logo, a phone full of before-and-afters, and no website.",
      decided:
        "The two colours in the badge became the whole brand system: two eight-step ramps, a neutral scale and a type stack, written up before a single page existed.",
      happened:
        "Live at cleancoast.ca, with a Notion guide that shows Liam how to run every part of it himself.",
    },
  },
];
