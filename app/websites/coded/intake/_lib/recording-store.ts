"use client";

/**
 * Where a recording lives before it is anywhere else.
 *
 * This module is the answer to the one requirement above all others: a client
 * must never lose a recording. `MediaRecorder` is given a timeslice, so
 * `dataavailable` fires every few seconds rather than once at stop, and every
 * chunk it hands over is written here **before it is acknowledged**. A tab that
 * dies at minute eighteen has eighteen minutes on disk.
 *
 * IndexedDB rather than localStorage because localStorage holds strings, and
 * base64-ing eight megabytes of audio through it on a phone is neither fast
 * nor within quota. IndexedDB stores `Blob`s directly.
 *
 * ## What is stored, and what is deliberately not
 *
 * A session row and its chunks. The session carries a scope key — the first
 * eight characters of the intake token, exactly as `use-step-autosave.ts`
 * derives its localStorage key and for the same stated reason: enough to
 * separate two engagements on one device, not enough that anything reading
 * browser storage walks away with a working link. **The full token is never
 * written here.**
 *
 * ## Every failure is survivable
 *
 * Private mode, quota, an embedded webview that stubs `indexedDB` and throws on
 * use — all of it is caught. A store that cannot open reports itself unusable
 * and the recorder falls back to holding chunks in memory, telling the client
 * their recording is only safe once sent. Degrading the safety net is correct;
 * refusing to record because the net is missing is not.
 */

const DB_NAME = "ta-intake-voice";
const DB_VERSION = 1;
const SESSIONS = "sessions";
const CHUNKS = "chunks";

export type RecordingSession = {
  id: string;
  /** `token.slice(0, 8)` — see the note above on why it is not the token. */
  scope: string;
  mimeType: string;
  startedAt: number;
  /** Set when the recorder stops cleanly. Absent on a session the tab killed. */
  endedAt?: number;
  /** Milliseconds of audio the recorder believes it captured. */
  durationMs: number;
};

/** Scope key for a token. One home, so the recorder cannot derive it twice. */
export function scopeFor(token: string): string {
  return token.slice(0, 8);
}

let opening: Promise<IDBDatabase | null> | null = null;

