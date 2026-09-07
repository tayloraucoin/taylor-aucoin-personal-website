"use client";

import type { TasteSpectrum } from "@/lib/intake/showcase-copy";
import { SpectrumScale } from "./spectrum-scale";

/**
 * One block of forks — the structural set or the feel set (D-PORT-29).
 *
 * ## Why a block and not five `Field`s
 *
 * The taste step shed five questions on 2026-09-03 (D-PORT-20). Rendering these
 * as separate labelled fields would put them straight back as five more things
 * to get through. One `fieldset` with one legend and one intro reads as a single
 * instrument, which is what it is — and it is why nine forks across two blocks
 * is survivable where nine fields would not be.
 *
 * ## Nothing here out-dresses Continue
 *
 * No ring, no gradient, no lift, no count, no meter (invariant 2, and the
 * taste scope's own law). The block reports nothing about how much of it is
 * filled in; skipping every fork costs nothing and is never mentioned again.
 */
export function SpectrumBlock({
  legend,
  intro,
  spectrums,
  values,
  onChange,
}: {
  /** The block's own name, read before any fork. */
  legend: string;
  intro: string;
  /** Already filtered to one group by the caller. Never empty — see below. */
  spectrums: readonly TasteSpectrum[];
  values: Record<string, number>;
  /** `undefined` clears the fork; the caller removes the key entirely. */
  onChange: (id: string, next: number | undefined) => void;
}) {
  // An absent block, never an empty one (D-PORT-12's law). A pack with no set
  // for this group renders nothing at all rather than a legend over a gap.
  if (spectrums.length === 0) return null;

  return (
    <fieldset className="mb-10 border-t border-(--color-faint) pt-7">
      <legend className="sr-only">{legend}</legend>

      <p
        aria-hidden
        className="mb-2 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)"
      >
        {legend}
      </p>

      <p className="mb-7 max-w-[52ch] font-body text-[15px] font-light leading-[1.6] text-(--color-dim)">
        {intro}
      </p>

      {spectrums.map((spectrum) => (
        <SpectrumScale
          key={spectrum.id}
          spectrum={spectrum}
          value={values[spectrum.id]}
          onChange={(next) => onChange(spectrum.id, next)}
        />
      ))}
    </fieldset>
  );
}
