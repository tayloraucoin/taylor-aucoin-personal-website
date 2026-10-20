import "server-only";
import type { BookInput, Outcome } from "@/lib/validators/book";

const FIT_BUDGETS: ReadonlySet<BookInput["budget"]> = new Set([
  "15k-75k",
  "over-75k",
  "salary",
]);
const FIT_STARTS: ReadonlySet<BookInput["start"]> = new Set([
  "this-month",
  "1-3-months",
]);

/**
 * The fit rule (D-SITE-166), on the server only: a website or brand always
 * goes to the note with its line to `/websites`; otherwise a budget of
 * $15K–$75K, over $75K or a full-time salary with a start this month or in
 * 1–3 months is a fit, whatever the role ("Not sure yet" included);
 * anything else goes to the note.
 */
export function fit(
  input: Pick<BookInput, "budget" | "start" | "role">,
): Outcome {
  if (input.role === "website-or-brand") return "website";
  return FIT_BUDGETS.has(input.budget) && FIT_STARTS.has(input.start)
    ? "fit"
    : "not_a_fit";
}
