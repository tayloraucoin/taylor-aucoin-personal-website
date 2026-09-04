"use client";

import { useIsDocument } from "@/components/intake/preview-mode";
import { DocHint, DocTag } from "../../../../intake/_components/document";

/** [COPY — draft] — the question, and what each end of it means. */
const SCALE_LABEL = "How close is this to what you want?";
const LOW = "One detail";
const HIGH = "Build me this";

const STOPS = [1, 2, 3, 4, 5, 6, 7] as const;

/**
 * Seven stops, and no default.
 *
 * **Nothing is selected until someone selects something.** A range input with a
 * default fabricates a score nobody gave, and every pick a client never touched
 * would come back as the same middle number — which is worse than no number,
 * because it reads as an answer. An untouched scale saves nothing and the
 * document says "no score", which is true.
 *
 * The question is *closeness*, not *liking*. They already pressed Select, so
 * they like it; what a designer needs is how much of it. A 2 against the note
 * "just the hover previews" is a precise instruction, and a 7 is a different
 * one — so the low end is labelled as a real answer rather than a slight.
 *
 * ## Why one slider and not seven radios
 *
 * A screen reader meets one control with a value, which is what this is, rather
 * than seven controls of which none is chosen. The stops are pointer
 * affordances inside that control: `tabIndex={-1}` keeps them out of the tab
 * order and `aria-hidden` keeps them out of the accessibility tree, so the
 * composite is announced once. Arrow keys, Home, and End drive the slider
 * itself.
 *
 * `aria-valuenow` is omitted while unset, because a slider that reports a
 * position it does not have is the same lie the default value would be;
 * `aria-valuetext` carries the honest reading either way.
 */
export function PickScale({
  idPrefix,
  value,
  onChange,
}: {
  /** Unique per scale on the page — the label finds the control by id. */
  idPrefix: string;
  value: number | undefined;
  /**
   * Absolute for a tap, an updater for a key.
   *
   * Key repeat fires faster than React re-renders, so a handler that computed
   * `value + 1` from the value its render closed over would read the same stale
   * number on every repeat and the scale would stick — the same hazard
   * M-PORT-17 fixed for array answers, in a different shape. The stop buttons
   * pass an absolute number because a tap genuinely is absolute.
   */
  onChange: (next: number | ((previous: number | undefined) => number)) => void;
}) {
  const labelId = `${idPrefix}-scale-label`;

  const valueText =
    value === undefined
      ? "No score yet"
      : value === 1
        ? `1 of 7 — ${LOW}`
        : value === 7
          ? `7 of 7 — ${HIGH}`
          : `${value} of 7`;

  if (useIsDocument()) {
    return (
      <>
        <DocTag>Scale · 1–7, nothing selected by default</DocTag>
        <DocHint>
          {SCALE_LABEL} 1 is &ldquo;{LOW}&rdquo;, 7 is &ldquo;{HIGH}&rdquo;.
        </DocHint>
      </>
    );
  }

  /** Moves by `delta` from whatever the value is when the update runs. */
  function step(delta: number) {
    onChange((previous) =>
      previous === undefined ? 1 : Math.min(7, Math.max(1, previous + delta)),
    );
  }

  return (
    <div>
      <p
        id={labelId}
        className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
      >
        {SCALE_LABEL}
      </p>

      <div
        role="slider"
        tabIndex={0}
        aria-labelledby={labelId}
        aria-valuemin={1}
        aria-valuemax={7}
        aria-valuenow={value}
        aria-valuetext={valueText}
        onKeyDown={(event) => {
          const key = event.key;
          if (key === "ArrowRight" || key === "ArrowUp") {
            event.preventDefault();
            step(1);
          } else if (key === "ArrowLeft" || key === "ArrowDown") {
            event.preventDefault();
            step(-1);
          } else if (key === "Home") {
            event.preventDefault();
            onChange(1);
          } else if (key === "End") {
            event.preventDefault();
            onChange(7);
          }
        }}
        className="mt-2.5 flex gap-1.5 rounded-(--radius) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-c2)"
      >
        {STOPS.map((stop) => {
          const chosen = value !== undefined && stop === value;
          const below = value !== undefined && stop < value;

          return (
            <button
              key={stop}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => onChange(stop)}
              className={`flex h-11 flex-1 items-center justify-center rounded-(--radius) border font-mono text-[11px] tracking-[.1em] transition-colors duration-(--dur-fast) ease-(--ease-out) ${
                chosen
                  ? "border-[rgb(232_185_97/.55)] bg-[rgb(232_185_97/.18)] text-(--color-ink)"
                  : below
                    ? "border-[rgb(232_185_97/.28)] bg-[rgb(232_185_97/.07)] text-(--color-body)"
                    : "border-(--color-faint) bg-(--color-card) text-(--color-dim) hover:border-[rgb(232_185_97/.28)]"
              }`}
            >
              {stop}
            </button>
          );
        })}
      </div>

      {/* The ends, named. A number with nothing at either end of it is a number
          someone has to guess the meaning of. */}
      <div className="mt-1.5 flex justify-between font-body text-[13.5px] font-light leading-[1.4] text-(--color-dim)">
        <span>1 · {LOW}</span>
        <span>7 · {HIGH}</span>
      </div>
    </div>
  );
}
