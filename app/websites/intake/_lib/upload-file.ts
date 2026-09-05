"use client";

/**
 * The one ladder every intake upload climbs: issue, PUT, confirm.
 *
 * Lifted out of `FileDrop` unchanged at PORT-20 so the voice recorder could
 * reuse it rather than grow a second one. Two upload paths would be two places
 * for the confirm step to be forgotten, and the confirm step is what the whole
 * "nothing is lost" story hangs on — a file whose PUT landed but whose confirm
 * did not is invisible to the intake document.
 *
 * Progress comes from `XMLHttpRequest` rather than `fetch`, which cannot report
 * upload progress. On a twenty-minute voice note over rural LTE, a progress
 * line is the difference between waiting and giving up.
 *
 * The caller decides what a failure means. This throws; `FileDrop` turns that
 * into its retry tile and the recorder into its own.
 */
export type UploadTarget = {
  token: string;
  stepKey: string;
  fieldKey: string;
  /** Scopes the file to one repeatable entry — a project's stills (M-PORT-3). */
  entryKey?: string;
};

/**
 * Sends one file and returns the row id the server recorded it under.
 *
 * The id matters to the recorder in a way it never did to `FileDrop`:
 * transcription is addressed to a file row, so the caller needs to know which
 * one it just created.
 */
export async function uploadIntakeFile(
  target: UploadTarget,
  file: File | Blob,
  filename: string,
  onProgress?: (percent: number) => void,
): Promise<{ fileId: string; confirmed: boolean }> {
  const issued = await fetch("/api/intake/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      token: target.token,
      stepKey: target.stepKey,
      fieldKey: target.fieldKey,
      entryKey: target.entryKey,
      filename,
      mimeType: file.type || undefined,
      sizeBytes: file.size,
    }),
  });

  if (!issued.ok) throw new Error("issue");

  const { fileId, uploadUrl } = (await issued.json()) as {
    fileId: string;
    uploadUrl: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(String(xhr.status))),
    );
    xhr.addEventListener("error", () => reject(new Error("network")));
    xhr.send(file);
  });

  /**
   * The confirm, reported rather than thrown.
   *
   * A row without `uploaded_at` is a started-and-abandoned upload, invisible to
   * the intake document — so whether this landed genuinely matters. It is
   * returned instead of thrown because `FileDrop` has always ignored the
   * outcome here, and PORT-20 must leave the durable track behaviourally
   * unchanged: turning a silent partial success into a visible failure would
   * be an improvement, and an improvement is still a change.
   *
   * The recorder does read it, and gates deleting its local chunks on it. If
   * the confirm did not land, the audio is still on the client's device and
   * the retry is real.
   */
  let confirmed = false;
  try {
    const response = await fetch("/api/intake/upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: target.token, confirm: fileId }),
    });
    confirmed = response.ok;
  } catch {
    confirmed = false;
  }

  return { fileId, confirmed };
}
