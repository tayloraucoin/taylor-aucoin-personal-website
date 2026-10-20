import { ResumeLink } from "@/components/site/ResumeLink";
import { toolGroups } from "@/content/stack";
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
          <span className="flex flex-wrap items-center gap-x-5">
            <ResumeLink className={ROW_LINK} alternate>
              The full list is in my résumé
              <span className="sr-only"> (PDF)</span>
            </ResumeLink>
          </span>
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
