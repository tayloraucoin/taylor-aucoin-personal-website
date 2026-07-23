import type { CaseStudy } from "@/content/work";
import CaseLinks from "@/components/work/CaseLinks";

/**
 * The case study template. Shared by the full page and the intercepted overlay.
 *
 * CRITICAL: this MUST look right when `media` is empty. Taylor has not confirmed
 * he has screenshots, and a beautiful site with four thin case studies reads WORSE
 * to a hiring manager than a plain site with four great ones.
 *
 * So the page leads with WHAT WAS BUILT, then the constraint, decisions, and tradeoffs.
 * That is the only thing here a hiring manager cannot get from a résumé.
 * Media is enrichment, not scaffolding.
 */
export default function CaseBody({ c }: { c: CaseStudy }) {
  return (
    <article className="mx-auto max-w-[1080px] px-[22px] py-14 md:px-14">
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        {c.index}
      </div>
      <h1 className="mb-4 font-display text-[clamp(32px,4.4vw,52px)] font-medium leading-[1.05] tracking-[-.03em] text-(--color-ink)">
        {c.title}
      </h1>

      <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        <span>{c.role}</span>
        <span>{c.period}</span>
      </div>

      <div className="mb-12 flex flex-wrap gap-2">
        {c.stack.map((s) => (
          <span
            key={s}
            className="rounded-(--radius) border border-(--color-faint) px-2.5 py-1 font-mono text-[10px] tracking-[.06em] text-(--color-body)"
          >
            {s}
          </span>
        ))}
      </div>

      <CaseLinks links={c.links} />

      <Section label="What I built">
        {c.built.map((p, i) => (
          <p
            key={i}
            className="mb-4 max-w-[62ch] text-lg font-light leading-[1.7] text-(--color-ink)"
          >
            {p}
          </p>
        ))}
      </Section>

      <Section label="The constraint">
        <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
          {c.constraint}
        </p>
      </Section>

      {/* The section that gets someone hired. Do not let it be thin. */}
      <Section label="Decisions">
        <div className="grid gap-px bg-(--color-faint)">
          {c.decisions.map((d, i) => (
            <div
              key={i}
              className="bg-[rgb(9_12_34/.62)] p-6 backdrop-blur-[8px]"
            >
              <p className="mb-3 font-display text-[17px] font-medium tracking-[-.01em] text-(--color-ink)">
                {d.decision}
              </p>
              <p className="mb-2 max-w-[58ch] text-sm font-light leading-[1.65] text-(--color-body)">
                <span className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                  Instead of{" "}
                </span>
                {d.alternative}
              </p>
              <p className="max-w-[58ch] text-sm font-light leading-[1.65] text-(--color-body)">
                <span className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
                  Why{" "}
                </span>
                {d.why}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {c.broke && (
        <Section label="What broke">
          <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
            {c.broke}
          </p>
        </Section>
      )}

      <Section label="Outcome">
        <p className="max-w-[62ch] text-lg font-light leading-[1.7] text-(--color-ink)">
          {c.outcome}
        </p>
      </Section>

      {/* Renders only if it exists. If it doesn't, the article closes cleanly. */}
      {c.media.length > 0 && (
        <Section label="Interface">
          <div className="grid gap-4">
            {c.media.map((m) => (
              <figure key={m.src}>
                {m.size === "narrow" ? (
                  <div className="flex justify-center rounded-(--radius) border border-(--color-faint) bg-[rgb(3_5_16/.92)] px-6 py-10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.src}
                      alt={m.alt}
                      loading="lazy"
                      className="w-full max-w-[360px] rounded-(--radius) border border-(--color-faint)"
                    />
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={m.src}
                    alt={m.alt}
                    loading="lazy"
                    className="w-full rounded-(--radius) border border-(--color-faint)"
                  />
                )}
                {m.caption && (
                  <figcaption className="mt-2 font-mono text-[10px] uppercase tracking-[.16em] text-(--color-dim)">
                    {m.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-14">
      <div className="mb-5 border-b border-(--color-faint) pb-4 font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
        {label}
      </div>
      {children}
    </section>
  );
}
