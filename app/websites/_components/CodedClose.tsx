import { BookCallLink } from "@/components/site/BookCallLink";
import { closing } from "@/content/websites-coded";
import { AGORA, SITE } from "@/lib/config";
import { TEXT_LINK } from "./Section";
import { StartLink } from "./StartLink";

/** BookCallLink drawn as a text link, as PageClose's "Prefer a call?". */
const CALL_AS_TEXT =
  "h-auto! min-h-6 border-0! bg-transparent! px-0! text-(--color-ink)! underline decoration-(--color-mark) decoration-1 underline-offset-[3px] hover:text-(--color-body)!";

/**
 * The close: Headline line, the primary button, "Book a call first" to /book
 * through BookCallLink (D-SITE-210, 226), phone and email, the entity at Meta.
 * Its own block rather than PageClose, whose call-led forms carry no start
 * button and no phone. At 390 the button is full width and the links stack.
 */
export function CodedClose() {
  return (
    <section
      aria-label="Start"
      className="mt-20 border-t border-(--color-line-soft) pt-12 md:mt-24 md:pt-16"
    >
      <p className="max-w-[34ch] font-display text-(length:--text-h3) leading-[1.3] font-medium tracking-(--tracking-h3) text-(--color-ink) md:max-w-[740px] md:text-[26px]">
        {closing.line}
      </p>
      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:gap-7">
        <StartLink />
        <BookCallLink
          surface="websites"
          placement="close"
          label="Book a call first"
          variant="ghost"
          className={`${CALL_AS_TEXT} self-start md:self-auto`}
        />
        <p className="flex flex-col items-start gap-2 text-(length:--text-small) text-(--color-dim) md:flex-row md:items-center md:gap-2">
          <a href={AGORA.phoneHref} className={TEXT_LINK}>
            {AGORA.phone}
          </a>
          <span aria-hidden className="hidden md:inline">
            ·
          </span>
          <a href={`mailto:${SITE.email}`} className={TEXT_LINK}>
            {SITE.email}
          </a>
        </p>
      </div>
      <p className="mt-6 text-(length:--text-meta) text-(--color-dim)">
        {closing.entity}
      </p>
    </section>
  );
}
