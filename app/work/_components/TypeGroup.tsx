import type { WorkType } from "@/content/work";
import type { WorkEntry } from "@/lib/work/rows";
import { workIndex } from "./words";
import { WorkRow } from "./WorkRow";

/**
 * One type group (D-SITE-100): label in a 200 column at 1440, stacked above
 * its rows at 390, a hairline between groups. With one chip selected the h2
 * stays, visually hidden, so the outline holds (D-SITE-191).
 */
export function TypeGroup({
  type,
  entries,
  labelHidden,
}: {
  type: WorkType;
  entries: WorkEntry[];
  labelHidden: boolean;
}) {
  return (
    <section className="border-t border-(--color-line-soft) py-8 first:border-t-0 first:pt-0 md:grid md:grid-cols-[200px_1fr] md:gap-x-8 md:py-12 md:first:pt-0">
      <h2
        className={
          labelHidden
            ? "sr-only"
            : "mb-6 text-(length:--text-body) font-semibold text-(--color-ink) md:mb-0"
        }
      >
        {workIndex.groups[type]}
      </h2>
      <ul>
        {entries.map((entry) => (
          <WorkRow key={entry.id} entry={entry} />
        ))}
      </ul>
    </section>
  );
}
