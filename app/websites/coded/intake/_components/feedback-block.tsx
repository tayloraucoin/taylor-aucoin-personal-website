"use client";

import { useState } from "react";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import { submitIntakeFeedback } from "../_actions/submit-feedback";
import { DocHint, DocTag } from "../../../intake/_components/document";
import { TextArea } from "../../../intake/_components/text-field";
import { PickScale } from "./taste/pick-scale";

/**
 * What that was like, asked once, after everything.
 *
 * **Behind a button, and last.** The questionnaire is finished by the time
 * anyone sees this: there is nothing left they could be answering for us, and
 * nothing here gates anything. Asking someone to rate a form while they are
 * still filling it in is asking them to perform while they still want
 * something from you, which is why this lives on the done screen and not in
 * step ten.
 *
 * Both scales are the taste step's `PickScale`, which starts unscored and can
 * be dragged back to unscored. That matters more here than it does there: a
 * slider that opens at 4 collects a four from everybody who did not touch it,
 * and a satisfaction number nobody gave is worse than no number.
 *
 * The thanks that replaces the form says nothing about what they said. No
 * score echoed back, no "we'll look into that" — the second is a promise this
 * component cannot keep.
 */

/** [COPY — pending Taylor] */
const COPY = {
  open: "Add feedback",
  heading: "How was that?",
  intro:
    "Two sliders and a box. It goes to Taylor and it has no effect on your build, so say what you actually thought.",
  enjoyment: "How much did you enjoy filling this in?",
  enjoymentLow: "A slog",
  enjoymentHigh: "Genuinely good",
  confidence: "How confident are you in what comes out of it?",
  confidenceLow: "Not very",
  confidenceHigh: "Very",
  thoughts: "Anything else",
  thoughtsHelp:
    "What dragged, what was confusing, what you expected to be asked and weren't.",
  send: "Send",
  sending: "Sending…",
  cancel: "Not now",
  done: "Thanks — that's genuinely useful.",
  empty: "Move a slider or write something first.",
  failed: "That didn't send. Try again in a moment.",
  link: "This link has expired, so the feedback couldn't be sent.",
  preview: "Not available in preview.",
};

type State =
  | { status: "closed" }
  | { status: "open" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string };

export function FeedbackBlock({ token }: Readonly<{ token: string }>) {
  const preview = useIsPreview();
  const isDocument = useIsDocument();

  const [state, setState] = useState<State>({ status: "closed" });
  const [enjoyment, setEnjoyment] = useState<number | undefined>(undefined);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [thoughts, setThoughts] = useState("");

  if (isDocument) {
    return (
      <>
        <DocTag>Optional · behind a button on the done screen</DocTag>
        <DocHint>
          {COPY.heading} {COPY.intro}
        </DocHint>
      </>
    );
  }

  async function send() {
    setState({ status: "sending" });

    const result = await submitIntakeFeedback({
      token,
      enjoyment: enjoyment ?? null,
      confidence: confidence ?? null,
      thoughts: thoughts.trim() || null,
    });

    if (result.ok) {
      setState({ status: "sent" });
      return;
    }

    setState({
      status: "error",
      message:
        result.reason === "empty"
          ? COPY.empty
          : result.reason === "link"
            ? COPY.link
            : COPY.failed,
    });
  }

  if (state.status === "sent") {
    return (
      <p className="mt-10 border-t border-(--color-faint) pt-6 font-body text-[16px] font-light leading-[1.6] text-(--color-c2)">
        {COPY.done}
      </p>
    );
  }

  if (state.status === "closed") {
    return (
      <div className="mt-10 border-t border-(--color-faint) pt-6">
        <GhostButton onClick={() => setState({ status: "open" })}>
          {COPY.open}
        </GhostButton>
      </div>
    );
  }

  const sending = state.status === "sending";

  return (
    <section className="mt-10 border-t border-(--color-faint) pt-6">
      <h2 className="font-display text-[22px] font-medium leading-[1.2] tracking-[-.02em] text-(--color-ink)">
        {COPY.heading}
      </h2>
      <p className="mt-2 max-w-[48ch] font-body text-[15px] font-light leading-[1.6] text-(--color-body)">
        {COPY.intro}
      </p>

      <div className="mt-8">
        <PickScale
          idPrefix="f-feedback-enjoyment"
          value={enjoyment}
          onChange={setEnjoyment}
          label={COPY.enjoyment}
          low={COPY.enjoymentLow}
          high={COPY.enjoymentHigh}
        />
      </div>

      <div className="mt-9">
        <PickScale
          idPrefix="f-feedback-confidence"
          value={confidence}
          onChange={setConfidence}
          label={COPY.confidence}
          low={COPY.confidenceLow}
          high={COPY.confidenceHigh}
        />
      </div>

      <div className="mt-9">
        <label
          htmlFor="f-feedback-thoughts"
          className="block font-body text-[16px] font-medium leading-[1.4] text-(--color-ink)"
        >
          {COPY.thoughts}
        </label>
        <p
          id="f-feedback-thoughts-help"
          className="mt-1.5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)"
        >
          {COPY.thoughtsHelp}
        </p>
        <div className="mt-2.5">
          <TextArea
            id="f-feedback-thoughts"
            aria-describedby="f-feedback-thoughts-help"
            value={thoughts}
            rows={5}
            onChange={(event) => setThoughts(event.target.value)}
          />
        </div>
      </div>

      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="mt-5 font-body text-[15px] font-light text-(--color-c2)"
        >
          {state.message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {/* Preview mounts this component and refuses the write, the same as
            every other network caller under the intake tree. */}
        <GradientButton
          onClick={preview ? undefined : () => void send()}
          disabled={sending || preview}
        >
          {preview ? COPY.preview : sending ? COPY.sending : COPY.send}
        </GradientButton>

        <button
          type="button"
          onClick={() => setState({ status: "closed" })}
          className="font-body text-[15px] font-light text-(--color-dim) underline underline-offset-4 transition-colors hover:text-(--color-ink)"
        >
          {COPY.cancel}
        </button>
      </div>
    </section>
  );
}
