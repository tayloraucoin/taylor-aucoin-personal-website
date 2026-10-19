import { offTheClock } from "@/content/about";
import { SectionHeading } from "./Row";

export function OffTheClock() {
  return (
    <section aria-labelledby="off-heading" className="mt-16 md:mt-24">
      <SectionHeading id="off-heading">Off the clock</SectionHeading>
      <div className="mt-8 max-w-[640px] space-y-5">
        {offTheClock.map((para, i) => (
          <p
            key={i}
            className="text-(length:--text-body) leading-[1.6] text-(--color-body)"
          >
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
