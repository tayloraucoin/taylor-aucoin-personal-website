import Link from "next/link";
import {
  experience,
  type ExperienceEntry,
  type ExperienceGroup,
} from "@/content/about";
import { isWorkPublished, OTHER_BUILDS } from "@/lib/config";
import { siteRoutes } from "@/lib/routes";
import { Row, ROW_LINK, SectionHeading } from "./Row";

const GROUPS: ExperienceGroup[] = [
  "Full-time",
  "Contract and fractional",
  "My own products",
  "Programmes",
];

function RowLink({ entry }: { entry: ExperienceEntry }) {
  if (entry.slug && isWorkPublished(entry.slug)) {
    return (
      <Link href={siteRoutes.caseStudy(entry.slug)} className={ROW_LINK}>
        Read the decision story
        <span className="sr-only">, {entry.name}</span>
      </Link>
    );
  }
  if (entry.anchor) {
    return (
      <a href={`#${entry.anchor}`} className={ROW_LINK}>
        Teaching
      </a>
    );
  }
  return null;
}

/** "Also built": one quiet line, no links (D-SITE-68). */
function AlsoBuilt() {
  return (
    <li className="grid gap-x-8 gap-y-1 border-b border-(--color-line-soft) py-5 md:grid-cols-[240px_1fr] md:items-baseline">
      <span className="text-(length:--text-meta) text-(--color-dim)">
        Also built
      </span>
      <span className="text-(length:--text-small) leading-[1.6] text-(--color-body)">
        {OTHER_BUILDS.map((b, i) => (
          <span key={b}>
            {i > 0 && (
              <span aria-hidden className="px-2 text-(--color-dim)">
                ·
              </span>
            )}
            {b}
          </span>
        ))}
      </span>
    </li>
  );
}

/** Experience reads `content/about.ts`, never `content/work` (D-SITE-197). */
export function Experience() {
  return (
    <section aria-labelledby="experience-heading" className="mt-16 md:mt-24">
      <SectionHeading id="experience-heading">Experience</SectionHeading>
      {GROUPS.map((group) => (
        <div key={group} className="mt-10 first-of-type:mt-8">
          <h3 className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
            {group}
          </h3>
          <ul className="mt-3 border-t border-(--color-line-soft)">
            {experience
              .filter((e) => e.group === group)
              .map((e) => (
                <Row
                  key={e.name}
                  name={e.name}
                  role={e.role}
                  years={e.years}
                  link={<RowLink entry={e} />}
                />
              ))}
            {group === "My own products" && <AlsoBuilt />}
          </ul>
        </div>
      ))}
    </section>
  );
}
