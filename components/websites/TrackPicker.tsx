"use client";

import { useState } from "react";
import Link from "next/link";
import {
  doors,
  picker,
  professions,
  verdicts,
  type Profession,
} from "@/content/websites-chooser";

/**
 * "Not sure which one?" — the overlap valve, sitting under the two doors.
 *
 * Taylor's brief: after the cards, a way in for someone who did not recognise
 * themselves in either, which asks what they do and then picks the track for
 * them. This is the deterministic version of that. No model call, no describe
 * yourself box: a list of jobs and a fixed mapping, which is faster to use,
 * impossible to get weird, and free to run.
 *
 * COLLAPSED BY DEFAULT, AND THAT IS THE POINT. The chooser's whole design
 * constraint is a trades buyer on a phone in a driveway reaching two doors
 * without scrolling. This sits after the doors and adds about forty pixels shut,
 * so the person who already knows what they want never pays for the person who
 * doesn't. Anyone who opens it has, by definition, told us they have a moment.
 *
 * `<details>` for the disclosure rather than state: keyboard support and the
 * global focus ring come free, open and close are instant, and instant is
 * already the correct reduced-motion behaviour. Only the pick itself needs
 * React, because a verdict has to be chosen and announced.
 *
 * WITHOUT JAVASCRIPT the disclosure still opens and the job list still reads;
 * only the pick goes dead. That is an acceptable floor here and not a shortcut:
 * everything this component does for a reader is also reachable from the two
 * cards above it and the phone number below it, both of which are server
 * rendered. It aids a decision rather than gating one.
 *
 * NO GRADIENT, in keeping with the page. The chooser spends none, and a
 * recommendation panel is exactly the kind of element that would want to.
 *
 * THE TRIGGER IS A CARD, NOT A LABEL, AND THAT WAS A CORRECTION. It first
 * shipped in the site's quietest register: 10px dim mono, wide-tracked, upper
 * case. Taylor's read was that most people would miss it, and he was right for
 * a specific reason — that register is the SectionLabel register, so the row
 * was wearing the one costume on this site that means "this is a heading for
 * the thing below it," which is the opposite of "press me." It now takes the
 * door cards' surface, a display-size question, and a gold glyph. It is
 * deliberately a full-width band under both doors rather than a third column:
 * it has to be impossible to miss without ever reading as a third option.
 */
export default function TrackPicker() {
  const [picked, setPicked] = useState<Profession | null>(null);
  const verdict = picked ? verdicts[picked.verdict] : null;
  const shown = verdict
    ? verdict.show.map((k) => doors.find((d) => d.key === k)!)
    : [];

  // The border-hover uses a raw arbitrary variant rather than the `has-[...]`
  // shorthand on purpose: CLAUDE.md records that a Tailwind v4 class which does
  // not parse fails SILENTLY, and a hover affordance that quietly does nothing
  // is exactly the bug that got this row rewritten in the first place. This
  // form is verified against the computed style.
  return (
    <details className="group mt-4 rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) transition-colors duration-(--dur-fast) [&:has(>summary:hover)]:border-[rgb(232_185_97/.34)] md:mt-5">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden md:p-6">
        <span>
          <span className="block font-display text-[17px] font-medium leading-[1.25] tracking-[-.02em] text-(--color-ink) md:text-[19px]">
            {picker.trigger}
          </span>
          <span className="mt-1.5 block text-[13.5px] font-light leading-[1.55] text-(--color-dim)">
            {picker.triggerSub}
          </span>
        </span>

        {/* Gold, and the same size as a door's CTA. On a page whose only other
            gold is the two prices and the two "see this build" lines, that is
            enough to read as an action without spending a gradient. */}
        <span
          aria-hidden
          className="shrink-0 font-mono text-[15px] leading-none text-(--color-c2) transition-colors duration-(--dur-fast) group-open:hidden"
        >
          +
        </span>
        <span
          aria-hidden
          className="hidden shrink-0 font-mono text-[15px] leading-none text-(--color-c2) group-open:inline"
        >
          −
        </span>
      </summary>

      <div className="border-t border-(--color-faint) px-5 pb-5 pt-5 md:px-6 md:pb-6">
        <p
          id="track-picker-prompt"
          className="text-[13.5px] font-light leading-[1.6] text-(--color-body)"
        >
          {picker.prompt}
        </p>

        {/* Buttons rather than links: the answer appears in place, so somebody
            who picks wrong can pick again without losing the page. A job list
            that navigated on the first tap would punish the exact hesitation
            this thing exists to serve. */}
        <div
          role="group"
          aria-labelledby="track-picker-prompt"
          className="mt-3 grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {professions.map((p) => {
            const active = picked?.label === p.label;
            return (
              <button
                key={p.label}
                type="button"
                aria-pressed={active}
                onClick={() => setPicked(p)}
                /* py-3.5 rather than something tighter is a tap-target
                   decision, not a rhythm one: at py-2.5 these rows measured
                   41px, under this site's own stated 44px floor. Height costs
                   nothing here because the whole block is collapsed by
                   default and sits below the doors. */
                className={`cursor-pointer border-b border-(--color-faint) py-3.5 text-left text-[13.5px] font-light leading-[1.45] transition-colors duration-(--dur-fast) ${
                  active
                    ? "text-(--color-c2)"
                    : "text-(--color-body) hover:text-(--color-ink)"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* aria-live so the verdict is announced when it replaces itself in
            place. It is polite, never assertive: nothing here is urgent and
            interrupting somebody mid-list to shout a recommendation would be
            the wrong register for a page that is trying to be easy. */}
        <div aria-live="polite" className="empty:hidden">
          {/* A hairline-separated block rather than a nested card. The trigger
              above is now itself a spec-bg card, and a spec-bg panel inside a
              spec-bg card reads as mud — two near-identical translucent
              surfaces stacked with no contrast between them. The rule does the
              separating; the gold link at the bottom does the pointing. */}
          {verdict && picked ? (
            <div className="mt-6 border-t border-(--color-faint) pt-5">
              <p className="font-mono text-[9px] uppercase tracking-[.2em] text-(--color-c2)">
                {picked.label}
              </p>

              <p className="mt-2 font-display text-[17px] font-medium leading-[1.25] tracking-[-.02em] text-(--color-ink)">
                {shown.length === 1 ? shown[0].name : picker.eitherHeadline}
              </p>

              <p className="mt-2.5 max-w-[58ch] text-[13.5px] font-light leading-[1.6] text-(--color-body)">
                {verdict.body}
              </p>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                {shown.map((d) => (
                  <Link
                    key={d.key}
                    href={d.href}
                    className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
                  >
                    {shown.length === 1 ? d.cta : d.name} →
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}
