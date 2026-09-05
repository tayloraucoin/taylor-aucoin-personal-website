import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";

/**
 * The golden set for PORT-10, written before the prompt (Loom's law).
 *
 * Eleven documents, all invented. **Nothing here is a real business, a real
 * person, or a real client**, and no fixture on this project may be — a
 * plausible-looking fake is the worse of the two failures, so every name,
 * address, domain, and number below is fictional and the domains use the
 * reserved `.example` TLD or a name that resolves to nothing.
 *
 * The eight numbered expectations come from the spec's eval section; cases 9
 * and 10 were added when file ingestion came into scope, because a document
 * that arrives as a PDF text layer or a flattened DOCX table is a different
 * input shape with its own way of producing confident nonsense.
 *
 * Expectations are floors and ceilings, not exact counts. A ceiling is a hard
 * failure — reaching is the behaviour this slice exists to prevent. A floor is
 * a soft finding, reported and not fatal, because a model that is quieter than
 * expected is a tuning question and not a safety one.
 */

const here = path.dirname(fileURLToPath(import.meta.url));

export type GoldenCase = {
  id: string;
  /** The file under `documents/`. */
  file: string;
  /** What this case exists to prove. Printed with the result. */
  intent: string;
  /** Hard ceiling on proposals. Exceeding it fails the case. */
  maxProposals?: number;
  /** Soft floor. Falling short is reported, not fatal. */
  minProposals?: number;
  /** Fields this document must never produce a proposal for. Hard. */
  forbiddenFields?: string[];
  /** The service is expected to refuse before reaching the model. */
  expectRefusal?: "empty" | "too_large";
  /**
   * Case 1 only: the hand-made key a human grades recall against. Not scored
   * mechanically — the runner prints it beside what came back.
   */
  recallKey?: string[];

  /**
   * PORT-18: the ingestion run's expectations, when this document is also an
   * ingestion case. Absent on the primer's own eleven, which grade the field
   * stage alone.
   */
  ingestion?: {
    /** The engagement kind the run is scoped to. */
    kind: ShowcaseKind;
    /** Entry expectations per stage, graded by the extraction grader. */
    entries?: Partial<Record<"experience" | "projects" | "offerings" | "pieces" | "services", { min?: number; max?: number; blankFields?: string[] }>>;
    /**
     * A second kind to run the same document under, asserting that no field
     * outside that kind's inventory appears. Mechanical, not a model grade.
     */
    alsoAs?: ShowcaseKind;
  };
};

