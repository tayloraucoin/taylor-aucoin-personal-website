import type { Metadata } from "next";
import RootField from "@/components/field/RootField";
import Footer from "@/components/sections/Footer";
import TrackDoors from "@/components/websites/TrackDoors";
import TrackPicker from "@/components/websites/TrackPicker";
import { chooser, chooserFallback } from "@/content/websites-chooser";
import { AGORA } from "@/lib/config";

/**
 * `/websites` — the chooser.
 *
 * This URL used to be the local-business sales page, which now lives at
 * `/websites/platform`. The move costs every pre-warmed trades buyer one extra
 * click, and Taylor accepted that cost explicitly rather than gating the change
 * behind a redirect window: the people mid-funnel who were given this address
 * land here and click once.
 *
 * Everything about this page is spent making that click free. Two doors, no
 * scroll on a phone, no cleverness, and no gradient. The doors name the
 * DELIVERABLE rather than the buyer, because a profession can genuinely sit in
 * both tracks. See docs/websites/PORTFOLIO-MARKETING-EXECUTION-SCOPE.md R-1.
 *
 * The intake questionnaire did NOT move with the platform page. It stays at
 * `/websites/intake` so no live resume link breaks and no cookie scope shifts
 * under a client who is mid-form. A client who trims that URL back now lands
 * here rather than on the page explaining what they are filling in. That is the
 * one regression in this change and it was the cheaper of the two options.
 *
 * NOT LINKED FROM ANYWHERE, AND NOT INDEXED — same reasoning as the pages
 * behind it. Until this line earns money, nobody evaluating Taylor for a
 * senior/staff role should stumble into it. If you add a `sitemap.ts` later,
 * exclude this route and both children by hand.
 */
const description =
  "Two ways I build websites: a site on a managed platform you run yourself, or a site built in code that you own outright.";

export const metadata: Metadata = {
  title: "Websites",
  description,
  robots: { index: false, follow: false },
};

export default function WebsitesChooserPage() {
  return (
    <main className="relative mx-auto max-w-[1080px] px-[22px] py-10 md:px-14 md:py-14">
      <RootField />

      {/* A signpost, not a hero. The h1 runs smaller than either sales page's
          because nothing is being sold on this screen — the job is to get
          someone through a door and let the page behind it do the work. Every
          pixel this heading takes is a pixel the second door loses on a
          375px phone. */}
      <section className="relative">
        <div className="mb-5 flex items-center gap-3.5 font-mono text-[10px] uppercase tracking-[.30em] text-(--color-dim)">
          <span>{chooser.eyebrow}</span>
          <span
            aria-hidden
            className="h-px max-w-[220px] flex-1"
            style={{
              background:
                "linear-gradient(90deg, rgb(232 185 97 / .30), transparent)",
            }}
          />
        </div>

        <h1 className="mb-4 font-display text-[clamp(27px,3.6vw,38px)] font-medium leading-[1.08] tracking-[-.03em] text-(--color-ink)">
          {chooser.title}
        </h1>

        <p className="mb-7 max-w-[52ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
          {chooser.sub}
        </p>
      </section>

      <TrackDoors />

      {/* The overlap valve, in two escalating steps. First the picker: pick your
          job, get the track. Collapsed, so it costs the doors above it nothing.
          Then the phone, for the cases a fixed list was never going to settle.
          The number is a tap-to-call target because the least-resilient reader
          on this page is holding a phone. */}
      <TrackPicker />

      <p className="mt-4 max-w-[56ch] text-[13.5px] font-light leading-[1.64] text-(--color-dim)">
        {chooserFallback}{" "}
        <a
          href={AGORA.phoneHref}
          className="whitespace-nowrap text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
        >
          {AGORA.phone}
        </a>
      </p>

      <Footer />
    </main>
  );
}
