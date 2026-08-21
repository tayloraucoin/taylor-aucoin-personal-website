/**
 * Hairline-divided rows: a wide-tracked mono lead label against plain body
 * copy. The inscription register — this is what keeps a list of facts from
 * reading as a brochure bullet list.
 *
 * Promoted out of `services/HowIWork` on its second and third consumer
 * (`/websites` uses it twice). Static markup, no client JS, and it never gates
 * the field's cursor-glow because nothing here is interactive.
 *
 * `tone` is the one variant: `accent` for what is being offered, `quiet` for
 * caveats and terms. Gold is rationed to the former — a caveat in gold reads
 * as a feature, which is the wrong promise.
 */
export type LabelRow = { label: string; body: string };

const toneClass = {
  accent: "text-(--color-c2)",
  quiet: "text-(--color-dim)",
} as const;

export default function LabelRows({
  rows,
  tone = "accent",
}: {
  rows: readonly LabelRow[];
  tone?: keyof typeof toneClass;
}) {
  return (
    <div>
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-1 gap-x-8 gap-y-1.5 border-b border-(--color-faint) py-5 md:grid-cols-[240px_1fr] md:items-baseline"
        >
          <span
            className={`font-mono text-[10px] uppercase tracking-[.24em] ${toneClass[tone]}`}
          >
            {row.label}
          </span>
          <p className="max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
            {row.body}
          </p>
        </div>
      ))}
    </div>
  );
}
