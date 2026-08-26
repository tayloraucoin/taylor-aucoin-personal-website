"use client";

import GradientRing from "@/components/ui/GradientRing";
import {
  ChoiceAnswer,
  LongAnswer,
} from "../../../../intake/_components/answer-inputs";
import { Field } from "../../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../../intake/_components/file-drop";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";

const PERSON = [
  { value: "first", label: 'First — "I direct…"' },
  { value: "third", label: 'Third — "Kryshan directs…"' },
  { value: "unsure", label: "Not sure — you pick" },
] as const;

/**
 * Step 6 — Your words.
 *
 * Every string is `docs/websites/portfolio-intake-questions-v2.md` § Step 6,
 * verbatim — including the voice-note prompt, which is the most carefully
 * written paragraph in the document and the one most likely to be "improved"
 * by accident.
 *
 * **The gradient ring appears here and nowhere else in this flow** (D-INT-3,
 * D-PORT-7). Rationing the site's signature element to one card is what gives
 * this field its weight without a word of pressure — and the skip line beneath
 * it is not a hedge. Prominence must never curdle into obligation.
 *
 * The ring holds still under `prefers-reduced-motion` (GradientRing handles
 * that itself) and does not accelerate on hover: this is a form, not a
 * portfolio card inviting a cursor.
 *
 * The file inputs carry no `accept` filter, deliberately. On some mobile
 * browsers `accept` does not merely sort the picker, it hides everything else —
 * and an old Android voice memo the OS refuses to classify as audio is exactly
 * the file we most want.
 */
export function StepWords({
  token,
  initial,
  files,
}: {
  token: string;
  initial: Record<string, unknown>;
  files: {
    voiceNote: readonly ExistingFile[];
    writing: readonly ExistingFile[];
  };
}) {
  const form = useStepAutosave({ token, stepKey: "words", initial });
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
          Record a 2–3 minute voice memo on your phone answering two things: how
          did you get into this, and what&apos;s a piece of work you&apos;re
          proud of — and why? Don&apos;t script it. This is the single most
          useful thing you can give us.
        </p>

        <div className="mt-4">
          <FileDrop
            token={token}
            stepKey="words"
            fieldKey="voice_note"
            label="Add your voice note"
            existing={files.voiceNote}
          />
        </div>

        <p className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
          Can&apos;t be bothered recording? Skip it — the call covers this too.
        </p>
      </GradientRing>

      <LongAnswer
        form={form}
        name="currentBio"
        label="Your current bio"
        help="Paste whatever exists — old site, festival program, LinkedIn. All versions welcome."
      />

      {/* Consequential enough to sit directly under the bio it governs, at full
          width, rather than as one checkbox among many further down. */}
      <Field
        id="f-keepMyWording"
        label="Keep my wording"
        help="Unchecked, we treat everything you've pasted as raw material and write from it."
      >
        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-3.5 py-3 font-body text-[16px] font-light leading-[1.4] text-(--color-body)">
          <input
            type="checkbox"
            checked={form.values.keepMyWording === true}
            onChange={(event) => {
              form.setValue("keepMyWording", event.target.checked);
              form.flush();
            }}
            className="mt-0.5 h-5 w-5 shrink-0 accent-(--color-c2)"
          />
          Where I&apos;ve written something myself — bio, project notes,
          experience blurbs — keep it. Fix typos, change nothing else.
        </label>
      </Field>

      <ChoiceAnswer
        form={form}
        name="personVoice"
        label="First person or third?"
        help="Third person reads like a program note; first person reads like a letter. Both work."
        options={PERSON}
      />

      <Field
        id="f-writing"
        label="Anything you've written"
        help="Artist statements, director's notes, grant applications, captions — anything in your own words."
      >
        <FileDrop
          token={token}
          stepKey="words"
          fieldKey="writing"
          label="Add files"
          multiple
          existing={files.writing}
        />
      </Field>

      <LongAnswer form={form} name="writtenNotes" label="Or paste it here" />

      <LongAnswer
        form={form}
        name="neverSay"
        label="Words or phrases you'd never use"
        help={`"Visual storyteller," "passionate" — whatever makes you wince.`}
      />

      <Field
        id="f-recordingConsent"
        label="Can we record our calls with you?"
        help="Only the calls about your site, and only so the writing sounds like you."
      >
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
