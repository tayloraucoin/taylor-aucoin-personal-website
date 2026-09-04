"use client";

import { useState } from "react";
import { useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import { suggestComeAcross } from "../_actions/come-across";
import { Field } from "../../../intake/_components/field";
import { TextField } from "../../../intake/_components/text-field";

type State =
  | { status: "idle" }
  | { status: "running" }
  | { status: "done"; words: string; sentence: string }
  | { status: "failed"; reason: "rate_limited" | "empty" | "failed" | "link" };

/**
 * "How do you want to come across?" — and the button that guesses.
 *
 * The hardest question on the form to answer cold, and the one a client has
 * already answered five steps of material's worth without noticing. The button
 * reads that material back: who the site is for, what they want that person to
 * do, what they are not, the three words the site should feel like.
 *
 * **The suggestions are never the answer.** Two come back — three words and one
 * sentence — and both sit outside the field until the client presses one into
 * it, where it becomes ordinary editable text they can rewrite. The same
 * seen-first law the extractor and the primer follow, and for the same reason:
 * a machine's guess at how someone wants to be seen is the last thing that
 * should be saved without them reading it.
 *
 * "Predict with AI" says what it is. A button here labelled "Suggest" or
 * "Help me" would be hiding the one fact a client should have before pressing
 * it — that their answers are about to be read by a model.
 *
 * The states are calm and none is styled as an error, because none of them is
 * the client's mistake — including the one that is entirely about them not
 * having answered enough yet.
 */
export function ComeAcross({
  token,
  value,
  onChange,
  onBlur,
}: {
  token: string;
  value: string;
  onChange: (next: string) => void;
  onBlur: () => void;
}) {
  const preview = useIsPreview();
  const [state, setState] = useState<State>({ status: "idle" });

  const run = async () => {
    setState({ status: "running" });
    const result = await suggestComeAcross(token);

    if (!result.ok) {
      setState({ status: "failed", reason: result.reason });
      return;
    }

    setState({
      status: "done",
      words: result.suggestion.words.join(", "),
      sentence: result.suggestion.sentence,
    });
  };

  const take = (next: string) => {
    onChange(next);
    onBlur();
  };

  return (
    <Field
      id="f-comeAcross"
      fieldKey="comeAcross"
      label="How do you want to come across?"
      // [COPY — pending Taylor]
      help="Three words, or one sentence — whichever comes easier. Not what you do; how you want to land on someone who has never heard of you."
    >
      {/* One line, not a box. "Three words, or one sentence" is the question,
          and a two-row textarea was quietly asking for a paragraph nobody had
          (Taylor, 2026-09-03). */}
      <TextField
        id="f-comeAcross-input"
        helpId="f-comeAcross-help"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <GhostButton
          type="button"
          onClick={preview ? undefined : () => void run()}
          disabled={preview || state.status === "running"}
        >
          {state.status === "running" ? "Reading it back…" : "Predict with AI"}
        </GhostButton>

        {preview ? (
          <span className="font-body text-[13.5px] font-light text-(--color-dim)">
            Not available in preview.
          </span>
        ) : (
          <span className="font-body text-[13.5px] font-light text-(--color-dim)">
            {/* [COPY — pending Taylor] */}
            Reads what you&apos;ve already answered and takes a guess.
          </span>
        )}
      </div>

      {state.status === "done" ? (
        <div className="mt-4 space-y-2.5" aria-live="polite">
          {state.words ? (
            <Suggestion label="Three words" onUse={() => take(state.words)}>
              {state.words}
            </Suggestion>
          ) : null}
          {state.sentence ? (
            <Suggestion label="One sentence" onUse={() => take(state.sentence)}>
              {state.sentence}
            </Suggestion>
          ) : null}
          <p className="font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            {/* [COPY — pending Taylor] */}
            Neither of these is saved until you use one, and you can rewrite it
            afterwards. If they&apos;re both wrong, that&apos;s useful too —
            write what they got wrong instead.
          </p>
        </div>
      ) : null}

      {state.status === "failed" ? (
        <p
          aria-live="polite"
          className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {/* [COPY — pending Taylor] — every line below. */}
          {state.reason === "empty"
            ? "There isn't enough on the form yet for a guess worth reading. Answer a few more of the earlier questions and try again — or just write it yourself, which is better anyway."
            : state.reason === "rate_limited"
              ? "Give it a minute and try again."
              : state.reason === "link"
                ? "That link stopped working. Anything you've typed is still here."
                : "That didn't work — nothing was lost. Try again, or write it yourself."}
        </p>
      ) : null}
    </Field>
  );
}

/**
 * One suggestion, and the button that takes it.
 *
 * A card rather than a pre-filled field: the difference between reading
 * something and pressing it into your own answer is the whole point, and a
 * suggestion that has already put itself in the box has taken the decision.
 */
function Suggestion({
  label,
  onUse,
  children,
}: {
  label: string;
  onUse: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) px-4 py-3.5">
      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        {label}
      </p>
      <p className="mt-2 font-body text-[16px] font-light leading-[1.5] text-(--color-ink)">
        {children}
      </p>
      <button
        type="button"
        onClick={onUse}
        className="mt-2.5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) underline underline-offset-2 transition-colors hover:text-(--color-c3) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
      >
        Use this
      </button>
    </div>
  );
}