function openDb(): Promise<IDBDatabase | null> {
  opening ??= new Promise<IDBDatabase | null>((resolve) => {
    try {
      if (typeof indexedDB === "undefined") return resolve(null);

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains(SESSIONS)) {
          db.createObjectStore(SESSIONS, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(CHUNKS)) {
          // Keyed by session and sequence together, so chunks come back in the
          // order they were recorded without a sort and a session's chunks can
          // be swept by range.
          db.createObjectStore(CHUNKS, { keyPath: ["sessionId", "seq"] });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });

  return opening;
}

/** Whether chunks can be made durable at all. The recorder tells the client. */
export async function storeAvailable(): Promise<boolean> {
  return (await openDb()) !== null;
}

function run<T>(
  db: IDBDatabase,
  stores: string[],
  mode: IDBTransactionMode,
  body: (tx: IDBTransaction) => IDBRequest<T> | null,
): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    try {
      const tx = db.transaction(stores, mode);
      const request = body(tx);

      // A write transaction is only durable once it commits, which is why
      // writes resolve on `oncomplete` rather than on the request succeeding.
      tx.oncomplete = () => resolve(request ? request.result : null);
      tx.onerror = () => resolve(null);
      tx.onabort = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Opens a session row. Called once, before the first chunk can arrive. */
export async function startSession(
  session: RecordingSession,
): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  const result = await run(db, [SESSIONS], "readwrite", (tx) =>
    tx.objectStore(SESSIONS).put(session),
  );

  return result !== null;
}

/**
 * Writes one chunk, and resolves only once the transaction has committed.
 *
 * The recorder awaits this inside its `dataavailable` handler. That ordering is
 * the whole contract — the same ordering `use-step-autosave.ts` states for
 * localStorage: durable first, everything else after.
 */
export async function putChunk(
  sessionId: string,
  seq: number,
  blob: Blob,
): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;

  const result = await run(db, [CHUNKS], "readwrite", (tx) =>
    tx.objectStore(CHUNKS).put({ sessionId, seq, blob }),
  );

  return result !== null;
}

/** Updates a session's duration and marks it cleanly ended. */
export async function endSession(
  sessionId: string,
  durationMs: number,
): Promise<void> {
  const db = await openDb();
  if (!db) return;

  await run(db, [SESSIONS], "readwrite", (tx) => {
    const store = tx.objectStore(SESSIONS);
    const read = store.get(sessionId);

    read.onsuccess = () => {
      const session = read.result as RecordingSession | undefined;
      if (session) {
        store.put({ ...session, endedAt: Date.now(), durationMs });
      }
    };

    return read;
  });
}

/**
 * The most recent session for this engagement on this device, if there is one.
 *
 * Most recent rather than all of them: the recovery prompt offers one
 * recording back, and a client who has abandoned three has told us something
 * about the first two. Older sessions are swept below.
 */
export async function latestSession(
  scope: string,
): Promise<RecordingSession | null> {
  const db = await openDb();
  if (!db) return null;

  const all = await run<RecordingSession[]>(db, [SESSIONS], "readonly", (tx) =>
    tx.objectStore(SESSIONS).getAll(),
  );

  if (!all) return null;

  const mine = all
    .filter((session) => session.scope === scope)
    .sort((a, b) => b.startedAt - a.startedAt);

  return mine[0] ?? null;
}

/**
 * Reassembles a session's chunks into one playable blob.
 *
 * The blob is built with the MIME type the recorder actually produced. Guessing
 * it — or normalising everything to `audio/webm` — yields a file Safari will
 * not play back, having recorded `audio/mp4`.
 */
export async function assembleSession(
  session: RecordingSession,
): Promise<Blob | null> {
  const db = await openDb();
  if (!db) return null;

  const rows = await run<Array<{ seq: number; blob: Blob }>>(
    db,
    [CHUNKS],
    "readonly",
    (tx) =>
      tx
        .objectStore(CHUNKS)
        .getAll(
          IDBKeyRange.bound([session.id, -Infinity], [session.id, Infinity]),
        ),
  );

  if (!rows || rows.length === 0) return null;

  const ordered = [...rows].sort((a, b) => a.seq - b.seq);
  return new Blob(
    ordered.map((row) => row.blob),
    { type: session.mimeType },
  );
}

/**
 * Deletes a session and its chunks.
 *
 * The recorder calls this in exactly two places: when the client says start
 * again, and when the server has **confirmed** the upload — never when the PUT
 * resolves, never at stop, never on unmount. That gate is the difference
 * between a retry that works and a client who has to say it all again.
 */
export async function dropSession(sessionId: string): Promise<void> {
  const db = await openDb();
  if (!db) return;

  await run(db, [SESSIONS, CHUNKS], "readwrite", (tx) => {
    tx.objectStore(CHUNKS).delete(
      IDBKeyRange.bound([sessionId, -Infinity], [sessionId, Infinity]),
    );
    return tx.objectStore(SESSIONS).delete(sessionId);
  });
}

/**
 * Sweeps sessions that are neither the newest for their scope nor recent.
 *
 * Audio is large and a browser that runs out of quota stops accepting chunks —
 * which would break the one guarantee this module exists for. Called on mount,
 * after the recovery prompt has resolved, so nothing a client might still be
 * offered is ever swept.
 */
export async function sweepOldSessions(keepSessionId?: string): Promise<void> {
  const db = await openDb();
  if (!db) return;

  const all = await run<RecordingSession[]>(db, [SESSIONS], "readonly", (tx) =>
    tx.objectStore(SESSIONS).getAll(),
  );

  if (!all) return;

  const week = 7 * 24 * 60 * 60 * 1000;
  const cutoff = Date.now() - week;

  for (const session of all) {
    if (session.id === keepSessionId) continue;
    if (session.startedAt >= cutoff) continue;
    await dropSession(session.id);
  }
}
