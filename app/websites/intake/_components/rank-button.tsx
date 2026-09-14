"use client";

/**
 * "Move up" / "Move down" — one shape, shared by every list that can be
 * put in the client's own order.
 *
 * Lifted out of `top-five.tsx` at PORT-33 so `RepeatableBlock`'s reorder
 * control is the same control rather than a second one that could drift —
 * text, not icons (a phone has no hover and a keyboard user has no pointer,
 * D-PORT-4), disabled at the ends rather than wrapping, and always rendered
 * so the affordance is learnable even where it does nothing yet.
 */
export function RankButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="rounded-(--radius) px-2 py-1 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-(--color-dim)"
    >
      {children}
    </button>
  );
}
