import type { ReactNode } from "react";

/**
 * The record row (about-build.md): name 240 · role 360 · years 120 · link.
 * At 390 it stacks, the years on their own meta line below the role (D-SITE-75).
 */
export function Row({
  name,
  role,
  years,
  link,
}: {
  name: string;
  role: string;
  years: string;
  link?: ReactNode;
}) {
  return (
    <li className="grid gap-x-8 gap-y-1 border-b border-(--color-line-soft) py-5 md:grid-cols-[240px_360px_120px_1fr] md:items-baseline">
      <span className="font-medium text-(--color-ink)">{name}</span>
      <span className="text-(length:--text-small) leading-[1.5] text-(--color-body)">
        {role}
      </span>
      <span className="block text-(length:--text-meta) text-(--color-dim)">
        {years}
      </span>
      <span className="md:justify-self-end">{link}</span>
    </li>
  );
}

export const ROW_LINK =
  "inline-flex min-h-11 items-center text-(length:--text-small) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-[3px] transition-colors duration-(--dur-fast) hover:text-(--color-body)";

export function SectionHeading({
  id,
  children,
  aside,
  tabIndex,
}: {
  id: string;
  children: ReactNode;
  aside?: ReactNode;
  tabIndex?: -1;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-(--color-line-soft) pb-6">
      <h2
        id={id}
        tabIndex={tabIndex}
        className="font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink) outline-none"
      >
        {children}
      </h2>
      {aside && (
        <span className="text-(length:--text-meta) text-(--color-dim)">
          {aside}
        </span>
      )}
    </div>
  );
}
