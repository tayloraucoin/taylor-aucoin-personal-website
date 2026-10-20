/**
 * The error line's 16px warning glyph (D-SITE-154), for a line that cannot be
 * `ErrorLine` itself: the save line keeps one live region for every state, so
 * the glyph goes inside it rather than replacing it.
 */
export function WarningGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-[2px] size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    >
      <path d="M8 1.75 14.75 13.75H1.25L8 1.75Z" />
      <path d="M8 6.25v3.5" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}
