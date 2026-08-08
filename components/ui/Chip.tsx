/**
 * Mono spec-card chip for DecisionCard's category row — 9px/400/.24em/uppercase,
 * --color-dim, 1px --color-spec-border border, 3px radius, 4px/8px padding.
 */
export default function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-block rounded-(--radius) border border-(--color-spec-border) px-2 py-1 font-mono text-[9px] uppercase tracking-[.24em] text-(--color-dim)",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </span>
  );
}
