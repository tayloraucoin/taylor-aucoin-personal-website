import { notFound, redirect } from "next/navigation";
import { findStep, flavourFor } from "@/lib/intake/tracks";
import { showcaseIntakeRoutes } from "@/lib/routes";
import {
  EngagementNotFoundError,
  requireEngagement,
} from "@/server/services/engagement";
import { listUploads, readStepAnswers } from "@/server/services/submission";
import { LinkUnavailable } from "../../../../intake/_components/link-unavailable";
import { RecordStepReached } from "../../../../intake/_components/record-step-reached";
import { StepShell } from "../../../../intake/_components/step-shell";
import {
  FooterSaveIndicator,
  SaveStateProvider,
} from "../../../../intake/_lib/save-state";
import { StepAbout } from "../../_components/steps/step-about";
import { StepAccess } from "../../_components/steps/step-access";
import { StepAudience } from "../../_components/steps/step-audience";
import { StepExperience } from "../../_components/steps/step-experience";
import { StepMedia } from "../../_components/steps/step-media";
import { StepSite } from "../../_components/steps/step-site";
import { StepTaste } from "../../_components/steps/step-taste";
import { StepWork } from "../../_components/steps/step-work";
import { StepWords } from "../../_components/steps/step-words";

/**
 * One showcase questionnaire step.
 *
 * The engagement resolves before the slug, because which registry a slug
 * belongs to cannot be known without knowing whose questionnaire this is — the
 * same ordering the durable tree uses (PORT-1).
 *
 * The step's intro is resolved for this client's copy pack: a filmmaker reads
 * the film wording, everyone else reads the generic one, and a client who
 * checked two disciplines reads generic rather than a sentence that assumes
 * one of them (D-PORT-5).
 *
 * All nine steps are real.
 */
export default async function ShowcaseIntakeStepPage({
  params,
}: {
  params: Promise<{ token: string; step: string }>;
}) {
  const { token, step: slug } = await params;

  let engagement;
  try {
    engagement = await requireEngagement(token);
  } catch (error) {
    if (error instanceof EngagementNotFoundError) {
      return <LinkUnavailable expired={error.reason === "expired"} />;
    }
    throw error;
  }

  if (engagement.track !== "showcase") notFound();

  const flavour = flavourFor(engagement.track, engagement.answers);
  const step = findStep(engagement.track, slug, flavour);
  if (!step) notFound();

  if (engagement.depositRequired && !engagement.paidAt) {
    redirect(showcaseIntakeRoutes.entry(token));
  }

  const initial = readStepAnswers(
    engagement.track,
    engagement.answers,
    step.key,
  );
  const uploadsFor = (fieldKey: string) => listUploads(engagement.id, fieldKey);

  async function body() {
    switch (step!.key) {
      case "about":
        return (
          <StepAbout
            token={token}
            initial={initial}
            prefill={{
              contactName: engagement!.contactName,
              contactEmail: engagement!.contactEmail,
              contactPhone: engagement!.contactPhone,
            }}
          />
        );
      case "audience":
        return <StepAudience token={token} initial={initial} />;
      case "experience":
        return <StepExperience token={token} initial={initial} />;
      case "work":
        return (
          <StepWork
            token={token}
            initial={initial}
            flavour={flavour}
            // One query for every project image, grouped client-side by the
            // entry each belongs to — rather than one query per project, which
            // on a forty-project catalogue is forty round trips to render one
            // screen.
            projectFiles={await uploadsFor("project_images")}
          />
        );
      case "words":
        return (
          <StepWords
            token={token}
            initial={initial}
            files={{
              voiceNote: await uploadsFor("voice_note"),
              writing: await uploadsFor("writing"),
            }}
          />
        );
      case "taste":
        return (
          <StepTaste
            token={token}
            initial={initial}
            flavour={flavour}
            files={{ inspiration: await uploadsFor("inspiration") }}
          />
        );
      case "media":
        return (
          <StepMedia
            token={token}
            initial={initial}
            files={{
              portrait: await uploadsFor("portrait"),
              behindScenes: await uploadsFor("behind_scenes"),
              laurels: await uploadsFor("laurels"),
              logo: await uploadsFor("logo"),
              brandAssets: await uploadsFor("brand_assets"),
            }}
          />
        );
      case "access":
        return (
          <StepAccess token={token} initial={initial} flavour={flavour} />
        );
      case "site":
        return <StepSite token={token} initial={initial} />;
      default:
        return null;
    }
  }

  return (
    <SaveStateProvider>
      <RecordStepReached token={token} stepNumber={step.number} />

      <StepShell
        track={engagement.track}
        token={token}
        step={step}
        saveSlot={<FooterSaveIndicator />}
      >
        {await body()}
      </StepShell>
    </SaveStateProvider>
  );
}
