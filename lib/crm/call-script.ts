/**
 * Personalizing the call sheet, without touching how it renders.
 *
 * `{{placeholder}}` tokens in `docs/crm/CALL-SHEET.md` get swapped for the
 * selected lead's real facts before the string ever reaches `Markup`
 * (CRM-17) — the renderer stays a dumb markdown display with no idea a lead
 * exists, and this stays a pure string transform with no idea how markdown
 * renders. Two small, separately correct pieces instead of one that has to
 * be both.
 *
 * The composed sentences live here, not as raw field interpolation in the
 * .md file, for one reason: some of them need a fact-dependent fallback
 * (no captured name, no review count yet), and a markdown file is the wrong
 * place to write that branch. `{{reviewLine}}` is a complete clause with its
 * own honest default; the .md file only ever sees finished English.
 */

export type ScriptFacts = {
  contactName: string | null;
  niche: string;
  city: string;
  rating: number | null;
  reviews: number | null;
};

function firstNameOf(contactName: string | null): string {
  return contactName?.trim().split(/\s+/)[0] ?? "";
}

/**
 * The reviews-and-rating flattery line, honestly scoped to what is actually
 * known.
 *
 * The illustrative draft this replaced said "that's better than anyone else
 * in Langley" — a fine line for one invented example, and a claim this
 * function must never assert about a real business it has no competitor data
 * for. Every lead on this list was sourced *because* it already has real
 * reviews (Drummer's ICP), so the fallback below stays true even when the
 * count itself is missing.
 */
function reviewLineFor(rating: number | null, reviews: number | null): string {
  if (reviews !== null && reviews > 0) {
    const stars = rating !== null ? ` at ${rating.toFixed(1)} stars` : "";
    return `You've got ${reviews} reviews${stars} — that's a real track record.`;
  }
  return "You've built a real reputation on Google already.";
}

export function applyScriptVariables(source: string, facts: ScriptFacts): string {
  const firstName = firstNameOf(facts.contactName);

  const variables: Record<string, string> = {
    greeting: firstName
      ? `Hey ${firstName} — it's Taylor.`
      : "Hey — it's Taylor.",
    // The one other bare-name reference in the sheet ("All the best, Mike").
    // Composed with its own leading comma so an unknown name degrades to
    // "All the best" rather than a dangling ", ".
    signoff: firstName ? `, ${firstName}` : "",
    niche: facts.niche,
    city: facts.city,
    reviewLine: reviewLineFor(facts.rating, facts.reviews),
  };

  let result = source;
  for (const [key, value] of Object.entries(variables)) {
    // A function replacer, not a string one: `String.replace`'s string form
    // treats `$&`, `$1`, etc. as special even outside a RegExp search, and a
    // business name pulled from Google Maps is exactly the kind of live data
    // that could contain a `$` and silently corrupt the output.
    result = result.replaceAll(`{{${key}}}`, () => value);
  }

  return result;
}
