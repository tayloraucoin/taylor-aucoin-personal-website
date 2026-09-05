import { StepAbout } from "@/app/websites/coded/intake/_components/steps/step-about";
import { StepAccess as ShowcaseAccess } from "@/app/websites/coded/intake/_components/steps/step-access";
import { StepAudience } from "@/app/websites/coded/intake/_components/steps/step-audience";
import { StepExperience } from "@/app/websites/coded/intake/_components/steps/step-experience";
import { StepIngest } from "@/app/websites/coded/intake/_components/steps/step-ingest";
import { StepMedia } from "@/app/websites/coded/intake/_components/steps/step-media";
import { StepSite } from "@/app/websites/coded/intake/_components/steps/step-site";
import { StepTaste } from "@/app/websites/coded/intake/_components/steps/step-taste";
import { StepWords } from "@/app/websites/coded/intake/_components/steps/step-words";
import { StepWork } from "@/app/websites/coded/intake/_components/steps/step-work";
import { StepAccess } from "@/app/websites/intake/_components/steps/step-access";
import { StepBusiness } from "@/app/websites/intake/_components/steps/step-business";
import { StepOperations } from "@/app/websites/intake/_components/steps/step-operations";
import { StepPhotos } from "@/app/websites/intake/_components/steps/step-photos";
import { StepPositioning } from "@/app/websites/intake/_components/steps/step-positioning";
import { StepPricing } from "@/app/websites/intake/_components/steps/step-pricing";
import { StepReviews } from "@/app/websites/intake/_components/steps/step-reviews";
import { StepTeam } from "@/app/websites/intake/_components/steps/step-team";
import { StepVoice } from "@/app/websites/intake/_components/steps/step-voice";
import type { ExampleSet } from "@/content/intake-examples";
import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { stepsFor } from "@/lib/intake/tracks";
import type { IntakeTrackKey } from "@/lib/types/intake";
import { AccordionControls, AccordionSection } from "./accordion";
import { PreviewLink } from "./preview-link";

/**
 * The group the step sections register under.
 *
 * Named rather than inlined at both ends, because a typo in one of the two
 * strings would produce a control that silently folds nothing.
 */
const STEP_GROUP = "questionnaire-steps";

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
 * Each step collapses independently of the flow band around it, which is what
 * makes comparing step 3's wording against step 4's a scroll of one screen
 * rather than six (Taylor, 2026-09-03). The body is unmounted while closed, so
 * a collapsed step costs nothing — these are live autosave components.
 *
 * Every prop is empty. There is no engagement behind a preview, so `token` is
 * the empty string, answers are `{}`, files are empty lists, and prefill is
 * blank strings — never a sample business, which `docs/intake/ADMIN-HANDOFF.md`
 * treats as a legal posture rather than a style note.
 */
export function QuestionStack({
  track,
  flavour,
  kind,
  gallery,
  previewQuery,
}: Readonly<{
  track: IntakeTrackKey;
  flavour: ShowcaseFlavour;
  /** What the site is for. Decides which field groups exist at all. */
  kind: ShowcaseKind;
  /**
   * The view the review page is showing, forwarded to each step's Preview
   * link so the tab it opens is the same questionnaire this stack is showing.
   */
  previewQuery: string;
  /**
   * This pack's gallery, exactly as a client would meet it.
   *
   * Loaded by the page and passed in, rather than read here: this component is
   * a server component that renders into a client accordion through a
   * synchronous `switch`, and keeping the read at the rail keeps it that way
   * (M-PORT-41). An unpublished pack arrives as the empty set and renders the
   * step's absent state, which is the point — this surface exists to show what
   * a client actually meets.
   */
  gallery: ExampleSet;
}>) {
  const steps = stepsFor(track, flavour);

  return (
    <>
      {/*
        The steps' own Expand / Collapse, scoped to this list.

        The page-level pair in the header folds all thirteen sections, which is
        the wrong instrument once you are down here: the questionnaire is nine
        of those thirteen, and folding it should not also close the start form
        and the pay screen you are comparing it against. `data-md="skip"` keeps
        the control out of the Markdown export, which reads this rendered DOM —
        the same reason the Hide/Show state word carries it.
      */}
      <div data-md="skip" className="mt-6 flex justify-end">
        <AccordionControls group={STEP_GROUP} noun="all steps" />
      </div>

      <ol className="mt-4">
        {steps.map((step) => (
          <li
            key={step.key}
            className="border-t border-(--color-faint) py-10 first:border-t-0 first:pt-0"
          >
            <AccordionSection
              group={STEP_GROUP}
              action={<PreviewLink section={step.key} query={previewQuery} />}
              header={
                <>
                  <span
                    data-md="eyebrow"
                    className="block font-(family-name:--font-mono) text-[10px] uppercase tracking-[.18em] text-(--color-dim)"
                  >
                    Step {step.number} of {steps.length} · {step.key}
                  </span>
                  <span
                    data-md="section"
                    className="mt-2 block font-(family-name:--font-display) text-[28px] font-medium leading-[1.15] tracking-[-.02em] text-(--color-ink)"
                  >
                    {step.title}
                  </span>
                </>
              }
              note={
                step.intro ? (
                  <p
                    key={`${step.key}-intro`}
                    className={`mt-3 max-w-[48ch] text-[16px] font-light leading-[1.6] ${
                      step.emphasis === "ink"
                        ? "text-(--color-ink)"
                        : "text-(--color-body)"
                    }`}
                  >
                    {step.intro}
                  </p>
                ) : undefined
              }
            >
              <div key={`${step.key}-body`} className="mt-6 max-w-2xl">
                <StepBody
                  track={track}
                  stepKey={step.key}
                  flavour={flavour}
                  kind={kind}
                  gallery={gallery}
                />
              </div>
            </AccordionSection>
          </li>
        ))}
      </ol>
    </>
  );
}

