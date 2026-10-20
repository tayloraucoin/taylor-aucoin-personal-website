"use client";

import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { LongAnswer } from "../answer-inputs";
import { CheckAnswer } from "../check-answer";
import { Field } from "../field";
import { FileDrop, type ExistingFile } from "../file-drop";

/**
 * Step 5 — How you talk.
 *
 * The voice note is the single most valuable thing a client can give us, and
 * the one grouped card on the step (D-INT-3, restyled by D-SITE-158). Giving
 * it the only card is what gives this field its weight without a word of
 * pressure.
 *
 * And the skip line under it is not a hedge — prominence must never curdle
 * into obligation. The verification call covers the same ground; the memo just
 * gets there in three minutes instead of thirty.
 *
 * The ring is gone under the new brand (no GradientRing anywhere in the
 * intake, D-SITE-158): the card is the kit's surface card with a hairline, a
 * grouped block, and its place first on the step carries the weight.
 *
 * The file input carries no `accept` filter, deliberately. On some mobile
 * browsers `accept` does not merely sort the picker, it hides everything else
 * — and an old Android voice memo the OS refuses to classify as audio is
 * exactly the file we most want. Better an unfiltered picker than a client who
 * cannot find their own recording.
 */
export function StepVoice({
  token,
  initial,
  files,
}: {
  token: string;
  initial: Record<string, unknown>;
  files: {
    voiceNote: readonly ExistingFile[];
    screenshots: readonly ExistingFile[];
    writing: readonly ExistingFile[];
  };
}) {
  const form = useStepAutosave({ token, stepKey: "voice", initial });
  useReportSaveState(form.state, form.retry);

  return (
    <>
      <section className="mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
        <h2 className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
          Voice note
        </h2>

        <p className="mt-3 text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
          Record a 2–3 minute voice memo on your phone answering: how did you
          get into this, and what&apos;s a job you were proud of? Send the file
          here. This is the single most useful thing you can give us.
        </p>

        <div className="mt-4">
          <FileDrop
            token={token}
            stepKey="voice"
            fieldKey="voice_note"
            label="Add your voice note"
            existing={files.voiceNote}
          />
        </div>

        <p className="mt-3 text-meta leading-[1.55] text-(--color-dim)">
          Can&apos;t be bothered recording? Skip it — the call covers this too.
        </p>
      </section>

      <Field
        id="f-screenshots"
        label="Screenshots of texts or emails you've sent customers"
        help="How you actually talk to customers — screenshots are fine."
      >
        <FileDrop
          token={token}
          stepKey="voice"
          fieldKey="screenshots"
          label="Add screenshots"
          multiple
          existing={files.screenshots}
        />
      </Field>

      <Field
        id="f-writing"
        label="Anything you've written"
        help="Old website copy, brochures, price lists, social captions, your Facebook About section."
      >
        <FileDrop
          token={token}
          stepKey="voice"
          fieldKey="writing"
          label="Add files"
          multiple
          existing={files.writing}
        />
      </Field>

      <LongAnswer
        form={form}
        name="writtenNotes"
        label="Or paste anything you've written here"
      />

      <LongAnswer
        form={form}
        name="neverSay"
        label="Words or phrases you'd never use"
      />

      <CheckAnswer
        form={form}
        name="recordingConsent"
        label="Can we record our calls with you?"
        help="Only the calls about your site, and only so the writing sounds like you."
        align="center"
      >
        Yes — we use it to make the writing sound like you.
      </CheckAnswer>
    </>
  );
}
