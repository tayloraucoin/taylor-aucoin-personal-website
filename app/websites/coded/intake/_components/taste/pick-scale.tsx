"use client";

import { useIsDocument } from "@/components/intake/preview-mode";
import { DocHint, DocTag } from "../../../../intake/_components/document";

/** [COPY — draft] — the taste step's question, and what each end of it means. */
const SCALE_LABEL = "How close is this to what you want?";
const LOW = "One detail";
const HIGH = "Build me this";

const MAX = 7;

/**
 * A real slider, and still no fabricated score.
 *
 * Seven tap-targets in a row was a segmented control wearing a scale's clothes;
 * this is the control the question actually describes, and it matches the
 * `ScaleSliderField` pattern in Conscious Connections' design system.
 *
 * **Zero is "not scored", and it is a position on the track.** That is what
 * keeps the no-default law (D-PORT-4 as amended) and a slider in the same
 * component: a slider always has a thumb somewhere, so parking it before the
 * first tick with the fill empty and the readout showing a dash says "you have
 * not answered this" in the one place a client is looking. It also buys
 * something the buttons never had — dragging back to zero **clears** a score,
 * where before a mis-tap could only be changed, never undone.
 *
 * ## Why a native range input rather than Radix
 *
 * Keyboard stepping, `Home`/`End`, touch dragging, the pointer-capture drag,
 * and the ARIA slider semantics are all free and already correct. Radix is here
 * for dialog and select because both need behaviour the platform does not give;
 * a one-thumb slider is not one of those, and a dependency that buys styling
 * hooks alone is a tax on every future install (M-INT boring-technology law).
 *
 * The browser also owns the value, so the stale-closure hazard the seven
 * buttons had — where key repeat outran React and the score stuck — cannot
 * exist here. Each event carries the browser's own current value.
 */
export function PickScale({
  idPrefix,
  value,
  onChange,
  label = SCALE_LABEL,
  low = LOW,
  high = HIGH,
}: {
  /** Unique per scale on the page — the label finds the control by id. */
  idPrefix: string;
  value: number | undefined;
  /** `undefined` when the client drags back to the unscored end. */
  onChange: (next: number | undefined) => void;
  /**
   * The question, and what each end of it means.
   *
   * Defaulted to the taste step's, which is the caller this was built for and
   * the only one until the done screen's feedback asked the same *shape* of
   * question about something else (2026-09-04). Parameters rather than a second
   * component: the no-default zero, the readout, the ticks, and the named ends
   * are the design here, and a copy of them that drifted would be the thing
   * worth avoiding.
   */
  label?: string;
  low?: string;
  high?: string;
}) {
  const labelId = `${idPrefix}-scale-label`;
  const inputId = `${idPrefix}-scale`;
  const position = value ?? 0;

  const valueText =
    value === undefined
      ? "Not scored"
      : value === 1
        ? `1 of ${MAX} — ${low}`
        : value === MAX
          ? `${MAX} of ${MAX} — ${high}`
          : `${value} of ${MAX}`;

  if (useIsDocument()) {
    return (
      <>
        <DocTag>Slider · 1–7, unscored until moved</DocTag>
        <DocHint>
          {label} 1 is &ldquo;{low}&rdquo;, 7 is &ldquo;{high}&rdquo;.
        </DocHint>
      </>
    );
  }

  /** The filled portion, drawn on the input itself so there is one element. */
  const filled = (position / MAX) * 100;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <label
          id={labelId}
          htmlFor={inputId}
          className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
        >
          {label}
        </label>

        {/* The readout carries the answer in numerals, where a thumb position
            alone would leave someone counting ticks. */}
        <span
          aria-hidden
          className={`font-mono text-[12px] tracking-[.14em] ${
            value === undefined ? "text-(--color-dim)" : "text-(--color-c2)"
          }`}
        >
          {value === undefined ? "—" : `${value} / ${MAX}`}
        </span>
      </div>

      <input
        id={inputId}
        type="range"
        min={0}
        max={MAX}
        step={1}
        value={position}
        aria-labelledby={labelId}
        aria-valuetext={valueText}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(next === 0 ? undefined : next);
        }}
        className="taste-scale mt-4 w-full"
        style={{ ["--filled" as string]: `${filled}%` }}
      />

      {/* Ticks under the track, so the seven stops are visible rather than
          something you discover by dragging. */}
      <div
        aria-hidden
        className="mt-2 flex justify-between px-[9px] font-mono text-[10px] text-(--color-dim)"
      >
        {Array.from({ length: MAX }, (_, index) => index + 1).map((stop) => (
          <span
            key={stop}
            className={
              value !== undefined && stop <= value
                ? "text-(--color-c2)"
                : undefined
            }
          >
            {stop}
          </span>
        ))}
      </div>

      {/* The ends, named. A number with nothing at either end of it is a number
          someone has to guess the meaning of. */}
      <div className="mt-2 flex justify-between gap-4 font-body text-[13.5px] font-light leading-[1.4] text-(--color-dim)">
        <span>1 · {low}</span>
        <span>7 · {high}</span>
      </div>
    </div>
  );
}
