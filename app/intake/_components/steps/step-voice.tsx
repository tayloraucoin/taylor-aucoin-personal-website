"use client";

import GradientRing from "@/components/ui/GradientRing";
import { useReportSaveState } from "../../_lib/save-state";
import { useStepAutosave } from "../../_lib/use-step-autosave";
import { LongAnswer } from "../answer-inputs";
import { FileDrop, type ExistingFile } from "../file-drop";
import { Field } from "../field";

/**
 * Step 5 — How you talk.
 *
 * The voice note is the single most valuable thing a client can give us, and
 * the only place in this entire flow where the gradient ring appears
 * (D-INT-3). Rationing the site's signature element to one card is what gives
 * this field its weight without a word of pressure.
 *
 * And the skip line under it is not a hedge — prominence must never curdle
 * into obligation. The verification call covers the same ground; the memo just
 * gets there in three minutes instead of thirty.
 *
 * The ring holds still under `prefers-reduced-motion` (GradientRing handles
 * that itself) and does not accelerate on hover here: this is a form, not a
 * portfolio card inviting a cursor.
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
      <GradientRing
        hoverAccelerate={false}
        className="mb-8 rounded-(--radius) bg-(--color-card) p-5"
      >
        <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
          Voice note
        </p>

        <p className="mt-3 font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
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

        <p className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
          Can&apos;t be bothered recording? Skip it — the call covers this too.
        </p>
      </GradientRing>

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

      <Field id="f-consent" label="Can we record our kickoff call?">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3 font-body text-[16px] font-light text-(--color-body)">
          <input
            type="checkbox"
            checked={form.values.recordingConsent === true}
            onChange={(event) => {
              form.setValue("recordingConsent", event.target.checked);
              form.flush();
            }}
            className="h-5 w-5 shrink-0 accent-(--color-c2)"
          />
          Yes — we use it to make the writing sound like you.
        </label>
      </Field>
    </>
  );
}
