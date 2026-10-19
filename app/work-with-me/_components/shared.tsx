import type { ReactNode } from "react";

export const LINK =
  "inline-flex min-h-11 items-center text-(length:--text-small) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-[3px] transition-colors duration-(--dur-fast) hover:text-(--color-body) md:min-h-6";

export function H2({
  id,
  children,
  small = false,
}: {
  id: string;
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <h2
      id={id}
      className={`border-b border-(--color-line-soft) pb-6 font-display leading-[1.15] font-semibold text-(--color-ink) ${
        small
          ? "text-(length:--text-h4) tracking-(--tracking-h4)"
          : "text-(length:--text-h2) tracking-(--tracking-h2)"
      }`}
    >
      {children}
    </h2>
  );
}
