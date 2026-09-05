"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsDocument, useIsPreview } from "@/components/intake/preview-mode";
import { GhostButton } from "@/components/ui/GradientButton";
import {
  DocHint,
  DocTag,
} from "../../../intake/_components/document";
import { uploadIntakeFile } from "../../../intake/_lib/upload-file";
import { saveTranscriptEdit } from "../_actions/save-transcript";
import {
  assembleSession,
  dropSession,
  endSession,
  latestSession,
  putChunk,
  scopeFor,
  startSession,
  storeAvailable,
  sweepOldSessions,
  type RecordingSession,
} from "../_lib/recording-store";

/**
 * Record a voice note here, and have it written out.
 *
 * ## The one requirement
 *
 * A client must never lose a recording. Three things make that true, and each
 * of them is a boundary that must not be collapsed for convenience:
 *
 * 1. **Chunks are durable before they are acknowledged.** `MediaRecorder` runs
 *    with a five-second timeslice and every `dataavailable` is awaited into
 *    IndexedDB. A tab killed at minute eighteen leaves eighteen minutes on
 *    disk, and the card offers them back on the next load.
 * 2. **Local chunks are deleted only after the server confirms.** Not after the
 *    PUT resolves, not at stop, not on unmount. A failed upload leaves the
 *    audio exactly where it was, so the retry is real rather than decorative.
 * 3. **Transcription is a separate step whose failure never touches the
 *    audio.** A voice note with no transcript is a valid, complete, shippable
 *    state — it is precisely what shipped before this component existed.
 *
 * ## Nothing here may block the step
 *
 * Every field on this form is optional (D-INT-4). No state below disables Next,
 * nothing is styled as an error, and a client with no microphone permission, no
 * `MediaRecorder`, or no interest meets the file drop and the phone-memo copy
 * that were always underneath — on screen from the start, as the floor, not
 * revealed by a failure.
 *
 * ## The transcript is a draft until a person has read it
 *
 * It comes back into a text box the client owns (D-PORT-3). An unedited
 * transcript is marked as machine-written in Taylor's intake document, because
 * a machine's guess at a festival name is not a fact.
 *
 * ## Motion
 *
 * The level meter is an animation and stops under `prefers-reduced-motion` —
 * the bar renders at a fixed height instead. The elapsed counter keeps
 * counting: it is information, and it is the only non-visual confirmation that
 * recording is live.
 *
 * This component sits **inside** the step's existing `GradientRing` and never
 * introduces a second one (D-INT-3 / D-PORT-7).
 */

/** Written to IndexedDB every five seconds. Bounds loss without thrashing. */
const TIMESLICE_MS = 5_000;

/** Speech-grade Opus: thirty minutes lands around 7 MB. */
const AUDIO_BITS_PER_SECOND = 32_000;

/** A quiet line appears here. Nothing stops. */
const NUDGE_MS = 20 * 60 * 1000;

/**
 * The recorder stops itself here and keeps every byte (Taylor, 2026-09-03).
 *
 * This is a property of the browser recorder, not of the field: the file drop
 * beside it still accepts a recording of any length, so nothing is ever
 * *rejected* for being long.
 */
const CEILING_MS = 30 * 60 * 1000;

/** Matches the service's per-file budget (M-PORT-30). */
const MAX_TRANSCRIPT_ATTEMPTS = 5;

const DEBOUNCE_MS = 900;

/** One voice note the server already knows about. */
export type VoiceNoteFile = {
  id: string;
  originalName: string | null;
  uploadedAt: Date | null;
  transcript: string | null;
  transcriptAttempts: number;
  transcriptEditedAt: Date | null;
  transcriptStatus: string | null;
};

type Phase =
  | "idle"
  | "permission_pending"
  | "recording"
  | "paused"
  | "stopped_local"
  | "uploading"
  | "uploaded"
  | "upload_failed";

type TranscriptState =
  | { status: "none" }
  | { status: "running" }
  | { status: "done" }
  | { status: "failed"; reason: string };

