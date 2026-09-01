import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

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
];

/** Reads one case's document off disk. Never bundled into the app. */
export function readCaseDocument(goldenCase: GoldenCase): string {
  return readFileSync(path.join(here, "documents", goldenCase.file), "utf8");
}
