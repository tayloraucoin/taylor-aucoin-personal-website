import {
  CapabilityChips,
  type CapabilityChipItem,
} from "@/components/capabilities/CapabilityChips";
import { capabilities } from "@/content/capabilities";
import { problems } from "@/content/home";

/**
 * The chips in Taylor's comfort order, stripped to plain props here on the
 * server so no rating reaches the client (D-SITE-65). A chip with no proof
 * never shows (D-SITE-15).
 */
function chipItems(): CapabilityChipItem[] {
  return capabilities
    .filter((c) => c.chip && c.comfort !== undefined && c.proof?.length)
    .sort((a, b) => b.comfort! - a.comfort!)
    .map((c) => ({
      slug: c.slug,
      name: c.chip!,
      title: c.title,
      tech: c.tech,
      approach: c.approach,
      proof: c.proof!.map(({ label, href, external }) => ({
        label,
        ...(href ? { href } : {}),
        ...(external ? { external } : {}),
      })),
    }));
}

/** Problems I take on (D-SITE-46): heading, its line right, the chips. */
export function ProblemsITakeOn({
  initialOpen,
  initialAll,
}: {
  initialOpen?: string | null;
  initialAll?: boolean;
}) {
  return (
    <section aria-labelledby="problems" className="mt-16 md:mt-24">
      <div className="flex flex-col gap-2 border-b border-(--color-line-soft) pb-6 md:flex-row md:items-end md:justify-between">
        <h2
          id="problems"
          className="font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)"
        >
          {problems.heading}
        </h2>
        <p className="text-(length:--text-meta) text-(--color-dim)">
          {problems.line}
        </p>
      </div>
      <CapabilityChips
        items={chipItems()}
        doneAt={problems.doneAt}
        labels={problems}
        initialOpen={initialOpen}
        initialAll={initialAll}
      />
    </section>
  );
}
