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
import agoraColourRolesDark from "@/public/images/branding/agora-colour-roles-dark.webp";
import agoraComponentsDark from "@/public/images/branding/agora-components-dark.webp";
import agoraCoverDark from "@/public/images/branding/agora-cover-dark.webp";
import agoraCreatorPageDark from "@/public/images/branding/agora-creator-page-dark.webp";
import agoraLogoDark from "@/public/images/branding/agora-logo-dark.webp";
import agoraPalette from "@/public/images/branding/agora-palette.webp";
import agoraType from "@/public/images/branding/agora-type.webp";
import ccCover from "@/public/images/branding/conscious-connections-cover.webp";
import ccIcons from "@/public/images/branding/conscious-connections-icons.webp";
import ccLockup from "@/public/images/branding/conscious-connections-lockup.webp";
import ccPalette from "@/public/images/branding/conscious-connections-palette.webp";
import ccSessionRoom from "@/public/images/branding/conscious-connections-session-room.webp";
import ccType from "@/public/images/branding/conscious-connections-type.webp";
import taCover from "@/public/images/branding/taylor-aucoin-cover.webp";
import taLogo from "@/public/images/branding/taylor-aucoin-logo.webp";
import taPalette from "@/public/images/branding/taylor-aucoin-palette.webp";
import taShareImage from "@/public/images/branding/taylor-aucoin-share-image.webp";
import taThemes from "@/public/images/branding/taylor-aucoin-themes.webp";
import taType from "@/public/images/branding/taylor-aucoin-type.webp";
import krDesktopAbout from "@/public/images/websites/kryshan-randel/desktop-about.webp";
import krDesktopHome from "@/public/images/websites/kryshan-randel/desktop-home.webp";
import krDesktopFilm from "@/public/images/websites/kryshan-randel/desktop-just-watch-us.webp";
import krDesktopTeaching from "@/public/images/websites/kryshan-randel/desktop-teaching.webp";
import krDesktopWork from "@/public/images/websites/kryshan-randel/desktop-work.webp";
import krMobileHome from "@/public/images/websites/kryshan-randel/mobile-home.webp";
import krMobileWork from "@/public/images/websites/kryshan-randel/mobile-work.webp";
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
        src: agoraCoverDark,
        alt: "Agora brand kit cover on the dark plum ground: the AGORA wordmark in a gold-to-lilac gradient with two four-point stars, the line 'The art you wear matches the art you are.' and three pairings: embodied but not staged, kindred but not a clique, mythic but not make-believe.",
        caption: "Cover, dark, from the Paper file",
      },
      {
        src: agoraLogoDark,
        alt: "The wordmark on dark at two sizes, filled with the gold-to-plum gradient, beside the square O mark at 64 and 32 pixels.",
        caption: "Logo on dark, from the Paper file",
      },
      {
        src: agoraPalette,
        alt: "Four colour ramps from 50 to 900: plum, gold, a plum-grey neutral and red, each step with its hex and OKLCH values.",
        caption: "Palette, from the Paper file",
      },
      {
        src: agoraColourRolesDark,
        alt: "A table of colour roles on dark: background, primary in light plum, secondary in gold, accent, muted, destructive in red, card, sidebar, ring, input, border and five chart colours, each with what it is used for.",
        caption: "Colour roles on dark, from the Paper file",
      },
      {
        src: agoraType,
        alt: "The two typefaces, Instrument Sans for the interface and Brygada 1918 for display, then five styles from display to meta with sample lines.",
        caption: "Type, from the Paper file",
      },
      {
        src: agoraComponentsDark,
        alt: "Components on dark: five button styles in each state, inputs and a maker autocomplete, filter chips, badges, avatars, a card, a dialog, a toast, and a look card beside the app frame.",
        caption: "Components on dark, from the Paper file",
      },
      {
        src: agoraCreatorPageDark,
        alt: "A creator's page at desktop width on dark: her name and handle above a grid of nine look cards, each with a title and the makers it credits. The photos are placeholders.",
        caption: "A creator's page, dark, from the Paper file",
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
        src: ccCover,
        alt: "Conscious Connections brand identity cover: the headline 'Depth earns the play.' in cream and gold serif on a deep wine ground, with the heart-flame lockup above it.",
        caption: "Cover, from the Paper file",
      },
      {
        src: ccLockup,
        alt: "The lockup, Conscious and Connections in cream serif with the heart-flame mark between them, and the mark alone on a cream tile and a crimson tile.",
        caption: "Lockup and mark, from the Paper file",
      },
      {
        src: ccPalette,
        alt: "Six grounds side by side, from parchment and petal through ember and crimson to ink and glow, each with what it is used for and its contrast ratios, then three candidate reds and the crimson ramp.",
        caption: "Palette, from the Paper file",
      },
      {
        src: ccType,
        alt: "The line 'Your room is ready.' with ready in red italic, above EB Garamond and Source Sans 3 and a type scale from hero to small.",
        caption: "Type, from the Paper file",
      },
      {
        src: ccIcons,
        alt: "Twelve line icons in cream on dark, each with its name and use, and three shown at their real size beside text.",
        caption: "Icons, from the Paper file",
      },
      {
        src: ccSessionRoom,
        alt: "The session room at desktop width, light above dark: a private note, the coach's reply, both partners' messages, the reply field, and a side rail saying who sees what.",
        caption: "The session room, light and dark, from the Paper file",
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
    gallery: [
      {
        src: taCover,
        alt: "Brand kit cover on a near-black ground: the line 'The whole product, thought through.' above a short note on what the kit holds, then the pillars, the two directions and the status.",
        caption: "Cover, from the Paper file",
      },
      {
        src: taLogo,
        alt: "The Taylor Aucoin wordmark on dark and light, the TA monogram over a gold or patina rule in four tiles, clear space, minimum sizes, and four ways never to set the name.",
        caption: "Wordmark and monogram, from the Paper file",
      },
      {
        src: taPalette,
        alt: "Three ramps from 50 to 900, Carbon, Gold and Patina, each step with its hex and use, and Lamplight shown as a glow on dark and on light.",
        caption: "Palette, from the Paper file",
      },
      {
        src: taType,
        alt: "Three typefaces, Instrument Sans for titles, Albert Sans for body and Fragment Mono for code, then the type scale from display to code block.",
        caption: "Type, from the Paper file",
      },
      {
        src: taThemes,
        alt: "The two directions, gold and patina, each shown dark and light with a heading, buttons, a link and a card, above the colour tokens and six colour rules.",
        caption: "Two directions, dark and light, from the Paper file",
      },
      {
        src: taShareImage,
        alt: "The link preview image in both directions: the name and 'The whole product, thought through.' on a dark ground, with a gold or patina rule before 'Product engineer since 2016'.",
        caption: "Share image, from the Paper file",
      },
    ],
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
    liveUrl: "https://kryshanrandel.com/",
    gallery: [
      {
        src: krDesktopHome,
        alt: "Kryshan Randel's home page: the line 'I direct, shoot and edit stories that are hard to look away from' in white and red, five film stills as cards, and a link to all 24 pieces.",
        caption: "Home",
      },
      {
        src: krDesktopWork,
        alt: "The work page: 24 pieces as a grid of film stills, with filters for directing, camera, editing, behind the scenes and personal projects.",
        caption: "Work",
      },
      {
        src: krDesktopFilm,
        alt: "A single film's page: a behind-the-scenes still from Just Watch Us, filling the width with a play button.",
        caption: "A film's page",
      },
      {
        src: krDesktopTeaching,
        alt: "The teaching page: where he teaches, programs and camps, one-on-one coaching, and two photos with students.",
        caption: "Teaching",
      },
      {
        src: krDesktopAbout,
        alt: "The about page: his story in five paragraphs beside a photo of him setting up a shot on location.",
        caption: "About",
      },
      {
        src: krMobileHome,
        alt: "The home page on a phone, headline first and the film cards stacked below it.",
        caption: "Home, on a phone",
        size: "narrow",
      },
      {
        src: krMobileWork,
        alt: "The work page on a phone, the film cards in a single column.",
        caption: "Work, on a phone",
        size: "narrow",
      },
    ],
    example: {
      desktop: {
        src: krDesktopHome,
        alt: "Kryshan Randel's home page: the line 'I direct, shoot and edit stories that are hard to look away from' in white and red, five film stills as cards, and a link to all 24 pieces.",
      },
      phone: {
        src: krMobileHome,
        alt: "The home page on a phone, headline first and the film cards stacked below it.",
      },
    },
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
