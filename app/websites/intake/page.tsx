import Link from "next/link";
import { socialCard } from "@/lib/metadata";
import { intakeRoutes, legalRoutes } from "@/lib/routes";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { readResumeCookie } from "./_actions/start";
import { StartForm } from "./_components/start-form";

/* This page is public and tokenless, so unlike the layout's neutral card it
 * can say something useful. It is still noindex: the URL is handed out, never
 * found. */
const description =
  "A few details to get set up, then the questionnaire. Nothing is charged until you've seen what you're starting.";

export const metadata = {
  title: "Start your website build",
  description,
  robots: { index: false, follow: false },
  ...socialCard({ title: "Start your website build", description }),
};

/**
 * The one link Taylor sends: `tayloraucoin.com/intake`.
 *
 * Stable and public, so nothing has to be provisioned before a client can
 * begin. Their submission is what mints the token everything afterwards hangs
 * off, which means the routing tree below this page is per-client while this
 * page never changes.
 *
 * A client who already started on this device is offered their place back
 * rather than a blank form, so a lost tab is not a lost engagement.
 */
export default async function IntakeStartPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const promoParam = (await searchParams).promo;
  const promo = Array.isArray(promoParam) ? promoParam[0] : promoParam;
  const token = await readResumeCookie();
  let inProgress: { token: string; businessName: string } | null = null;

  if (token) {
    try {
      const engagement = await requireEngagement(token);
      if (!engagement.completedAt) {
        inProgress = { token, businessName: engagement.businessName };
      }
    } catch (error) {
      // An expired or re-issued link just means no offer to resume.
      if (!(error instanceof EngagementNotFoundError)) throw error;
    }
  }

  return (
    <div>
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        Let&apos;s get your site started.
      </h1>

      <p className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-body">
        A few details to set things up. The full questionnaire comes next —
        about 30 minutes, and you can skip anything you&apos;re not sure about.
      </p>

      {inProgress ? (
        <div className="mt-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
          <p className="text-[16px] leading-[1.6] text-(--color-body) sm:text-body">
            You already started one for{" "}
            <span className="text-(--color-ink)">
              {inProgress.businessName}
            </span>
            .
          </p>
          <p className="mt-3">
            <Link
              href={intakeRoutes.entry(inProgress.token)}
              className="text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
            >
              Pick up where you left off →
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <StartForm promo={promo} />
      </div>

      {/* Notice at the point of collection: this is the first screen that
          takes personal information, so the privacy policy is named here —
          before the pay screen's acceptance line, not only on it. */}
      <p className="mt-10 border-t border-(--color-faint) pt-5 text-meta leading-[1.55] text-(--color-dim)">
        Nothing is charged on this page. Everything you enter is confidential ·{" "}
        <Link
          href={legalRoutes.privacy}
          className="inline-flex min-h-11 items-center text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
        >
          Privacy
        </Link>
      </p>
    </div>
  );
}
