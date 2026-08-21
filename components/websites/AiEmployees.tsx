import SectionLabel from "@/components/ui/SectionLabel";
import { aiEmployees } from "@/content/websites";

/**
 * The section that stops this being "a website for $1,200".
 *
 * The million-dollar framing is Taylor's and it is the whole reason this lands
 * with a non-technical reader: it turns an abstract idea they have no hook for
 * ("AI roles") into a concrete one they have already had ("who would I hire").
 * Lead with the question, explain the mechanism second, show four examples
 * third. Reversing that order loses them in the first sentence.
 *
 * Four examples, not a catalogue. The list is per-trade and naming twenty of
 * them would read as filler; naming four that a tradesperson recognises reads
 * as real.
 *
 * Flat spec-bg cards — the ring stays rationed to the price card.
 */
export default function AiEmployees() {
  return (
    <section className="mt-16">
      <SectionLabel>Not just a website</SectionLabel>

      <p className="mt-6 max-w-[62ch] text-[15px] font-light leading-[1.7] text-(--color-ink)">
        {aiEmployees.intro}
      </p>
      <p className="mt-4 max-w-[62ch] text-[15px] font-light leading-[1.7] text-(--color-body)">
        {aiEmployees.how}
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        {aiEmployees.roles.map((r) => (
          <div
            key={r.role}
            className="rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5"
          >
            <span className="block font-mono text-[9px] uppercase tracking-[.24em] text-(--color-c2)">
              {r.role}
            </span>
            <p className="mt-2.5 max-w-[46ch] text-[13.5px] font-light leading-[1.64] text-(--color-body)">
              {r.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-[62ch] border-l border-(--color-faint) pl-5 text-[15px] font-light leading-[1.7] text-(--color-dim)">
        {aiEmployees.note}
      </p>
    </section>
  );
}
