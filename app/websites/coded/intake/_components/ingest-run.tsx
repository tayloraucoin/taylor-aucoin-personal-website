"use client";

import { useEffect, useRef, useState } from "react";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton, GradientButton } from "@/components/ui/GradientButton";
import type { ShowcaseFlavour } from "@/lib/intake/showcase-steps";
import { copyPackFor, stepsFor } from "@/lib/intake/tracks";
import { showcaseIntakeRoutes } from "@/lib/routes";
import { runIngestionForToken } from "../_actions/ingest";
import { DocHint, DocTag } from "../../../intake/_components/document";
import { WorkingIndicator } from "../../../intake/_components/working-indicator";

type Reason =
  | "nothingPasted"
  | "tooLarge"
  | "rateLimited"
  | "offline"
  | "link"
  | "failed"
  | "alreadyRan";

type State =
  | { status: "idle" }
  | { status: "confirming" }
  | { status: "running" }
  | { status: "done"; filled: number; failed: string[] }
  | { status: "failed"; reason: Reason };

/**
 * The one action on step 1: read everything, once.
 *
 * Three things about this component are laws rather than choices.
 *
 * **The confirmation is a real screen, not a `confirm()`.** This is the only
 * action in the whole questionnaire that cannot be undone or repeated, so it
 * gets the trust grammar a destructive action gets: it says plainly that it
 * runs once, says what a half-ready run costs, and offers a real way back. It
 * manufactures no urgency — no countdown, no warning colour, no "last chance".
 * Nothing here is the client's mistake and the palette has no red anyway.
 *
 * **The in-progress state is honest about duration and never dead-ends.** It
 * says the real range rather than a p50, says the tab can be closed, and every
 * way the request can end lands somewhere: a failure rung with the paste
 * intact, or the completed summary. It blocks interaction because the form
 * underneath is about to be rewritten by the server and letting someone type
 * into a field that is mid-write would lose what they typed.
 *
 * **The motion settles.** One hairline breathing at the slow duration, not a
 * spinner — a spinner on a form reads as trouble, and this is the moment a
 * client is most likely to think something has gone wrong. Reduced motion
 * needs no branch here: the sitewide collapse turns the keyframe into the
 * static line it is drawn from.
 *
 * Every string comes from the pack's `ingestion` block, so the copy pass is
 * one file.
 */
/** What the run is about to read, counted for the confirmation. */
export type Manifest = {
  hasPaste: boolean;
  /** Files that have been read and will be used. */
  files: number;
  /** Pages that will be fetched when the run starts. */
  links: number;
  /** Files still mid-read. The run waits briefly, but not forever. */
  reading: number;
};

