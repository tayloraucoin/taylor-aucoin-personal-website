import Link from "next/link";
import GradientRing from "@/components/ui/GradientRing";
import { stack } from "@/content/stack";

/**
 * The full stack taxonomy. Shared by the /stack page and the intercepted
 * overlay opened from the home page's "Full stack →" link.
 *
 * The home page carries the curated one-liner; this is the complete inventory.
 * Categories render as GradientRing cards — the same moving-border idiom as
 * the Capabilities cards. Items flagged `core` in content/stack.ts render
 * bold; the legend under the h1 explains the emphasis.
 *
 * `overlay` — true when rendered inside the intercepted-route Overlay. The
 * home link is hidden there: parallel-route slots keep rendering their last
 * matched content on soft navigation, so a `<Link href="/">` inside the
 * overlay changes the URL without closing the panel — a dead-looking click.
 * Esc, backdrop, and the close chip already cover dismissal in that context.
 */
export default function StackBody({ overlay = false }: { overlay?: boolean }) {
  return (
    <article className="mx-auto max-w-[1080px] px-[22px] py-14 md:px-14">
      {!overlay && (
        <Link
          href="/"
          className="mb-8 inline-block font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors duration-(--dur-fast) hover:text-(--color-ink)"
        >
          ← tayloraucoin.com
        </Link>
      )}
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        Taylor Aucoin
      </div>
      <h1 className="mb-4 font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-.03em] text-(--color-ink)">
        Full stack
      </h1>
      <p className="mb-10 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        The <strong className="font-medium text-(--color-ink)">bold</strong>{" "}
        items are my core stack
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {stack.map((cat) => (
          <GradientRing key={cat.label} className="px-6 pb-6 pt-[26px]">
            <h2 className="mb-3.5 font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
              {cat.label}
            </h2>
            <p className="text-[13.5px] font-light leading-[1.75] text-(--color-body)">
              {cat.items.map((item, i) => {
                const name = typeof item === "string" ? item : item.name;
                const core = typeof item !== "string" && item.core;
                return (
                  <span key={name}>
                    {i > 0 && " · "}
                    {core ? (
                      <strong className="font-medium text-(--color-ink)">
                        {name}
                      </strong>
                    ) : (
                      name
                    )}
                  </span>
                );
              })}
            </p>
          </GradientRing>
        ))}
      </div>
    </article>
  );
}
