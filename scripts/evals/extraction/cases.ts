import type { ExtractionMode } from "@/server/services/extract";

/**
 * The golden set for "Sort this for me" (PORT-17).
 *
 * Written before the prompts, on purpose. The failure this feature has is not a
 * bad parse — a client sees those and fixes them — it is a **plausible
 * invention**: a co-founder who does not exist, a status the deck never gave, a
 * price nobody quoted, sitting in a field they skim past because it looks
 * right. Cases 3, 4, and 5 exist for that and nothing else.
 *
 * Every blob below is invented, and deliberately about nobody: no real client,
 * no real person, no real business. A plausible-looking fake of a real client
 * is the worse of the two failures (house law).
 */
export type ExtractionCase = {
  id: string;
  mode: ExtractionMode;
  what: string;
  blob: string;
  /** What a correct run looks like, graded mechanically where it can be. */
  expect: {
    /** Fewer than this many entries is correct for a wrong-shape paste. */
    maxEntries?: number;
    minEntries?: number;
    /** These enum fields must be blank — the text never states them. */
    blankFields?: string[];
    /** Every entry value must appear in the blob. Always true; stated for clarity. */
    grounded: true;
  };
};

const TEAM_PAGE = `
Our team

Dana Whitlow — Founder. Dana spent eleven years in regenerative agriculture
before starting this. She leads land acquisition.

Marek Oyelaran, Operations Lead. Marek runs the build programme and the
contractor relationships.

Priya Ellsworth is our community director.
`.trim();

const RATE_CARD = `
What I offer

Strategy intensive — one day, in person or remote. $4,500.
Includes a pre-read, the day itself, and a written summary within a week.

Monthly advisory. Two calls a month plus async. Pricing on request.

Keynote — 45 minutes, conference or internal offsite.
`.trim();

const DECK_PHASES = `
The property is a 40-hectare estate in the hills. We took possession in March
and restoration of the main house is underway.

Phase 1 residences: twelve units, planned for 2027.

We also intend to run a retreat programme once the main house is finished.
`.trim();

const SERVICE_LIST = `
Services

Panel upgrades — from $1,800. Usually a full day. Older homes with knob and
tube take longer.

EV charger installation, $900 flat, about three hours.

Emergency callouts.
`.trim();

const DECOY = `
Brightwater Logistics is a freight brokerage founded in 2011 in Memphis.
We move refrigerated goods across the southeast. Our founder, Cal Brightwater,
drove routes for fifteen years before starting the company.
`.trim();

const A_CV = `
Jordan Amaechi
Senior Producer

2019–now  Head of Production, Longacre Pictures
2015–2019 Line Producer, freelance
2012–2015 Production Coordinator, Vessel Media

Education: BFA, Film Production
`.trim();

export const GOLDEN_SET: readonly ExtractionCase[] = [
  {
    id: "people-rich",
    mode: "people",
    what: "A team page with three named people and real roles.",
    blob: TEAM_PAGE,
    expect: { minEntries: 3, grounded: true },
  },
  {
    id: "people-thin",
    mode: "people",
    what: "Two sentences naming one person.",
    blob: "We are a small studio. Dana Whitlow founded it in 2019.",
    expect: { maxEntries: 2, grounded: true },
  },
  {
    id: "people-wrong-shape",
    mode: "people",
    what: "A CV pasted into the people box — the thing the copy says not to do.",
    blob: A_CV,
    expect: { maxEntries: 2, grounded: true },
  },
  {
    id: "offerings-rate-card",
    mode: "offerings",
    what: "A rate card with two priced offers and one unpriced.",
    blob: RATE_CARD,
    expect: {
      minEntries: 2,
      // The keynote has no price and no posture; neither may be invented.
      blankFields: ["pricePosture"],
      grounded: true,
    },
  },
  {
    id: "pieces-deck",
    mode: "pieces",
    what: "Deck phases: one underway, one planned, one only intended.",
    blob: DECK_PHASES,
    expect: { minEntries: 2, grounded: true },
  },
  {
    id: "pieces-no-status",
    mode: "pieces",
    what: "A property described with no status language at all.",
    blob: "We are creating a sanctuary on a hillside estate with gardens, a sauna, and studios.",
    expect: { blankFields: ["status"], grounded: true },
  },
  {
    id: "services-list",
    mode: "services",
    what: "A trade's service list with prices and durations.",
    blob: SERVICE_LIST,
    expect: { minEntries: 2, grounded: true },
  },
  {
    id: "services-wrong-shape",
    mode: "services",
    what: "A team page pasted into the services box.",
    blob: TEAM_PAGE,
    expect: { maxEntries: 2, grounded: true },
  },
  {
    id: "decoy",
    mode: "pieces",
    what: "A document about an entirely different business. Entries are correct here; a human reading them catches it, which is what quoting buys.",
    blob: DECOY,
    expect: { grounded: true },
  },
  {
    id: "empty",
    mode: "people",
    what: "Whitespace only. Must spend no run.",
    blob: "   \n  ",
    expect: { maxEntries: 0, grounded: true },
  },
];
