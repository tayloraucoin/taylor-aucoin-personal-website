import { notFound, redirect } from "next/navigation";
import { findStep } from "@/lib/intake/steps";
import { intakeRoutes } from "@/lib/routes";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { listUploads, readStepAnswers } from "@/server/services/submission";
import { FooterSaveIndicator, SaveStateProvider } from "../../_lib/save-state";
import { LinkUnavailable } from "../../_components/link-unavailable";
import { RecordStepReached } from "../../_components/record-step-reached";
import { StepAccess } from "../../_components/steps/step-access";
import { StepBusiness } from "../../_components/steps/step-business";
import { StepOperations } from "../../_components/steps/step-operations";
import { StepPhotos } from "../../_components/steps/step-photos";
import { StepPositioning } from "../../_components/steps/step-positioning";
import { StepPricing } from "../../_components/steps/step-pricing";
import { StepReviews } from "../../_components/steps/step-reviews";
import { StepTeam } from "../../_components/steps/step-team";
import { StepVoice } from "../../_components/steps/step-voice";
import { StepShell } from "../../_components/step-shell";

/**
 * One questionnaire step.
 *
 * The slug is validated against the step registry rather than parsed, so the
 * URL space stays exactly nine wide and a typo lands on a 404 instead of a
 * blank shell claiming to be "step NaN of 9".
 *
 * An unpaid engagement is bounced back to the entry route: the deposit is step
 * zero, and a client should not be able to skip it by editing the address bar.
 *
 * Answers and any already-delivered files are read here on the server, so a
 * client returning to a step sees their work immediately with no loading
 * state.
 */
export default async function IntakeStepPage({
  params,
}: {
  params: Promise<{ token: string; step: string }>;
}) {
  const { token, step: slug } = await params;

  const step = findStep(slug);
  if (!step) notFound();

  let engagement;
  try {
    engagement = await requireEngagement(token);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return <LinkUnavailable expired={error.reason === "expired"} />;
    }
    throw error;
  }

  if (engagement.depositRequired && !engagement.paidAt) {
    redirect(intakeRoutes.entry(token));
  }

  const initial = readStepAnswers(engagement.answers, step.key);
  const uploadsFor = (fieldKey: string) => listUploads(engagement.id, fieldKey);

  async function body() {
    switch (step!.key) {
      case "business":
        return (
          <StepBusiness
            token={token}
            initial={initial}
            prefill={{
              businessName: engagement!.businessName,
              contactName: engagement!.contactName,
              contactEmail: engagement!.contactEmail,
              contactPhone: engagement!.contactPhone,
            }}
          />
        );
      case "pricing":
        return <StepPricing token={token} initial={initial} />;
      case "operations":
        return <StepOperations token={token} initial={initial} />;
      case "positioning":
        return <StepPositioning token={token} initial={initial} />;
      case "voice":
        return (
          <StepVoice
            token={token}
            initial={initial}
            files={{
              voiceNote: await uploadsFor("voice_note"),
              screenshots: await uploadsFor("screenshots"),
              writing: await uploadsFor("writing"),
            }}
          />
        );
      case "photos":
        return (
          <StepPhotos
            token={token}
            initial={initial}
            files={{
              logo: await uploadsFor("logo"),
              brandAssets: await uploadsFor("brand_assets"),
              photos: await uploadsFor("photos"),
              portrait: await uploadsFor("portrait"),
            }}
          />
        );
      case "reviews":
        return (
          <StepReviews
            token={token}
            initial={initial}
            files={{ screenshots: await uploadsFor("review_screenshots") }}
          />
        );
      case "team":
        return <StepTeam token={token} initial={initial} />;
      case "access":
        return <StepAccess token={token} initial={initial} />;
    }
  }

  return (
    <SaveStateProvider>
      <RecordStepReached token={token} stepNumber={step.number} />

      <StepShell token={token} step={step} saveSlot={<FooterSaveIndicator />}>
        {await body()}
      </StepShell>
    </SaveStateProvider>
  );
}
