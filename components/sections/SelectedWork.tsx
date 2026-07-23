import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { work } from "@/content/work";
import { OTHER_BUILDS } from "@/lib/config";

/**
 * The saidalachgar.dev pattern: clickable rows that open a full-screen case panel.
 * Rows are <Link>, not divs — the overlay is an intercepting route, so the URL is
 * real, shareable, and indexable. That is the whole reason this pattern was chosen.
 */
export default function SelectedWork() {
  return (
    <section id="work" className="mt-16 scroll-mt-16">
      <SectionLabel>Selected work</SectionLabel>
      {work.map((w) => (
        <Link
          key={w.slug}
          href={`/work/${w.slug}`}
          className="group relative flex items-baseline gap-[22px] overflow-hidden border-b border-(--color-faint) px-1 py-6 transition-[padding] duration-(--dur-base) ease-(--ease-out) hover:pl-4"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-0 transition-[width] duration-(--dur-slow) ease-(--ease-out) group-hover:w-full"
            style={{
              background:
                "linear-gradient(90deg, rgb(232 185 97 / .16), rgb(139 123 232 / .05) 55%, transparent)",
            }}
          />
          <span className="relative min-w-[26px] font-mono text-[11px] text-(--color-c2)">
            {w.index}
          </span>
          <span className="relative flex-1 font-display text-2xl tracking-[-.015em] text-(--color-ink)">
            {w.title}
          </span>
          <span className="relative hidden font-mono text-[10.5px] tracking-[.05em] text-(--color-dim) sm:inline">
            {w.meta}
          </span>
          <span className="relative -translate-x-2 text-[15px] text-(--color-c2) opacity-0 transition-all duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0 group-hover:opacity-100">
            →
          </span>
        </Link>
      ))}
      <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        Also built: {OTHER_BUILDS.join(" · ")}
      </p>
    </section>
  );
}
