"use client";

import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { ChoiceAnswer, LongAnswer } from "../answer-inputs";
import { FileDrop, type ExistingFile } from "../file-drop";
import { Field } from "../field";

const REVIEW_SOURCES = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "texts", label: "Text messages from customers" },
  { value: "none", label: "None yet" },
] as const;

/**
 * Step 7 — Reviews and proof.
 *
 * "None yet" is exclusive and completely fine, and the step intro says so
 * before asking anything. That is not politeness: a platform once
 * auto-generated eleven fabricated customers with AI headshots for a real
 * business, which is a Competition Act problem rather than a style one. No
 * testimonial ships without a named, real source, so a client who has none
 * gets the section removed — never filled.
 *
 * Permission to publish is its own unchecked box. Having a review is not the
 * same as being allowed to print it.
 */
export function StepReviews({
  token,
  initial,
  files,
}: {
  token: string;
  initial: Record<string, unknown>;
  files: { screenshots: readonly ExistingFile[] };
}) {
  const form = useStepAutosave({ token, stepKey: "reviews", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <ChoiceAnswer
        form={form}
        name="reviewSources"
        label="Do you have reviews anywhere?"
        options={REVIEW_SOURCES}
        multiple
        exclusiveValue="none"
      />

      <LongAnswer
        form={form}
        name="bestReviews"
        label="Paste one or a few of your best"
        help="Copy and paste — one or two is plenty. Or screenshot them below."
      />

      <Field id="f-review-shots" label="Screenshots">
        <FileDrop
          token={token}
          stepKey="reviews"
          fieldKey="review_screenshots"
          label="Add screenshots"
          multiple
          existing={files.screenshots}
        />
      </Field>

      <Field id="f-permission" label="Can we publish these?">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3 font-body text-[16px] font-light text-(--color-body)">
          <input
            type="checkbox"
            checked={form.values.publishPermission === true}
            onChange={(event) => {
              form.setValue("publishPermission", event.target.checked);
              form.flush();
            }}
            className="h-5 w-5 shrink-0 accent-(--color-c2)"
          />
          Yes — these are real and you can use them on my site.
        </label>
      </Field>

      <LongAnswer
        form={form}
        name="notableClients"
        label="Notable clients or jobs worth featuring"
      />
    </>
  );
}