export function IngestRun({
  token,
  flavour,
  /** Whether the paste box holds anything. Decides the nothing-pasted line. */
  hasSource,
  manifest,
}: {
  token: string;
  flavour: ShowcaseFlavour;
  hasSource: boolean;
  manifest: Manifest;
}) {
  const copy = copyPackFor(flavour).ingestion;
  const preview = useIsPreview();
  const document = useIsDocument();
  const [state, setState] = useState<State>({ status: "idle" });

  // Ingestion is always step 1 on this track, so step 2 is where the success
  // card points. Read from the registry rather than named, so a reordering
  // moves this with it.
  const nextHref = showcaseIntakeRoutes.step(
    token,
    stepsFor("showcase", flavour)[1]!.key,
  );

  const run = async () => {
    // Checked here rather than only on the server, so being offline costs a
    // round trip that cannot succeed and reads as a failure of the feature.
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setState({ status: "failed", reason: "offline" });
      return;
    }

    setState({ status: "running" });

    let result;
    try {
      result = await runIngestionForToken(token);
    } catch {
      // A thrown action crossing the boundary — a dropped connection, a
      // function timeout. The server may still be finishing, which is what the
      // copy says; nothing was written unless it completed, and a completed
      // run is what the client finds on their next load.
      setState({ status: "failed", reason: "failed" });
      return;
    }

    if (result.ok) {
      // Held here as well as server-rendered. The stored record is still the
      // authority on every later visit, but a `refresh()` alone swapped one
      // quiet card for another and read as nothing having happened — the run
      // takes minutes and deserves to be told it finished (Taylor, 2026-09-05).
      // No `refresh()` here on purpose: the step's page now redirects forward
      // once the record exists, so refreshing would pull the client off this
      // card before they had read it. They leave by the button.
      setState({
        status: "done",
        filled: result.filled,
        failed: result.failed,
      });
      return;
    }

    const map: Record<string, Reason> = {
      empty: "nothingPasted",
      too_large: "tooLarge",
      rate_limited: "rateLimited",
      link: "link",
      already_ran: "alreadyRan",
      failed: "failed",
    };
    setState({ status: "failed", reason: map[result.reason] ?? "failed" });
  };

  /**
   * The document renders the action and its confirmation as prose, because a
   * one-shot action's warning is one of the most important things on this
   * step to review — and it is invisible in a screenshot of the idle state.
   */
  if (document) {
    return (
      <section className="mb-8">
        <DocTag>Button · &ldquo;{copy.button}&rdquo;</DocTag>
        <DocHint>
          {copy.confirm.title} {copy.confirm.body}
        </DocHint>
        <DocHint>Once it runs: {copy.done.again}</DocHint>
      </section>
    );
  }

  return (
    <div className="mt-8">
      {state.status === "confirming" ? (
        <Confirm
          copy={copy.confirm}
          manifest={manifest}
          onProceed={() => void run()}
          onBack={() => setState({ status: "idle" })}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <GhostButton
            type="button"
            disabled={preview || state.status === "running"}
            onClick={
              preview
                ? undefined
                : () =>
                    setState(
                      hasSource
                        ? { status: "confirming" }
                        : { status: "failed", reason: "nothingPasted" },
                    )
            }
          >
            {copy.button}
          </GhostButton>

          {preview ? (
            <span className="font-body text-[13.5px] font-light text-(--color-dim)">
              Not available in preview.
            </span>
          ) : null}
        </div>
      )}

      {state.status === "failed" ? (
        <p
          aria-live="polite"
          className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)"
        >
          {copy.failures[state.reason]}
        </p>
      ) : null}

      {state.status === "running" ? <RunningOverlay copy={copy.running} /> : null}

      {state.status === "done" ? (
        <DoneOverlay
          filled={state.filled}
          failed={state.failed}
          nextHref={nextHref}
        />
      ) : null}
    </div>
  );
}

/**
 * What the run found, and the way onward.
 *
 * Deliberately a modal rather than a line under the button: the thing it is
 * reporting rewrote most of the form, and the client's next move is forward
 * rather than back into a step that is now finished. It is the only screen in
 * the flow that ends by pointing at the next one, because it is the only one
 * whose work happened somewhere the client could not watch.
 *
 * [COPY — draft, pending Taylor]
 */
function DoneOverlay({
  filled,
  failed,
  nextHref,
}: {
  filled: number;
  failed: string[];
  nextHref: string;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ingest-done-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(6_11_30/.86)] px-[22px] backdrop-blur-[6px]"
    >
      <div className="w-full max-w-[420px] rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-6">
        <p
          id="ingest-done-title"
          className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)"
        >
          Read it through
        </p>

        <p className="mt-5 font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
          {filled > 0
            ? `We filled in ${filled} ${filled === 1 ? "answer" : "answers"} from what you sent. They're marked where they land, and every one of them is yours to correct.`
            : "We read everything you sent. It didn't give us enough to fill anything in confidently, so the questions ahead are yours to answer from scratch."}
        </p>

        {failed.length > 0 ? (
          <p className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            We couldn&rsquo;t read {failed.join(", ")}. Taylor will ask about
            that part on the call.
          </p>
        ) : null}

        <div className="mt-6">
          <GradientButton href={nextHref}>Continue →</GradientButton>
        </div>
      </div>
    </div>
  );
}

/**
 * "Are you sure you're ready" — stated as information, with a way back.
 *
 * A card in the flow rather than a modal: the thing it is asking about is the
 * box directly above it, and a dialog would cover the one piece of evidence
 * the client needs to answer the question.
 */
