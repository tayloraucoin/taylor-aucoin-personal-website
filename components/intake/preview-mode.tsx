"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * How the intake is being rendered, and for whom.
 *
 * **Every field defaults to the safe, ordinary value, and that is the whole
 * design.** Preview is opt-in by mounting a provider, so a tree that never
 * mounts one — every real client questionnaire — cannot accidentally be in
 * preview, cannot be in document mode, and cannot be in the all-kinds scope. A
 * missing provider fails to the client's own experience; the alternative (a
 * sentinel token compared inside the autosave hook) fails to the writing state
 * the moment a refactor drops the comparison, and nothing would fail the build
 * (M-ADM-1).
 *
 * The context grew from a bare boolean to this object at ADM-4 (M-ADM-6).
 * `useIsPreview()` kept its name and its signature, so its ten callers were
 * untouched by that change.
 *
 * ## Who reads this
 *
 * The write-path audit, re-run 2026-09-04 for PORT-25, returns **sixteen**
 * modules under the intake `_components` and `_lib` trees that reach the
 * network. Twelve of them read `useIsPreview` and refuse:
 *
 * - `_lib/use-step-autosave` — the `saveStep` action and `localStorage`
 * - `_components/file-drop` — `/api/intake/upload`
 * - `_components/start-form`, coded `showcase-start-form` — mint an engagement
 * - `_components/pay-button`, coded `showcase-pay-button` — open Stripe Checkout
 * - `_components/deposit-checkout`, coded `showcase-checkout` — promo validation
 * - coded `extraction-block` — the extract action
 * - coded `ingest-run` — the ingestion action (PORT-18). It replaced
 *   `primer-block`, which held this line and was deleted with the step-2 paste
 *   box it belonged to.
 * - coded `taste/style-search` — the style-search action (PORT-25).
 * - coded `taste/motion-notice` — the add-on checkout action (PORT-26).
 *
 * Two more read it to disable a control rather than to refuse a write, which is
 * the same law wearing different clothes: coded `come-across` and coded
 * `taste/example-row`, whose **See more** opens a live third-party frame — not a
 * write, but not a thing a preview should be doing either.
 *
 * The remaining four — `complete-on-arrival`, `record-step-reached`,
 * `send-my-link-button`, and coded `step-proposals` — are mounted by the intake
 * *shell* (`[token]/[step]/page.tsx`), never by a step body, and the preview
 * does not mount the shell. They are unguarded on purpose and the reason is
 * their placement, not an oversight.
 *
 * That list is an audit, not a comment: **if a fifteenth network caller is ever
 * added beneath a step, it reads this too, or the preview silently starts
 * writing.**
 *
 * The provider is mounted in exactly one place:
 * `app/admin/(protected)/intake/questions`. Nothing under `app/websites/**`
 * imports it, so preview is not merely disabled on the client path — it is
 * unreachable from it.
 *
 * Lives here rather than in `lib/` because it has two consumers in two app
 * trees and it carries JSX; `lib/` on this repo is `.ts` only (M-ADM-2).
 */

/**
 * Whether the questionnaire renders as controls or as prose.
 *
 * `document` is the review reading of the same components: every label, help
 * line, and option is the string the component already renders, so there is no
 * transcription to drift from the client's words (D-ADM-6, D-ADM-9).
 */
export type RenderMode = "interface" | "document";

/**
 * Whether kind-driven branches render only this kind's, or every kind's.
 *
 * `all` is the "Every kind" overview: both sides of each branch render, tagged
 * with the kinds that meet them, so base questions and kind-specific ones are
 * legible in one read (D-ADM-11).
 */
export type KindScope = "one" | "all";

type PreviewState = {
  preview: boolean;
  render: RenderMode;
  scope: KindScope;
};

/** What a tree with no provider sees. Every value is the client's. */
const CLIENT: PreviewState = {
  preview: false,
  render: "interface",
  scope: "one",
};

const PreviewModeContext = createContext<PreviewState>(CLIENT);

export function PreviewModeProvider({
  children,
  render = "interface",
  scope = "one",
}: Readonly<{
  children: ReactNode;
  render?: RenderMode;
  scope?: KindScope;
}>) {
  // Memoised so flipping neither switch re-renders the whole questionnaire on
  // every parent render. The stack below this is eighteen step components deep.
  const value = useMemo<PreviewState>(
    () => ({ preview: true, render, scope }),
    [render, scope],
  );

  return (
    <PreviewModeContext.Provider value={value}>
      {children}
    </PreviewModeContext.Provider>
  );
}

/** True only inside a `PreviewModeProvider`. Never assume; always ask. */
export function useIsPreview(): boolean {
  return useContext(PreviewModeContext).preview;
}

/** `interface` on every client route, with or without a provider. */
export function useRenderMode(): RenderMode {
  return useContext(PreviewModeContext).render;
}

/**
 * The reading most primitives want, since they branch two ways and not three.
 *
 * A primitive in document mode never also needs to know it is in preview: the
 * document renders no control, so there is nothing to disable.
 */
export function useIsDocument(): boolean {
  return useContext(PreviewModeContext).render === "document";
}

/** `one` on every client route. Only the overview sets `all`. */
export function useKindScope(): KindScope {
  return useContext(PreviewModeContext).scope;
}
