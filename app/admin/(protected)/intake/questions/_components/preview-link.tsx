import Link from "next/link";
import { adminRoutes } from "@/lib/routes";

/**
 * "Preview" beside a section's heading.
 *
 * Opens that one section alone, in the client's own column, in a new tab —
 * new tab because the review page is a long scroll someone is working down,
 * and replacing it would cost them their place for every screen they wanted
 * to look at properly (Taylor, 2026-09-04).
 *
 * Styled as the accordion's Hide/Show word is, deliberately: it sits in the
 * same row, it is the same weight of control, and a second visual language for
 * a second control in the same corner would be noise. Gold on hover is the
 * only thing marking it as the one that leaves the page.
 */
export function PreviewLink({
  section,
  query,
  label = "Preview",
}: Readonly<{
  /** A flow band's id, or a step's own key. */
  section: string;
  /** The track, kind, and pack the review page is showing. */
  query: string;
  label?: string;
}>) {
  return (
    <Link
      href={adminRoutes.intakeSectionPreview(section, query)}
      target="_blank"
      rel="noreferrer"
      className="mt-1 flex items-center font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim) transition-colors hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-c2)"
    >
      {label}
    </Link>
  );
}
