import Image from "next/image";
import LabelCard from "@/components/ui/LabelCard";
import SectionLabel from "@/components/ui/SectionLabel";
import { codedCase } from "@/content/websites-coded-case";

/**
 * The coded track's case study. RENDERS NOTHING TODAY, and that is the correct
 * behaviour rather than a gap waiting to be filled with something.
 *
 * The first client's site does not exist yet. The section either has its
 * content or does not exist: no "coming soon", no skeleton, no sample build,
 * no stock screenshot standing in for a real one. That law is inherited from
 * the platform page, and it is what makes an empty state on this site read as
 * hospitality rather than as an apology.
 *
 * The structure exists now so that publishing is a content edit. Every piece is
 * independently absent-able: no shots, no testimonial, and no live link each
 * close cleanly on their own, and with all three gone the prose carries the
 * section unaided. The testimonial is null until a real person says a real
 * thing, because it would be the only testimonial on this page and the only one
 * on a page has to be genuine.
 *
 * The site is NEVER iframed. Framing may be blocked outright, mobile iframes
 * behave badly, and it would pollute the client's own analytics with traffic
 * from this page. Screenshots plus a live link is the treatment.
 *
 * Phones lead in the gallery when there are shots. Not a layout preference: the
 * people deciding about a filmmaker are largely holding a phone, and leading
 * with desktop would be leading with the view they are least likely to have.
 */
export default function CodedCase() {
  if (!codedCase.published) return null;

  return (
    <section id="case-study" className="mt-16 scroll-mt-8">
      <SectionLabel>Case study</SectionLabel>

      <h2 className="mt-6 font-display text-[clamp(24px,3.2vw,32px)] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
        {codedCase.client}
      </h2>
      <p className="mt-3 max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
        {codedCase.what}
      </p>
      <p className="mt-5 max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
        {codedCase.intro}
      </p>

      {codedCase.liveUrl ? (
        <p className="mt-5">
          <a
            href={codedCase.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) hover:text-(--color-c3)"
          >
            Open the live site →
          </a>
        </p>
      ) : null}

      {/* Every capture sits on a dark panel with a hairline. These are
          screenshots of somebody else's site dropped onto this ground; without
          the panel they glare and butt straight into the page gradient. */}
      {codedCase.shots.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {codedCase.shots.map((shot) => (
            <figure
              key={shot.alt}
              className="rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-3"
            >
              {/* w-full, never w-auto — see the next/image sizing trap in
                  CLAUDE.md. Static imports carry intrinsic dimensions, so the
                  layout box is reserved before the image loads. */}
              <Image
                src={shot.src}
                alt={shot.alt}
                className="w-full rounded-[calc(var(--radius)-4px)]"
              />
              <figcaption className="mt-2.5 font-mono text-[9px] uppercase tracking-[.18em] text-(--color-dim)">
                {shot.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      ) : null}

      {codedCase.built.length > 0 ? (
        <div className="mt-10">
          <p className="font-mono text-[10px] uppercase tracking-[.24em] text-(--color-dim)">
            What got built
          </p>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {codedCase.built.map((row, i) => (
              <LabelCard key={row.label} index={i + 1} label={row.label}>
                {row.body}
              </LabelCard>
            ))}
          </div>
        </div>
      ) : null}

      {codedCase.outcome ? (
        <div className="mt-8 border-t border-(--color-faint) pt-6">
          <p className="max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
            {codedCase.outcome}
          </p>
        </div>
      ) : null}

      {codedCase.testimonial ? (
        <figure className="mt-8 border-l border-(--color-faint) pl-5">
          <blockquote className="max-w-[56ch] text-[15px] font-light leading-[1.7] text-(--color-ink)">
            {codedCase.testimonial.quote}
          </blockquote>
          <figcaption className="mt-3 font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
            {codedCase.testimonial.attribution}
          </figcaption>
        </figure>
      ) : null}
    </section>
  );
}
