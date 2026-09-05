"use client";

import type { ExampleSet } from "@/content/intake-examples";
import {
  EXAMPLE_GROUPS,
  GROUP_ORDER,
} from "@/content/intake-examples/taxonomy";
import { ExampleRow } from "@/app/websites/coded/intake/_components/taste/example-row";

/**
 * The gallery, rendered by the components a client's browser renders.
 *
 * **Not a mock-up of the taste step — the taste step's own row.** Same law as
 * D-ADM-6: there is no second copy of the presentation, so there is nothing to
 * drift. What you see here is what a client meets, including the group titles
 * and one-liners from `taxonomy.ts` and the tag order from `tagsFor`.
 *
 * The pick controls render because they are part of the row and a preview that
 * hid them would be lying about what the row looks like. They do nothing: the
 * handlers are no-ops and nothing is stored, which is the same posture the
 * questions preview takes and for the same reason (D-ADM-5).
 *
 * The set passed in is the **published** one, resolved exactly as a client's
 * would be — so a pack whose switch is off previews as the absent state, which
 * is the thing most worth being able to see before turning it on.
 */
export function GalleryPreview({
  set,
  absentLine,
}: {
  set: ExampleSet;
  absentLine: string;
}) {
  const groups = GROUP_ORDER.map((group) => ({
    group,
    sites: set.sites.filter((site) => site.group === group),
  })).filter((entry) => entry.sites.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-(--radius) border border-(--color-faint) bg-(--color-well) px-3 py-2 text-sm text-(--color-dim)">
        {/* [COPY — draft] — orientation, not a warning. */}
        Preview — this is the taste step&apos;s own gallery. Nothing here saves.
      </p>

      {!set.curated || set.sites.length === 0 ? (
        <p className="max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-dim)">
          {absentLine}
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {groups.map(({ group, sites }) => (
            <section key={group} className="flex flex-col gap-4">
              <header className="flex flex-col gap-1">
                <h3 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
                  {EXAMPLE_GROUPS[group].title}
                </h3>
                <p className="max-w-[52ch] text-sm text-(--color-body)">
                  {EXAMPLE_GROUPS[group].line}
                </p>
              </header>

              <div className="flex flex-col gap-8">
                {sites.map((site) => (
                  <ExampleRow
                    key={site.key}
                    site={site}
                    pick={null}
                    onSave={NOOP}
                    onRemove={NOOP}
                    onSeeMore={NOOP}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

const NOOP = () => undefined;