function Confirm({
  copy,
  manifest,
  onProceed,
  onBack,
}: {
  copy: {
    title: string;
    body: string;
    proceed: string;
    back: string;
    reads: {
      title: string;
      paste: string;
      files: string;
      links: string;
      stillReading: string;
      none: string;
    };
  };
  manifest: Manifest;
  onProceed: () => void;
  onBack: () => void;
}) {
  // Counted rows rather than a sentence with numbers in it: this is a manifest
  // of what is about to be read, and a list is what a person checks against
  // what they think they sent.
  const rows: Array<[string, string]> = [];
  if (manifest.hasPaste) rows.push([copy.reads.paste, ""]);
  if (manifest.files > 0) rows.push([copy.reads.files, String(manifest.files)]);
  if (manifest.links > 0) rows.push([copy.reads.links, String(manifest.links)]);

  return (
    <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-5">
      <p className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)">
        {copy.title}
      </p>

      <p className="mt-3 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
        {copy.body}
      </p>

      <div className="mt-4 border-t border-(--color-faint) pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
          {copy.reads.title}
        </p>

        <ul className="mt-2 space-y-1">
          {rows.length === 0 ? (
            <li className="font-body text-[15px] font-light text-(--color-dim)">
              {copy.reads.none}
            </li>
          ) : (
            rows.map(([label, count]) => (
              <li
                key={label}
                className="font-body text-[15px] font-light text-(--color-body)"
              >
                {label}
                {count ? (
                  <span className="text-(--color-dim)"> · {count}</span>
                ) : null}
              </li>
            ))
          )}
        </ul>

        {/* The one thing that changes whether pressing now is the right move.
            Gold, because it is the line worth reading twice — not because
            anything is wrong. */}
        {manifest.reading > 0 ? (
          <p className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-c2)">
            {copy.reads.stillReading} · {manifest.reading}
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <GhostButton type="button" onClick={onProceed}>
          {copy.proceed}
        </GhostButton>

        {/* A real way back, and a plain one: a second button of equal weight
            would make the choice look like a coin toss rather than a check. */}
        <button
          type="button"
          onClick={onBack}
          className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-2 transition-colors hover:text-(--color-c2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
        >
          {copy.back}
        </button>
      </div>
    </div>
  );
}

/**
 * What the wait is spent saying, after the pack's own first line.
 *
 * A run can take a couple of minutes on a long paste, and the honest use of
 * that time is telling someone what the form will ask them next — so the steps
 * ahead arrive recognised rather than cold (Taylor, 2026-09-05). They stop on
 * the last line rather than looping.
 *
 * [COPY — draft, pending Taylor]
 */
const RUNNING_NOTES = [
  "We're pulling names and dates out of what you wrote.",
  "Next you'll tell us who the site is for, and what you want them to do.",
  "After that, your work goes in one project at a time.",
  "Then you'll rate some real sites so we can see your taste.",
  "Anything we fill in is yours to change.",
] as const;

/**
 * The in-progress state: focus trapped, interaction blocked, announced once.
 *
 * There is nothing to press here on purpose. The run is happening on the
 * server, so a cancel button would either lie about stopping it or leave the
 * client believing a half-written form is safe to edit. What it offers instead
 * is the true reassurance: the tab can be closed and the work will be waiting.
 */
function RunningOverlay({ copy }: { copy: { title: string; body: string } }) {
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialog.current?.focus();

    // Focus cannot leave while the form underneath is being rewritten, and
    // there is nothing in here to tab to.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ingest-running-title"
      ref={dialog}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgb(6_11_30/.86)] px-[22px] backdrop-blur-[6px] focus:outline-none"
    >
      <div className="w-full max-w-[420px] rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-6">
        <p
          id="ingest-running-title"
          className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-c2)"
        >
          {copy.title}
        </p>

        <div className="mt-5">
          <WorkingIndicator messages={[copy.body, ...RUNNING_NOTES]} />
        </div>
      </div>
    </div>
  );
}
