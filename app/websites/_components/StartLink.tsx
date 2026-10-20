import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { ctaLabel, startHref } from "@/content/websites-coded";

/**
 * "Start your site →", the page's one primary action, three times with one
 * label and one destination (D-SITE-210). The arrow is hidden from the name.
 * Full width at 390. No event: only the call fires one here (D-SITE-226).
 */
export function StartLink() {
  const label = ctaLabel.replace(/\s*→$/, "");
  return (
    <Link
      href={startHref}
      className={`${buttonVariants({ variant: "primary" })} w-full gap-1.5 md:w-auto`}
    >
      {label}
      {label !== ctaLabel && <span aria-hidden>→</span>}
    </Link>
  );
}
