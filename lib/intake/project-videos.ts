import type {
  ProjectEntry,
  ProjectVideo,
} from "@/lib/validators/showcase-intake";

/**
 * Everything to do with a project's videos that more than one surface needs.
 *
 * Three callers read this: the project card, step 9's home shortlist, and the
 * output document. Each of them has to agree about what a project's videos
 * *are* — including for a project answered before PORT-19, whose single
 * `watchUrl` has to keep reading as one video everywhere or the client's
 * answer changes depending on which screen is looking at it.
 */

/** The stable key for one video across the whole form. */
export const MEDIA_VIDEO_OWNER = "media";

/**
 * A project's videos, including the one a legacy `watchUrl` stands for.
 *
 * **Derived, never written.** Nothing here saves the migration back into the
 * answers document — an entry keeps its `watchUrl` until the client opens the
 * card and edits it, at which point the component writes a real `videos` array
 * and the legacy field goes quiet. A derivation that saved itself would
 * rewrite answers nobody asked us to touch.
 *
 * The synthetic entry key is the project's own. A project has exactly one
 * legacy link, so there is nothing for it to collide with, and a minted key
 * would be different on every render — which would make the home shortlist's
 * tick point at a video that no longer exists a moment later.
 */
export function videosOf(project: ProjectEntry): ProjectVideo[] {
  const stored = Array.isArray(project.videos) ? project.videos : [];
  if (stored.length > 0) return stored;

  const legacy = project.watchUrl?.trim();
  if (!legacy) return [];

  return [
    {
      entryKey: project.entryKey,
      url: legacy,
      password: project.linkPassword,
    },
  ];
}

/**
 * The reference a home-page tick stores.
 *
 * Two keys joined, because a video's own key is only unique within the entry
 * that holds it — and because step 9 stores its ticks in its own answers and
 * cannot reach into step 5's to disambiguate later. `owner` is a project's
 * entry key, or `MEDIA_VIDEO_OWNER` for a video that belongs to no project.
 */
export function videoRef(owner: string, videoKey: string): string {
  return `${owner}:${videoKey}`;
}

/**
 * One video's label: what the client said it is, else the bare link.
 *
 * Takes the two fields it reads rather than a whole `ProjectVideo`, because
 * step 9's shortlist rows are not videos — they are references to videos, with
 * the source they came from attached — and a signature that demanded an
 * `entryKey` it never touches would push that shape to fake one.
 */
export function videoLabel(video: { what?: string; url?: string }): string {
  return video.what?.trim() || video.url?.trim() || "Untitled video";
}

/**
 * The embeddable form of a YouTube or Vimeo link, or `null` for anything else.
 *
 * `null` is an ordinary outcome, not a failure: a client may paste a Drive
 * link, a Frame.io review link, or a bare domain, and every one of those is a
 * real answer we keep and show as a link. The shortlist renders the row either
 * way — an embed when we can, the link when we cannot.
 *
 * Parsed with `URL` rather than a regular expression so a query string, a
 * timestamp, or a trailing slash cannot decide whether a video is watchable.
 */
export function embedUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  let url: URL;
  try {
    url = new URL(value.startsWith("http") ? value : `https://${value}`);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    if (id) return `https://www.youtube.com/embed/${id}`;

    // /embed/ID, /shorts/ID, /live/ID — all already one path segment deep.
    const [first, second] = url.pathname.split("/").filter(Boolean);
    if (first && second && ["embed", "shorts", "live", "v"].includes(first)) {
      return `https://www.youtube.com/embed/${second}`;
    }
    return null;
  }

  if (host === "vimeo.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    // vimeo.com/123456789 and the unlisted vimeo.com/123456789/abcdef0123.
    const id = parts[0];
    if (!id || !/^\d+$/.test(id)) return null;
    const hash = parts[1] && /^[0-9a-z]+$/i.test(parts[1]) ? parts[1] : null;
    return hash
      ? `https://player.vimeo.com/video/${id}?h=${hash}`
      : `https://player.vimeo.com/video/${id}`;
  }

  if (host === "player.vimeo.com") return url.toString();

  return null;
}
