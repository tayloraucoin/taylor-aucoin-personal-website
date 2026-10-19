import Link from "next/link";
import { BookCallLink } from "@/components/site/BookCallLink";
import { buttonVariants } from "@/components/ui/Button";
import { availability, workWithMeWords } from "@/content/services";
import { SITE } from "@/lib/config";
import { siteRoutes } from "@/lib/routes";

/** Eyebrow, h1, availability, sub; the note leads, the call is the ghost beside it. */
export function Hero() {
  return (
    <section aria-label="Work with me">
      <p className="flex items-center gap-3.5 text-(length:--text-label) font-medium tracking-(--tracking-label) text-(--color-dim) uppercase">
        <span aria-hidden className="h-px w-6 bg-(--color-rule)" />
        {SITE.location} · {workWithMeWords.eyebrowSuffix}
      </p>
      <h1 className="mt-5 font-display text-[length:clamp(48px,8vw,var(--text-display))] leading-[1.02] font-medium tracking-(--tracking-display) text-(--color-ink)">
        Work with me
      </h1>
      <p className="mt-4 text-(length:--text-meta) text-(--color-dim)">
        Available now · {availability}
      </p>
      <p className="mt-8 max-w-[56ch] text-(length:--text-lede) leading-[1.6] text-(--color-ink)">
        {workWithMeWords.sub}
      </p>
      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <Link
          href={siteRoutes.contact}
          className={`${buttonVariants({ variant: "primary" })} w-full md:w-auto`}
        >
          {workWithMeWords.note}
        </Link>
        <BookCallLink
          surface="services"
          placement="hero"
          variant="ghost"
          className="w-full md:w-auto"
        />
      </div>
    </section>
  );
}
