import Link from "next/link";
import { StoryGallery } from "@/components/work/StoryGallery";
import { selectedWork as words } from "@/content/home";
import type { Beats, MediaItem } from "@/content/work";

export type Story = {
  id: string;
  meta: string;
  title: string;
  beats?: Beats;
  quote?: { text: string; by: string };
  storyHref?: string;
  live?: { href: string; label: string };
  gallery: MediaItem[];
  galleryLabel: string;
};

const LINK =
  "inline-flex min-h-11 items-center text-(length:--text-body) text-(--color-ink) underline decoration-(--color-mark) decoration-1 underline-offset-4 transition-colors duration-(--dur-fast) hover:text-(--color-body)";

/**
 * One story (D-SITE-51, 175, 181): the meta line, the title, Problem · Decided
 * · Happened, a quote where one is on file, then the links; the gallery to
 * the right at 1440, under the text at 390. A story with no artifact is text
 * only. The heading takes focus from the hero's See the work.
 */
export function StoryRow({ story }: { story: Story }) {
  const beats = (["problem", "decided", "happened"] as const).map((key) => ({
    key,
    label: words.beats[key],
    text: story.beats?.[key] ?? words.beatMissing,
  }));

  return (
    <article className="grid gap-8 py-10 md:grid-cols-[1fr_520px] md:gap-10 md:py-12">
      <div>
        <p className="text-(length:--text-small) text-(--color-dim)">
          {story.meta}
        </p>
        <h3
          tabIndex={-1}
          className="mt-2 font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--color-focus)"
        >
          {story.title}
        </h3>
        <dl className="mt-6 space-y-5">
          {beats.map((b) => (
            <div key={b.key}>
              <dt className="text-(length:--text-label) font-medium tracking-(--tracking-label) text-(--color-dim) uppercase">
                {b.label}
              </dt>
              <dd className="mt-2 max-w-[60ch] text-(length:--text-body) leading-[1.7] text-(--color-body)">
                {b.text}
              </dd>
            </div>
          ))}
        </dl>
        {story.quote && (
          <figure className="mt-8 max-w-[54ch]">
            <blockquote className="text-[20px] leading-[1.55] text-(--color-ink)">
              “{story.quote.text}”
            </blockquote>
            <figcaption className="mt-3 text-(length:--text-meta) text-(--color-dim)">
              {story.quote.by}
            </figcaption>
          </figure>
        )}
        {(story.storyHref || story.live) && (
          <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {story.storyHref && (
              <Link href={story.storyHref} scroll className={LINK}>
                {words.readStory}
                <span className="sr-only">: {story.title}</span>
              </Link>
            )}
            {story.live && (
              <a
                href={story.live.href}
                target="_blank"
                rel="noopener noreferrer"
                className={LINK}
              >
                {story.live.label}
              </a>
            )}
          </p>
        )}
      </div>
      <div>
        <StoryGallery items={story.gallery} label={story.galleryLabel} />
      </div>
    </article>
  );
}
