import type { ShowcaseKind, VentureType } from "@/lib/intake/showcase-kinds";

/**
 * WEB-22's drawn states: step 8 with a box per page, as data.
 *
 * Read by the harness at `/test-harness/intake?state=<key>` (a 404 in
 * production) through `intake-fixtures.tsx`, which draws the site step alone
 * inside `StepShell`. Each state is the pages a client has ticked and typed,
 * and what they bought, because the boxes are computed from exactly those.
 *
 * Every value is invented (D-PORT-14).
 */

export const SITE_PAGES_STATE_KEYS = [
  "pages-home-only",
  "pages-some",
  "pages-typed",
  "pages-over",
  "pages-bought",
] as const;

export type SitePagesStateKey = (typeof SITE_PAGES_STATE_KEYS)[number];

export function isSitePagesStateKey(
  value: unknown,
): value is SitePagesStateKey {
  return SITE_PAGES_STATE_KEYS.includes(value as SitePagesStateKey);
}

export type SitePagesFixture = {
  kind: ShowcaseKind;
  ventureType: VentureType | null;
  /** The site step's answers, as the engagement would hold them. */
  site: Record<string, unknown>;
  /** Pages bought at checkout. */
  paidExtraPages: number;
};

/** Four checklist pages and three typed: seven against five included. */
const OVER_SITE = {
  pages: ["home", "team", "about", "vision"],
  pagesCustom: [
    "[Fixture: a page for the residency]",
    "[Fixture: volunteer days]",
    "[Fixture: a reading list]",
  ],
  homeBrainDump: "[Fixture: what leads the home page]",
  aboutBrainDump: "[Fixture: who is behind it]",
  pagesCustomBrainDump: ["[Fixture: what the residency page holds]"],
} as const;

const FIXTURES: Record<SitePagesStateKey, SitePagesFixture> = {
  // Home only: one box, the shortlist, no other page's box.
  "pages-home-only": {
    kind: "venture",
    ventureType: null,
    site: { pages: ["home"] },
    paidExtraPages: 0,
  },
  // Ticked out of order: the boxes follow the checklist, not the ticks.
  "pages-some": {
    kind: "venture",
    ventureType: null,
    site: {
      pages: ["home", "contact", "about", "team"],
      homeBrainDump: "[Fixture: what leads the home page]",
      teamBrainDump: "[Fixture: who is on the team page]",
    },
    paidExtraPages: 0,
  },
  // A place venture, so `offering` reads "The model", and two typed pages
  // with notes of their own.
  "pages-typed": {
    kind: "venture",
    ventureType: "place",
    site: {
      pages: ["home", "offering"],
      pagesCustom: [
        "[Fixture: a page for the residency]",
        "[Fixture: volunteer days]",
      ],
      pagesCustomBrainDump: [
        "[Fixture: what the residency page holds]",
        "[Fixture: what the volunteer page holds]",
      ],
    },
    paidExtraPages: 0,
  },
  // Seven pages, five included: five boxes and the extra pages question.
  "pages-over": {
    kind: "venture",
    ventureType: null,
    site: OVER_SITE,
    paidExtraPages: 0,
  },
  // The same seven, two bought at checkout: every page has a box.
  "pages-bought": {
    kind: "venture",
    ventureType: null,
    site: OVER_SITE,
    paidExtraPages: 2,
  },
};

export function sitePagesFixture(key: SitePagesStateKey): SitePagesFixture {
  return FIXTURES[key];
}
