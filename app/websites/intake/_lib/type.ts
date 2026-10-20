/**
 * The intake's type roles, stated once (intake-coded.md, token rules; D-SITE-158).
 *
 * Both intake trees read these rather than restating a class string, so a
 * screen not drawn on the canvas still lands on the kit: the h1 at Heading 2,
 * body 17 (16 under 640) at 400, meta 13 muted in sentence case, Heading 4 for
 * a section or card kicker, and the text link (text colour, mark underline,
 * 2px on hover). Gold is a mark here, never text (kit §1 law 1).
 */

/** Every screen's h1: Heading 2, 30/600. */
export const H1 =
  "font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)";

/** A section or card kicker, an h2 or h3 by place: Heading 4. */
export const H4 =
  "font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)";

/** Body 17, 16 under 640, weight 400. */
export const BODY =
  "text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)";

/** Small 15 at 400: labels and option text. */
export const SMALL = "text-small leading-[1.5] text-(--color-body)";

/** Meta 13, muted: help, notes, position, counts. */
export const META = "text-meta leading-[1.55] text-(--color-dim)";

/** The text link's look, at whatever size it sits in. */
export const TEXT_LINK =
  "text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-[text-decoration-thickness] duration-(--dur-fast) hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

/**
 * A meta-size text link with a 44px hit area and the look unchanged
 * (intake-coded-build.md, Touch at 390).
 */
export const META_LINK = `inline-flex min-h-11 items-center text-meta ${TEXT_LINK}`;
