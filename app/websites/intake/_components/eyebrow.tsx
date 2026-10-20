/**
 * The old intake eyebrow, kept only for the coded tree's last importers until
 * SITE-29 removes them. It renders as meta 13 in sentence case with no rule:
 * the mono caps and gold hairline are gone with the rebrand (D-SITE-158, A-07).
 */
export function Eyebrow({ children }: { children: string }) {
  return (
    <p className="mb-3 text-meta leading-[1.55] text-(--color-dim)">
      {children}
    </p>
  );
}
