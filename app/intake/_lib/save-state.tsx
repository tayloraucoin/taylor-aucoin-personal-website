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

  const report = useCallback<Report>((next) => setEntry(next), []);
  const value = useMemo(() => entry, [entry]);

  return (
    <ReportContext.Provider value={report}>
      <ValueContext.Provider value={value}>{children}</ValueContext.Provider>
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
