import { proofBar } from "@/content/home";

/**
 * The proof bar (D-SITE-48): a ledger in type, four cells, each a heading-4
 * fact over a meta line, hairlines between. Never a hero-metric block (A-09):
 * no counters, no accent numbers, nothing that moves after load. Side by side
 * at 1440, stacked at 390.
 */
export function ProofBar() {
  return (
    <section aria-label="Proof" className="mt-16 md:mt-24">
      <ul className="flex flex-col border-y border-(--color-line-soft) md:flex-row">
        {proofBar.map(({ fact, meta }) => (
          <li
            key={fact}
            className="border-(--color-line-soft) py-5 not-first:border-t md:px-6 md:py-6 md:first:pl-0 md:last:flex-1 md:last:pr-0 md:not-first:border-t-0 md:not-first:border-l"
          >
            <p className="font-display text-(length:--text-h4) font-semibold leading-[1.25] tracking-(--tracking-h4) text-(--color-ink)">
              {fact}
            </p>
            <p className="mt-1 text-(length:--text-meta) leading-[1.5] text-(--color-dim)">
              {meta}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
