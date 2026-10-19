import { replyLine, steps } from "@/content/services";
import { H2 } from "./shared";

export function HowToStart() {
  return (
    <section aria-labelledby="start-heading" className="mt-16 md:mt-24">
      <H2 id="start-heading">How to start</H2>
      <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="grid grid-cols-[16px_1fr] gap-x-4 md:block"
          >
            <span className="text-(length:--text-meta) text-(--color-dim)">
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-(length:--text-h4) leading-[1.25] font-semibold tracking-(--tracking-h4) text-(--color-ink) md:mt-1">
                {s.title}
              </h3>
              <p className="mt-2 max-w-[44ch] text-(length:--text-small) leading-[1.6] text-(--color-body)">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-(length:--text-meta) text-(--color-dim)">
        {replyLine}
      </p>
    </section>
  );
}
