import type { CaseStudy } from "@/content/work";
import {
  Block,
  Bullets,
  host,
  LedgerRow,
  LedgerRows,
  Prose,
  RowText,
  RowTitle,
  TEXT_LINK,
} from "./blocks";

const LABEL =
  "text-(length:--text-label) font-medium tracking-(--tracking-label) text-(--color-dim) uppercase";

/** The brief: an intro, then two groups under their own heads. */
export function Brief({ brief }: { brief: CaseStudy["brief"] }) {
  if (!brief) return null;
  if (typeof brief === "string") {
    return (
      <Block title="The brief">
        <Prose>{brief}</Prose>
      </Block>
    );
  }
  return (
    <Block title="The brief">
      <Prose tone="ink">{brief.intro}</Prose>
      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
        {brief.groups.map((group) => (
          <div key={group.header}>
            <RowTitle>{group.header}</RowTitle>
            <ul className="mt-4 border-b border-(--color-line-soft)">
              {group.bullets.map((item) => (
                <li
                  key={item}
                  className="border-t border-(--color-line-soft) py-4 text-[16px] leading-[1.6] text-(--color-body) md:text-(length:--text-small)"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Block>
  );
}

/**
 * What I built as text surfaces. SITE-16 gives it the study's media format;
 * until then it reads as `no-artifacts` draws it: the intro and the surface
 * rows, no screens, no gallery.
 */
export function WhatIBuilt({ built }: { built: CaseStudy["built"] }) {
  if (Array.isArray(built)) {
    return (
      <Block title="What I built">
        {built.map((p, i) => (
          <Prose key={i} tone="ink">
            {p}
          </Prose>
        ))}
      </Block>
    );
  }
  return (
    <Block title="What I built">
      <Prose tone="ink">{built.intro}</Prose>
      <LedgerRows>
        {built.cards.map((card) => (
          <LedgerRow key={card.label} label={<RowTitle>{card.label}</RowTitle>}>
            <RowText>{card.body}</RowText>
            {card.link && (
              <a href={card.link.href} className={TEXT_LINK}>
                {card.link.label}
              </a>
            )}
          </LedgerRow>
        ))}
      </LedgerRows>
    </Block>
  );
}

export function ProcessRows({ process }: { process: CaseStudy["process"] }) {
  if (!process) return null;
  if (typeof process === "string") {
    return (
      <Block title="Process">
        <Prose>{process}</Prose>
      </Block>
    );
  }
  return (
    <Block title="Process">
      <Prose tone="ink">{process.intro}</Prose>
      <LedgerRows>
        {process.sections.map((section) => (
          <LedgerRow
            key={section.header}
            label={
              <>
                <RowTitle>{section.header}</RowTitle>
                <p className="mt-2 text-(length:--text-small) leading-[1.6] text-(--color-dim)">
                  {section.intro}
                </p>
              </>
            }
          >
            <Bullets items={section.bullets} />
          </LedgerRow>
        ))}
      </LedgerRows>
    </Block>
  );
}

export function DecisionRows({
  decisions,
}: {
  decisions: CaseStudy["decisions"];
}) {
  if (decisions.length === 0) return null;
  return (
    <Block title="Decisions">
      <LedgerRows>
        {decisions.map((d) => (
          <LedgerRow
            key={d.decision}
            label={d.chip ? <p className={LABEL}>{d.chip}</p> : <span />}
          >
            <RowTitle>{d.decision}</RowTitle>
            <p className={`mt-5 ${LABEL}`}>Instead of</p>
            <RowText>{d.alternative}</RowText>
            <p className={`mt-5 ${LABEL}`}>Why</p>
            <RowText>{d.why}</RowText>
          </LedgerRow>
        ))}
      </LedgerRows>
    </Block>
  );
}

export function WhatBroke({ broke }: { broke: CaseStudy["broke"] }) {
  if (!broke) return null;
  if (typeof broke === "string") {
    return (
      <Block title="What broke">
        <Prose>{broke}</Prose>
      </Block>
    );
  }
  return (
    <Block title="What broke">
      <Prose tone="ink">{broke.intro}</Prose>
      <LedgerRows>
        {broke.categories.map((cat) => (
          <LedgerRow key={cat.chip} label={<RowTitle>{cat.chip}</RowTitle>}>
            <RowText>{cat.body}</RowText>
          </LedgerRow>
        ))}
      </LedgerRows>
      {broke.closing && <Prose>{broke.closing}</Prose>}
    </Block>
  );
}

/** Outcome: the paragraph, the bullets, the live link last (D-SITE-86). */
export function Outcome({ c }: { c: CaseStudy }) {
  const live = c.facts[3].href;
  return (
    <Block title="Outcome">
      {typeof c.outcome === "string" ? (
        <Prose tone="ink">{c.outcome}</Prose>
      ) : (
        <>
          <Prose tone="ink">{c.outcome.intro}</Prose>
          <div className="mt-8">
            <Bullets items={c.outcome.bullets} />
          </div>
        </>
      )}
      {live && (
        <p className="mt-6">
          <a href={live} className={TEXT_LINK}>
            {host(live)}
          </a>
        </p>
      )}
    </Block>
  );
}
