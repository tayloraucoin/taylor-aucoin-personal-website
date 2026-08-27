"use client";

import {
  ChoiceAnswer,
  LongAnswer,
  TextAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../../intake/_components/file-drop";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";

const LOGO_STATUS = [
  { value: "yes", label: "Yes, I have one" },
  { value: "no", label: "No — my name in good type is fine" },
  { value: "hate", label: "Have one, but I hate it" },
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
 */
export function StepMedia({
  token,
  initial,
  files,
}: {
  token: string;
  initial: Record<string, unknown>;
  files: {
    portrait: readonly ExistingFile[];
    behindScenes: readonly ExistingFile[];
    laurels: readonly ExistingFile[];
    logo: readonly ExistingFile[];
    brandAssets: readonly ExistingFile[];
  };
}) {
  const form = useStepAutosave({ token, stepKey: "media", initial });
  useReportSaveState(form.state, form.retry);

  const logoStatus = form.values.logoStatus;
  const wantsLogoFile = logoStatus === "yes" || logoStatus === "hate";

  return (
    <>
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

      <Field
        id="f-behindScenes"
        label="Behind the scenes"
        help="You on set, behind a camera, teaching. This is where the site gets its humanity."
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

      <Field
        id="f-laurels"
        label="Laurels and award graphics"
        help="Festivals send these as PNGs. Whatever you've got."
      >
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
        help="Most portfolio sites don't need a logo — a well-set name usually does it better."
        options={LOGO_STATUS}
      />

      {/* Reveals in place, below its trigger (UX spec §6.5) — never a layout
          jump, never a new screen. */}
      {wantsLogoFile ? (
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
      ) : null}

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

      <TextAnswer
        form={form}
        name="coloursYouLike"
        label="Colours you're drawn to"
      />

      <LongAnswer
        form={form}
        name="dislikes"
        label="Anything you dislike"
        help="Colours, styles, or a site that makes you cringe."
      />
    </>
  );
}
