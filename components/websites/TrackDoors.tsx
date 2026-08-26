import Link from "next/link";
import { doors } from "@/content/websites-chooser";

/**
 * The two doors, and the whole page.
 *
 * NO GRADIENT ANYWHERE IN HERE, deliberately. No ring, no gradient button, not
 * even on the price. The chooser sits in front of two pages that each spend
 * their one ring on their price card, and a chooser that out-dresses them is a
 * chooser that has quietly become the destination. Flat cards, hairlines, and
 * the site's standard card hover.
 *
 * The whole card is the link. A CTA button inside a card that is itself a
 * button gives a phone user two targets for one action and a screen reader two
 * announcements of the same destination — so the "See this build" line at the
 * bottom is text, styled to read as the affordance, inside the one anchor.
 *
 * Each card leads with the DELIVERABLE and states applicability underneath.
 * That ordering is Taylor's ruling and it overruled naming the doors by buyer:
 * a profession can genuinely sit in both tracks, so "who it's for" cannot carry
 * the distinction, while "what you get handed" always can. Price is on the card
 * because a buyer who recognises neither description can still self-select on
 * the number.
 *
 * Sizing is set by the worst moment on this page: a trades buyer on a 375px
 * phone, seconds after a call, who was told to go to tayloraucoin.com/websites
 * and has just discovered one more click. Both doors have to be reachable
 * without a deliberate scroll, which is why the copy is short, the padding is
 * tighter than the site's card default below md, and the heading above is a
 * signpost rather than a hero.
 */
export default function TrackDoors() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
      {doors.map((door) => (
        <Link
          key={door.href}
          href={door.href}
          className="group flex flex-col rounded-(--radius) border border-(--color-spec-border) bg-(--color-spec-bg) p-5 transition-[transform,border-color,background-color] duration-(--dur-fast) ease-(--ease-out) hover:-translate-y-px hover:border-[rgb(232_185_97/.34)] motion-reduce:hover:translate-y-0 md:p-6"
        >
          <h2 className="font-display text-[19px] font-medium leading-[1.25] tracking-[-.02em] text-(--color-ink) md:text-[21px]">
            {door.name}
          </h2>

          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
            <span className="font-display text-[22px] font-medium tracking-[-.02em] text-(--color-c2)">
              {door.price}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[.18em] text-(--color-dim)">
              {door.priceNote}
            </span>
          </div>

          <p className="mt-3.5 text-[14.5px] font-light leading-[1.6] text-(--color-body)">
            {door.body}
          </p>

          {/* Applicability, not a gate. Nobody is turned away at a door on the
              strength of a job title, and the wording says "most applicable"
              rather than "for" so that a reader who half-fits keeps reading
              instead of bouncing to the other card. */}
          <p className="mt-3.5 border-t border-(--color-faint) pt-3.5 text-[13px] font-light leading-[1.55] text-(--color-dim)">
            {door.audience}
          </p>

          <span className="mt-4 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) transition-colors duration-(--dur-fast) group-hover:text-(--color-c3)">
            {door.cta} →
          </span>
        </Link>
      ))}
    </div>
  );
}
