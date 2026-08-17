import Link from "next/link";
import GradientRing from "@/components/ui/GradientRing";
import SectionLabel from "@/components/ui/SectionLabel";
import { offers, priceAnchor } from "@/content/services";
import { BOOKING_URL } from "@/lib/config";

/**
 * SVC-03 + SVC-04. Three GradientRing cards — the Capabilities idiom, three
 * across. Equal weight; the flagship gets one extra mono word in its tag, not
 * a bigger card. The price anchor is one quiet line beneath, in the same
 * register as the home page's core-stack line.
 */
export default function OfferCards() {
  return (
    <section className="mt-16">
      <SectionLabel>Three ways in</SectionLabel>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {offers.map((o) => (
          <GradientRing key={o.tag} className="flex flex-col px-6 pb-6 pt-[26px]">
            <span className="mb-3.5 block font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
              {o.tag}
              {o.flagship && " · Flagship"}
            </span>
            <h2 className="mb-1.5 font-display text-[18px] font-medium tracking-[-.012em] text-(--color-ink)">
              {o.title}
            </h2>
            <p className="mb-3.5 font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
              {o.cadence}
            </p>
            <p className="mb-3.5 max-w-[44ch] text-[13.5px] font-light leading-[1.64] text-(--color-body)">
              {o.bestFor}
            </p>
            <ul className="mb-5 space-y-1.5">
              {o.includes.map((line) => (
                <li key={line} className="flex gap-2.5">
                  <span
                    aria-hidden
                    className="mt-[8px] h-[3px] w-[3px] shrink-0 bg-(--color-dim)"
                  />
                  <span className="max-w-[44ch] text-[13.5px] font-light leading-[1.64] text-(--color-body)">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
            >
              Start here →
            </Link>
          </GradientRing>
        ))}
      </div>
      <p className="mt-5 max-w-[64ch] text-[13.5px] font-light leading-[1.64] text-(--color-dim)">
        {priceAnchor}
      </p>
    </section>
  );
}
