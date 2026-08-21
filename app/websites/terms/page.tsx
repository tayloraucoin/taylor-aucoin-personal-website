import type { Metadata } from "next";
import LegalArticle from "@/components/websites/legal/LegalArticle";
import LegalPageShell from "@/components/websites/legal/LegalPageShell";
import { terms } from "@/content/legal";
import { legalRoutes } from "@/lib/routes";

/**
 * `/websites/terms` — the master agreement for the website-build service.
 *
 * Acceptance is by deposit payment (terms §2): the pay screen links here and
 * states that paying agrees. This page is therefore load-bearing in a way no
 * other copy on the site is — its text at a given TERMS_VERSION is what a
 * client agreed to, so substantive edits bump `lib/legal/version.ts`, never
 * ship silently.
 *
 * `noindex` for the same reason `/websites` carries it: direct URL is the
 * distribution model, and nothing under this route should surface in search.
 */
export const metadata: Metadata = {
  title: "Website services terms",
  description:
    "The terms for Agora Network Technologies' website-build service.",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      crossLink={{ href: legalRoutes.privacy, label: "Privacy policy" }}
    >
      <LegalArticle doc={terms} />
    </LegalPageShell>
  );
}
