import { diffEveryPack, diffPack, type PackDiff } from "./pack-diff";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-copy";

/**
 * Named `pack-diff-section.tsx` rather than `pack-diff.tsx` because the pure
 * walk beside it is `pack-diff.ts`, and TypeScript resolves `.ts` before `.tsx`
 * for the same basename — an import of "./pack-diff" silently got the data
 * module and reported a missing export.
 *
 * The words that change by pack, at the foot of the document.
 *
 * `ForKinds` shows which kinds are asked a question. This shows which kinds are
 * asked it in *different words* — the case the document cannot show inline,
 * because it renders one pack's strings and there are six packs.
 *
 * Everything here is derived at render from `copyPackFor`, so it cannot drift
 * from what a client reads. The slot paths are the property names in
 * `lib/intake/showcase-copy.ts`, which is the one file the human-hand copy pass
 * edits — so a path is a grep target rather than a description.
 */
export function PackDiffSection({
  flavour,
  everyPack,
}: Readonly<{
  /** The pack this view is reading. Ignored when `everyPack` is set. */
  flavour: ShowcaseFlavour;
  /** The all-kinds overview shows all five non-generic packs. */
  everyPack?: boolean;
}>) {
  const diffs = everyPack ? diffEveryPack() : [diffPack(flavour)];
  const anything = diffs.some((diff) => diff.differences.length > 0);

  return (
    <section className="mt-16 border-t border-(--color-faint) pt-10">
      <p className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
        Appendix
      </p>
      <h2 className="mt-2 font-(family-name:--font-display) text-[24px] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
        Copy that changes by pack
      </h2>
      <p className="mt-2 max-w-[68ch] text-sm text-(--color-dim)">
        The same question, asked in different words. Everything below is read
        live from the copy packs and diffed against the generic floor, so it is
        what a client of that kind actually meets. The paths are the slot names
        in <code>lib/intake/showcase-copy.ts</code>.
      </p>

      {anything ? (
        diffs.map((diff) => <PackBlock key={diff.flavour} diff={diff} />)
      ) : (
        <p className="mt-8 max-w-[68ch] font-body text-[15px] font-light leading-[1.5] text-(--color-dim)">
          This pack says everything the generic floor says. Nothing is reworded
          for it.
        </p>
      )}
    </section>
  );
}

function PackBlock({ diff }: Readonly<{ diff: PackDiff }>) {
  if (diff.differences.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
        {diff.flavour} · {diff.differences.length} slot
        {diff.differences.length === 1 ? "" : "s"}
      </h3>

      <dl className="mt-4 space-y-5">
        {diff.differences.map((difference) => (
          <div key={difference.path}>
            <dt className="font-(family-name:--font-mono) text-[10px] tracking-[.12em] text-(--color-dim)">
              {difference.path}
            </dt>
            <dd className="mt-1.5 max-w-[68ch]">
              {difference.generic === null ? (
                <p className="font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                  No generic floor — this slot exists only on this pack.
                </p>
              ) : (
                <p className="font-body text-[15px] font-light leading-[1.5] text-(--color-dim) line-through decoration-(--color-faint)">
                  {difference.generic}
                </p>
              )}
              <p className="mt-1 font-body text-[15px] font-light leading-[1.5] text-(--color-body)">
                {difference.pack}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
