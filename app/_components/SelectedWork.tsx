import { selectedWork as words } from "@/content/home";
import { visibleTestimonials } from "@/content/testimonials";
import { work } from "@/content/work";
import { siteRoutes } from "@/lib/routes";
import {
  chipsForTab,
  entriesForTab,
  filterByType,
  visibleTabs,
  workHref,
  type Tab,
  type TypeFilter,
  type WorkEntry,
} from "@/lib/work/rows";
import { StoryRow, type Story } from "./StoryRow";
import { WorkTabs, type TabChip, type WorkTab } from "./WorkTabs";

/** A type chip shows that type's entries newest first, three at most (D-SITE-51). */
const PER_CHIP = 3;

const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");

/** A product story's captures, live link and quote come from its study. */
function toStory(entry: WorkEntry): Story {
  const study =
    entry.tab === "product"
      ? work.find((s) => s.slug === entry.caseStudySlug)
      : undefined;
  const gallery = study
    ? study.media.flatMap((group) => group.items)
    : entry.gallery;
  const liveUrl =
    entry.liveUrl ?? study?.links?.find((l) => l.status === "live")?.href;
  const quote =
    entry.tab === "product" && entry.caseStudySlug
      ? visibleTestimonials().find(
          (t) => t.project?.href === siteRoutes.caseStudy(entry.caseStudySlug!),
        )
      : undefined;
  const images = gallery.filter((item) => !item.video).length;

  return {
    id: entry.id,
    meta: `${words.typeLabels[entry.type]} · ${entry.role}`,
    title: entry.title,
    beats: entry.beats,
    quote: quote && { text: quote.quote, by: `${quote.name} · ${quote.title}` },
    storyHref: entry.caseStudySlug
      ? siteRoutes.caseStudy(entry.caseStudySlug)
      : undefined,
    live: liveUrl ? { href: liveUrl, label: host(liveUrl) } : undefined,
    gallery,
    galleryLabel: (entry.tab === "branding"
      ? words.galleryAll.boards
      : words.galleryAll.images
    ).replace("{n}", String(images)),
  };
}

function footer(tab: Tab, type: TypeFilter | "featured") {
  const seeAll = {
    label:
      tab === "product" && type === "full-time"
        ? words.seeAllFullTime
        : words.seeAll,
    href: workHref(tab, type),
  };
  if (tab === "websites")
    return [{ label: words.websitesLink, href: siteRoutes.websites }, seeAll];
  if (tab === "branding")
    return [{ label: words.brandingLink, href: siteRoutes.workWithMe }, seeAll];
  return [seeAll];
}

function tabFor(tab: Tab, entries: WorkEntry[]): WorkTab {
  const featured: TabChip = {
    key: "featured",
    label: words.chips.featured,
    ids: words.featured[tab].filter((id) => entries.some((e) => e.id === id)),
    links: footer(tab, "featured"),
  };
  const typed = chipsForTab(entries)
    .filter((type) => type !== "all")
    .map((type): TabChip => ({
      key: type,
      label: words.chips[type as keyof typeof words.chips],
      ids: filterByType(entries, type)
        .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
        .slice(0, PER_CHIP)
        .map((e) => e.id),
      links: footer(tab, type),
    }));
  return { key: tab, label: words.tabs[tab], chips: [featured, ...typed] };
}

/**
 * Home's Selected work (D-SITE-51): tabs, chips, groups and every /work href
 * from `lib/work/rows.ts`; the stories rendered here on the server and handed
 * to the client tabs as nodes.
 */
export function SelectedWork({
  initialTab,
  initialChip,
}: {
  initialTab?: Tab;
  initialChip?: string;
}) {
  const tabs = visibleTabs().map((tab) => ({
    tab,
    entries: entriesForTab(tab),
  }));
  const stories: Record<string, React.ReactNode> = {};
  for (const { entries } of tabs)
    for (const entry of entries)
      stories[entry.id] = <StoryRow story={toStory(entry)} />;

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="mt-16 scroll-mt-8 md:mt-24"
    >
      <h2
        id="work-heading"
        className="font-display text-(length:--text-h2) leading-[1.15] font-semibold tracking-(--tracking-h2) text-(--color-ink)"
      >
        {words.heading}
      </h2>
      <WorkTabs
        tabs={tabs.map(({ tab, entries }) => tabFor(tab, entries))}
        stories={stories}
        liveCount={words.liveCount}
        initialTab={initialTab}
        initialChip={initialChip}
      />
    </section>
  );
}
