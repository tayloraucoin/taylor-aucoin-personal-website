"use client";

import { useState } from "react";
import { useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import type { StyleSearchResult } from "@/server/services/style-search";
import { searchStyle } from "../../_actions/style-search";
import { TextArea } from "../../../../intake/_components/text-field";

/** [COPY — draft] — every string in this component. */
const COPY = {
  label: "Find more like it",
  intro:
    "Describe the site you're picturing and we'll go looking for real ones that feel like it. Anything helps — a mood, a site you can't remember the name of, “like the second one above but lighter”.",
  placeholder:
    "Dark but warm, big type, one project at a time, nothing moves until you hover…",
  button: "Search with AI",
  running: "Looking…",
  aside: "Reads your picks and the three words too.",
  empty: "Say a little first — even three words.",
  found:
    "Found these. We haven't checked them — some may be dead or nothing like you meant. Open the ones that sound right.",
  none: "Nothing convincing came back. Try different words, or put what you're picturing in the brain dump below — that reaches a person.",
  failed: "That didn't work — your description is still here. Try again in a moment.",
  budget:
    "That's the lot for now. Anything you'd have searched for is welcome in the brain dump.",
  link: "That link stopped working. Anything you've typed is still here.",
  add: "Add to my sites",
  added: "Added",
  preview: "Not available in preview.",
};

type State =
  | { status: "idle" }
  | { status: "running" }
  | { status: "results"; results: StyleSearchResult[] }
  | { status: "none" }
  | { status: "failed"; reason: "rate_limited" | "failed" | "link" | "empty" };

/**
 * Describe what you are picturing, and we go looking for it.
 *
 * The same grammar as **Predict with AI** on the words step, deliberately: the
 * button says what it is rather than hiding that a model is about to read
 * something, nothing that comes back is an answer until the client presses it
 * into their own list, and none of the failure states is styled as their
 * mistake — because none of them is.
 *
 * **The copy never says these links were checked.** They were not. A model
 * searched, and a link that is dead or wrong is an ordinary outcome the client
 * is told about up front, so the one thing this section must never do is imply
 * a vetting that did not happen.
 *
 * The description autosaves as `styleBrief` like any other field, so it reaches
 * Taylor whether or not the search ever ran — a client describing what they
 * want is worth having even when nothing came back.
 */
export function StyleSearch({
  token,
  brief,
  onBrief,
  onBlur,
  onAdd,
}: {
  token: string;
  brief: string;
  onBrief: (next: string) => void;
  onBlur: () => void;
  /** Presses a result into the client's own list of sites. */
  onAdd: (url: string) => void;
}) {
  const preview = useIsPreview();
  const [state, setState] = useState<State>({ status: "idle" });
  const [added, setAdded] = useState<ReadonlySet<string>>(new Set());

  const run = async () => {
    if (!brief.trim()) {
      setState({ status: "failed", reason: "empty" });
      return;
    }

    setState({ status: "running" });
    const outcome = await searchStyle(token, brief);

    if (!outcome.ok) {
      setState({ status: "failed", reason: outcome.reason });
      return;
    }

    setState(
      outcome.results.length === 0
        ? { status: "none" }
        : { status: "results", results: outcome.results },
    );
  };

  const running = state.status === "running";
  const briefId = "f-styleBrief";

  return (
    <section className="mt-12 border-t border-(--color-faint) pt-7">
      <h2 className="font-mono text-[10px] uppercase tracking-[.28em] text-(--color-dim)">
        {COPY.label}
      </h2>

      <p className="mt-4 max-w-[48ch] font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
        {COPY.intro}
      </p>

      <div className="mt-4">
        <label htmlFor={briefId} className="sr-only">
          {COPY.label}
        </label>
        <TextArea
          id={briefId}
          rows={3}
          value={brief}
          readOnly={running}
          placeholder={COPY.placeholder}
          onChange={(event) => onBrief(event.target.value)}
          onBlur={onBlur}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <GhostButton
          type="button"
          onClick={preview ? undefined : () => void run()}
          disabled={preview || running}
        >
          {running ? COPY.running : COPY.button}
        </GhostButton>

        <span className="font-body text-[13.5px] font-light text-(--color-dim)">
          {preview ? COPY.preview : COPY.aside}
        </span>
      </div>

      {/* One short announcement per state, out of sight.
          The visible blocks below are not live regions: a list of six result
          cards inside one would be read out in full every time a search
          finished, which is how a helpful feature becomes an unusable one. */}
      <p aria-live="polite" className="sr-only">
        {running
          ? COPY.running
          : state.status === "results"
            ? `Found ${state.results.length} ${state.results.length === 1 ? "site" : "sites"}.`
            : state.status === "none"
              ? COPY.none
              : state.status === "failed"
                ? "Nothing was searched."
                : ""}
      </p>

      {/* Every outcome is a calm sentence. None of them is an error, because
          none of them is something the client did wrong. */}
      {state.status === "failed" ? (
        <p
          className={`mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] ${
            state.reason === "empty"
              ? "text-(--color-dim)"
              : "text-(--color-c2)"
          }`}
        >
          {state.reason === "empty"
            ? COPY.empty
            : state.reason === "rate_limited"
              ? COPY.budget
              : state.reason === "link"
                ? COPY.link
                : COPY.failed}
        </p>
      ) : null}

      {state.status === "none" ? (
        <p
          className="mt-3 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)"
        >
          {COPY.none}
        </p>
      ) : null}

      {state.status === "results" ? (
        <div>
          <p className="mt-4 max-w-[48ch] font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            {COPY.found}
          </p>

          <ul className="mt-4 space-y-3">
            {state.results.map((result) => {
              const isAdded = added.has(result.url);

              return (
                <li
                  key={result.url}
                  className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4"
                >
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-4 transition-colors hover:text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
                  >
                    {result.host} ↗
                  </a>

                  <p className="mt-2 font-body text-[16px] font-light leading-[1.5] text-(--color-ink)">
                    {result.why}
                  </p>

                  {isAdded ? (
                    <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                      {COPY.added}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onAdd(result.url);
                        setAdded((current) =>
                          new Set(current).add(result.url),
                        );
                      }}
                      className="mt-2.5 min-h-11 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2) underline underline-offset-2 transition-colors hover:text-(--color-c3) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
                    >
                      {COPY.add}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
