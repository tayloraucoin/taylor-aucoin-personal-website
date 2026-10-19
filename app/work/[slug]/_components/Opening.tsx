import Image from "next/image";
import Link from "next/link";
import { selectedWork } from "@/content/home";
import type { CaseStudy, MediaItem } from "@/content/work";
import { siteRoutes } from "@/lib/routes";
import { TEXT_LINK } from "./blocks";

/** The label in sentence case: "MARKETING SITE" reads "Marketing site". */
const sentence = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

/** The first image of the first group, or none (D-SITE-86). */
export function leadArtifact(
  c: CaseStudy,
): { item: MediaItem; caption?: string } | null {
  for (const group of c.media) {
    const item = group.items.find((i) => !i.video && typeof i.src !== "string");
    if (item) {
      return {
        item,
        caption: group.label ? sentence(group.label) : item.caption,
      };
    }
  }
  return null;
}

/**
 * Everything above At a glance: All work, the meta line, the h1, the tagline,
 * the facts ledger and the lead artifact (D-SITE-79).
 */
export function Opening({ c }: { c: CaseStudy }) {
  const lead = leadArtifact(c);
  return (
    <header>
      <Link href={siteRoutes.work} className={TEXT_LINK}>
        All work
      </Link>
      <p className="mt-8 text-(length:--text-meta) text-(--color-dim)">
        {selectedWork.typeLabels[c.type]} · {c.meta}
      </p>
      <h1 className="mt-3 font-display text-[48px] leading-[1.05] font-semibold tracking-(--tracking-display) text-(--color-ink) md:text-(length:--text-display)">
        {c.title}
      </h1>
      <p className="mt-6 max-w-[40ch] text-(length:--text-lede) leading-[1.55] text-(--color-body)">
        {c.tagline}
      </p>
      <FactsLedger facts={c.facts} />
      {lead && lead.item.src && typeof lead.item.src !== "string" && (
        <figure className="mt-12 md:mt-16">
          <Image
            src={lead.item.src}
            alt={lead.item.alt}
            sizes="(min-width: 768px) 1080px, 100vw"
            priority
            className="block h-auto w-full rounded-(--radius) border border-(--color-line-soft)"
          />
          {lead.caption && (
            <figcaption className="mt-3 text-(length:--text-meta) text-(--color-dim)">
              {lead.caption}
            </figcaption>
          )}
        </figure>
      )}
    </header>
  );
}

function FactsLedger({ facts }: { facts: CaseStudy["facts"] }) {
  return (
    <ul className="mt-12 grid border-y border-(--color-line-soft) md:grid-cols-4">
      {facts.map((fact, i) => (
        <li
          key={i}
          className="border-t border-(--color-line-soft) px-0 py-5 first:border-t-0 md:border-t-0 md:border-l md:px-6 md:first:border-l-0 md:first:pl-0"
        >
          {fact.href ? (
            <a
              href={fact.href}
              className="inline-flex min-h-11 items-center [overflow-wrap:anywhere] font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4"
            >
              {fact.value}
            </a>
          ) : (
            <p className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
              {fact.value}
            </p>
          )}
          <p className="mt-1 text-(length:--text-meta) text-(--color-dim)">
            {fact.meta}
          </p>
        </li>
      ))}
    </ul>
  );
}
