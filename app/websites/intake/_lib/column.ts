/**
 * The intake column, stated once.
 *
 * Two things need this rule and they are in different files: the page column
 * in `layout.tsx`, and the inner row of the sticky footer bar in
 * `step-shell.tsx`. The bar spans the whole viewport while its Back and
 * Continue must line up exactly with the fields above them, which is only true
 * for as long as both sides agree on the column — so they read the same
 * string rather than each carrying a copy of `max-w-[560px] px-[22px] md:px-8`.
 *
 * Vertical rhythm is deliberately absent: the page and the bar want different
 * padding, and only the horizontal measure has to match.
 */
export const INTAKE_COLUMN = "mx-auto w-full max-w-[560px] px-[22px] md:px-8";
