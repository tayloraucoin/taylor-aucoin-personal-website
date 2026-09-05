"use client";

import type { ShowcaseKind } from "@/lib/intake/showcase-kinds";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor } from "@/lib/intake/tracks";
import type { ProjectVideo } from "@/lib/validators/showcase-intake";
import {
  ChoiceAnswer,
  LongAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../../intake/_components/file-drop";
import { Reveal } from "../../../../intake/_components/reveal";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { DocumentDrop } from "../document-drop";
import { asks, ForKinds, hasGroup } from "../for-kinds";
import { UpsellQuestions } from "../upsell-block";
import { VideoList } from "../video-list";

function asVideos(value: unknown): ProjectVideo[] {
  return Array.isArray(value) ? (value as ProjectVideo[]) : [];
}

const LOGO_STATUS = [
  { value: "yes", label: "Yes, I have one" },
  { value: "no", label: "No — my name in good type is fine" },
  // The value is storage and does not move; the label lost the word "hate" at
  // Taylor's request (2026-09-03). [COPY — pending Taylor]
  { value: "hate", label: "Have one, but I want a new one" },
] as const;

/**
 * Step 7 — Media.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 7,
 * verbatim.
 *
 * Nothing here is ever rejected for its format — size is the only refusal, and
 * it arrives as a sentence rather than an error state. A festival's laurel PNG,
 * a RAW portrait, a `.heic` off an iPhone: all of them are exactly what the
 * client has, and turning one away teaches them the form is broken when the
 * problem is ours to solve later.
 *
 * Project images are deliberately not here. They live with their projects on
 * step 4, which is what the step intro says and what the client will expect.
 * Project *videos* follow the same rule; this step's video list is only for
 * the ones that belong to no project (PORT-19).
 */
export function StepMedia({
  token,
  initial,
  flavour,
  kind,
  files,
  purchasedExtras = [],
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  kind: ShowcaseKind;
  /**
   * What this engagement paid for on the pay screen, in the extras vocabulary.
   *
   * Empty in a preview, which buys nothing — the review surface reaches these
   * blocks through document mode instead, where `Reveal` renders every branch
   * under a line naming what opens it.
   */
  purchasedExtras?: readonly string[];
  files: {
    portrait: readonly ExistingFile[];
    behindScenes: readonly ExistingFile[];
    laurels: readonly ExistingFile[];
    logo: readonly ExistingFile[];
    brandAssets: readonly ExistingFile[];
    place: readonly ExistingFile[];
    documents: readonly ExistingFile[];
  };
}) {
  const pack = copyPackFor(flavour);

  const form = useStepAutosave({ token, stepKey: "media", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <ForKinds
        kind={kind}
        test={asks("portrait")}
        otherwise={
          <Field id="f-place" label={pack.place.label} help={pack.place.help}>
            <FileDrop
              token={token}
              stepKey="media"
              fieldKey="place"
              label="Add photos"
              multiple
              existing={files.place}
            />
          </Field>
        }
      >
        <Field
          id="f-portrait"
          label="A photo of you"
          help="For the about page. A real photo beats a stock one every time — a still of you working is even better."
        >
          <FileDrop
            token={token}
            stepKey="media"
            fieldKey="portrait"
            label="Add a photo"
            existing={files.portrait}
          />
        </Field>
      </ForKinds>

      <Field
        id="f-behindScenes"
        label="Behind the scenes"
        help={pack.behindScenesHelp}
      >
        <FileDrop
          token={token}
          stepKey="media"
          fieldKey="behind_scenes"
          label="Add photos"
          multiple
          existing={files.behindScenes}
        />
      </Field>

      {/* Videos that belong to no project — a showreel, a teaser, a talk, the
          thing that lives on the home page and nowhere else. Project videos
          are on step 5 with the project they belong to; these two lists are
          what step 9's home shortlist is built from (PORT-19).

          No primary tick here: primary means "lead with this one *within this
          project*", and there is no project for these to lead.
          [COPY — pending Taylor] */}
      <Field
        id="f-videos"
        label="Videos that don't belong to one project"
        help="A showreel, a sizzle, a teaser, a talk you gave. Anything on Vimeo or YouTube — the site embeds from there rather than hosting video itself, which is what keeps your hosting close to free."
      >
        <VideoList
          idPrefix="f-media-video"
          videos={asVideos(form.values.videos)}
          onChange={(next) => form.setValue("videos", next)}
          onBlur={form.flush}
          addLabel="Add another video"
        />
      </Field>

      <Field id="f-laurels" label={pack.logos.label} help={pack.logos.help}>
        <FileDrop
          token={token}
          stepKey="media"
          fieldKey="laurels"
          label="Add files"
          multiple
          existing={files.laurels}
        />
      </Field>

      <ChoiceAnswer
        form={form}
        name="logoStatus"
        label="Do you have a logo or wordmark?"
        help={pack.logoHelp}
        options={LOGO_STATUS}
      />

      {/* Reveals in place, below its trigger (UX spec §6.5) — never a layout
          jump, never a new screen. */}
      <Reveal
        values={form.values}
        dependsOn={{ field: "logoStatus", in: ["yes", "hate"] }}
      >
        <Field
          id="f-logo"
          label="Your logo file"
          help="The original file if you have it — otherwise any version."
        >
          <FileDrop
            token={token}
            stepKey="media"
            fieldKey="logo"
            label="Add your logo"
            existing={files.logo}
          />
        </Field>
      </Reveal>

      {/* Directly under the logo question and its file drop, because that is
          what the refresh is built from — the questions and the source files
          belong in one place, not two steps apart. */}
      <UpsellQuestions
        form={form}
        extras={purchasedExtras}
        extra="logo"
        block={pack.upsells.logo}
      />

      <Field
        id="f-brandAssets"
        label="Anything else with your name on it"
        help="Posters, title cards, business cards, the old site — it helps us work out what you've already got going."
      >
        <FileDrop
          token={token}
          stepKey="media"
          fieldKey="brand_assets"
          label="Add files"
          multiple
          existing={files.brandAssets}
        />
      </Field>

      {/* Decks, one-pagers, floor plans, price sheets. The kinds that have
          documents worth reading are the ones whose site is about an
          organisation rather than a body of work. */}
      <ForKinds kind={kind} test={hasGroup("documents")}>
        <DocumentDrop
          token={token}
          label={pack.documents.label}
          help={pack.documents.help}
          existing={files.documents}
        />
      </ForKinds>

      <LongAnswer
        form={form}
        name="dislikes"
        label="Anything you dislike"
        help="Colours, styles, or a site that makes you cringe."
      />
    </>
  );
}
