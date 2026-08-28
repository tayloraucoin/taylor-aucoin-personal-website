import type { Metadata } from "next";
import LegalArticle from "@/components/websites/legal/LegalArticle";
import LegalPageShell from "@/components/websites/legal/LegalPageShell";
import { terms } from "@/content/legal";
import { legalRoutes } from "@/lib/routes";
import { socialCard } from "@/lib/metadata";

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
const description =
  "The terms for Agora Network Technologies' website-build service.";

/**
 * The card is Agora's, not Taylor's. The pay screen links here and paying
 * agrees to it, so a client opens this mid-payment and may well forward it to
 * a partner or a bookkeeper. Without its own card it inherited the root
 * layout's, which unfurled a contract for a website build as an ad for a
 * senior/staff engineer looking for work.
 */
export const metadata: Metadata = {
  title: "Website services terms",
  description,
  robots: { index: false, follow: false },
  ...socialCard({ title: "Website services terms", description }),
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
