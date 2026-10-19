import { processSteps } from "@/content/websites-coded";
import { LABEL, Section } from "./Section";

/**
 * How it goes: numbered label rows, number and system label in the 240
 * column, the step title (h3) and body beside; step 2's detail lines at Meta.
 * A real sequence, so the numbers stay (canon A-08).
 */
export function ProcessSteps() {
  return (
    <Section id="how-it-goes" heading="How it goes">
      <ol className="mt-8 border-t border-(--color-line-soft)">
        {processSteps.map((step, i) => (
          <li
            key={step.system}
            className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-(--color-line-soft) py-6 md:grid-cols-[240px_minmax(0,640px)]"
          >
            <p className="flex items-baseline gap-4">
              <span className="w-5 shrink-0 text-(length:--text-body) font-medium text-(--color-dim)">
                {i + 1}
              </span>
              <span className={LABEL}>{step.system}</span>
            </p>
            <div>
              <h3 className="font-display text-(length:--text-h4) leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
                {step.title}
              </h3>
              <p className="mt-2 text-(length:--text-body) leading-[1.65] text-(--color-body)">
                {step.body}
              </p>
              {step.detail && (
                <ul className="mt-4 space-y-2">
                  {step.detail.map((line) => (
                    <li
                      key={line}
                      className="text-(length:--text-meta) leading-[1.6] text-(--color-dim) md:text-(length:--text-small)"
                    >
                      {line}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
