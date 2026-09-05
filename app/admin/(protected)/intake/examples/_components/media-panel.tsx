"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { isCaptureAspect } from "@/lib/intake/example-site-rules";
import type { DraftCapture } from "@/lib/intake/example-packs";
import {
  captureFromUrlAction,
  promoteCaptureAction,
  removeCaptureAction,
  setCaptureAltAction,
  uploadCaptureAction,
} from "../_actions/examples";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm";

/**
 * A site's media: stills, animated GIFs, and video.
 *
 * The screenshot is the thing being judged — `dark-cinematic`, `alive`, `dense`
 * are all decided by looking — so it is large and beside the fields. A GIF of a
 * hover state or a recording of a scroll is the same evidence for a site whose
 * whole character is motion, and a still cannot carry it.
 *
 * **Item one is the hero**: what the client's row renders, in the MacBook box.
 * Which item leads is an editorial call — you shoot three scrolls and the
 * second one is the shot — so any item can be promoted. A video cannot lead,
 * because the row renders a still; that is the one rule here that refuses
 * rather than warns.
 *
 * Every item sits on a plate. Not decoration: in the admin's light theme a
 * white screenshot on paper has no edge, and this is content we do not control.
 */
export function MediaPanel({
  slug,
  captures,
  compact,
}: {
  slug: string;
  captures: DraftCapture[];
  compact?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const hero = captures[active] ?? captures[0];

  function run(work: () => Promise<{ ok: boolean; message?: string }>) {
    setMessage(null);
    startTransition(async () => {
      const result = await work();
      if (!result.ok) setMessage(result.message ?? "That didn't work.");
    });
  }

  /**
   * Video dimensions come from the browser, which has already decoded the file
   * to show it. MP4 buries them in a `tkhd` box and WebM's EBML is worse — a
   * decoder's worth of work for a layout hint.
   */
  async function measure(file: File): Promise<{ width: number; height: number } | null> {
    if (!file.type.startsWith("video/")) return null;

    return new Promise((resolve) => {
      const element = document.createElement("video");
      element.preload = "metadata";
      element.onloadedmetadata = () => {
        resolve({ width: element.videoWidth, height: element.videoHeight });
        URL.revokeObjectURL(element.src);
      };
      element.onerror = () => resolve(null);
      element.src = URL.createObjectURL(file);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {hero ? (
        <figure className="flex flex-col gap-2">
          {hero.isVideo ? (
            <video
              key={hero.id}
              src={hero.src}
              controls
              loop
              muted
              playsInline
              className="w-full rounded-(--radius) border border-(--color-line) bg-(--color-well)"
            />
          ) : (
            /*
              Explicit pixel width and height from the item's own intrinsic
              size — never `w-auto`, never `sizes`. This is the exact shape of
              the bug CLAUDE.md records. `unoptimized` on a GIF because the
              optimizer would return a single frozen frame, which for media
              chosen to show motion is the whole point lost.
            */
            <Image
              key={hero.id}
              src={hero.src}
              alt={hero.alt || "Media for this site"}
              width={hero.width}
              height={hero.height}
              unoptimized={hero.mimeType === "image/gif"}
              className="w-full rounded-(--radius) border border-(--color-line) bg-(--color-well)"
            />
          )}

          <figcaption className="flex flex-wrap items-center gap-x-3 text-xs text-(--color-dim)">
            <span>
              {hero.width} × {hero.height}
            </span>
            <span>{hero.mimeType.replace(/^\w+\//, "").toUpperCase()}</span>
            {hero.position === 1 ? (
              <span className="text-(--color-c2)">Hero</span>
            ) : (
              <button
                type="button"
                disabled={pending || hero.isVideo}
                onClick={() =>
                  run(() =>
                    promoteCaptureAction({ slug, captureId: hero.id }),
                  )
                }
                className="underline underline-offset-4 hover:text-(--color-ink) disabled:no-underline disabled:opacity-50"
              >
                {/* [COPY — draft] */}
                {hero.isVideo ? "Video can't lead" : "Make this the hero"}
              </button>
            )}
            {hero.position === 1 && !hero.isVideo &&
            !isCaptureAspect(hero.width, hero.height) ? (
              <span className="text-(--color-body)">
                {/* [COPY — draft] — a note, never a blocker. */}
                Not the MacBook shape, so the row will crop it.
              </span>
            ) : null}
          </figcaption>
        </figure>
      ) : (
        <div className="flex aspect-[1512/982] w-full items-center justify-center rounded-(--radius) border border-(--color-line) bg-(--color-well)">
          <span className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
            {/* [COPY — draft] */}
            No media yet
          </span>
        </div>
      )}

      {captures.length > 1 ? (
        <ul className="flex flex-wrap gap-2">
          {captures.map((item, index) => (
            <li key={item.id} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show item ${item.position}`}
                aria-pressed={index === active}
                className={`relative rounded-(--radius) border p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2) ${
                  index === active
                    ? "border-(--color-c2)"
                    : "border-(--color-line)"
                }`}
              >
                {item.isVideo ? (
                  <span className="flex h-[62px] w-[96px] items-center justify-center rounded-(--radius) bg-(--color-well) font-(family-name:--font-mono) text-[9px] tracking-[.24em] text-(--color-dim) uppercase">
                    Video
                  </span>
                ) : (
                  <Image
                    src={item.src}
                    alt=""
                    width={96}
                    height={62}
                    unoptimized={item.mimeType === "image/gif"}
                    className="h-[62px] w-[96px] rounded-(--radius) bg-(--color-well) object-cover"
                  />
                )}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(() => removeCaptureAction({ slug, captureId: item.id }))
                }
                className="text-xs text-(--color-dim) hover:text-(--color-ink)"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {hero && hero.position === 1 ? (
        <label className="flex flex-col gap-2">
          <span className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
            Alt text · hero
          </span>
          <input
            type="text"
            defaultValue={hero.alt}
            placeholder="What it shows, for someone who can't see it"
            onBlur={(event) =>
              run(() =>
                setCaptureAltAction({
                  slug,
                  captureId: hero.id,
                  alt: event.target.value,
                }),
              )
            }
            className="min-h-[44px] w-full rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 text-sm text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
          />
        </label>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-(--color-faint) pt-4">
        <span className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
          {/* [COPY — draft] */}
          Add media
        </span>

        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          multiple
          className="text-sm text-(--color-body) file:mr-3 file:min-h-[44px] file:rounded-(--radius) file:border file:border-(--color-line-strong) file:bg-transparent file:px-4 file:text-sm file:text-(--color-ink)"
          onChange={async (event) => {
            const files = [...(event.target.files ?? [])];
            if (files.length === 0) return;
            if (fileInput.current) fileInput.current.value = "";

            // One at a time: position is assigned server-side from what is
            // already there, so parallel uploads would race for the same slot.
            for (const file of files) {
              const size = await measure(file);
              const form = new FormData();
              form.set("slug", slug);
              form.set("file", file);
              if (size) {
                form.set("width", String(size.width));
                form.set("height", String(size.height));
              }
              const result = await uploadCaptureAction(form);
              if (!result.ok) {
                setMessage(result.message);
                break;
              }
            }
          }}
        />

        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-1 flex-col gap-2">
            <span className="font-(family-name:--font-mono) text-[10px] tracking-[.28em] text-(--color-dim) uppercase">
              {/* [COPY — draft] */}
              Or an image URL
            </span>
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              className="min-h-[44px] w-full rounded-(--radius) border border-(--color-line) bg-(--color-well) px-3 font-(family-name:--font-mono) text-xs text-(--color-ink) outline-none focus-visible:border-(--color-c2)"
            />
          </label>
          <button
            type="button"
            disabled={pending || !url.trim()}
            onClick={() =>
              run(async () => {
                const result = await captureFromUrlAction({ slug, url });
                if (result.ok) setUrl("");
                return result;
              })
            }
            className="min-h-[44px] rounded-(--radius) border border-(--color-line-strong) px-4 text-sm text-(--color-ink) hover:bg-(--color-card-hover) disabled:text-(--color-dim)"
          >
            {pending ? "Fetching…" : "Fetch"}
          </button>
        </div>

        {!compact ? (
          <p className="max-w-[52ch] text-sm text-(--color-dim)">
            {/* [COPY — draft] */}
            Images and GIFs up to 10 MB, video up to 50 MB. An image URL is
            copied here rather than linked, so it outlives the site it shows.
            Video has to be uploaded.
          </p>
        ) : null}

        {message ? (
          <p className="max-w-[52ch] text-sm text-(--color-body)">{message}</p>
        ) : null}
      </div>
    </div>
  );
}
