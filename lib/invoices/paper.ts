/**
 * Palette D · Gilt, on paper — the light variant of the site's palette, for
 * documents that get printed, forwarded, and filed with a bookkeeper.
 *
 * Derived from `app/globals.css`, not invented: the ground becomes the ink
 * (`--color-ground-a` is the brand's darkest value, so it is exactly what the
 * brand's black should be on white), and the violet-gray text ramp is the
 * dark theme's ramp flipped. Gold is unchanged.
 *
 * The rule that keeps it professional: **gold is never text on paper.**
 * `#e8b961` on white is ~1.9:1 — unreadable, and it looks cheap in print.
 * Gold appears as a rule, a chip fill, and a button fill with ink text, which
 * is the same "gold fill, ink-dark text" law the site's primary CTA follows.
 *
 * Contrast against `paper`: ink 18.9:1 · body 10.3:1 · dim 5.3:1. All pass
 * WCAG AA at the sizes used here, including the mono labels.
 *
 * Recorded as a design-system extension (D-DOC-1). Deliberately not the
 * cream and rust of `how_we_work.pdf` — that document predates this system,
 * and its palette is not part of Palette D.
 */
export const PAPER = {
  /** White, on Taylor's call: it reads as professional and prints honestly. */
  paper: "#ffffff",
  /** The one non-white surface. `--color-ground-a` at ~3%, for meta blocks. */
  tint: "#f7f6fa",
  /** `--color-ground-a`, promoted from background to text. */
  ink: "#060b1e",
  /** The light-mode counterpart of `--color-body` (#9c99bc). */
  body: "#3f3c5c",
  /** The light-mode counterpart of `--color-dim` (#7e7ca0), AA-corrected. */
  dim: "#6b6889",
  /** The light-mode counterpart of `--color-faint`. */
  hairline: "#e3e1ec",
  /** `--color-c2`. Accent only: rules, chips, button fills. Never text. */
  gold: "#e8b961",
} as const;

/** The three site families, by the names the PDF renderer registers them as. */
export const PAPER_FONT = {
  display: "Space Grotesk",
  body: "Manrope",
  mono: "JetBrains Mono",
} as const;
