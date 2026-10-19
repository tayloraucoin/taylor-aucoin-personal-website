import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { SITE } from "@/lib/config";
import { siteRoutes } from "@/lib/routes";
import { BookCallLink } from "./BookCallLink";
import type { CallSurface } from "./nav";

const TEXT_LINK =
  "inline-flex min-h-11 items-center text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-[3px] transition-colors duration-(--dur-fast) hover:text-(--color-body)";

/** The "Prefer a call?" link: BookCallLink, drawn as a text link, not a button. */
const CALL_AS_TEXT =
  "h-auto! min-h-11 border-0! bg-transparent! px-0! text-(--color-ink)! underline decoration-(--color-mark) decoration-1 underline-offset-[3px] hover:text-(--color-body)!";

/**
 * The close every page ends on (D-SITE-74, 130, 174): a hairline, the page's
 * closing line, availability, then the actions. The page passes its own line
 * and availability; this holds no page's copy.
 *
 * - `form="call"` (default): the call is the one primary action, then the
 *   résumé when `resume` is set, then "Not ready to book?" with "Send a note".
 * - `form="note"` (Work with me): "Send a note" is the one primary action,
 *   then "Prefer a call?" with the call as a text link. No résumé.
 *
 * The call is always `BookCallLink` with placement `close`; there is no email
 * address anywhere in the block (D-SITE-174).
 */
export function PageClose({
  line,
  availability,
  surface,
  slug,
  form = "call",
  resume = false,
  lineSize = "headline",
  lineAs: Line = "p",
  noteLabel = "Send a note",
}: {
  line: string;
  /** The text after "Available now · ". */
  availability: string;
  surface: CallSurface;
  /** The case study's slug, for the event. */
  slug?: string;
  form?: "call" | "note";
  /** Show "Résumé (PDF)"; call-led form only. */
  resume?: boolean;
  /** Headline, or Heading 3 for /capabilities. */
  lineSize?: "headline" | "h3";
  lineAs?: "p" | "h2" | "h3";
  /** The note-led button's label, which carries Work with me's [draft] mark. */
  noteLabel?: string;
}) {
  return (
    <section
      data-page-close={form}
      className="mx-auto w-full max-w-[1192px] px-[22px] md:px-14"
    >
      <div className="border-t border-(--color-line-soft) pt-12 pb-20 md:pt-16 md:pb-28">
        <Line
          className={`max-w-[34ch] font-medium text-(--color-ink) md:max-w-[780px] ${
            lineSize === "h3"
              ? "text-(length:--text-h3) leading-[1.3]"
              : "text-(length:--text-headline) leading-[1.25]"
          }`}
        >
          {line}
        </Line>
        <p className="mt-4 text-(length:--text-meta) text-(--color-dim)">
          Available now · {availability}
        </p>
        {form === "call" ? (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-1">
            <BookCallLink surface={surface} slug={slug} placement="close" />
            {resume && (
              <a href={SITE.resume} className={TEXT_LINK}>
                Résumé (PDF)
              </a>
            )}
            <p className="flex basis-full flex-wrap items-center gap-x-2 text-(length:--text-small) text-(--color-dim) md:basis-auto">
              Not ready to book?
              <Link href={siteRoutes.contact} className={TEXT_LINK}>
                Send a note
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-1">
            <Link
              href={siteRoutes.contact}
              className={buttonVariants({ variant: "primary" })}
            >
              {noteLabel}
            </Link>
            <p className="flex flex-wrap items-center gap-x-2 text-(length:--text-small) text-(--color-dim)">
              Prefer a call?
              <BookCallLink
                surface={surface}
                slug={slug}
                placement="close"
                variant="ghost"
                className={CALL_AS_TEXT}
              />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
