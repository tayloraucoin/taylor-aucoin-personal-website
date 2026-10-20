import { howIThink } from "@/content/about";
import { SectionHeading } from "./Row";

export function HowIThink() {
  return (
    <section aria-labelledby="think-heading" className="mt-16 md:mt-24">
      <SectionHeading id="think-heading">How I think</SectionHeading>
      <div>
        {howIThink.map((item) => (
          <div
            key={item.lead}
            className="grid gap-x-8 gap-y-1.5 border-b border-(--color-line-soft) py-6 md:grid-cols-[240px_1fr]"
          >
            <h3 className="font-medium text-(--color-ink)">{item.lead}</h3>
            <p className="max-w-[620px] text-(length:--text-small) leading-[1.6] text-(--color-body)">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
