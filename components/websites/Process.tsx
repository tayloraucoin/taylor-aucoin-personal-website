import BulletList from "@/components/ui/BulletList";
import SectionLabel from "@/components/ui/SectionLabel";
import { processSteps } from "@/content/websites";

/**
 * The section both audiences are here for, served by one artifact.
 *
 * A client reads the titles — "You fill out the questionnaire", "You review it
 * live". Someone evaluating Taylor reads the mono taxonomy running down the
 * left rail: structured intake → gap close → brand extraction/primer/build/
 * verification → live preview → DNS cutover → handoff. Neither audience pays
 * for the other's needs and there is one list to maintain.
 *
 * Step 03 carries sub-lines the others don't. It is the step that proves a
 * system exists rather than a workflow, and it is the only place on the page
 * where the extra depth is spent.
 *
 * The platform is never named here — preview-first, platform-name-last. The
 * client learns it at handoff.
 */
export default function Process() {
  return (
    <section className="mt-16">
      <SectionLabel>How it goes</SectionLabel>
      <ol className="mt-2">
        {processSteps.map((step, i) => (
          <li
            key={step.system}
            className="grid grid-cols-1 gap-x-8 border-b border-(--color-faint) py-7 md:grid-cols-[240px_1fr]"
          >
            <div>
              <span className="font-mono text-[10px] tracking-[.2em] text-(--color-c2)">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 max-w-[210px] font-mono text-[9px] uppercase leading-[1.8] tracking-[.24em] text-(--color-dim)">
                {step.system}
              </p>
            </div>

            <div className="mt-3 md:mt-0">
              <h3 className="font-display text-[18px] font-medium tracking-[-.012em] text-(--color-ink)">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[56ch] text-[15px] font-light leading-[1.6] text-(--color-body)">
                {step.body}
              </p>
              {step.detail ? (
                <div className="mt-4">
                  <BulletList items={step.detail} />
                </div>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
