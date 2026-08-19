/**
 * Native <details>/<summary> — no JS, keyboard-accessible for free, and the
 * global :focus-visible ring applies. Open/close is instant, which is also the
 * correct prefers-reduced-motion behaviour; nothing animates, so nothing needs
 * to be frozen.
 *
 * Promoted out of `services/Faq` when `/websites` needed the same thing with
 * different questions. The look has one home; each page owns its content.
 */
export default function Faq({
  items,
}: {
  items: ReadonlyArray<{ q: string; a: string }>;
}) {
  return (
    <div className="mt-2">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-(--color-faint)">
          <summary className="flex cursor-pointer list-none items-baseline justify-between gap-4 py-4 font-display text-[15px] font-medium tracking-[-.012em] text-(--color-ink) transition-colors duration-(--dur-fast) hover:text-(--color-c3) [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden
              className="font-mono text-[11px] text-(--color-dim) group-open:hidden"
            >
              +
            </span>
            <span
              aria-hidden
              className="hidden font-mono text-[11px] text-(--color-dim) group-open:inline"
            >
              −
            </span>
          </summary>
          <p className="max-w-[64ch] pb-5 text-[13.5px] font-light leading-[1.64] text-(--color-body)">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
