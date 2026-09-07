/**
 * How the coded track's catalogue rows depend on each other.
 *
 * Two relations, opposite directions, same kind of fact — one add-on's
 * presence changes what another add-on means:
 *
 *   `ADDON_BUNDLES`  A includes B, so buying A must not also bill B.
 *   `ADDON_REQUIRES` B is meaningless without A, so B is not offered until A.
 *
 * One add-on on the coded track is a dependency of another rather than a
 * choice beside it: the admin panel cannot work without a database, so buying
 * the admin panel buys the Supabase setup as part of it. That is a fact about
 * the catalogue, and it is read in two places that must never disagree —
 * the pay screen, which greys the included row out, and the checkout service,
 * which drops it from the basket before a Price is ever quoted.
 *
 * Second consumer, so it lives here rather than in either one (the codebase's
 * promotion rule). Platform-pure on purpose: no framework, no transport, no
 * database — it is a map of catalogue keys, and both a client component and a
 * server service import it unchanged.
 *
 * **The server is the guarantee; the screen is the courtesy.** The pay screen
 * un-ticks an included row so nobody is charged for something they are already
 * getting, but a hand-built POST does not go through the pay screen. The drop
 * in `createDepositCheckout` is the one that actually protects the client, and
 * it is deliberately not conditional on what the browser sent.
 */

/* ── A includes B ─────────────────────────────────────────────────────── */

/** Key → the add-on keys buying it already includes. */
export const ADDON_BUNDLES: Readonly<Record<string, readonly string[]>> = {
  // Ratified by Taylor, 2026-09-07. The admin panel writes to Supabase, so a
  // client buying the panel is buying the database it runs on; billing the
  // setup a second time beside it would be charging twice for one dependency.
  showcase_admin_panel: ["showcase_supabase_setup"],
} as const;

/**
 * Which selected add-on includes `key`, or null when nothing does.
 *
 * Returns the *including* key rather than a boolean because every caller needs
 * to say which one — the pay screen names it in the row's note, and a note
 * that said only "included" would leave the client hunting for what included it.
 */
export function includedBy(
  key: string,
  selected: Iterable<string>,
): string | null {
  const chosen = selected instanceof Set ? selected : new Set(selected);

  for (const [owner, included] of Object.entries(ADDON_BUNDLES)) {
    if (chosen.has(owner) && included.includes(key)) return owner;
  }

  return null;
}

/**
 * `selected`, minus every key another selected key already includes.
 *
 * Order-preserving and idempotent, so it is safe to run on the way into the
 * basket and again on the way to Stripe.
 */
export function withoutBundled(selected: readonly string[]): string[] {
  const chosen = new Set(selected);
  return selected.filter((key) => includedBy(key, chosen) === null);
}


/* ── B requires A ─────────────────────────────────────────────────────── */

/**
 * Key → the add-on key that has to be bought before this one means anything.
 *
 * Blog posts are the case. A post written for a site with no blog to publish
 * it on is work the client cannot use, so the counter does not appear until
 * the blog is ticked — the same reason the pay screen doesn't sell a booking
 * page to someone who didn't buy booking. This is a fit rule, not an upsell
 * ladder: the gate exists to stop a sale that shouldn't happen, and it is
 * enforced on the server for exactly that reason.
 */
export const ADDON_REQUIRES: Readonly<Record<string, string>> = {
  // Ratified by Taylor, 2026-09-07.
  showcase_seo_post: "showcase_seo_blog",
} as const;

/**
 * Whether `key` may be bought given what else is selected.
 *
 * True for every row with no prerequisite, which is almost all of them.
 */
export function isUnlocked(key: string, selected: Iterable<string>): boolean {
  const required = ADDON_REQUIRES[key];
  if (!required) return true;

  const chosen = selected instanceof Set ? selected : new Set(selected);
  return chosen.has(required);
}
