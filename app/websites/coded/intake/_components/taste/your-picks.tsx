"use client";

import type { ExampleSite } from "@/content/intake-examples";
import type { TastePick } from "@/lib/validators/showcase-intake";

/** [COPY — draft] */
const INTRO =
  "Five is the number we're after. More is welcome; fewer and the first look is more of a guess.";

/**
 * The shortlist, and the one place the ask is explained.
 *
 * **Absent until the first pick, never empty.** An empty state here would be a
 * form telling someone they have not done something yet, on the step most
 * likely to make a precious client stall (PORT-7's law, kept).
 *
 * No drag, no move buttons, and that is the D-PORT-4 amendment in one line:
 * **the score is the rank.** Ties are honest — two sites a client would equally
 * happily be handed is real information — and a forced total order was asking
 * for a precision nobody holds. Rows sit in gallery order so the list reads the
 * same way the gallery above it does.
 *
 * Edit does not open anything here. It sends the client back to the row, which
 * is where the capture and the tags are — deciding whether a 5 is really a 5 is
 * a thing you do while looking at the site, not at a line of text about it.
 */
export function YourPicks({
  picks,
  siteFor,
  onEdit,
}: {
  picks: readonly TastePick[];
  siteFor: (key: string) => ExampleSite | undefined;
  onEdit: (siteKey: string) => void;
}) {
  return (
    <section className="mb-10 border-t border-(--color-faint) pt-7">
      <h2 className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
        Your picks
      </h2>

      <p className="mt-4 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
        {INTRO}
      </p>

      <ol className="mt-5 space-y-3">
        {picks.map((pick, index) => {
          const site = siteFor(pick.siteKey);

          return (
            <li
              key={pick.siteKey}
              className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <span className="text-meta text-(--color-dim) tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="min-w-0 grow text-[16px] text-(--color-ink) sm:text-(length:--text-body)">
                  {site?.name ?? pick.siteKey}
                  {/* A site that has left the gallery keeps its place. Dropping
                      it would be the form editing an answer because our
                      curation changed. */}
                  {site ? null : (
                    <span className="ml-2 text-meta text-(--color-dim)">
                      no longer in the gallery
                    </span>
                  )}
                </span>

                <span className="shrink-0 text-meta text-(--color-dim) tabular-nums">
                  {pick.score === undefined ? "—" : pick.score} / 7
                </span>

                <button
                  type="button"
                  onClick={() => onEdit(pick.siteKey)}
                  className="min-h-11 shrink-0 text-meta inline-flex min-h-11 items-center text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-focus)"
                >
                  Edit
                </button>
              </div>

              {pick.note?.trim() ? (
                <p className="mt-2 line-clamp-2 text-meta leading-[1.55] text-(--color-dim)">
                  {pick.note}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
