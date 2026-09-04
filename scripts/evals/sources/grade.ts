/**
 * The graders for the source-reading eval (PORT-21).
 *
 * One of these is the slice. `composedLines` is the mechanical form of the
 * guarantee this stage weakens: the ingestion run verifies a quote against the
 * text we hold, and for a transcribed file that text is a model's own output —
 * so a sentence invented here would be verified against itself later. This
 * grader is the only thing in the system that can catch that, because it is
 * the only place that knows what was really on the page.
 *
 * Recall is graded too, but it is the softer of the two: a transcription that
 * misses a line is a worse reading, while one that adds a line is a lie.
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
 * Lines the transcription is allowed to contain that were not on the page.
 *
 * The instruction asks for exactly three: a page marker, a bracketed note
 * about an image, and `[unreadable]`. Anything else that is not in the source
 * is composed, which is the failure.
 */
function isAllowedScaffold(line: string): boolean {
  const trimmed = line.trim();
  return (
    /^-{2,3}\s*(page|slide)\s+\d+\s*-{2,3}$/i.test(trimmed) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  );
}

/** The lines of the true text that the transcription did not reproduce. */
export function missingLines(
  truth: readonly string[],
  transcription: string,
): string[] {
  const haystack = norm(transcription);
  return truth.filter((line) => !haystack.includes(norm(line)));
}

/** Lines in the transcription that are not in the true text. The hard rule. */
export function composedLines(
  truth: readonly string[],
  transcription: string,
): string[] {
  const haystack = norm(truth.join("\n"));

  return transcription
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !isAllowedScaffold(line))
    .filter((line) => !haystack.includes(norm(line)));
}

/** Proves the graders catch what they claim to, with no model involved. */
export function selfTest(): string[] {
  const failures: string[] = [];
  const truth = ["Marrow & Vane", "A two-person brand studio in Halifax."];

  if (missingLines(truth, "Marrow & Vane\nA two-person brand studio in Halifax.").length !== 0) {
    failures.push("missingLines() reported a line that was present");
  }
  if (missingLines(truth, "Marrow & Vane").length !== 1) {
    failures.push("missingLines() missed an absent line");
  }
  if (composedLines(truth, "Marrow & Vane\n--- page 1 ---\n[photo of a shop]").length !== 0) {
    failures.push("composedLines() rejected the allowed scaffold");
  }
  const invented = composedLines(truth, "Marrow & Vane\nFounded in 1998 by two brothers.");
  if (invented.length !== 1) {
    failures.push(`composedLines() found ${invented.length} invented lines, expected 1`);
  }
  // Case and whitespace are normalised; word order is not.
  if (composedLines(truth, "MARROW  &  VANE").length !== 0) {
    failures.push("composedLines() is not normalising");
  }
  if (composedLines(truth, "Vane & Marrow").length !== 1) {
    failures.push("composedLines() accepted a reordering");
  }

  return failures;
}