const NO_TOKEN = "";
const NO_ANSWERS: Record<string, unknown> = {};
const NO_FILES = [] as const;

/**
 * One step's fields, with every prop empty.
 *
 * Exported because the single-section preview renders exactly one of these in
 * the client's own column, and a second dispatch would be a second thing to
 * forget when a step is added — the `UnrenderedStep` guard below only helps
 * while there is one switch to fall through.
 */
export function StepBody({
  track,
  stepKey,
  flavour,
  kind,
  gallery,
}: Readonly<{
  track: IntakeTrackKey;
  stepKey: string;
  flavour: ShowcaseFlavour;
  kind: ShowcaseKind;
  gallery: ExampleSet;
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
    case "ingest":
      // The paste box, the drop, and the action with its confirmation. No
      // record: a preview has no engagement and therefore no run, so this
      // reviews the step a client meets first rather than its completed
      // state. The action itself refuses in preview, as every write path
      // beneath this surface does.
      return <StepIngest {...shared} flavour={flavour} files={NO_FILES} />;
    case "about":
      return (
        <StepAbout
          {...shared}
          initialKind={kind}
          prefill={{ contactName: "", contactEmail: "", contactPhone: null }}
          headshots={NO_FILES}
        />
      );
    case "audience":
      return <StepAudience {...shared} flavour={flavour} />;
    case "experience":
      // No roster: a preview has no engagement and therefore no people, so the
      // step renders its one-subject shape. The per-person grouping is
      // reachable here only by filling step 1's roster above, which is exactly
      // how a client reaches it too.
      return <StepExperience {...shared} flavour={flavour} />;
    case "work":
      return (
        <StepWork
          {...shared}
          flavour={flavour}
          kind={kind}
          projectFiles={NO_FILES}
          pieceFiles={NO_FILES}
        />
      );
    case "words":
      return (
        // No `displayName`: this surface reviews the questions, not one
        // client's answers, so the third-person example renders its
        // no-name form ("They make…") rather than borrowing a name.
        <StepWords
          {...shared}
          flavour={flavour}
          files={{ voiceNote: NO_FILES, writing: NO_FILES }}
        />
      );
    case "taste":
      return (
        // The set for this pack as it stands. Uncurated sets render the taste
        // step's absent state here too, which is the point: this surface is
        // for reviewing what a client actually meets.
        <StepTaste
          {...shared}
          flavour={flavour}
          gallery={gallery}
          files={{ inspiration: NO_FILES }}
          // A preview buys nothing and quotes nothing: the document renders
          // both add-on states under a line naming what opens each.
          motion={{ priceCents: null, currency: "cad" }}
        />
      );
    case "media":
      return (
        <StepMedia
          {...shared}
          flavour={flavour}
          kind={kind}
          files={{
            portrait: NO_FILES,
            behindScenes: NO_FILES,
            laurels: NO_FILES,
            logo: NO_FILES,
            brandAssets: NO_FILES,
            place: NO_FILES,
            documents: NO_FILES,
          }}
        />
      );
    case "site":
      return <StepSite {...shared} flavour={flavour} kind={kind} />;
    case "access":
      return <ShowcaseAccess {...shared} flavour={flavour} kind={kind} />;
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
