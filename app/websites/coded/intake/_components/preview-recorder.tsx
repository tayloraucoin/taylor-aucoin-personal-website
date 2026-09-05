"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GhostButton } from "@/components/ui/GradientButton";

/**
 * The voice note, working, inside the admin preview.
 *
 * The real recorder is a durable pipeline: chunks to IndexedDB, an upload
 * keyed to an engagement, a transcript written to that file's row, recovery
 * across a closed tab. None of that has anywhere to go in a preview, which is
 * why the component stood down there and printed "Recording is off in
 * preview" — and why the one thing Taylor most needed to hear could not be
 * heard (2026-09-04).
 *
 * This is the short path through the same idea: record, send the blob to the
 * admin-only transcription route, show what came back. Nothing is stored on
 * the device, nothing is uploaded to intake storage, and no transcript is
 * saved anywhere. Reloading the page loses it, which is correct — there is
 * nothing here that should outlive the tab.
 *
 * Deliberately not wired into the real recorder as a branch. That component's
 * value is that its durability is not optional; threading a "but not this
 * time" through its chunk writer, its recovery, and its row bookkeeping would
 * put the client's path one boolean away from losing a recording.
 */

/** Same order and the same reasoning as the real recorder's picker. */
function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const candidate of [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ]) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate;
  }
  return undefined;
}

/** [COPY — pending Taylor] — this component is admin-only and never client-facing. */
const COPY = {
  idle: "Record a note",
  again: "Record another",
  stop: "Stop",
  recording: "Recording",
  working: "Writing it out…",
  unsupported: "This browser cannot record audio.",
  denied: "No microphone access. Allow it in the browser and try again.",
  failed: "That didn't work. Try again in a moment.",
  tooLarge: "That recording is too long to send.",
  heading: "Transcript",
  note: "Admin preview. Nothing is saved — this is the transcription on its own.",
};

type Phase =
  | { status: "idle" }
  | { status: "recording" }
  | { status: "working" }
  | { status: "done"; transcript: string }
  | { status: "error"; message: string };

export function PreviewRecorder() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>({ status: "idle" });
  const [seconds, setSeconds] = useState(0);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setSupported(
      typeof MediaRecorder !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    );
  }, []);

  // Stop the microphone if this unmounts mid-recording. A live capture
  // outliving the component is the one failure here with a visible cost: the
  // browser keeps showing a recording indicator for a page that has gone.
  useEffect(() => {
    return () => {
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (phase.status !== "recording") return;
    const timer = setInterval(() => setSeconds((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [phase.status]);

  const transcribe = useCallback(async (blob: Blob) => {
    setPhase({ status: "working" });

    const body = new FormData();
    body.append(
      "audio",
      new File([blob], "note.webm", { type: blob.type || "audio/webm" }),
    );

    try {
      const response = await fetch("/api/admin/transcribe-preview", {
        method: "POST",
        body,
      });
      const result = (await response.json()) as
        { ok: true; transcript: string } | { ok: false; reason: string };

      if (result.ok) {
        setPhase({ status: "done", transcript: result.transcript });
        return;
      }

      setPhase({
        status: "error",
        message: result.reason === "too_large" ? COPY.tooLarge : COPY.failed,
      });
    } catch {
      setPhase({ status: "error", message: COPY.failed });
    }
  }, []);

  async function start() {
    setSeconds(0);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setPhase({ status: "error", message: COPY.denied });
      return;
    }

    streamRef.current = stream;
    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
    });
    recorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      const blob = new Blob(chunksRef.current, {
        type: recorder.mimeType || mimeType || "audio/webm",
      });
      chunksRef.current = [];
      if (blob.size === 0) {
        setPhase({ status: "error", message: COPY.failed });
        return;
      }
      void transcribe(blob);
    };

    recorder.start();
    setPhase({ status: "recording" });
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  if (supported === null) return null;

  if (!supported) {
    return <Notice>{COPY.unsupported}</Notice>;
  }

  return (
    <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4">
      <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
        {COPY.note}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        {phase.status === "recording" ? (
          <GhostButton onClick={stop}>{COPY.stop}</GhostButton>
        ) : (
          <GhostButton onClick={() => void start()}>
            {phase.status === "done" ? COPY.again : COPY.idle}
          </GhostButton>
        )}

        <p
          aria-live="polite"
          className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2)"
        >
          {phase.status === "recording"
            ? `${COPY.recording} · ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
            : phase.status === "working"
              ? COPY.working
              : ""}
        </p>
      </div>

      {phase.status === "error" ? (
        <p className="mt-4 font-body text-[15px] font-light text-(--color-c2)">
          {phase.message}
        </p>
      ) : null}

      {phase.status === "done" ? (
        <div className="mt-5 border-t border-(--color-faint) pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            {COPY.heading}
          </p>
          <p className="mt-3 whitespace-pre-wrap font-body text-[16px] font-light leading-[1.6] text-(--color-body)">
            {phase.transcript}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Notice({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <p className="flex min-h-12 w-full items-center justify-center rounded-(--radius) border border-dashed border-(--color-faint) bg-(--color-card) px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)/60">
      {children}
    </p>
  );
}
