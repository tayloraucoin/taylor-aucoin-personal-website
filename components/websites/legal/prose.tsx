import type { ReactNode } from "react";

/**
 * The reading grammar for the legal documents — terms and privacy share it so
 * the two read as one set. Same tokens and mono-label idiom as the rest of
 * the site; body sizes match the intake surface (16px floor), because these
 * documents are read in a dialog on a phone right before a payment.
 *
 * Plain by design. A legal page in display type is theater, and a legal page
 * nobody can read protects nobody.
 */

export function LegalSection({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="flex items-baseline gap-3 border-b border-(--color-faint) pb-3 font-mono text-[11px] uppercase tracking-[.24em] text-(--color-body)">
        <span className="text-(--color-dim)">{index}</span>
        <span>{title}</span>
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
      {children}
    </p>
  );
}

/** Inline emphasis: ink against body copy — the one weight change allowed. */
export function Em({ children }: { children: ReactNode }) {
  return <strong className="font-normal text-(--color-ink)">{children}</strong>;
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 font-body text-[16px] font-light leading-[1.66] text-(--color-body)"
        >
          <span aria-hidden className="mt-[2px] select-none text-(--color-dim)">
            ·
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
