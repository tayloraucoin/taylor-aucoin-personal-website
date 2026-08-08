import type { CaseStudy } from "@/content/work";
import CaseLinks from "@/components/work/CaseLinks";
import LabelCard from "@/components/ui/LabelCard";
import DecisionCard from "@/components/ui/DecisionCard";
import BulletList from "@/components/ui/BulletList";

/**
 * The case study template. Shared by the full page and the intercepted overlay.
 *
 * CRITICAL: this MUST look right when `media` is empty. Taylor has not confirmed
 * he has screenshots, and a beautiful site with four thin case studies reads WORSE
 * to a hiring manager than a plain site with four great ones.
 *
 * Section order: context (at a glance, brief/constraint, process), then decisions
 * and what was built, then tradeoffs and outcome. Media is enrichment, not scaffolding.
 *
 * Brief / process / built / broke / outcome each accept either a plain string
 * (the original shape — still used as-is by every case study besides the
 * family office platform) or a structured shape with an intro paragraph plus
 * sub-headers/bullets/cards. Branch on `typeof` before rendering either.
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

      {c.atAGlance && c.atAGlance.length > 0 && (
        <Section label="At a glance">
          <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5">
            {c.atAGlance.map((row, i, rows) => (
              <LabelCard
                key={row.label}
                label={row.label}
                padding="compact"
                className={
                  i === rows.length - 1 ? "md:col-span-2" : undefined
                }
              >
                {row.value}
              </LabelCard>
            ))}
          </div>
        </Section>
      )}

      {c.brief &&
        (typeof c.brief === "string" ? (
          <Section label="The brief">
            <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
              {c.brief}
            </p>
          </Section>
        ) : (
          <Section label="The brief">
            <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
              {c.brief.intro}
            </p>
            {c.brief.groups.map((g) => (
              <div key={g.header}>
                <div className="mb-3 mt-7 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-ink)">
                  {g.header}
                </div>
                <BulletList items={g.bullets} />
              </div>
            ))}
          </Section>
        ))}

      {c.constraint && (
        <Section label="The constraint">
          <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
            {c.constraint}
          </p>
        </Section>
      )}

      {c.process &&
        (typeof c.process === "string" ? (
          <Section label="Process">
            <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
              {c.process}
            </p>
          </Section>
        ) : (
          <Section label="Process">
            <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
              {c.process.intro}
            </p>
            {c.process.sections.map((s) => (
              <div key={s.header}>
                <h3 className="mb-3 mt-7 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-ink)">
                  {s.header}
                </h3>
                <p className="mb-3 max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
                  {s.intro}
                </p>
                <BulletList items={s.bullets} />
              </div>
            ))}
          </Section>
        ))}

      {/* The section that gets someone hired. Do not let it be thin. */}
      <Section label="Decisions">
        <div className="grid gap-5">
          {c.decisions.map((d, i) => (
            <DecisionCard key={i} d={d} />
          ))}
        </div>
      </Section>

      {Array.isArray(c.built) ? (
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
      ) : (
        <Section label="What I built">
          <p className="mb-8 max-w-[62ch] text-lg font-light leading-[1.7] text-(--color-ink)">
            {c.built.intro}
          </p>
          <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2">
            {c.built.cards.map((card) => (
              <LabelCard key={card.label} label={card.label} padding="compact">
                {card.body}
              </LabelCard>
            ))}
          </div>
        </Section>
      )}

      {c.broke &&
        (typeof c.broke === "string" ? (
          <Section label="What broke">
            <p className="max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
              {c.broke}
            </p>
          </Section>
        ) : (
          <Section label="What broke">
            <p className="mb-6 max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
              {c.broke.intro}
            </p>
            <div className="grid grid-cols-1 gap-5">
              {c.broke.categories.map((cat) => (
                <LabelCard key={cat.chip} label={cat.chip} padding="compact">
                  {cat.body}
                </LabelCard>
              ))}
            </div>
            {c.broke.closing && (
              <p className="mt-6 max-w-[62ch] font-light leading-[1.7] text-(--color-body)">
                {c.broke.closing}
              </p>
            )}
          </Section>
        ))}

      {typeof c.outcome === "string" ? (
        <Section label="Outcome">
          <p className="max-w-[62ch] text-lg font-light leading-[1.7] text-(--color-ink)">
            {c.outcome}
          </p>
        </Section>
      ) : (
        <Section label="Outcome">
          <p className="mb-5 max-w-[62ch] text-lg font-light leading-[1.7] text-(--color-ink)">
            {c.outcome.intro}
          </p>
          <BulletList items={c.outcome.bullets} />
        </Section>
      )}

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
      <div className="mb-5 border-b border-(--color-faint) pb-4 font-mono text-[12px] font-medium uppercase tracking-[.28em] text-(--color-ink)">
        {label}
      </div>
      {children}
    </section>
  );
}
