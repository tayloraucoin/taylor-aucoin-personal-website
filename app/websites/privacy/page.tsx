import type { Metadata } from "next";
import LegalArticle from "@/components/websites/legal/LegalArticle";
import LegalPageShell from "@/components/websites/legal/LegalPageShell";
import { privacy } from "@/content/legal";
import { legalRoutes } from "@/lib/routes";
import { socialCard } from "@/lib/metadata";

/**
 * `/websites/privacy` — the privacy policy for the website-build service,
 * scoped to this service on purpose (Taylor's call: the portfolio site
 * around it is a different surface with different stakes).
 *
 * Substantive edits bump `lib/legal/version.ts` alongside the terms — the
 * two documents share a version identity and are accepted together at the
 * deposit.
 */
const description =
  "How Agora Network Technologies handles information in its website-build service.";

/** Same reasoning as the terms page: read mid-payment, forwarded without
 *  thinking, and it must unfurl as Agora rather than as Taylor's job search. */
export const metadata: Metadata = {
  title: "Privacy policy",
  description,
  robots: { index: false, follow: false },
  ...socialCard({ title: "Privacy policy", description }),
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