type NoteRow = {
  fileId: string;
  name: string;
  transcript: string;
  edited: boolean;
  attempts: number;
  state: TranscriptState;
  save: "idle" | "saving" | "saved" | "failed";
};

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;

  // Chrome and Firefox take the first; Safari takes `audio/mp4`. The browser's
  // own answer is accepted — the container is never constrained to one format.
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

function extensionFor(mimeType: string): string {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

function clock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function rowFrom(file: VoiceNoteFile): NoteRow {
  return {
    fileId: file.id,
    name: file.originalName ?? "Voice note",
    transcript: file.transcript ?? "",
    edited: file.transcriptEditedAt !== null,
    attempts: file.transcriptAttempts,
    state: file.transcript
      ? { status: "done" }
      : file.transcriptStatus === "failed"
        ? { status: "failed", reason: "failed" }
        : { status: "none" },
    save: "idle",
  };
}

export function VoiceRecorder({
  token,
  existing,
  dropped = [],
}: {
  token: string;
  existing: readonly VoiceNoteFile[];
  /**
   * Row ids of voice notes uploaded through the file drop during this visit.
   *
   * The drop beside this component is the floor and stays exactly as it was,
   * so it reports upward to the step, which passes the ids down here. That is
   * what lets an uploaded phone memo be written out in the same visit instead
   * of on the client's next one.
   */
  dropped?: readonly string[];
}) {
  /**
   * There is no engagement behind a preview, so a recording could not be
   * uploaded and a transcript could not be saved. A control that says up front
   * that it will not work is kinder than one that discovers it afterwards
   * (ADM-2, UX spec §6) — the same call `FileDrop` makes.
   */
  const preview = useIsPreview();
  const isDocument = useIsDocument();

  const [supported, setSupported] = useState<boolean | null>(null);
  const [durable, setDurable] = useState(true);
  const [denied, setDenied] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [level, setLevel] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  const [recovered, setRecovered] = useState<RecordingSession | null>(null);
  const [rows, setRows] = useState<NoteRow[]>(() => existing.map(rowFrom));

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<RecordingSession | null>(null);
  const seqRef = useRef(0);
  const writesRef = useRef<Promise<unknown>>(Promise.resolve());
  const memoryChunksRef = useRef<Blob[]>([]);
  const blobRef = useRef<Blob | null>(null);
  const startedAtRef = useRef(0);
  const audioRef = useRef<{
    context: AudioContext;
    analyser: AnalyserNode;
    frame: number;
  } | null>(null);
  const recoveryRef = useRef<HTMLDivElement>(null);
  const kickedRef = useRef(false);

  /* ── Capability, durability, and motion, all read once ──────────────────── */

  useEffect(() => {
    setSupported(
      typeof MediaRecorder !== "undefined" &&
        typeof navigator !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    );

    void storeAvailable().then(setDurable);

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(query.matches);

    const onChange = (event: MediaQueryListEvent) =>
      setReduceMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  /* ── What survived the last visit ───────────────────────────────────────── */

  useEffect(() => {
    if (preview) return;

    let cancelled = false;

    void (async () => {
      const session = await latestSession(scopeFor(token));
      if (cancelled) return;

      if (session) {
        setRecovered(session);
      } else {
        // Nothing to offer back, so nothing a sweep could take away.
        void sweepOldSessions();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [preview, token]);

  useEffect(() => {
    if (recovered) recoveryRef.current?.focus();
  }, [recovered]);

  /* ── Transcription ──────────────────────────────────────────────────────── */

  const patchRow = useCallback(
    (fileId: string, changes: Partial<NoteRow>) => {
      setRows((current) =>
        current.map((row) =>
          row.fileId === fileId ? { ...row, ...changes } : row,
        ),
      );
    },
    [],
  );

  const transcribe = useCallback(
    async (fileId: string) => {
      patchRow(fileId, { state: { status: "running" } });

      try {
        const response = await fetch("/api/intake/transcribe", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token, fileId }),
        });

        const result = (await response.json()) as
          | { ok: true; transcript: string }
          | { ok: false; reason: string };

        if (result.ok) {
          patchRow(fileId, {
            transcript: result.transcript,
            state: { status: "done" },
          });
          return;
        }

        patchRow(fileId, { state: { status: "failed", reason: result.reason } });
      } catch {
        patchRow(fileId, { state: { status: "failed", reason: "failed" } });
      } finally {
        setRows((current) =>
          current.map((row) =>
            row.fileId === fileId
              ? { ...row, attempts: row.attempts + 1 }
              : row,
          ),
        );
      }
    },
    [patchRow, token],
  );

  /**
   * Picks up voice notes that were uploaded but never written out.
   *
   * This is what serves the client who recorded, closed the tab before the
   * transcription came back, and returned later — and the one who uploaded a
   * phone memo on a previous visit. Only rows that have never been attempted
   * are started automatically: a row already marked failed offers a button
   * instead, because auto-retrying a known failure on every mount is a loop
   * dressed up as helpfulness.
   */
  useEffect(() => {
    if (preview || kickedRef.current) return;
    kickedRef.current = true;

    for (const file of existing) {
      if (file.transcript) continue;
      if (file.uploadedAt === null) continue;
      if (file.transcriptStatus !== null) continue;
      if (file.transcriptAttempts >= MAX_TRANSCRIPT_ATTEMPTS) continue;

      void transcribe(file.id);
    }
  }, [existing, preview, transcribe]);

  /**
   * A file the drop just landed: give it a row and write it out.
   *
   * Guarded on the row already existing so a re-render cannot start a second
   * run for the same file — the ids only ever accumulate.
   */
  const seenRef = useRef(new Set<string>());

  useEffect(() => {
    for (const fileId of dropped) {
      if (seenRef.current.has(fileId)) continue;
      seenRef.current.add(fileId);

      setRows((current) =>
        current.some((row) => row.fileId === fileId)
          ? current
          : [
              ...current,
              {
                fileId,
                name: "Voice note",
                transcript: "",
                edited: false,
                attempts: 0,
                state: { status: "none" },
                save: "idle",
              },
            ],
      );

      void transcribe(fileId);
    }
  }, [dropped, transcribe]);

  /* ── The transcript box ─────────────────────────────────────────────────── */

  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const editTranscript = useCallback(
    (fileId: string, next: string) => {
      patchRow(fileId, { transcript: next, save: "saving", edited: true });

      const existingTimer = timers.current.get(fileId);
      if (existingTimer) clearTimeout(existingTimer);

      timers.current.set(
        fileId,
        setTimeout(() => {
          void saveTranscriptEdit(token, fileId, next).then((result) => {
            patchRow(fileId, { save: result.ok ? "saved" : "failed" });
          });
        }, DEBOUNCE_MS),
      );
    },
    [patchRow, token],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
    };
  }, []);

  /* ── Upload ─────────────────────────────────────────────────────────────── */

  const send = useCallback(
    async (blob: Blob, session: RecordingSession | null) => {
      setPhase("uploading");
      setProgress(0);

      const extension = extensionFor(blob.type || "audio/webm");
      const filename = `voice-note.${extension}`;

      try {
        const { fileId, confirmed } = await uploadIntakeFile(
          { token, stepKey: "words", fieldKey: "voice_note" },
          blob,
          filename,
          setProgress,
        );

        // The gate. Chunks are dropped here and nowhere else — a PUT that
        // landed but a confirm that did not is an upload the intake document
        // cannot see, so the audio stays on the device and the retry is real.
        if (!confirmed) throw new Error("confirm");

        if (session) await dropSession(session.id);

        setPhase("uploaded");
        setAnnouncement("Voice note sent");

        setRows((current) => [
          ...current,
          {
            fileId,
            name: filename,
            transcript: "",
            edited: false,
            attempts: 0,
            state: { status: "none" },
            save: "idle",
          },
        ]);

        void transcribe(fileId);
      } catch {
        setPhase("upload_failed");
        setAnnouncement("Voice note didn't send");
      }
    },
    [token, transcribe],
  );

  /* ── Recording ──────────────────────────────────────────────────────────── */

  const teardownMeter = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    cancelAnimationFrame(audio.frame);
    void audio.context.close().catch(() => {});
    audioRef.current = null;
    setLevel(0);
  }, []);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const finish = useCallback(async () => {
    const session = sessionRef.current;
    const duration = Date.now() - startedAtRef.current;

    // Whatever the store holds is authoritative; the in-memory copy is only
    // the fallback for a browser that would not give us a store at all.
    await writesRef.current;

    let blob: Blob | null = null;
    if (session) {
      await endSession(session.id, duration);
      blob = await assembleSession(session);
    }

    if (!blob && memoryChunksRef.current.length > 0) {
      blob = new Blob(memoryChunksRef.current, {
        type: memoryChunksRef.current[0]?.type || "audio/webm",
      });
    }

    if (!blob) {
      setPhase("idle");
      setAnnouncement("Nothing was recorded");
      return;
    }

    blobRef.current = blob;
    setPhase("stopped_local");
    setAnnouncement(`Recording stopped at ${clock(duration)}`);

    void send(blob, session);
  }, [send]);

  const start = useCallback(async () => {
    setPhase("permission_pending");
    setDenied(false);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Denied, or no device. One plain line, no modal, no instructions for
      // finding browser settings — the file drop below was always the floor.
      setDenied(true);
      setPhase("idle");
      return;
    }

    streamRef.current = stream;

    const mimeType = pickMimeType();
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
    });

    recorderRef.current = recorder;
    seqRef.current = 0;
    memoryChunksRef.current = [];
    writesRef.current = Promise.resolve();
    blobRef.current = null;
    startedAtRef.current = Date.now();

    const session: RecordingSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      scope: scopeFor(token),
      mimeType: recorder.mimeType || mimeType || "audio/webm",
      startedAt: Date.now(),
      durationMs: 0,
    };

    const opened = await startSession(session);
    sessionRef.current = opened ? session : null;
    setDurable(opened);

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size === 0) return;

      const seq = seqRef.current++;

      // Chained rather than fired in parallel: the writes are small, ordering
      // is free to preserve, and `finish` has one promise to await.
      writesRef.current = writesRef.current.then(async () => {
        const stored = sessionRef.current
          ? await putChunk(sessionRef.current.id, seq, event.data)
          : false;

        // The fallback, and it is a real fallback rather than a mirror: a
        // store that works never accumulates a second copy in memory.
        if (!stored) {
          setDurable(false);
          memoryChunksRef.current.push(event.data);
        }
      });
    });

    recorder.addEventListener("stop", () => {
      teardownMeter();
      stopTracks();
      void finish();
    });

    recorder.start(TIMESLICE_MS);
    setElapsed(0);
    setPhase("recording");
    setAnnouncement("Recording");

    if (!reduceMotion) startMeter(stream);
  }, [finish, reduceMotion, stopTracks, teardownMeter, token]);

  function startMeter(stream: MediaStream) {
    try {
      const context = new AudioContext();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      context.createMediaStreamSource(stream).connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteTimeDomainData(data);

        let peak = 0;
        for (const value of data) {
          peak = Math.max(peak, Math.abs(value - 128) / 128);
        }

        setLevel(Math.min(1, peak * 1.8));

        if (audioRef.current) {
          audioRef.current.frame = requestAnimationFrame(tick);
        }
      };

      audioRef.current = { context, analyser, frame: requestAnimationFrame(tick) };
    } catch {
      // No meter. Recording is unaffected, and the counter still counts.
    }
  }

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === "inactive") return;
    recorder.stop();
    recorderRef.current = null;
  }, []);

  /* ── The clock, the nudge, and the ceiling ──────────────────────────────── */

  useEffect(() => {
    if (phase !== "recording") return;

    const timer = setInterval(() => {
      const next = Date.now() - startedAtRef.current;
      setElapsed(next);
      if (next >= CEILING_MS) stop();
    }, 500);

    return () => clearInterval(timer);
  }, [phase, stop]);

  /* ── Leaving the page mid-recording ─────────────────────────────────────── */

  useEffect(() => {
    return () => {
      // Stop the hardware, keep the chunks. The session row stays open and the
      // next visit offers it back — which is exactly the tab-death path, and
      // it should behave identically whether the tab died or the client
      // navigated.
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== "inactive") recorder.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());

      const audio = audioRef.current;
      if (audio) {
        cancelAnimationFrame(audio.frame);
        void audio.context.close().catch(() => {});
      }
    };
  }, []);

  /* ── Recovery ───────────────────────────────────────────────────────────── */

  async function keepRecovered() {
    if (!recovered) return;

    const blob = await assembleSession(recovered);
    setRecovered(null);
    void sweepOldSessions();

    if (!blob) {
      setAnnouncement("That recording could not be read");
      return;
    }

    blobRef.current = blob;
    setElapsed(recovered.durationMs);
    void send(blob, recovered);
  }

  async function discardRecovered() {
    if (!recovered) return;
    await dropSession(recovered.id);
    setRecovered(null);
    void sweepOldSessions();
  }

  /* ── Surfaces ───────────────────────────────────────────────────────────── */

  if (isDocument) {
    return (
      <>
        <DocTag>Voice recording</DocTag>
        {/* [COPY — pending Taylor] */}
        <DocHint>Record a voice note in the browser</DocHint>
      </>
    );
  }

  if (preview) {
    return (
      <p className="flex min-h-12 w-full items-center justify-center rounded-(--radius) border border-dashed border-(--color-faint) bg-(--color-card) px-4 py-3 text-center font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)/60">
        {/* [COPY — pending Taylor] */}
        Recording is off in preview
      </p>
    );
  }

  // Feature detection has not run yet on the very first paint. Rendering the
  // button and then removing it would be worse than a beat of nothing.
  if (supported === null) return null;

  return (
    <div>
      {/* One announcement per transition, not one per chunk. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {recovered ? (
        <div
          ref={recoveryRef}
          tabIndex={-1}
          className="mb-4 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4 outline-none"
        >
          {/* [COPY — pending Taylor] */}
          <p className="font-body text-[14px] font-light leading-[1.6] text-(--color-body)">
            There&apos;s a recording here from earlier
            {recovered.durationMs > 0
              ? ` — about ${clock(recovered.durationMs)}`
              : ""}
            . Keep it, or start again?
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <GhostButton onClick={() => void keepRecovered()}>
              Keep it
            </GhostButton>
            <button
              type="button"
              onClick={() => void discardRecovered()}
              className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim) underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-c2)"
            >
              Start again
            </button>
          </div>
        </div>
      ) : null}

      {supported ? (
        <div className="rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4">
          {phase === "recording" || phase === "paused" ? (
            <>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-6 w-1 shrink-0 rounded-full bg-(--color-c2)"
                  style={{
                    // The meter is the animation, so it is the thing that
                    // freezes. A fixed bar under reduced motion still shows
                    // that the control is live.
                    transform: reduceMotion
                      ? "scaleY(0.5)"
                      : `scaleY(${0.25 + level * 0.75})`,
                  }}
                />
                <p className="font-mono text-[12px] tracking-[.14em] text-(--color-c2)">
                  {clock(elapsed)}
                </p>
              </div>

              {elapsed >= NUDGE_MS ? (
                // [COPY — pending Taylor]
                <p className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                  That&apos;s plenty — stop whenever you like.
                </p>
              ) : null}

              {!durable ? (
                // [COPY — pending Taylor]
                <p className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                  This browser won&apos;t let us hold the recording on your
                  device, so it&apos;s only safe once it&apos;s sent.
                </p>
              ) : null}

              <div className="mt-3">
                {/* [COPY — pending Taylor] */}
                <GhostButton onClick={stop}>Stop recording</GhostButton>
              </div>
            </>
          ) : null}

          {phase === "idle" || phase === "permission_pending" ? (
            <>
              {/* [COPY — pending Taylor] */}
              <GhostButton
                onClick={() => void start()}
                disabled={phase === "permission_pending"}
              >
                Record a voice note
              </GhostButton>

              {denied ? (
                // [COPY — pending Taylor]
                <p className="mt-3 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                  No microphone here — record on your phone and add the file
                  below instead.
                </p>
              ) : null}
            </>
          ) : null}

          {phase === "stopped_local" || phase === "uploading" ? (
            <>
              {/* [COPY — pending Taylor] */}
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                Sending — {clock(elapsed)}
              </p>
              <div className="mt-2 h-px w-full bg-(--color-faint)">
                <div
                  className="h-px bg-(--color-c2) transition-[width] duration-(--dur-fast)"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : null}

          {phase === "uploaded" ? (
            <>
              {/* [COPY — pending Taylor] */}
              <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-c2)">
                Sent
              </p>
              <div className="mt-3">
                <GhostButton onClick={() => void start()}>
                  Record another
                </GhostButton>
              </div>
            </>
          ) : null}

          {phase === "upload_failed" ? (
            <>
              {/* [COPY — pending Taylor] */}
              <p className="font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                That didn&apos;t send. Your recording is still here — try again
                whenever you&apos;re ready.
              </p>
              <div className="mt-3">
                <GhostButton
                  onClick={() => {
                    const blob = blobRef.current;
                    if (blob) void send(blob, sessionRef.current);
                  }}
                >
                  Try again
                </GhostButton>
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {rows.map((row) => (
        <TranscriptBlock
          key={row.fileId}
          row={row}
          onEdit={(next) => editTranscript(row.fileId, next)}
          onRetry={() => void transcribe(row.fileId)}
        />
      ))}
    </div>
  );
}

/**
 * One voice note's transcript, and the truth about where it came from.
 *
 * The caveat sits above the box and is the textarea's `aria-describedby`, so a
 * screen reader hears "a machine wrote this" before it reads the machine's
 * guess at a festival name.
 */
function TranscriptBlock({
  row,
  onEdit,
  onRetry,
}: {
  row: NoteRow;
  onEdit: (next: string) => void;
  onRetry: () => void;
}) {
  const helpId = `voice-transcript-help-${row.fileId}`;
  const fieldId = `voice-transcript-${row.fileId}`;

  return (
    <div className="mt-4 rounded-(--radius) border border-(--color-faint) bg-(--color-card) p-4">
      <p className="truncate font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim)">
        {row.name}
      </p>

      {row.state.status === "running" ? (
        // No spinner. A progress animation on a form reads as trouble.
        // [COPY — pending Taylor]
        <p className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
          Writing this up — it takes a minute.
        </p>
      ) : null}

      {row.state.status === "failed" ? (
        <>
          {/* [COPY — pending Taylor] */}
          <p className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
            We couldn&apos;t write this one up. Your recording is safe either
            way — Taylor will listen to it.
          </p>
          {row.attempts < MAX_TRANSCRIPT_ATTEMPTS ? (
            <div className="mt-3">
              <GhostButton onClick={onRetry}>Try again</GhostButton>
            </div>
          ) : null}
        </>
      ) : null}

      {row.state.status === "done" || row.transcript ? (
        <>
          {/* [COPY — pending Taylor] */}
          <p
            id={helpId}
            className="mt-2 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)"
          >
            A machine wrote this out. Fix anything it got wrong — names
            especially — or leave it.
          </p>

          <label htmlFor={fieldId} className="sr-only">
            Transcript
          </label>
          <textarea
            id={fieldId}
            value={row.transcript}
            onChange={(event) => onEdit(event.target.value)}
            aria-describedby={helpId}
            rows={8}
            className="mt-2 min-h-[160px] w-full resize-y rounded-(--radius) border border-(--color-faint) bg-transparent px-3 py-3 font-body text-[15px] font-light leading-[1.6] text-(--color-body) outline-none transition-colors duration-(--dur-fast) focus:border-(--color-c2)"
          />

          <p className="mt-1 h-4 font-mono text-[9px] uppercase tracking-[.14em] text-(--color-dim)">
            {row.save === "saving"
              ? "Saving"
              : row.save === "saved"
                ? "Saved"
                : row.save === "failed"
                  ? "Couldn't save — keep typing, we'll try again"
                  : ""}
          </p>
        </>
      ) : null}
    </div>
  );
}
