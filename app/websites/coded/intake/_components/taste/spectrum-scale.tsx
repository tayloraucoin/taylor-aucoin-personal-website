"use client";

import { useIsDocument } from "@/components/intake/preview-mode";
import type { TasteSpectrum } from "@/lib/intake/showcase-copy";
import { DocHint, DocTag } from "../../../../intake/_components/document";

/** The ends of the track. Continuous between them — see the component doc. */
const MIN = 1;
const MAX = 7;

/**
 * How fine a position the client can express.
 *
 * A tenth, which the readout prints as one decimal place. Coarser buckets were
 * the first build and Taylor replaced them: a fork between two feelings is a
 * place you slide to, not a bucket you pick, and 4.3 is a different answer from
 * 4.0 to the person who set it there.
 *
 * Keyboard is not stranded by the fineness. The platform gives arrows one step
 * (0.1) and PageUp/PageDown a tenth of the range (0.6), which is coarse enough
 * to cross the whole track in ten presses.
 */
const STEP = 0.1;

/**
 * How close to the middle still reads as "no strong feeling".
 *
 * Wide enough that a client who dragged to roughly the centre is told they
 * landed there, rather than being assigned a lean they did not intend by a
 * tenth of a point.
 */
const EVEN_BAND = 0.4;

/**
 * The thumb's diameter, matching `.taste-spectrum` in `globals.css`.
 *
 * A range input's thumb travels between its own edges rather than the full
 * track width, so the reachable extremes sit half a thumb inside the track at
 * each end. `PickScale` shipped without accounting for that once and its ticks
 * drifted away from the values they selected; here the same arithmetic insets
 * the two end labels so each one's outer edge lines up with a position the
 * control can actually reach.
 */
const THUMB_PX = 20;

/** The midpoint, which is also where an unanswered fork parks its thumb. */
const CENTRE = (MIN + MAX) / 2;

/**
 * One fork, as a continuous position between two named ends (D-PORT-29).
 *
 * ## Why this is not `PickScale` with different props
 *
 * `PickScale` measures **a quantity** — how close a site is to what someone
 * wants — in seven discrete stops from an unscored zero that sits on the track
 * as a real position. This marks **a position between two equal ends**, where
 * there is no "more", no zero to park at, and a fill growing from the left
 * would actively lie about what is being asked. The two share a look and
 * nothing else; folding them into one component would mean a `bipolar` flag
 * deciding the meaning of every other prop, which is two components wearing a
 * trenchcoat.
 *
 * ## No default, on a track with no spare position
 *
 * A bipolar track has no zero to park an unanswered value at. So the input's
 * value is held at the **centre** while unset and the thumb goes dim and
 * hollow, and the readout carries the whole signal: a dash rather than a
 * number.
 *
 * The thumb was hidden outright in the first draft. Seen on screen that left
 * nine hairlines with two words under each, recognisable as a control by
 * nobody — so it is drawn, dimmed. An answered fork is gold with a number and a
 * direction; an unanswered one is grey with a dash. Those do not read alike.
 *
 * **Every change commits, from any input method.** A keyboard arrow from unset
 * fires at 3.9 or 4.1, which is the honest reading — they moved it off centre.
 * There is no "did they mean it" branch, because a control that second-guesses
 * the platform's own events is a control that will disagree with the platform
 * eventually.
 *
 * ## What a client reads
 *
 * Each end's short name, and under it the line saying what that end **turns
 * into** on the built site. Two gallery site names per end stood here until
 * Taylor cut them (2026-09-07): clients "aren't paying that kind of attention",
 * and a name only helps someone who remembers the site. A descriptor helps
 * everyone — and cutting them removed this component's only reason to know
 * about the gallery at all, along with a coupling that let a site archived in
 * `/admin/intake/examples` change what a fork said.
 */
