import Link from "next/link";
import { legalRoutes, showcaseIntakeRoutes } from "@/lib/routes";
import { ShowcaseStartForm, type StartFormSeed } from "./showcase-start-form";

/**
 * The coded intake's start screen: h1, lede, the resume offer when the cookie
 * matches (a surface card with a text link, D-SITE-155), the form and the
 * footnote. The route reads the cookie and the engagement; this renders, so
 * the admin preview and the harness can show each state from a fixture.
 */
export function ShowcaseStart({
  promo,
  inProgress,
  invalidEmail,
  seed,
}: {
  promo?: string;
  inProgress: { token: string; name: string } | null;
  /** A fixture's address that fails the check, shown on arrival. */
  invalidEmail?: string;
  /** A fixture's choices, drawn already made (VEN). */
  seed?: StartFormSeed;
}) {
  return (
    <div>
      <h1 className="font-display text-h2 leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)">
        Let&apos;s get your site started.
      </h1>

      <p className="mt-5 max-w-[48ch] text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
        A few details to set things up. The full questionnaire comes next —
        about 45 minutes, and you can skip anything you&apos;re not sure about.
      </p>

      {inProgress ? (
        <div className="mt-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
          <p className="text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
            You already started one as{" "}
            <span className="text-(--color-ink)">{inProgress.name}</span>.
          </p>
          <p className="mt-3">
            <Link
              href={showcaseIntakeRoutes.entry(inProgress.token)}
              className="text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
            >
              Pick up where you left off →
            </Link>
          </p>
        </div>
      ) : null}

      <div className="mt-10">
        <ShowcaseStartForm
          promo={promo}
          invalidEmail={invalidEmail}
          seed={seed}
        />
      </div>

      {/* Notice at the point of collection: this is the first screen that takes
          personal information, so the privacy policy is named here — before the
          pay screen's acceptance line, not only on it. */}
      <p className="mt-10 border-t border-(--color-faint) pt-5 text-meta leading-[1.55] text-(--color-dim)">
        Nothing is charged on this page. Everything you enter is confidential ·{" "}
        <Link
          href={legalRoutes.privacy}
          className="inline-block -my-[15px] py-[15px] text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 hover:decoration-2"
        >
          Privacy
        </Link>
      </p>
    </div>
  );
}
