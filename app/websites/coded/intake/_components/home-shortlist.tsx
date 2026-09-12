"use client";

import { useIsDocument } from "@/components/intake/preview-mode";
import { embedUrl, videoLabel } from "@/lib/intake/project-videos";
import {
  CARD_CLASS,
  SELECTED_CLASS,
  UNSELECTED_CLASS,
} from "../../../intake/_components/choice-group";
import { DocHint, DocTag } from "../../../intake/_components/document";

/** One thing a client has already given us, offered back for the home page. */
export type ShortlistVideo = {
  /** `videoRef(owner, videoKey)` — stable across renders and across steps. */
  ref: string;
  url?: string;
  what?: string;
  /** Where it came from, for the dim line: a project's title, or "Media". */
  source: string;
};

export type ShortlistFile = {
  id: string;
  name: string;
  source: string;
};

/**
 * What should be on the home page — said in prose, then shortlisted.
 *
 * This block replaced the reel question at PORT-19. That question asked for
 * "the one video a stranger should see first" on step 5, four steps before the
 * client had finished telling us what they had, and it only ever had one
 * answer-shaped slot. The home page is not one video; it is a decision about
 * everything they have given us.
 *
 * ## What it promises, and what it doesn't
 *
 * **A shortlist, not a running order.** The site is designed from every answer
 * on this form, and what leads the home page is a decision made with all of it
 * in hand. Ticking something here means "consider this", and the copy says so
 * outright rather than implying a guarantee we would then have to break.
 *
 * ## Why the videos carry a line about themselves
 *
 * Whoever places a video on a home page needs to know whether it is the
 * ninety-minute cut or a forty-second teaser, and a Vimeo id does not say
 * (Taylor, 2026-09-03). The line is collected once, on the video itself, on
 * the project card and on Media — never here, where the same fact would have a
 * second home and the two could disagree.
 *
 * ## Ticks outlive what they point at
 *
 * A tick stores a file id or a video ref, verbatim. A file deleted afterwards,
 * or a video removed from a project, leaves a tick pointing at nothing — and
 * it stays, marked, rather than being swept up. Silently dropping it would be
 * editing the client's answer because something else changed, which is the
 * same law the taste favourites live under.
 */
export function HomeShortlist({
  videos,
  files,
  chosenVideos,
  chosenFiles,
  onVideos,
  onFiles,
}: {
  videos: readonly ShortlistVideo[];
  files: readonly ShortlistFile[];
  chosenVideos: readonly string[];
  chosenFiles: readonly string[];
  onVideos: (next: string[]) => void;
  onFiles: (next: string[]) => void;
}) {
  const document = useIsDocument();

  const toggle = (
    list: readonly string[],
    key: string,
    commit: (next: string[]) => void,
  ) =>
    commit(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);

  /**
   * The review reading. Nothing on this block's shelves belongs to it — the
   * videos and the files are the client's own answers from three steps — so a
   * review surface has no rows to print and must say what the control is
   * instead of showing an empty one.
   */
  if (document) {
    return (
      <>
        <DocTag>
          Shortlist · their own videos and files, tickable, any number
        </DocTag>
        <DocHint>
          Every video from every project and from Media, each rendered as a
          YouTube or Vimeo embed and labelled with the line they wrote about it;
          then every file they have uploaded, by name. Ticking shortlists it for
          the home page — it is explicitly not a promise that it gets used.
        </DocHint>
      </>
    );
  }

  const nothing = videos.length === 0 && files.length === 0;

  if (nothing) {
    return (
      <p className="font-body text-[15px] font-light leading-[1.6] text-(--color-dim)">
        Nothing to shortlist yet — this fills in from the videos and files you
        add on the earlier steps. Come back once they&apos;re in, or just say it
        in the box above.
      </p>
    );
  }

  return (
    <div className="space-y-7">
      {videos.length > 0 ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            Your videos
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {videos.map((video) => {
              const embed = embedUrl(video.url);
              const picked = chosenVideos.includes(video.ref);
              const label = videoLabel(video);

              return (
                <div
                  key={video.ref}
                  className={`overflow-hidden rounded-(--radius) border transition-colors duration-(--dur-fast) ${
                    picked
                      ? "border-(--color-gold-line) bg-(--color-card-hover)"
                      : "border-(--color-faint) bg-(--color-card)"
                  }`}
                >
                  {/* Lazy, because a filmmaker with thirty projects can arrive
                      here with sixty players on one screen. A link is not a
                      fallback state — a Drive or Frame.io link is a real
                      answer we keep, and it renders as what it is. */}
                  {embed ? (
                    <iframe
                      src={embed}
                      title={label}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      className="aspect-video w-full border-0 bg-(--color-card)"
                    />
                  ) : (
                    <p className="px-3.5 pt-3.5 font-body text-[13.5px] font-light leading-[1.5] text-(--color-dim)">
                      No preview for this one —{" "}
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="underline underline-offset-2 hover:text-(--color-c2)"
                      >
                        open the link
                      </a>
                      .
                    </p>
                  )}

                  <label className="flex cursor-pointer items-start gap-3 px-3.5 py-3">
                    <input
                      type="checkbox"
                      checked={picked}
                      onChange={() => toggle(chosenVideos, video.ref, onVideos)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full transition-colors duration-(--dur-fast) ${
                        picked ? "bg-(--color-c2)" : "bg-(--color-faint)"
                      }`}
                    />
                    <span className="min-w-0 font-body text-[16px] font-light leading-[1.4] text-(--color-body)">
                      {label}
                      <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                        {video.source}
                      </span>
                    </span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {files.length > 0 ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
            Your images and files
          </p>

          <div className="mt-3 flex flex-col gap-2">
            {files.map((file) => {
              const picked = chosenFiles.includes(file.id);

              return (
                <label
                  key={file.id}
                  className={`${CARD_CLASS} cursor-pointer ${
                    picked ? SELECTED_CLASS : UNSELECTED_CLASS
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={picked}
                    onChange={() => toggle(chosenFiles, file.id, onFiles)}
                    className="sr-only"
                  />
                  <span
                    aria-hidden
                    className={`mr-3 h-2 w-2 shrink-0 rounded-full transition-colors duration-(--dur-fast) ${
                      picked ? "bg-(--color-c2)" : "bg-(--color-faint)"
                    }`}
                  />
                  <span className="min-w-0 grow truncate">{file.name}</span>
                  <span className="ml-3 shrink-0 font-mono text-[10px] uppercase tracking-[.18em] text-(--color-dim)">
                    {file.source}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
