"use client";

import Link from "next/link";
import {
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/Button";
import { track } from "@/lib/analytics/events";
import { siteRoutes } from "@/lib/routes";
import type { CallSurface } from "./nav";

type Placement = "header" | "hero" | "close" | "contact_sent" | "screening_fit";

/**
 * The one call link on the site: always to `/book`, never to Cal.com (A-17,
 * D-SITE-165), always the one label but for the /websites ticket's "Book a
 * call first" (D-SITE-210). It sends `book_call_click` through `track()`
 * only, which stays silent without consent; the link works either way. A
 * null surface renders the link and sends nothing.
 */
export function BookCallLink({
  surface,
  placement,
  slug,
  variant = "primary",
  size = "default",
  label = "Book a 30-minute call",
  className = "",
}: {
  surface: CallSurface | "websites" | null;
  placement: Placement;
  slug?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: "Book a 30-minute call" | "Book a call first";
  className?: string;
}) {
  return (
    <Link
      href={siteRoutes.book}
      className={`${buttonVariants({ variant, size })} ${className}`}
      onClick={() => {
        if (!surface) return;
        track("book_call_click", {
          surface,
          placement,
          ...(slug ? { slug } : {}),
        });
      }}
    >
      {label}
    </Link>
  );
}
