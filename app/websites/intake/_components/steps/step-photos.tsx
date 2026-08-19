"use client";

import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { ChoiceAnswer, LongAnswer, TextAnswer } from "../answer-inputs";
import { FileDrop, type ExistingFile } from "../file-drop";
import { Field } from "../field";

const LOGO_STATUS = [
  { value: "have", label: "Yes, I have one" },
  { value: "need", label: "No — I need one" },
  { value: "hate", label: "Have one, but I hate it" },
] as const;

/**
 * Step 6 — Photos and logo.
 *
 * Brand assets are their own field rather than more help text on Photos,
 * because the two are used differently: photographs fill galleries, while a
 * wrap, a uniform or a business card is where the palette gets reverse-
 * engineered when there is no logo file. That field carries no `accept`
 * filter — a PDF invoice, an .ai logo and a photo of a truck are all correct
 * answers to it.
 *
 * The photo count stays a suggestion in the help line and never becomes a
 * counter. "10–20 is ideal" invites; "3 / 10" scores, and a client who feels
 * scored sends nothing.
 */
export function StepPhotos({
  token,
  initial,
  files,
}: {
  token: string;
  initial: Record<string, unknown>;
  files: {
    logo: readonly ExistingFile[];
    brandAssets: readonly ExistingFile[];
    photos: readonly ExistingFile[];
    portrait: readonly ExistingFile[];
  };
}) {
  const form = useStepAutosave({ token, stepKey: "photos", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <ChoiceAnswer
        form={form}
        name="logoStatus"
        label="Do you have a logo?"
        options={LOGO_STATUS}
      />

      <Field
        id="f-logo"
        label="Your logo file"
        help="The original file if you have it — otherwise any version."
      >
        <FileDrop
          token={token}
          stepKey="photos"
          fieldKey="logo"
          label="Add your logo"
          existing={files.logo}
        />
      </Field>

      <Field
        id="f-brand-assets"
        label="Anything else with your branding on it"
        help="Vehicle wrap, uniforms, signage, business cards, flyers, invoices, your old site. A phone photo of any of it is fine — it's how we work out your colours."
      >
        <FileDrop
          token={token}
          stepKey="photos"
          fieldKey="brand_assets"
          label="Add brand assets"
          multiple
          existing={files.brandAssets}
        />
      </Field>

      <Field
        id="f-photos"
        label="Photos"
        help="You, your work, before-and-afters, your vehicle or equipment. Phone photos in good light are perfect. 10–20 is ideal."
      >
        <FileDrop
          token={token}
          stepKey="photos"
          fieldKey="photos"
          label="Add photos"
          accept="image/*"
          multiple
          existing={files.photos}
        />
      </Field>

      <Field
        id="f-portrait"
        label="A photo of you"
        help="For the About page — a real photo beats a stock one every time."
      >
        <FileDrop
          token={token}
          stepKey="photos"
          fieldKey="portrait"
          label="Add your photo"
          accept="image/*"
          existing={files.portrait}
        />
      </Field>

      <TextAnswer form={form} name="coloursYouUse" label="Colours you already use" />

      <LongAnswer
        form={form}
        name="dislikes"
        label="Anything you dislike"
        help="Colours, styles, or a competitor's site that makes you cringe."
      />
    </>
  );
}
