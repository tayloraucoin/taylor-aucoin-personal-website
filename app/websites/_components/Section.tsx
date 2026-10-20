/**
 * One section of `/websites`: a hairline, then a Heading 2 (websites-coded-build
 * §Layout). `id` doubles as an anchor that links from outside the page keep.
 */
export function Section({
  id,
  heading,
  children,
}: {
  id: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="mt-20 scroll-mt-8 border-t border-(--color-line-soft) pt-10 md:mt-24 md:pt-12"
    >
      <h2
        id={`${id}-heading`}
        className="font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)"
      >
        {heading}
      </h2>
      {children}
    </section>
  );
}

/** The 12px uppercase label, muted (kit §3). */
export const LABEL =
  "text-(length:--text-label) font-medium uppercase tracking-(--tracking-label) text-(--color-dim)";

/** Text colour with the `--mark` underline (kit §1 law 3); 24px target. */
export const TEXT_LINK =
  "inline-flex min-h-6 items-center text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-[3px] transition-colors duration-(--dur-fast) hover:text-(--color-body) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)";

/** Label in a 240 column, body beside it at 1440; label over body at 390. */
export const LABEL_ROW =
  "grid grid-cols-1 gap-x-8 gap-y-2 border-b border-(--color-line-soft) py-6 md:grid-cols-[240px_minmax(0,640px)]";
