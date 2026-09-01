import { stepsFor } from "@/lib/intake/tracks";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import type { IntakeTrackKey } from "@/lib/types/intake";

import { StepAccess } from "@/app/websites/intake/_components/steps/step-access";
import { StepBusiness } from "@/app/websites/intake/_components/steps/step-business";
import { StepOperations } from "@/app/websites/intake/_components/steps/step-operations";
import { StepPhotos } from "@/app/websites/intake/_components/steps/step-photos";
import { StepPositioning } from "@/app/websites/intake/_components/steps/step-positioning";
import { StepPricing } from "@/app/websites/intake/_components/steps/step-pricing";
import { StepReviews } from "@/app/websites/intake/_components/steps/step-reviews";
import { StepTeam } from "@/app/websites/intake/_components/steps/step-team";
import { StepVoice } from "@/app/websites/intake/_components/steps/step-voice";

import { StepAbout } from "@/app/websites/coded/intake/_components/steps/step-about";
import { StepAccess as ShowcaseAccess } from "@/app/websites/coded/intake/_components/steps/step-access";
import { StepAudience } from "@/app/websites/coded/intake/_components/steps/step-audience";
import { StepExperience } from "@/app/websites/coded/intake/_components/steps/step-experience";
import { StepMedia } from "@/app/websites/coded/intake/_components/steps/step-media";
import { StepSite } from "@/app/websites/coded/intake/_components/steps/step-site";
import { StepTaste } from "@/app/websites/coded/intake/_components/steps/step-taste";
import { StepWords } from "@/app/websites/coded/intake/_components/steps/step-words";
import { StepWork } from "@/app/websites/coded/intake/_components/steps/step-work";

/**
 * Every step of one track, stacked, in order.
 *
 * **These are the production step components.** That is the point of the
 * surface and it is not an optimisation: question copy exists exactly once in
 * this repo — in the component that asks it — so this page cannot drift from
 * what a client reads, because there is nothing here to drift from (D-ADM-6).
 *
 * What that costs is the dispatch below, which repeats the switch each track's
 * `[step]/page.tsx` already has. That is duplication of a routing table, not of
 * copy, and it is the price of not editing eighteen components to add a prop
 * they would only need here. Sharing it would mean the client route importing
 * something whose other consumer is an admin screen; the client route is the
 * one that must stay simple.
 *
 * Every prop is empty. There is no engagement behind a preview, so `token` is
 * the empty string, answers are `{}`, files are empty lists, and prefill is
 * blank strings — never a sample business, which `docs/intake/ADMIN-HANDOFF.md`
 * treats as a legal posture rather than a style note.
 */
export function QuestionStack({
  track,
  flavour,
}: Readonly<{ track: IntakeTrackKey; flavour: ShowcaseFlavour }>) {
  const steps = stepsFor(track, flavour);

  return (
    <ol className="mt-10">
      {steps.map((step) => (
        <li
          key={step.key}
          className="border-t border-(--color-faint) py-10 first:border-t-0 first:pt-0"
        >
          <p className="font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            Step {step.number} of {steps.length} · {step.key}
          </p>

          <h2 className="mt-2 font-(family-name:--font-display) text-[28px] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)">
            {step.title}
          </h2>

          {step.intro ? (
            <p
              className={`mt-3 max-w-[48ch] text-[16px] font-light leading-[1.6] ${
                step.emphasis === "ink"
                  ? "text-(--color-ink)"
                  : "text-(--color-body)"
              }`}
            >
              {step.intro}
            </p>
          ) : null}

          <div className="mt-6 max-w-2xl">
            <StepBody track={track} stepKey={step.key} flavour={flavour} />
          </div>
        </li>
      ))}
    </ol>
  );
}

const NO_TOKEN = "";
const NO_ANSWERS: Record<string, unknown> = {};
const NO_FILES = [] as const;

function StepBody({
  track,
  stepKey,
  flavour,
}: Readonly<{
  track: IntakeTrackKey;
  stepKey: string;
  flavour: ShowcaseFlavour;
}>) {
  const shared = { token: NO_TOKEN, initial: NO_ANSWERS };

  if (track === "durable") {
    switch (stepKey) {
      case "business":
        return (
          <StepBusiness
            {...shared}
            prefill={{
              businessName: "",
              contactName: "",
              contactEmail: "",
              contactPhone: null,
            }}
          />
        );
      case "pricing":
        return <StepPricing {...shared} />;
      case "operations":
        return <StepOperations {...shared} />;
      case "positioning":
        return <StepPositioning {...shared} />;
      case "voice":
        return (
          <StepVoice
            {...shared}
            files={{
              voiceNote: NO_FILES,
              screenshots: NO_FILES,
              writing: NO_FILES,
            }}
          />
        );
      case "photos":
        return (
          <StepPhotos
            {...shared}
            files={{
              logo: NO_FILES,
              brandAssets: NO_FILES,
              photos: NO_FILES,
              portrait: NO_FILES,
            }}
          />
        );
      case "reviews":
        return <StepReviews {...shared} files={{ screenshots: NO_FILES }} />;
      case "team":
        return <StepTeam {...shared} />;
      case "access":
        return <StepAccess {...shared} purchasedExtras={[]} />;
      default:
        return <UnrenderedStep stepKey={stepKey} />;
    }
  }

  switch (stepKey) {
    case "about":
      return (
        <StepAbout
          {...shared}
          prefill={{ contactName: "", contactEmail: "", contactPhone: null }}
        />
      );
    case "audience":
      return <StepAudience {...shared} />;
    case "experience":
      return <StepExperience {...shared} />;
    case "work":
      return (
        <StepWork {...shared} flavour={flavour} projectFiles={NO_FILES} />
      );
    case "words":
      return (
        <StepWords {...shared} files={{ voiceNote: NO_FILES, writing: NO_FILES }} />
      );
    case "taste":
      return (
        <StepTaste
          {...shared}
          flavour={flavour}
          files={{ inspiration: NO_FILES }}
        />
      );
    case "media":
      return (
        <StepMedia
          {...shared}
          files={{
            portrait: NO_FILES,
            behindScenes: NO_FILES,
            laurels: NO_FILES,
            logo: NO_FILES,
            brandAssets: NO_FILES,
          }}
        />
      );
    case "site":
      return <StepSite {...shared} />;
    case "access":
      return <ShowcaseAccess {...shared} flavour={flavour} />;
    default:
      return <UnrenderedStep stepKey={stepKey} />;
  }
}

/**
 * Unreachable while the dispatch covers both registries, and loud if it ever
 * stops being. A step silently missing from a top-to-bottom review is the one
 * defect this surface cannot have, so the gap says so rather than rendering
 * nothing.
 */
function UnrenderedStep({ stepKey }: Readonly<{ stepKey: string }>) {
  return (
    <p className="text-sm text-(--color-c2)">
      No preview wired for step &ldquo;{stepKey}&rdquo;. The step registry and
      this dispatch have diverged.
    </p>
  );
}
