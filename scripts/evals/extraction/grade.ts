import type { ExtractionCase } from "./cases";

/**
 * The graders. Mechanical where they can be, silent where they cannot.
 *
 * Grounding is the one that matters and it is the one that is checkable: every
 * value an extraction returns must appear in the text it was given. A model
 * that paraphrases fails this, which is intended — the prompt tells it to
 * preserve wording, and a client's own words are the point.
 */

/** Normalised for comparison: case, whitespace, and smart punctuation. */
function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Whether a returned value is supported by the blob.
 *
 * Substring after normalisation. A model that reorders or compresses a phrase
 * fails, and should: the instruction is to copy, not to summarise.
 */
export function grounded(value: string, blob: string): boolean {
  const v = norm(value);
  if (!v) return true;
  return norm(blob).includes(v);
}

export type CaseResult = {
  id: string;
  entries: number;
  ungrounded: Array<{ field: string; value: string }>;
  wrongBlanks: string[];
  countOk: boolean;
};

export function grade(
  testCase: ExtractionCase,
  entries: Array<Record<string, string>>,
): CaseResult {
  const ungrounded: Array<{ field: string; value: string }> = [];
  for (const entry of entries) {
    for (const [field, value] of Object.entries(entry)) {
      if (typeof value !== "string" || !value.trim()) continue;
      if (!grounded(value, testCase.blob)) ungrounded.push({ field, value });
    }
  }

  const wrongBlanks = (testCase.expect.blankFields ?? []).filter((field) =>
    entries.some((entry) => (entry[field] ?? "").trim() !== ""),
  );

  const { minEntries, maxEntries } = testCase.expect;
  const countOk =
    (minEntries === undefined || entries.length >= minEntries) &&
    (maxEntries === undefined || entries.length <= maxEntries);

  return {
    id: testCase.id,
    entries: entries.length,
    ungrounded,
    wrongBlanks,
    countOk,
  };
}

/** Proves the graders catch what they claim to, without spending a run. */
export function selfTest(): string[] {
  const failures: string[] = [];
  const blob = "Dana Whitlow — Founder. She leads land acquisition.";

  if (!grounded("Dana Whitlow", blob)) failures.push("grounded() rejected a real quote");
  if (grounded("Marek Oyelaran", blob)) failures.push("grounded() accepted an invention");
  if (!grounded("", blob)) failures.push("grounded() rejected a blank");
  if (!grounded("dana  whitlow", blob)) failures.push("grounded() is not normalising");

  const fake: ExtractionCase = {
    id: "t", mode: "people", what: "t", blob,
    expect: { maxEntries: 1, blankFields: ["status"], grounded: true },
  };
  const r = grade(fake, [
    { name: "Dana Whitlow", role: "Chief Executive", status: "underway" },
    { name: "Someone Else" },
  ]);
  // Three: the invented title, the invented status, and the invented name.
  // `status` is counted twice over — once as ungrounded, once as a wrongly
  // filled blank — and both are true of it.
  if (r.ungrounded.length !== 3) {
    failures.push(`grade() found ${r.ungrounded.length} ungrounded values, expected 3`);
  }
  if (r.wrongBlanks.length !== 1) failures.push("grade() missed a wrongly-filled enum");
  if (r.countOk) failures.push("grade() missed an over-count");

  return failures;
}
