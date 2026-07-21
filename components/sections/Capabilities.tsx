import GradientRing from "@/components/ui/GradientRing";

/**
 * The "what I can do for you" block Taylor wanted after seeing danielsantos.co —
 * but tuned for a hiring manager, not a consulting client.
 * PLACEHOLDER copy.
 */
const cards = [
  {
    tag: "01 / Architecture",
    title: "Systems, end to end",
    body: "Turborepo monorepos, typed contracts from Postgres to the pixel, and infrastructure a team of one can actually operate.",
  },
  {
    tag: "02 / Product",
    title: "Judgment, not tickets",
    body: "I've been the founder and the first engineer. I know which corners are load-bearing and which ones are decoration.",
  },
];

export default function Capabilities() {
  return (
    <section className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2">
      {cards.map((c) => (
        <GradientRing key={c.tag} className="px-6 pb-6 pt-[26px]">
          <span className="mb-3.5 block font-mono text-[9px] uppercase tracking-[.24em] text-[--color-c2]">
            {c.tag}
          </span>
          <h2 className="mb-2 font-display text-[18px] font-medium tracking-[-.012em] text-[--color-ink]">
            {c.title}
          </h2>
          <p className="max-w-[44ch] text-[13.5px] font-light leading-[1.64] text-[--color-body]">
            {c.body}
          </p>
        </GradientRing>
      ))}
    </section>
  );
}
