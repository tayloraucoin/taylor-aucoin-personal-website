"use client";

import { createContext, useContext, type ReactNode } from "react";

/**
 * Whether the intake is being rendered for review rather than for a client.
 *
 * **The default is `false`, and that is the whole design.** Preview is opt-in
 * by mounting a provider, so a tree that never mounts one — every real client
 * questionnaire — cannot accidentally be in preview. A missing provider fails
 * to the safe state; the alternative (a sentinel token compared inside the
 * autosave hook) fails to the writing state the moment a refactor drops the
 * comparison, and nothing would fail the build (M-ADM-1).
 *
 * Exactly three modules read this, and they are the only three under a step
 * body that reach the network — `_lib/use-step-autosave`,
 * `_components/file-drop`, and the showcase `_components/extraction-block`.
 * That list is an audit, re-run at the top of ADM-2. If a fourth network
 * caller is ever added beneath a step, it reads this too, or the preview
 * silently starts writing.
 *
 * The provider is mounted in exactly one place:
 * `app/admin/(protected)/intake/questions`. Nothing under `app/websites/**`
 * imports it, so preview is not merely disabled on the client path — it is
 * unreachable from it.
 *
 * Lives here rather than in `lib/` because it has two consumers in two app
 * trees and it carries JSX; `lib/` on this repo is `.ts` only (M-ADM-2).
 */
const PreviewModeContext = createContext(false);

export function PreviewModeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <PreviewModeContext.Provider value={true}>
      {children}
    </PreviewModeContext.Provider>
  );
}

/** True only inside a `PreviewModeProvider`. Never assume; always ask. */
export function useIsPreview(): boolean {
  return useContext(PreviewModeContext);
}
