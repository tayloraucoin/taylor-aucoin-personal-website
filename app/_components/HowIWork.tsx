import { ToolsRow } from "@/app/_components/ToolsRow";
import { howIWork } from "@/content/home";

/**
 * How I work (D-SITE-58): five numbered steps in a row at 1440, stacked with
 * a fixed number column at 390, then the AI block's three lists shown as
 * outputs, never opened, then the tools row (feedback round 2).
 */
export function HowIWork() {
  return (
    <section aria-labelledby="how-heading" className="mt-16 md:mt-24">
      <h2
        id="how-heading"
        className="border-b border-(--color-line-soft) pb-6 font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)"
      >
        {howIWork.heading}
      </h2>
      <ol className="mt-8 grid gap-4 md:mt-10 md:grid-cols-5 md:gap-6">
        {howIWork.steps.map((step, i) => (
          <li
            key={step}
            className="grid grid-cols-[2rem_1fr] items-baseline md:block"
          >
            <span className="text-(length:--text-meta) text-(--color-dim) md:block">
              {i + 1}
            </span>
            <span className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink) md:mt-1 md:block">
              {step}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
        {howIWork.ai.map((list) => (
          <div key={list.label}>
            <h3 className="text-(length:--text-label) font-medium tracking-(--tracking-label) text-(--color-dim) uppercase">
              {list.label}
            </h3>
            <ul className="mt-3 space-y-2">
              {list.items.map((item) => (
                <li
                  key={item}
                  className="text-(length:--text-small) leading-[1.6] text-(--color-body)"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ToolsRow />
    </section>
  );
}