export function SpectrumScale({
  spectrum,
  value,
  onChange,
}: {
  spectrum: TasteSpectrum;
  value: number | undefined;
  /** `undefined` when the client clears the row. */
  onChange: (next: number | undefined) => void;
}) {
  const inputId = `f-spectrum-${spectrum.id}`;
  const labelId = `${inputId}-label`;
  const unset = value === undefined;

  /**
   * Which end this position leans toward, or neither.
   *
   * The direction is a word and the strength is the number beside it, so no
   * per-position copy has to exist: "6.4 · Warm" and "4.9 · Warm" say different
   * things without either of them needing a phrase written for it.
   */
  const lean =
    value === undefined
      ? null
      : Math.abs(value - CENTRE) <= EVEN_BAND
        ? "Even"
        : value < CENTRE
          ? spectrum.ends.low
          : spectrum.ends.high;

  /** One decimal place, always — "4" beside "4.3" reads as a different scale. */
  const shown = value === undefined ? null : value.toFixed(1);

  if (useIsDocument()) {
    return (
      <div className="mb-6">
        <DocTag>
          Slider · {spectrum.label} · {MIN.toFixed(1)}–{MAX.toFixed(1)}, unset
          until moved
        </DocTag>
        <DocHint>
          {spectrum.ends.low} ({spectrum.means.low}) to {spectrum.ends.high} (
          {spectrum.means.high})
        </DocHint>
      </div>
    );
  }

  return (
    <div className="mb-9 last:mb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <label
          id={labelId}
          htmlFor={inputId}
          className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
        >
          {spectrum.label}
        </label>

        {/* Cleared, not toggled — and absent until there is something to clear,
            so an untouched row carries no controls at all. */}
        {unset ? null : (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-4 hover:text-(--color-ink)"
          >
            Clear
          </button>
        )}
      </div>

      {/* The number and the direction it leans. This is also what tells an
          unset row apart from one answered at dead centre, since both park the
          thumb in the same place. */}
      <p
        aria-hidden
        className={`mt-1.5 min-h-[1.4em] font-mono text-[12px] tracking-[.14em] ${
          unset ? "text-(--color-dim)" : "text-(--color-c2)"
        }`}
      >
        {unset ? "—" : `${shown} · ${lean}`}
      </p>

      <input
        id={inputId}
        type="range"
        min={MIN}
        max={MAX}
        step={STEP}
        // Centre while unset — a bipolar track has nowhere else to park a
        // control nobody has touched. The dimmed thumb and the dash above it
        // are what say so; this number never reaches the answers document.
        value={value ?? CENTRE}
        data-unset={unset ? "true" : "false"}
        aria-labelledby={labelId}
        // Rounded on the way in rather than on the way out: floating-point
        // arithmetic on a 0.1 step yields values like 4.300000000000001, and
        // the answers document should hold what the readout showed.
        onChange={(event) =>
          onChange(Math.round(Number(event.target.value) * 10) / 10)
        }
        // Words as well as the number. A bare "4.3" between two named ends
        // tells a screen-reader user nothing about which way that is.
        aria-valuetext={
          unset
            ? "Not answered"
            : `${shown} of ${MAX.toFixed(1)}, ${
                lean === "Even"
                  ? `even between ${spectrum.ends.low} and ${spectrum.ends.high}`
                  : `toward ${lean}`
              }`
        }
        className="taste-spectrum w-full"
      />

      {/* The ends, each over the line saying what it turns into.

          Laid out as two columns rather than absolutely positioned at the
          extremes: centring a label on an end hangs half of it off the
          container, and two long ends collide in the middle. Each column's
          outer edge aligns with the position the thumb can actually reach,
          which is what the half-thumb inset is for.

          Pulled up, because the input is 44px tall for the tap target while its
          track is 2px — so a fifth of that height is blank space under the line,
          and without this the ends read as a caption on the rule above them
          rather than as the two ends of the control. */}
      <div
        className="-mt-2.5 flex justify-between gap-8"
        style={{
          paddingLeft: `${THUMB_PX / 2}px`,
          paddingRight: `${THUMB_PX / 2}px`,
        }}
      >
        <div className="min-w-0 basis-1/2">
          <p className="font-body text-[13.5px] font-light leading-[1.4] text-(--color-body)">
            {spectrum.ends.low}
          </p>
          <p className="mt-1 font-body text-[13px] font-light leading-[1.5] text-(--color-dim)">
            {spectrum.means.low}
          </p>
        </div>

        <div className="min-w-0 basis-1/2 text-right">
          <p className="font-body text-[13.5px] font-light leading-[1.4] text-(--color-body)">
            {spectrum.ends.high}
          </p>
          <p className="mt-1 font-body text-[13px] font-light leading-[1.5] text-(--color-dim)">
            {spectrum.means.high}
          </p>
        </div>
      </div>
    </div>
  );
}
