import Link from "next/link";
import { intakeRoutes } from "@/lib/routes";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { readResumeCookie } from "./_actions/start";
import { Eyebrow } from "./_components/eyebrow";
import { StartForm } from "./_components/start-form";

export const metadata = {
  title: "Start your website build",
  robots: { index: false, follow: false },
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
export default async function IntakeStartPage() {
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
      <Eyebrow>Agora · Website build</Eyebrow>

      <h1 className="font-display text-[clamp(28px,6vw,38px)] font-medium leading-[1.1] tracking-[-.025em] text-(--color-ink)">
        Let&apos;s get your site started.
      </h1>

      <p className="mt-5 max-w-[48ch] font-body text-[16px] font-light leading-[1.66] text-(--color-body)">
        A few details to set things up. The full questionnaire comes next — about
        30 minutes, and you can skip anything you&apos;re not sure about.
      </p>

      {inProgress ? (
        <div className="mt-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
          <p className="font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
            You already started one for{" "}
            <span className="text-(--color-ink)">{inProgress.businessName}</span>.
          </p>
          <p className="mt-3">
            <Link
              href={intakeRoutes.entry(inProgress.token)}
              className="font-mono text-[11px] uppercase tracking-[.10em] text-(--color-c2) underline underline-offset-4 hover:text-(--color-c3)"
            >
              Pick up where you left off →
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <StartForm />
      </div>

      <p className="mt-10 border-t border-(--color-faint) pt-5 font-mono text-[10px] uppercase leading-[1.8] tracking-[.18em] text-(--color-dim)">
        Nothing is charged on this page. Everything you enter is confidential.
      </p>
    </div>
  );
}
