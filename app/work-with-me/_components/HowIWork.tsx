import { howIWork, whatImNot } from "@/content/services";
import { H2 } from "./shared";

export function HowIWork() {
  return (
    <section aria-labelledby="how-heading" className="mt-16 md:mt-24">
      <H2 id="how-heading">How I work</H2>
      <ul>
        {howIWork.map((r) => (
          <li
            key={r.lead}
            className="grid gap-x-8 gap-y-1 border-b border-(--color-line-soft) py-5 md:grid-cols-[240px_1fr]"
          >
            <h3 className="font-medium text-(--color-ink)">{r.lead}</h3>
            <p className="text-(length:--text-small) leading-[1.6] text-(--color-body)">
              {r.body}
            </p>
          </li>
        ))}
        <li className="grid gap-x-8 gap-y-1 py-5 md:grid-cols-[240px_1fr]">
          <p className="text-(length:--text-meta) text-(--color-dim)">
            What I&rsquo;m not
          </p>
          <div className="space-y-1 text-(length:--text-small) leading-[1.6] text-(--color-body)">
            {whatImNot.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        </li>
      </ul>
    </section>
  );
}
