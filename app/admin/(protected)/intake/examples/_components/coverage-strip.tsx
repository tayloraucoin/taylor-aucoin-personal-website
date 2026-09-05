import { EXAMPLE_GROUPS } from "@/content/intake-examples/taxonomy";
import type { PackCoverage } from "@/lib/intake/example-packs";

/**
 * What the set is missing — the reason this screen is not a table.
 *
 * A list tells you what you have. It does not tell you that you have nineteen
 * dark sites and nothing warm, which is the only fact that decides which site
 * to add next. `content/intake-examples/film.ts` said it plainly before it was
 * deleted: a set that fills only two groups has already decided for the client.
 *
 * **Numbers in the mono register, hairlines, no bars.** A chart here would be
 * at home in a generic dashboard template, which is the drift test's whole
 * question, and the site's own instrument grammar reads better at this size.
 *
 * The gaps are **said, not coloured**. A red zero on a screen about taste is
 * the escalation the alarm test exists to catch, and a hue you have to learn is
 * worse than a sentence you can read. Neither advisory ever blocks anything.
 */
export function CoverageStrip({
  coverage,
  publishedCount,
}: {
  coverage: PackCoverage;
  publishedCount: number;
}) {
  const empty = coverage.groups
    .filter((group) => group.count === 0)
    .map((group) => EXAMPLE_GROUPS[group.key as keyof typeof EXAMPLE_GROUPS].title);

  return (
    <section className="flex flex-col gap-5 border-y border-(--color-faint) py-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
          Groups
        </h2>
        <ul className="grid gap-x-8 gap-y-1 md:grid-cols-2">
          {coverage.groups.map((group) => (
            <li
              key={group.key}
              className="flex items-baseline justify-between gap-4"
            >
              <span className="text-sm text-(--color-body)">
                {
                  EXAMPLE_GROUPS[group.key as keyof typeof EXAMPLE_GROUPS]
                    .title
                }
              </span>
              <span
                className={`font-(family-name:--font-mono) text-xs ${
                  group.count > 0 ? "text-(--color-ink)" : "text-(--color-dim)"
                }`}
              >
                {group.count}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <dl className="flex flex-col gap-1">
        <Axis label="Ground" counts={coverage.ground} />
        <Axis label="Motion" counts={coverage.motion} />
        <Axis label="Density" counts={coverage.density} />
      </dl>

      {publishedCount > 0 ? (
        <div className="flex flex-col gap-1 text-sm text-(--color-body)">
          {empty.length > 0 ? (
            /* [COPY — draft] */
            <p>Nothing yet in {empty.join(", ")}.</p>
          ) : null}
          {publishedCount < 12 ? (
            /* [COPY — draft] — film.ts's own curation guidance, stated once. */
            <p>
              {publishedCount} published. The set reads best at 12&ndash;24.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function Axis({
  label,
  counts,
}: {
  label: string;
  counts: Record<string, number>;
}) {
  const entries = Object.entries(counts);

  return (
    <div className="flex flex-wrap items-baseline gap-x-4">
      <dt className="min-w-[5rem] font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
        {label}
      </dt>
      <dd className="font-(family-name:--font-mono) text-xs text-(--color-body)">
        {entries.length === 0
          ? "—"
          : entries
              .map(([value, count]) => `${value} ${count}`)
              .join(" · ")}
      </dd>
    </div>
  );
}
