"use client";

/**
 * The promo rail, shared by both tracks' pay screens.
 *
 * Purely presentational: every piece of state lives in the parent checkout,
 * which owns what an activated code means for its own total. Extracted rather
 * than copied because the two screens' rails are word-for-word identical, and
 * a money surface with two copies of the same markup is two places for a
 * disabled state or a focus ring to drift.
 *
 * It hides behind one dim line because most clients do not have a code, and an
 * empty input box on a payment screen reads as a test you might be failing. A
 * code arriving by URL param opens and applies itself.
 */

export type PromoRailState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "invalid" }
  | { status: "active" };

export function PromoRail({
  open,
  state,
  value,
  activeSlot,
  onOpen,
  onChange,
  onApply,
}: {
  open: boolean;
  state: PromoRailState;
  value: string;
  /** What an activated code renders — each track describes its own effect. */
  activeSlot?: React.ReactNode;
  onOpen: () => void;
  onChange: (next: string) => void;
  onApply: () => void;
}) {
  if (state.status === "active") return <>{activeSlot}</>;

  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim) underline decoration-(--color-faint) underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        Have a code from our call?
      </button>
    );
  }

  return (
    <div>
      <label
        htmlFor="promo-code"
        className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)"
      >
        Promo code
      </label>
      <div className="mt-2 flex gap-2.5">
        <input
          id="promo-code"
          type="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onApply();
            }
          }}
          className="min-h-12 w-full min-w-0 grow rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 font-mono text-[16px] tracking-[.04em] text-(--color-ink) placeholder:text-(--color-dim) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        />
        <button
          type="button"
          disabled={state.status === "checking" || !value.trim()}
          onClick={onApply}
          className="min-h-12 shrink-0 rounded-(--radius) border border-(--color-faint) px-5 font-mono text-[11px] uppercase tracking-[.10em] text-(--color-body) transition-colors hover:border-(--color-gold-line) hover:text-(--color-ink) disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          {state.status === "checking" ? "Checking…" : "Apply"}
        </button>
      </div>
      {state.status === "invalid" ? (
        <p
          aria-live="polite"
          className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          That code isn&apos;t one of mine — worth checking the spelling.
        </p>
      ) : null}
    </div>
  );
}
