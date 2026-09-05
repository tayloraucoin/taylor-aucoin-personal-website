"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { SaveIndicator, type SaveState } from "../_components/save-indicator";

type Entry = { state: SaveState; retry?: () => void };
type Report = (entry: Entry) => void;

const ValueContext = createContext<Entry>({ state: "idle" });
const ReportContext = createContext<Report | null>(null);

/**
 * The footer's other slot: whatever a step wants to say where the next-step
 * line normally goes.
 *
 * One step uses it — taste, for its picks count (D-PORT-16) — and it exists as
 * a slot rather than a prop for the same reason the save indicator does: the
 * count is client state that lives in the form, the footer is rendered by a
 * server component, and threading it through the shell would make the shell a
 * client component for one step's sake.
 *
 * Nothing reported means the footer shows exactly what it showed before, so
 * every other step on both tracks is untouched by construction.
 */
const NoteValueContext = createContext<ReactNode>(null);
const NoteReportContext = createContext<((note: ReactNode) => void) | null>(
  null,
);

/**
 * Lets the autosave indicator live in the step's sticky footer while the state
 * it reports lives in the form above it.
 *
 * The alternative was making `StepShell` a client component so both could sit
 * in one tree. This keeps the shell server-rendered — only the form and this
 * indicator ship JavaScript — and it means INT-6's five remaining steps report
 * their state the same way without threading props through the shell.
 */
export function SaveStateProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<Entry>({ state: "idle" });
  const [note, setNote] = useState<ReactNode>(null);

  const report = useCallback<Report>((next) => setEntry(next), []);
  const reportNote = useCallback((next: ReactNode) => setNote(next), []);
  const value = useMemo(() => entry, [entry]);

  return (
    <ReportContext.Provider value={report}>
      <NoteReportContext.Provider value={reportNote}>
        <ValueContext.Provider value={value}>
          <NoteValueContext.Provider value={note}>
            {children}
          </NoteValueContext.Provider>
        </ValueContext.Provider>
      </NoteReportContext.Provider>
    </ReportContext.Provider>
  );
}

/** Called by a step form to publish its save state to the footer. */
export function useReportSaveState(state: SaveState, retry: () => void) {
  const report = useContext(ReportContext);

  useEffect(() => {
    report?.({ state, retry });
  }, [report, state, retry]);
}

/** The footer's slot. Renders nothing until a form reports something. */
export function FooterSaveIndicator() {
  const { state, retry } = useContext(ValueContext);
  return <SaveIndicator state={state} onRetry={retry} />;
}

/**
 * Publishes a line into the footer's right-hand slot for as long as this
 * component is mounted.
 *
 * Cleared on unmount, which is the whole reason it is an effect rather than a
 * render-time call: without the teardown, a count reported on the taste step
 * would still be sitting in the footer on the step after it.
 */
export function useReportFooterNote(note: ReactNode) {
  const report = useContext(NoteReportContext);

  useEffect(() => {
    report?.(note);
    return () => report?.(null);
  }, [report, note]);
}

/**
 * The footer's right-hand end: a step's own line if it published one, and
 * otherwise exactly what was there before.
 *
 * `fallback` is the next-step line the shell already built. Passing it through
 * here rather than choosing between them in the shell is what keeps the shell a
 * server component while letting a client-side count take the slot — and it
 * means a step that publishes nothing renders the identical markup, which is
 * every step but one.
 */
export function FooterEnd({ fallback }: { fallback: ReactNode }) {
  return <>{useContext(NoteValueContext) ?? fallback}</>;
}