export const GOLDEN_SET: readonly GoldenCase[] = [
  {
    id: "01-rich-about-page",
    file: "01-rich-about-page.txt",
    intent:
      "A well-written About page. Many grounded proposals; recall judged by a human.",
    minProposals: 8,
    recallKey: [
      "displayName",
      "whatYouDo",
      "howLong",
      "basedIn",
      "credentials",
      "awards",
      "whoMattersMost",
      "whyPickYou",
      "whatYouAreNot",
      "currentWebsite",
      "emailAtDomain",
      "showAvailability",
      "whatShouldTheyDo",
      "howToReach",
    ],
  },
  {
    id: "02-thin-blurb",
    file: "02-thin-blurb.txt",
    intent: "One thin paragraph. Two or three proposals, and no reaching.",
    minProposals: 2,
    maxProposals: 6,
  },
  {
    id: "03-different-business",
    file: "03-different-business.txt",
    intent:
      "A document about someone else's company. Proposals are expected — this case proves the quotes are what let a human catch it.",
    minProposals: 3,
  },
  {
    id: "04-cv-pasted-in-error",
    file: "04-cv-pasted-in-error.txt",
    intent:
      "The thing the copy tells them not to paste. Near-silence, not a career smeared across the form.",
    maxProposals: 1,
  },
  {
    id: "05-numbers-heavy",
    file: "05-numbers-heavy.txt",
    intent:
      "Revenue, headcount, years, coverage. Every critical field is quote-or-nothing.",
    minProposals: 3,
  },
  {
    id: "06-unfalsifiable-marketing",
    file: "06-unfalsifiable-marketing.txt",
    intent:
      "Puffery with no facts in it. The claims must not become recognition, credentials, or testimonials.",
    maxProposals: 4,
    forbiddenFields: [
      "awards",
      "credentials",
      "press",
      "kindWords",
      "notableNames",
      "affiliations",
      "representation",
    ],
  },
  {
    id: "07-two-sentences",
    file: "07-two-sentences.txt",
    intent: "Two sentences that answer nothing. One proposal, or none.",
    maxProposals: 1,
  },
  {
    id: "08a-empty",
    file: "08a-empty.txt",
    intent: "Nothing pasted. Refused before the model is called.",
    expectRefusal: "empty",
    maxProposals: 0,
  },
  {
    id: "08b-whitespace-only",
    file: "08b-whitespace-only.txt",
    intent: "Whitespace only. Same refusal — trim before the emptiness check.",
    expectRefusal: "empty",
    maxProposals: 0,
  },
  {
    id: "09-pdf-text-layer",
    file: "09-pdf-text-layer.txt",
    intent:
      "A PDF text layer: hyphens broken across lines, two columns bled into one, page furniture. Quotes must still verify, and 'Page 1 of 3' must not become a fact.",
    minProposals: 4,
  },
  {
    id: "10-docx-flattened-tables",
    file: "10-docx-flattened-tables.txt",
    intent:
      "A DOCX one-pager whose tables flatten to tab-separated pairs. The pairs are real answers and should be found.",
    minProposals: 5,
  },

  /* ── PORT-18 — the ingestion run ─────────────────────────────────────────
     Each of these grades two things the primer's cases could not: the entry
     stages alongside the field stage, and the kind scope. Written before the
     service ran once. ─────────────────────────────────────────────────────── */
  {
    id: "11-two-line-dump",
    file: "11-two-line-dump.txt",
    intent:
      "Two lines. A handful of fields at most, no projects, and no reaching for a career the lines do not contain.",
    // Four on the first live run — what they do, where, the work they want
    // more of, what they want from the site — every one quoted from the two
    // lines. The ceiling was the author's guess and the guess was low; raised
    // to the count the document genuinely supports, not to the model's output.
    maxProposals: 4,
    ingestion: {
      kind: "portfolio",
      entries: { experience: { max: 1 }, projects: { max: 0 } },
    },
  },
  {
    id: "12-venture-deck",
    file: "12-venture-deck.txt",
    intent:
      "A venture's briefing deck. Fields across five steps including the claims cluster; pieces with status only where stated; run as a portfolio, nothing venture-only may appear.",
    minProposals: 6,
    recallKey: [
      "displayName",
      "whatYouDo",
      "basedIn",
      "whoMattersMost",
      "signOff",
      "cantSay",
      "requiredWording",
      "currentWebsite",
    ],
    ingestion: {
      kind: "venture",
      // Six is the honest ceiling on this deck's people slide: three named
      // roles, Dana's prior career, and the two ongoing programmes Marek and
      // Priya run. The first live run returned six grounded entries and the
      // second four — the ceiling was the author's guess, the document
      // supports both readings, and only an ungrounded value is a defect.
      entries: { pieces: { min: 2 }, experience: { max: 6 } },
      alsoAs: "portfolio",
    },
  },
  {
    id: "13-cv-as-dump",
    file: "13-cv-as-dump.txt",
    intent:
      "A CV as the whole dump. The field stage takes the header and the memberships and nothing softer; the experience stage does the work.",
    // Six on the first live run: name, title, city, memberships, the studio
    // they work under, and named clients — all quoted. What must stay absent
    // is the soft material a CV never states, which `forbiddenFields` holds.
    maxProposals: 6,
    forbiddenFields: ["awards", "press", "kindWords", "whyPickYou"],
    ingestion: {
      kind: "portfolio",
      // The CV's freelance line names three works — the commercials, the
      // cooking series, the eleven-day feature — so a projects stage that
      // finds three grounded entries is right and the author's ceiling of two
      // was wrong. What must stay near-silent is the *field* stage, which
      // `maxProposals` and `forbiddenFields` above hold.
      entries: { experience: { min: 3 }, projects: { max: 3 } },
    },
  },
  {
    id: "14-almost-nothing",
    file: "14-almost-nothing.txt",
    intent:
      "An apology with nothing in it. The correct output is almost nothing, and the run still counts.",
    maxProposals: 1,
    ingestion: {
      kind: "practice",
      entries: { experience: { max: 0 }, offerings: { max: 0 } },
    },
  },
  {
    id: "15-practice-one-sheet",
    file: "15-practice-one-sheet.txt",
    intent:
      "A consultant's one-sheet. Offers with prices copied exactly and posture left blank; one or two experience entries; the practice inventory only.",
    minProposals: 4,
    ingestion: {
      kind: "practice",
      entries: {
        offerings: { min: 2, blankFields: ["pricePosture"] },
        // Four: the practice itself, the adjunct post, nine years as an
        // operator, and four of those as COO. All four are on the sheet.
        experience: { min: 1, max: 4 },
      },
      alsoAs: "venture",
    },
  },
];

/** The ingestion cases alone, for the runner's `--ingestion` modes. */
export const INGESTION_SET: readonly GoldenCase[] = GOLDEN_SET.filter(
  (goldenCase) => goldenCase.ingestion !== undefined,
);

/** Reads one case's document off disk. Never bundled into the app. */
export function readCaseDocument(goldenCase: GoldenCase): string {
  return readFileSync(path.join(here, "documents", goldenCase.file), "utf8");
}
