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
        className="inline-flex min-h-11 items-center text-meta text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
      >
        Have a code from our call?
      </button>
    );
  }

  return (
    <div>
      <label
        htmlFor="promo-code"
        className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)"
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
          className="min-h-12 w-full min-w-0 grow rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 font-code text-[16px] text-(--color-ink) placeholder:text-(--color-dim) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
        />
        <button
          type="button"
          disabled={state.status === "checking" || !value.trim()}
          onClick={onApply}
          className="min-h-12 shrink-0 rounded-(--radius) border border-(--color-faint) px-5 text-small text-(--color-ink) transition-colors hover:border-(--color-ink) hover:text-(--color-ink) disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
        >
          {state.status === "checking" ? "Checking…" : "Apply"}
        </button>
      </div>
      {state.status === "invalid" ? (
        <p
          aria-live="polite"
          className="mt-2 text-meta leading-[1.55] text-(--color-ink)"
        >
          That code isn&apos;t one of mine — worth checking the spelling.
        </p>
      ) : null}
    </div>
  );
}
