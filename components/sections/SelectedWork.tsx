import Link from "next/link";
import SectionLabel from "@/components/ui/SectionLabel";
import { publishedWork } from "@/content/work";
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
      {publishedWork.map((w, i) => (
        <Link
          key={w.slug}
          href={`/work/${w.slug}`}
          className="group relative grid grid-cols-1 gap-y-1.5 overflow-hidden border-b border-(--color-faint) px-1 py-5 pr-8 transition-[padding] duration-(--dur-base) ease-(--ease-out) hover:pl-4 sm:grid-cols-[26px_1fr_auto] sm:items-baseline sm:gap-x-[22px]"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-0 transition-[width] duration-(--dur-slow) ease-(--ease-out) group-hover:w-full"
            style={{
              background:
                "linear-gradient(90deg, rgb(232 185 97 / .16), rgb(139 123 232 / .05) 55%, transparent)",
            }}
          />

          {/* Mobile: block stack (number → title → …). Desktop: grid cells 1 & 2
              on the title baseline — `leading-none` fixes number line-box height;
              `sm:-translate-y-0.5` is the shared optical nudge on desktop only. */}
          <span
            className="relative mb-1.5 block font-mono text-[11px] leading-none text-(--color-c2) sm:col-start-1 sm:row-start-1 sm:mb-0 sm:-translate-y-0.5"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="relative block font-display text-2xl tracking-[-.015em] text-(--color-ink) sm:col-start-2 sm:row-start-1">
            {w.title}
          </span>

          {/* Tagline — under the title only on desktop, not the tags column. */}
          <span className="relative max-w-[58ch] text-[13px] font-light leading-[1.55] text-(--color-dim) sm:col-start-2 sm:row-start-2">
            {w.tagline}
          </span>

          {/* Tags + role share one block so their 8px gap is independent of
              the outer grid's row gap. Flush left on mobile; right-aligned
              and spanning both title/tagline rows on desktop. */}
          <div className="relative flex flex-col gap-2 sm:col-start-3 sm:row-start-1 sm:row-span-2 sm:items-end sm:self-start">
            <span className="font-mono text-[10.5px] tracking-[.05em] text-(--color-dim) sm:text-right">
              {w.meta}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[.24em] text-(--color-role-label) sm:text-right">
              {w.roleLabel}
            </span>
          </div>

          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-1 flex -translate-x-2 items-center text-[15px] text-(--color-c2) opacity-0 transition-all duration-(--dur-base) ease-(--ease-out) group-hover:translate-x-0 group-hover:opacity-100"
          >
            →
          </span>
        </Link>
      ))}
      <p className="mt-5 font-mono text-[10px] uppercase leading-[2] tracking-[.18em] text-(--color-dim)">
        <span className="font-medium text-(--color-meta-label)">
          Also built:
        </span>{" "}
        {OTHER_BUILDS.join(" · ")}
      </p>
    </section>
  );
}
