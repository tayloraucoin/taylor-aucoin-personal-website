import { socialCard } from "@/lib/metadata";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { readShowcaseResumeCookie } from "./_actions/start";
import { ShowcaseStart } from "./_components/showcase-start";

/* This page is public and tokenless, so unlike the layout's neutral card it
 * can say something useful. It is still noindex: the URL is handed out, never
 * found. */
const description =
  "A few details to get set up, then the questionnaire. Nothing is charged until you've seen what you're starting.";

export const metadata = {
  title: "Start your build",
  description,
  robots: { index: false, follow: false },
  ...socialCard({ title: "Start your build", description }),
};

/**
 * The public start page for the showcase track.
 *
 * Stable and tokenless, like the durable track's: a client's own submission
 * mints the token everything after it hangs off, so nothing has to be
 * provisioned by hand before someone can begin.
 *
 * Someone who already started on this device is offered their place back
 * rather than a blank form, so a lost tab is not a lost engagement.
 *
 * The heading is the durable page's, unchanged — it is approved copy for the
 * same act and reusing it beats inventing a second way to say it. The line
 * beneath carries the v2 doc's own numbers.
 * `[COPY — pending Taylor's read-aloud pass]`
 */
export default async function ShowcaseIntakeStartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const promoParam = (await searchParams).promo;
  const promo = Array.isArray(promoParam) ? promoParam[0] : promoParam;
  const token = await readShowcaseResumeCookie();
  let inProgress: { token: string; name: string } | null = null;

  if (token) {
    try {
      const engagement = await requireEngagement(token);
      if (!engagement.completedAt && engagement.track === "showcase") {
        inProgress = { token, name: engagement.contactName };
      }
    } catch (error) {
      // An expired or re-issued link just means no offer to resume.
      if (!(error instanceof EngagementNotFoundError)) throw error;
    }
  }

  return <ShowcaseStart promo={promo} inProgress={inProgress} />;
}
