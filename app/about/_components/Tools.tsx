import { toolGroups } from "@/content/stack";
import { SITE } from "@/lib/config";
import { ROW_LINK, SectionHeading } from "./Row";

/** Tools `#tools`: core items only, five groups, the résumé link beside the heading (D-SITE-72). */
export function Tools() {
  return (
    <section
      id="tools"
      aria-labelledby="tools-heading"
      className="mt-16 scroll-mt-24 md:mt-24"
    >
      <SectionHeading
        id="tools-heading"
        tabIndex={-1}
        aside={
          <a href={SITE.resume} className={ROW_LINK}>
            The full list is in my résumé [draft]
            <span className="sr-only"> (PDF)</span>
          </a>
        }
      >
        Tools
      </SectionHeading>
      <dl>
        {toolGroups.map((g) => (
          <div
            key={g.label}
            className="grid gap-x-8 gap-y-1 border-b border-(--color-line-soft) py-5 md:grid-cols-[240px_1fr]"
          >
            <dt className="font-medium text-(--color-ink)">{g.label}</dt>
            <dd className="text-(length:--text-small) leading-[1.6] text-(--color-body)">
              {g.items.map((it, i) => (
                <span key={it.name}>
                  {i > 0 && (
                    <>
                      {" "}
                      <span aria-hidden className="px-1 text-(--color-dim)">
                        ·
                      </span>{" "}
                    </>
                  )}
                  {it.label ?? it.name}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
