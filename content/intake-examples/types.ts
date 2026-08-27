/**
 * One example site in the taste gallery.
 *
 * `width` and `height` are the capture's real intrinsic pixels and they are
 * **required**, not optional. This repo has already shipped the bug they
 * prevent once: `next/image` with an unconstrained width renders a capture at a
 * fraction of its size, silently, with nothing in the console (see
 * `CLAUDE.md`). Making the dimensions part of the content contract is what
 * makes that failure impossible here rather than merely unlikely.
 *
 * `key` is stable and outlives the file. A client's favourites are stored by
 * key, so renaming one orphans someone's ranked list; add and retire sites
 * instead of renaming them.
 */
export type ExampleCapture = {
  src: string;
  width: number;
  height: number;
  /** What the capture shows, for someone who cannot see it. */
  alt: string;
};

export type ExampleSite = {
  key: string;
  name: string;
  url: string;
  /** First capture is the opening view; the rest scroll inside the card. */
  captures: readonly ExampleCapture[];
};
