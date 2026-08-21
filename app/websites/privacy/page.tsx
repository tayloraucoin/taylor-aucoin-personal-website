import type { Metadata } from "next";
import LegalArticle from "@/components/websites/legal/LegalArticle";
import LegalPageShell from "@/components/websites/legal/LegalPageShell";
import { privacy } from "@/content/legal";
import { legalRoutes } from "@/lib/routes";

/**
 * `/websites/privacy` — the privacy policy for the website-build service,
 * scoped to this service on purpose (Taylor's call: the portfolio site
 * around it is a different surface with different stakes).
 *
 * Substantive edits bump `lib/legal/version.ts` alongside the terms — the
 * two documents share a version identity and are accepted together at the
 * deposit.
 */
export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Agora Network Technologies handles information in its website-build service.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      crossLink={{ href: legalRoutes.terms, label: "Website services terms" }}
    >
      <LegalArticle doc={privacy} />
    </LegalPageShell>
  );
}
