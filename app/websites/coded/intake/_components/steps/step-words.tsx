"use client";

import { useState } from "react";
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
 * Every string is `docs/_legacy/websites/portfolio-intake-questions-v2.md` § Step 6,
 * verbatim — including the voice-note prompt, which is the most carefully
 * written paragraph in the document and the one most likely to be "improved"
 * by accident.
 *
 * **The voice note is the one grouped card on this step** (D-INT-3, D-PORT-7,
 * restyled by D-SITE-158: the kit's surface card with a hairline, no ring).
 * Giving it the only card is what gives this field its weight without a word
 * of pressure — and the skip line beneath it is not a hedge. Prominence must
 * never curdle into obligation.
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
  const [removedVoiceNotes, setRemovedVoiceNotes] = useState<string[]>([]);

  const pack = copyPackFor(flavour);
  const person = personVoiceOptionsFor(flavour, displayName);

  return (
    <>
      <section className="mb-8 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
        <h2 className="font-display text-h4 leading-[1.3] font-semibold tracking-(--tracking-h4) text-(--color-ink)">
          Voice note
        </h2>

        <p className="mt-3 text-[16px] leading-[1.6] text-(--color-body) sm:text-(length:--text-body)">
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
            removed={removedVoiceNotes}
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
            // A removed note takes its transcript with it — the row is gone,
            // so the recorder's block for it has to go too.
            onRemoved={(fileId) =>
              setRemovedVoiceNotes((current) => [...current, fileId])
            }
          />
        </div>

        <p className="mt-3 text-meta leading-[1.55] text-(--color-dim)">
          Can&apos;t be bothered recording? Skip it — the call covers this too.
          {pack.voiceNoteSkipSuffix ? ` ${pack.voiceNoteSkipSuffix}` : ""}
        </p>
      </section>

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
