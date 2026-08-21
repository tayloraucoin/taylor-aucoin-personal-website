import Image from "next/image";
import MediaLightbox from "@/components/work/MediaLightbox";
import { cleanCoast } from "@/content/websites-clean-coast";

/**
 * The gallery. Phones first, and that is not a layout preference — most of the
 * people who find a local trade are standing somewhere holding a phone, and the
 * buyer reading this page is on one right now. Showing the desktop capture
 * first would be showing them the view they are least likely to have.
 *
 * Every capture sits on a dark panel with a hairline. These are screenshots of
 * a light-background site dropped onto a dark ground, and without the panel
 * they glare and butt straight into the page gradient — the same reason the
 * case-study template has `frame: "panel"`.
 *
 * Zoom comes from `MediaLightbox`, reused rather than rebuilt. The figures stay
 * server-rendered as its children, so only the shell hydrates: the triggers are
 * real `<button>`s located by `data-zoom-index`, which also enrols them in the
 * root field's cursor-glow fade for free.
 *
 * Images are sized with `w-full`, never `w-auto` — the `next/image` sizing trap
 * in CLAUDE.md only bites the latter.
 */
export default function CleanCoastGallery() {
  const phones = cleanCoast.shots.filter((s) => s.device === "phone");
  const desktops = cleanCoast.shots.filter((s) => s.device === "desktop");

  if (cleanCoast.shots.length === 0) return null;

  // Zoom indices must match the order of `items` handed to the lightbox.
  const ordered = [...phones, ...desktops];

  return (
    <MediaLightbox
      items={ordered.map((s) => ({ src: s.src, alt: s.alt, caption: s.caption }))}
    >
      <div className="mt-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[.24em] text-(--color-c2)">
          The site itself
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:items-start">
          <div className="flex justify-center gap-4 rounded-(--radius) border border-(--color-faint) bg-[rgb(3_5_16/.92)] px-5 py-7">
            {phones.map((shot, i) => (
              <figure key={shot.caption} className="w-full max-w-[190px]">
                <button
                  type="button"
                  data-zoom-index={i}
                  className="block w-full cursor-zoom-in rounded-(--radius) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    sizes="(min-width: 768px) 190px, 40vw"
                    className="w-full rounded-(--radius) border border-(--color-faint)"
                  />
                </button>
                <figcaption className="mt-3 text-center font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {desktops.map((shot, i) => (
              <figure
                key={shot.caption}
                className="rounded-(--radius) border border-(--color-faint) bg-[rgb(3_5_16/.92)] p-4"
              >
                <button
                  type="button"
                  data-zoom-index={phones.length + i}
                  className="block w-full cursor-zoom-in rounded-(--radius) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-c2)"
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    sizes="(min-width: 768px) 560px, 92vw"
                    className="w-full rounded-(--radius) border border-(--color-faint)"
                  />
                </button>
                <figcaption className="mt-3 font-mono text-[9px] uppercase tracking-[.2em] text-(--color-dim)">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </MediaLightbox>
  );
}
