"use client";

import { useState } from "react";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import { mintEntryKey } from "@/lib/intake/entry-key";
import type { ExtractionMode } from "@/server/services/extract";
import { extractPastedEntries, type ExtractResult } from "../_actions/extract";
import { DocHint, DocTag } from "../../../intake/_components/document";
import { TextArea } from "../../../intake/_components/text-field";

type State =
  | { status: "idle" }
  | { status: "nothing_pasted" }
  | { status: "running" }
  | { status: "done" }
  | { status: "failed"; reason: "rate_limited" | "empty" | "failed" | "link" };

/**
 * "The fast way" — the paste box and the button that sorts it.
 *
 * **The blob autosaves as an ordinary field from the moment it is typed.** That
 * is the whole safety contract and it predates the button: whatever happens to
 * an extraction — an API error, a rate limit, a closed tab mid-run — the paste
 * is already in the answers document. A client never has to find their CV
 * twice (D-PORT-3).
 *
 * **Nothing extracted is saved by this component.** Entries are handed up to
 * the step, which appends them to its ordinary repeatable block; they reach the
 * database through the client's own next autosave, which cannot fire until the
 * entries have been on screen in front of them. That is what makes "nothing
 * saves as fact until you've seen it" a mechanism rather than a promise.
 *
 * **A re-run appends and never overwrites.** Entries a client has already
 * corrected are theirs; a second press adds below them rather than replacing
 * work they just did.
 *
 * The states are calm on purpose. No spinner — a progress animation on a form
 * reads as trouble — and no state is styled as an error, because none of them
 * is the client's mistake.
 */
export function ExtractionBlock({
  token,
  mode,
  intro,
  afterLine,
  value,
  onChange,
  onBlur,
  onEntries,
}: {
  token: string;
  /** One home for the mode list: the service that runs them. */
  mode: ExtractionMode;
  /** The v2 doc's copy above the box — different words on each step. */
  intro: string;
  /** The v2 doc's line shown once entries have appeared. */
  afterLine: string;
  value: string;
  onChange: (next: string) => void;
  onBlur: () => void;
  /** Hands new entries to the step, which appends them. Never saves here. */
  onEntries: (entries: Record<string, string>[]) => void;
}) {
  /**
   * The extraction round-trips through a server action that resolves the
   * engagement behind the token. A preview has neither, so the button is
   * disabled and says why rather than failing on press (ADM-2, UX spec §6).
   */
  const preview = useIsPreview();
  const document = useIsDocument();

  const [state, setState] = useState<State>({ status: "idle" });

  const run = async () => {
    if (!value.trim()) {
      setState({ status: "nothing_pasted" });
      return;
    }

    setState({ status: "running" });

    let result: ExtractResult;
    try {
      result = await extractPastedEntries(token, mode, value);
    } catch {
      setState({ status: "failed", reason: "failed" });
      return;
    }

    if (!result.ok) {
      setState({ status: "failed", reason: result.reason });
      return;
    }

    // Each entry gets its key here, on arrival, so an extracted project can
    // hold images the moment it renders.
    onEntries(
      result.entries.map((entry) => ({ ...entry, entryKey: mintEntryKey() })),
    );
    setState({ status: "done" });
  };

  const running = state.status === "running";

  /**
   * The paste box is a question — its blob is stored as `fastWay` — so it
   * belongs in the document, minus the button that cannot be pressed there.
   * The after-line is included because it is the copy that tells a client what
   * happens to what they pasted, which is the part worth reviewing.
   */
  if (document) {
    return (
      <section className="mb-10">
        <h3 className="font-display text-[18px] font-medium leading-[1.3] tracking-[-.012em] text-(--color-ink)">
          The fast way
        </h3>
        <p className="mt-1.5 max-w-[68ch] font-body text-[15px] font-light leading-[1.5] text-(--color-dim)">
          {intro}
        </p>
        <div className="mt-2">
          <DocTag>Paste box · &ldquo;Sort this for me&rdquo;</DocTag>
          <DocHint>Once it has run: {afterLine}</DocHint>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
      <h2 className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
        The fast way
      </h2>

      <p className="mt-3 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
        {intro}
      </p>

      {/* The id is suffixed by mode because two of these render on one page:
          the block appears on step 3 and on step 4, and the review surface
          stacks every step, so a bare `f-fastWay` was a duplicate id the
          moment both were on screen. */}
      <div className="mt-4">
        <TextArea
          id={`f-fastWay-${mode}`}
          rows={8}
          value={value}
          readOnly={running}
          onChange={(event) => {
            onChange(event.target.value);
            if (state.status !== "idle" && state.status !== "running") {
              setState({ status: "idle" });
            }
          }}
          onBlur={onBlur}
          placeholder="Paste it all here — don't tidy it."
        />
      </div>

      <div className="mt-4">
        <GhostButton
          disabled={running || preview}
          onClick={preview ? undefined : () => void run()}
        >
          {running ? "Reading it through…" : "Sort this for me"}
        </GhostButton>

        {preview ? (
          <p className="mt-3 max-w-[48ch] text-xs text-(--color-dim)">
            Sorting is disabled in preview.
          </p>
        ) : (
          <p aria-live="polite" className="mt-3 max-w-[48ch]">
            <Line
              state={state}
              afterLine={afterLine}
              onRetry={() => void run()}
            />
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * One line per state. Every one of them is dim body copy except the failures,
 * which are gold — this palette has no red, and nothing here is the client's
 * fault (D-INT-2).
 */
function Line({
  state,
  afterLine,
  onRetry,
}: {
  state: State;
  afterLine: string;
  onRetry: () => void;
}) {
  const dim =
    "font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)";
  const gold =
    "font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)";

  switch (state.status) {
    case "idle":
      return null;

    case "running":
      // [COPY — pending Taylor]
      return <span className={dim}>This takes a few seconds.</span>;

    case "nothing_pasted":
      // [COPY — pending Taylor]
      return (
        <span className={dim}>
          Nothing to sort yet — paste something in first.
        </span>
      );

    case "done":
      return <span className={dim}>{afterLine}</span>;

    case "failed":
      return (
        <span className={gold}>
          {state.reason === "rate_limited" ? (
            // [COPY — pending Taylor]
            <>Give it a minute and try again — your paste is safe.</>
          ) : state.reason === "empty" ? (
            // [COPY — pending Taylor]
            <>
              Couldn&apos;t find entries in that — your paste is still here. Add
              them by hand below, or try a different paste.
            </>
          ) : state.reason === "link" ? (
            // [COPY — pending Taylor]
            <>That link stopped working — your paste is still here.</>
          ) : (
            // [COPY — pending Taylor]
            <>
              That didn&apos;t work — your paste is still here.{" "}
              <button
                type="button"
                onClick={onRetry}
                className="underline underline-offset-2 hover:text-(--color-c3) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
              >
                Try again
              </button>
              , or add entries by hand below.
            </>
          )}
        </span>
      );
  }
}
