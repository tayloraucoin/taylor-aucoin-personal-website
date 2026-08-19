import Image from "next/image";
import BulletList from "@/components/ui/BulletList";
import SectionLabel from "@/components/ui/SectionLabel";
import CleanCoastGallery from "@/components/websites/CleanCoastGallery";
import { cleanCoast } from "@/content/websites-clean-coast";

/**
 * The centrepiece — and it needs no image assets to work.
 *
 * The strongest artifact from this build is the logo → palette extraction, and
 * rendering it as live CSS swatches from the real hex values does more than a
 * screenshot would: it ships without waiting on a capture, it stays sharp at
 * any zoom, and it reads as visibly SYSTEMATIC rather than decorative — which
 * is the actual claim being made.
 *
 * Everything optional closes cleanly when absent, same law as the case-study
 * template: no logo, no screenshots, no testimonial, no live link — the prose
 * and the palette carry the section unaided. Nothing ever says "coming soon".
 *
 * The site is NEVER iframed. Framing may be blocked outright, mobile iframes
 * behave badly, and it would pollute the client's analytics with traffic from
 * this page.
 *
 * Two gates, deliberately separate — see content/websites-clean-coast.ts.
 */
export default function CleanCoastCase() {
  if (!cleanCoast.published) return null;

  return (
    <section id="clean-coast" className="mt-16 scroll-mt-8">
      <SectionLabel>Case study</SectionLabel>

      <h2 className="mt-6 font-display text-[clamp(24px,3.2vw,32px)] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
        {cleanCoast.business}
      </h2>
      <p className="mt-3 max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
        {cleanCoast.what}
      </p>
      <p className="mt-5 max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
        {cleanCoast.intro}
      </p>

      {/* Screenshots are the argument; the live site is the proof. A buyer who
          wants to poke at the real thing should not have to hunt for it, so the
          link sits with the captures rather than at the end of a column. */}
      {cleanCoast.liveUrl ? (
        <p className="mt-5">
          <a
            href={cleanCoast.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
          >
            Open the live site →
          </a>
        </p>
      ) : null}

      <CleanCoastGallery />

      <PaletteArtifact />

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-c2)">
            What got built
          </p>
          <BulletList items={cleanCoast.built} />
        </div>
        <div>
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-c2)">
            Outcome
          </p>
          <p className="max-w-[48ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
            {cleanCoast.outcome}
          </p>

          {cleanCoast.testimonial ? (
            <blockquote className="mt-6 border-l border-(--color-faint) pl-5">
              <p className="max-w-[48ch] text-[15px] font-light leading-[1.7] text-(--color-ink)">
                “{cleanCoast.testimonial.quote}”
              </p>
              <footer className="mt-2.5 font-mono text-[9px] uppercase tracking-[.24em] text-(--color-dim)">
                {cleanCoast.testimonial.attribution}
              </footer>
            </blockquote>
          ) : null}


        </div>
      </div>
    </section>
  );
}

/**
 * The logo, if one exists, beside the system pulled out of it.
 *
 * Swatches are aria-hidden and every colour they show is stated as real text,
 * so colour is never the sole carrier of meaning. Each carries a --color-faint
 * hairline so the pale end of the ramp does not float on the dark ground.
 */
function PaletteArtifact() {
  return (
    <div className="mt-8 rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5 md:p-7">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        {cleanCoast.logo ? (
          <Image
            src={cleanCoast.logo}
            alt={`${cleanCoast.business} logo`}
            width={112}
            height={112}
            className="h-[72px] w-auto"
          />
        ) : null}
        <p className="font-mono text-[10px] uppercase tracking-[.24em] text-(--color-c2)">
          Logo → extracted palette
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-6 md:grid-cols-4">
        {cleanCoast.brandColors.map((color) => (
          <div key={color.hex}>
            <div
              aria-hidden
              className="h-14 w-full rounded-(--radius) border border-(--color-faint)"
              style={{ background: color.hex }}
            />
            <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-ink)">
              {color.name}
            </p>
            <p className="mt-1 font-mono text-[10px] tabular-nums tracking-[.08em] text-(--color-c2)">
              {color.hex}
            </p>
            <p className="mt-1.5 text-[12px] font-light leading-[1.5] text-(--color-dim)">
              {color.role}
            </p>
          </div>
        ))}
      </div>

      {/* Ramps are strips, not labelled chips. Eight labelled swatches at
          375px gives each about 40px, which cannot carry a legible hex — and
          the ramp is a gradient of SYSTEM, so the individual steps are not the
          point. The four colours that are the point get full chips above. */}
      <div className="mt-8 space-y-5">
        {cleanCoast.ramps.map((ramp) => (
          <div key={ramp.name}>
            <p className="font-mono text-[9px] uppercase tracking-[.24em] text-(--color-dim)">
              {ramp.name} · 100–800
            </p>
            <div
              aria-hidden
              className="mt-2 flex overflow-hidden rounded-(--radius) border border-(--color-faint)"
            >
              {ramp.steps.map((hex) => (
                <div key={hex} className="h-9 flex-1" style={{ background: hex }} />
              ))}
            </div>
            <div aria-hidden className="mt-1 flex gap-px">
              {ramp.steps.map((hex, i) => (
                <div key={hex} className="flex-1">
                  {i === ramp.brandStep ? (
                    <div className="h-[2px] bg-(--color-c2)" />
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-[64ch] text-[13.5px] font-light leading-[1.64] text-(--color-dim)">
        {cleanCoast.rampNote}
      </p>
    </div>
  );
}
