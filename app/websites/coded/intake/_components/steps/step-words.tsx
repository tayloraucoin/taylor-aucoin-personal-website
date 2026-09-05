"use client";

import { useState } from "react";
import GradientRing from "@/components/ui/GradientRing";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor, personVoiceOptionsFor } from "@/lib/intake/tracks";
import {
  ChoiceAnswer,
  LongAnswer,
} from "../../../../intake/_components/answer-inputs";
import { CheckAnswer } from "../../../../intake/_components/check-answer";
import { Field } from "../../../../intake/_components/field";
import {
  FileDrop,
  type ExistingFile,
} from "../../../../intake/_components/file-drop";
import { useReportSaveState } from "../../../../intake/_lib/save-state";
import { useStepAutosave } from "../../../../intake/_lib/use-step-autosave";
import { ComeAcross } from "../come-across";
import { VoiceRecorder, type VoiceNoteFile } from "../voice-recorder";

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
 *
 * The person-voice options are the one place on this step whose words are not
 * fixed: they carry the client's own name from step 1, resolved through the
 * copy pack, because they used to carry another client's (D-PORT-14).
 */
export function StepWords({
  token,
  initial,
  flavour,
  displayName,
  files,
}: {
  token: string;
  initial: Record<string, unknown>;
  flavour: ShowcaseFlavour;
  /** Step 1's `displayName`, already in the answers document this page read. */
  displayName?: string;
  files: {
    voiceNote: readonly VoiceNoteFile[];
    writing: readonly ExistingFile[];
  };
}) {
  const form = useStepAutosave({ token, stepKey: "words", initial });
  useReportSaveState(form.state, form.retry);

  /** Voice notes uploaded through the drop this visit, for the recorder. */
  const [droppedVoiceNotes, setDroppedVoiceNotes] = useState<string[]>([]);

  const pack = copyPackFor(flavour);
  const person = personVoiceOptionsFor(flavour, displayName);

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
          {pack.voiceNotePrompt}
        </p>

        {/* Recording sits above the drop, not instead of it (Taylor,
            2026-09-03). A client with no microphone, no MediaRecorder, or no
            interest meets the same two things they always did, on screen from
            the start rather than revealed by a failure — which is what keeps
            this field as optional as every other one (D-INT-4).

            Inside the ring, never carrying one of its own: the gradient ring
            appears exactly once in this flow and it is already spent on this
            card (D-INT-3 / D-PORT-7). */}
        <div className="mt-4">
          <VoiceRecorder
            token={token}
            existing={files.voiceNote}
            dropped={droppedVoiceNotes}
          />
        </div>

        <div className="mt-4">
          <FileDrop
            token={token}
            stepKey="words"
            fieldKey="voice_note"
            label="Add your voice note"
            existing={files.voiceNote}
            // A phone memo gets written up in the same visit rather than on
            // the client's next one. The recorder owns every transcript on
            // this card, however its audio arrived — so the id is handed up
            // here and back down to it.
            onUploaded={(fileId) =>
              setDroppedVoiceNotes((current) => [...current, fileId])
            }
          />
        </div>

        <p className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
          Can&apos;t be bothered recording? Skip it — the call covers this too.
          {pack.voiceNoteSkipSuffix ? ` ${pack.voiceNoteSkipSuffix}` : ""}
        </p>
      </GradientRing>

      {/* First, under the voice note and above the bio.

          It is the question the rest of this step is trying to answer, and a
          client who has just decided how they want to land writes a different
          "anything you've written" answer than one who has not. It is also the
          only question here the machine can help with, and helping with it
          after they have already written their bio would be too late. */}
      <ComeAcross
        token={token}
        value={
          typeof form.values.comeAcross === "string"
            ? form.values.comeAcross
            : ""
        }
        onChange={(next) => form.setValue("comeAcross", next)}
        onBlur={form.flush}
      />

      <LongAnswer
        form={form}
        name="currentBio"
        label="Your current bio"
        help={pack.bioHelp}
      />

      {/* Consequential enough to sit directly under the bio it governs, at full
          width, rather than as one checkbox among many further down. */}
      <CheckAnswer
        form={form}
        name="keepMyWording"
        label="Keep my wording"
        help="Unchecked, we treat everything you've pasted as raw material and write from it."
      >
        Where I&apos;ve written something myself — bio, project notes,
        experience blurbs — keep it. Fix typos, change nothing else.
      </CheckAnswer>

      <ChoiceAnswer
        form={form}
        name="personVoice"
        label="First person or third?"
        help="Third person reads like a program note; first person reads like a letter. Both work."
        options={person}
      />

      <Field
        id="f-writing"
        label="Anything you've written"
        help={pack.writingHelp}
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
